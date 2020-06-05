// Change the Yelp GraphQL schema to fit the graphql-cost-analysis library

import {
  parse,
  print,
  visit,
  ArgumentNode,
  NamedTypeNode,
  DefinitionNode,
  DirectiveDefinitionNode,
  DirectiveNode,
  DocumentNode,
  FieldDefinitionNode,
  ObjectTypeDefinitionNode,
  ScalarTypeDefinitionNode,
  TypeNode,
  EnumTypeDefinitionNode,
} from "graphql";

import * as fs from "fs";

/**
 * Cost directive definition
 *
 * directive @complexity(multipliers: [String!], value: Int!) on FIELD_DEFINITION
 */
const costDirectiveDefinition: DirectiveDefinitionNode = {
  kind: "DirectiveDefinition",
  name: {
    kind: "Name",
    value: "complexity",
  },
  arguments: [
    {
      kind: "InputValueDefinition",
      name: {
        kind: "Name",
        value: "multipliers",
      },
      type: {
        kind: "ListType",
        type: {
          kind: "NonNullType",
          type: {
            kind: "NamedType",
            name: {
              kind: "Name",
              value: "String",
            },
          },
        },
      },
    },
    {
      kind: "InputValueDefinition",
      name: {
        kind: "Name",
        value: "value",
      },
      type: {
        kind: "NonNullType",
        type: {
          kind: "NamedType",
          name: {
            kind: "Name",
            value: "Int",
          },
        },
      },
    },
  ],
  repeatable: false,
  locations: [
    {
      kind: "Name",
      value: "FIELD_DEFINITION",
    },
  ],
};

/**
 * Directive describing the multipliers
 *
 * @cost(multipliers: ["limit"])
 */
const limitArgumentDirective: ArgumentNode = {
  kind: "Argument",
  value: {
    kind: "ListValue",
    values: [
      {
        kind: "StringValue",
        value: "limit",
      },
    ],
  },
  name: {
    kind: "Name",
    value: "multipliers",
  },
};

/**
 * Directive describing the complexity
 *
 * @cost(value: 1)
 */
function getValueDirective(complexity: number): ArgumentNode {
  return {
    kind: "Argument",
    value: {
      kind: "IntValue",
      value: `${complexity}`,
    },
    name: {
      kind: "Name",
      value: "value",
    },
  };
}

/**
 * Utility function used to get the named type node from a type node
 */
function unwrapTypeNode(node: TypeNode): NamedTypeNode {
  if (node.kind === "NamedType") {
    return node;
  } else {
    return unwrapTypeNode(node.type);
  }
}

const ast = parse(
  fs.readFileSync("../graphql-schemas/schemas/yelp/yelp.graphql", "utf8")
);

const scalarNames = ["Int", "Float", "String", "ID", "Boolean"];
// Add custom defined scalars to the scalarNames list
visit(ast, {
  ScalarTypeDefinition: {
    enter(node: ScalarTypeDefinitionNode) {
      scalarNames.push(node.name.value);
    },
  },
  EnumTypeDefinition: {
    enter(node: EnumTypeDefinitionNode) {
      scalarNames.push(node.name.value);
    },
  },
});

// Created edited schema with directives
const editedAst = visit(ast, {
  Document: {
    enter(node: DocumentNode) {
      // Copy existing definitions
      const definitions: DefinitionNode[] = [];
      if (Array.isArray(node.definitions)) {
        node.definitions.forEach((definition) => {
          definitions.push(definition);
        });
      }

      // Add cost directive definition to definitions
      definitions.push(costDirectiveDefinition);

      const edited: DocumentNode = {
        ...node,
        ...{
          definitions,
        },
      };

      return edited;
    },
  },
  FieldDefinition: {
    enter(node: FieldDefinitionNode, key, parent, path, ancestors) {
      const parentType = ancestors[
        ancestors.length - 1
      ] as ObjectTypeDefinitionNode;

      const parentTypeName = parentType.name.value;
      const fieldName = node.name.value;
      const typeName = unwrapTypeNode(node.type).name.value;

      const complexityDirective: any = {
        kind: "Directive",
        name: {
          kind: "Name",
          value: "complexity",
        },
        arguments: [],
      };

      // Add a limit argument directive
      if (parentTypeName === "Query") {
        if (
          ["business_match", "reviews", "search", "event_search"].includes(
            fieldName
          )
        ) {
          complexityDirective.arguments.push(limitArgumentDirective);
        }
      }

      // Add a limit argument directive
      if (parentTypeName === "Business" && fieldName === "reviews") {
        complexityDirective.arguments.push(limitArgumentDirective);
      }

      /**
       * Add a value directive to all fields
       *
       * The values 0 and 1 must be explicitly expressed or else the complexity
       * calculation behaves unpredictably.
       */
      if (!scalarNames.includes(typeName)) {
        complexityDirective.arguments.push(getValueDirective(1));
      } else {
        complexityDirective.arguments.push(getValueDirective(0));
      }

      // Finalize newly added directives
      if (complexityDirective.arguments.length > 0) {
        // Copy existing directives
        const directives: DirectiveNode[] = [];
        if (Array.isArray(node.directives)) {
          node.directives.forEach((directive) => {
            directives.push(directive);
          });
        }

        // Add new directives
        directives.push(complexityDirective);

        const edited: FieldDefinitionNode = {
          ...node,
          ...{
            directives,
          },
        };

        return edited;
      }
    },
  },
});

fs.writeFileSync(
  "./configurations/graphql-query-complexity/graphql-query-complexity_yelp.graphql",
  print(editedAst)
);
