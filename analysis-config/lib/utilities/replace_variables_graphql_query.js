"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceVariablesQuery = void 0;
var graphql_1 = require("graphql");
function getOperationType(opNode, schema) {
  switch (opNode.operation) {
    case "query":
      return schema.getQueryType();
    case "mutation":
      return schema.getMutationType();
    case "subscription":
      return schema.getSubscriptionType();
    default:
      throw new Error(
        'Cannot analyze response for operation "' + opNode.operation + '"'
      );
  }
}
function replaceVariablesQuery(ast, schema, variables) {
  if (typeof variables === "object") {
    var state_1 = {
      visitedTypes: [],
      fields: [],
    };
    return graphql_1.visit(ast, {
      OperationDefinition: {
        enter: function (node) {
          var operationNodeType = getOperationType(node, schema);
          state_1.visitedTypes.push(graphql_1.getNamedType(operationNodeType));
          return __assign(__assign({}, node), {
            variableDefinitions: [],
          });
        },
        leave: function () {
          state_1.visitedTypes.pop();
        },
      },
      Field: {
        enter: function (node) {
          var fieldName = node.name.value;
          var parentType =
            state_1.visitedTypes[state_1.visitedTypes.length - 1];
          var type = parentType.getFields()[fieldName].type;
          if (graphql_1.isNonNullType(type)) {
            type = graphql_1.getNullableType(type);
          }
          var typeName = graphql_1.getNamedType(type);
          state_1.visitedTypes.push(typeName);
          var field = parentType.getFields()[fieldName];
          state_1.fields.push(field);
        },
        leave: function () {
          state_1.fields.pop();
          state_1.visitedTypes.pop();
        },
      },
      FragmentDefinition: {
        enter: function (node) {
          return __assign(__assign({}, node), {
            variableDefinitions: [],
          });
        },
      },
      Argument: {
        enter: function (node, key, parent, path, ancestors) {
          if (node.value.kind === "Variable") {
            var variableKey = node.value.name.value;
            if (variableKey in variables) {
              var variableValue = variables[variableKey];
              var field = state_1.fields[state_1.fields.length - 1];
              var arg = field.args.find(function (arg) {
                return arg.name === node.name.value;
              });
              if (arg) {
                if (graphql_1.isEnumType(graphql_1.getNamedType(arg.type))) {
                  var enumValueNode = {
                    kind: "EnumValue",
                    value: variableValue.toString(),
                  };
                  return __assign(__assign({}, node), {
                    value: enumValueNode,
                  });
                } else {
                  switch (typeof variableValue) {
                    case "number":
                      var intValueNode = {
                        kind: "IntValue",
                        value: variableValue.toString(),
                      };
                      return __assign(__assign({}, node), {
                        value: intValueNode,
                      });
                    case "string":
                      var stringValueNode = {
                        kind: "StringValue",
                        value: variableValue,
                      };
                      return __assign(__assign({}, node), {
                        value: stringValueNode,
                      });
                    default:
                      throw new Error(
                        "Could not handle variable value type '" +
                          typeof variableValue +
                          "'"
                      );
                  }
                }
              }
            } else {
              throw new Error(
                "Could not find variable key '" +
                  variableKey +
                  "' in variables '" +
                  variables +
                  "'"
              );
            }
          }
        },
      },
    });
  } else {
    return ast;
  }
}
exports.replaceVariablesQuery = replaceVariablesQuery;
//# sourceMappingURL=replace_variables_graphql_query.js.map
