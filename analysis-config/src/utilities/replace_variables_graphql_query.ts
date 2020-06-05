import {
  visit,
  ArgumentNode,
  ASTNode,
  EnumValueNode,
  FieldNode,
  FragmentDefinitionNode,
  getNamedType,
  getNullableType,
  GraphQLField,
  GraphQLObjectType,
  GraphQLSchema,
  IntValueNode,
  isEnumType,
  isNonNullType,
  OperationDefinitionNode,
  StringValueNode,
  VariableNode,
} from "graphql";

function getOperationType(
  opNode: OperationDefinitionNode,
  schema: GraphQLSchema
): GraphQLObjectType {
  switch (opNode.operation) {
    case "query":
      return schema.getQueryType() as GraphQLObjectType;
    case "mutation":
      return schema.getMutationType() as GraphQLObjectType;
    case "subscription":
      return schema.getSubscriptionType() as GraphQLObjectType;
    default:
      throw new Error(
        `Cannot analyze response for operation "${opNode.operation}"`
      );
  }
}

type State = {
  visitedTypes: GraphQLObjectType[];
  fields: GraphQLField<any, any>[];
};

export function replaceVariablesQuery(
  ast: ASTNode,
  schema: GraphQLSchema,
  variables: any
): ASTNode {
  if (typeof variables === "object") {
    const state: State = {
      visitedTypes: [],
      fields: [],
    };

    return visit(ast, {
      OperationDefinition: {
        enter(node: OperationDefinitionNode) {
          const operationNodeType = getOperationType(node, schema);
          state.visitedTypes.push(
            getNamedType(operationNodeType) as GraphQLObjectType
          );

          return {
            ...node,
            ...{
              variableDefinitions: [],
            },
          };
        },
        leave() {
          state.visitedTypes.pop();
        },
      },
      Field: {
        enter(node: FieldNode) {
          const fieldName = node.name.value;
          const parentType = state.visitedTypes[state.visitedTypes.length - 1];
          let type = parentType.getFields()[fieldName].type;
          if (isNonNullType(type)) {
            type = getNullableType(type);
          }

          const typeName = getNamedType(type);
          state.visitedTypes.push(typeName as GraphQLObjectType);
          const field = parentType.getFields()[fieldName];
          state.fields.push(field);
        },
        leave() {
          state.fields.pop();
          state.visitedTypes.pop();
        },
      },
      FragmentDefinition: {
        enter(node: FragmentDefinitionNode) {
          return {
            ...node,
            ...{
              variableDefinitions: [],
            },
          };
        },
      },
      Argument: {
        enter(node: ArgumentNode, key, parent, path, ancestors) {
          if (node.value.kind === "Variable") {
            const variableKey = (node.value as VariableNode).name.value;
            if (variableKey in variables) {
              const variableValue = variables[variableKey];

              const field = state.fields[state.fields.length - 1];

              const arg = field.args.find((arg) => {
                return arg.name === node.name.value;
              });

              if (arg) {
                if (isEnumType(getNamedType(arg.type))) {
                  const enumValueNode: EnumValueNode = {
                    kind: "EnumValue",
                    value: variableValue.toString(),
                  };

                  return {
                    ...node,
                    ...{
                      value: enumValueNode,
                    },
                  };
                } else {
                  switch (typeof variableValue) {
                    case "number":
                      const intValueNode: IntValueNode = {
                        kind: "IntValue",
                        value: variableValue.toString(),
                      };

                      return {
                        ...node,
                        ...{
                          value: intValueNode,
                        },
                      };

                    case "string":
                      const stringValueNode: StringValueNode = {
                        kind: "StringValue",
                        value: variableValue,
                      };

                      return {
                        ...node,
                        ...{
                          value: stringValueNode,
                        },
                      };

                    default:
                      throw new Error(
                        `Could not handle variable value type '${typeof variableValue}'`
                      );
                  }
                }
              }
            } else {
              throw new Error(
                `Could not find variable key '${variableKey}' in variables '${variables}'`
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
