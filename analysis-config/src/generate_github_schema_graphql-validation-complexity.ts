// Change the GitHub GraphQL schema to fit the graphql-validation-complexity library

import {
  parse,
  print,
  visit,
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
  ArgumentNode,
} from "graphql";

import * as fs from "fs";

/**
 * Cost directive definition
 *
 * directive @cost(value: Int) on FIELD_DEFINITION
 */
const costDirectiveDefinition: DirectiveDefinitionNode = {
  kind: "DirectiveDefinition",
  name: {
    kind: "Name",
    value: "cost",
  },
  arguments: [
    {
      kind: "InputValueDefinition",
      name: {
        kind: "Name",
        value: "value",
      },
      type: {
        kind: "NamedType",
        name: {
          kind: "Name",
          value: "Int",
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
 * Cost factor directive definition
 *
 * directive @costFactor(value: Int) on FIELD_DEFINITION
 */
const costFactorDirectiveDefinition: DirectiveDefinitionNode = {
  kind: "DirectiveDefinition",
  name: {
    kind: "Name",
    value: "costFactor",
  },
  arguments: [
    {
      kind: "InputValueDefinition",
      name: {
        kind: "Name",
        value: "value",
      },
      type: {
        kind: "NamedType",
        name: {
          kind: "Name",
          value: "Int",
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
 * Directive describing the complexity
 *
 * @costFactor(value: 10)
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
  fs.readFileSync("../graphql-schemas/schemas/github/github.graphql", "utf8")
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

      /**
       * Add cost directive definition and cost factor directive definition to
       * definitions
       */
      definitions.push(costDirectiveDefinition);
      definitions.push(costFactorDirectiveDefinition);

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

      if (
        !scalarNames.includes(typeName) && // list of non-scalar types
        (node.type.kind === "ListType" || // list type
          (node.type.kind === "NonNullType" &&
            node.type.type.kind === "ListType")) // nonnull list type
      ) {
        const costFactorDirective: any = {
          kind: "Directive",
          name: {
            kind: "Name",
            value: "costFactor",
          },
          arguments: [],
        };

        if (fieldName === "edges" || fieldName === "nodes") {
          // Add a cost factor directive to all fields that are related to the connections pattern
          costFactorDirective.arguments.push(getValueDirective(100));
        } else {
          // Add a cost factor directive to all fields that have a default list size
          switch (fieldName) {
            case "marketplaceCategories":
              costFactorDirective.arguments.push(getValueDirective(35));
              break;

            case "codesOfConduct":
              costFactorDirective.arguments.push(getValueDirective(2));
              break;

            case "licenses":
              costFactorDirective.arguments.push(getValueDirective(13));
              break;

            case "relatedTopics":
              costFactorDirective.arguments.push(getValueDirective(10));
              break;

            case "limitations":
              costFactorDirective.arguments.push(getValueDirective(3));
              break;

            case "conditions":
              costFactorDirective.arguments.push(getValueDirective(5));
              break;

            case "permissions":
              costFactorDirective.arguments.push(getValueDirective(5));
              break;

            case "suggestedReviewers":
              costFactorDirective.arguments.push(getValueDirective(3));
              break;

            case "ranges":
              costFactorDirective.arguments.push(getValueDirective(10));
              break;

            case "entries":
              costFactorDirective.arguments.push(getValueDirective(5));
              break;

            case "reactionGroups":
              costFactorDirective.arguments.push(getValueDirective(8));
              break;

            case "textMatches":
              costFactorDirective.arguments.push(getValueDirective(3));
              break;

            case "contexts":
              costFactorDirective.arguments.push(getValueDirective(10));
              break;

            case "highlights":
              costFactorDirective.arguments.push(getValueDirective(3));
              break;

            case "identifiers":
              costFactorDirective.arguments.push(getValueDirective(2));
              break;

            case "references":
              costFactorDirective.arguments.push(getValueDirective(2));
              break;

            case "contributionDays":
              costFactorDirective.arguments.push(getValueDirective(7));
              break;

            case "weeks":
              costFactorDirective.arguments.push(getValueDirective(53));
              break;

            case "months":
              costFactorDirective.arguments.push(getValueDirective(13));
              break;

            default:
              // Fields with irregular default list sizes
              if (parentTypeName === "Gist" && fieldName === "files") {
                // Gist.files
                costFactorDirective.arguments.push(getValueDirective(10));
              } else if (fieldName.endsWith("ContributionsByRepository")) {
                costFactorDirective.arguments.push(getValueDirective(25));
              }
          }
        }

        // Copy existing directives
        const directives: DirectiveNode[] = [];
        if (Array.isArray(node.directives)) {
          node.directives.forEach((directive) => {
            directives.push(directive);
          });
        }

        if (costFactorDirective.arguments.length === 0) {
          throw new Error(
            `costFactor directive does not have any arguments, type: ${parentTypeName}, field: ${fieldName}`
          );
        } else {
          // Add new directives
          directives.push(costFactorDirective);

          const edited: FieldDefinitionNode = {
            ...node,
            ...{
              directives,
            },
          };

          return edited;
        }
      }
    },
  },
});

fs.writeFileSync(
  "./configurations/graphql-validation-complexity/graphql-validation-complexity_github.graphql",
  print(editedAst)
);
