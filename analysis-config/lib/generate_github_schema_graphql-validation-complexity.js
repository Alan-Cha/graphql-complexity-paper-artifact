"use strict";
// Change the GitHub GraphQL schema to fit the graphql-validation-complexity library
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var fs = __importStar(require("fs"));
/**
 * Cost directive definition
 *
 * directive @cost(value: Int) on FIELD_DEFINITION
 */
var costDirectiveDefinition = {
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
var costFactorDirectiveDefinition = {
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
function getValueDirective(complexity) {
  return {
    kind: "Argument",
    value: {
      kind: "IntValue",
      value: "" + complexity,
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
function unwrapTypeNode(node) {
  if (node.kind === "NamedType") {
    return node;
  } else {
    return unwrapTypeNode(node.type);
  }
}
var ast = graphql_1.parse(
  fs.readFileSync("../graphql-schemas/schemas/github/github.graphql", "utf8")
);
var scalarNames = ["Int", "Float", "String", "ID", "Boolean"];
// Add custom defined scalars to the scalarNames list
graphql_1.visit(ast, {
  ScalarTypeDefinition: {
    enter: function (node) {
      scalarNames.push(node.name.value);
    },
  },
  EnumTypeDefinition: {
    enter: function (node) {
      scalarNames.push(node.name.value);
    },
  },
});
// Created edited schema with directives
var editedAst = graphql_1.visit(ast, {
  Document: {
    enter: function (node) {
      // Copy existing definitions
      var definitions = [];
      if (Array.isArray(node.definitions)) {
        node.definitions.forEach(function (definition) {
          definitions.push(definition);
        });
      }
      /**
       * Add cost directive definition and cost factor directive definition to
       * definitions
       */
      definitions.push(costDirectiveDefinition);
      definitions.push(costFactorDirectiveDefinition);
      var edited = __assign(__assign({}, node), {
        definitions: definitions,
      });
      return edited;
    },
  },
  FieldDefinition: {
    enter: function (node, key, parent, path, ancestors) {
      var parentType = ancestors[ancestors.length - 1];
      var parentTypeName = parentType.name.value;
      var fieldName = node.name.value;
      var typeName = unwrapTypeNode(node.type).name.value;
      if (
        !scalarNames.includes(typeName) && // list of non-scalar types
        (node.type.kind === "ListType" || // list type
          (node.type.kind === "NonNullType" &&
            node.type.type.kind === "ListType")) // nonnull list type
      ) {
        var costFactorDirective = {
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
        var directives_1 = [];
        if (Array.isArray(node.directives)) {
          node.directives.forEach(function (directive) {
            directives_1.push(directive);
          });
        }
        if (costFactorDirective.arguments.length === 0) {
          throw new Error(
            "costFactor directive does not have any arguments, type: " +
              parentTypeName +
              ", field: " +
              fieldName
          );
        } else {
          // Add new directives
          directives_1.push(costFactorDirective);
          var edited = __assign(__assign({}, node), {
            directives: directives_1,
          });
          return edited;
        }
      }
    },
  },
});
fs.writeFileSync(
  "./configurations/graphql-validation-complexity/graphql-validation-complexity_github.graphql",
  graphql_1.print(editedAst)
);
//# sourceMappingURL=generate_github_schema_graphql-validation-complexity.js.map
