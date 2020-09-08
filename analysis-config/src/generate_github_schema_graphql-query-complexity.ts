// Change the GitHub GraphQL schema to fit the graphql-cost-analysis library

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
  StringValueNode
} from 'graphql'

import * as fs from 'fs'

/**
 * Cost directive definition
 * 
 * directive @complexity(multipliers: [String!], value: Int!) on FIELD_DEFINITION
 */
const costDirectiveDefinition: DirectiveDefinitionNode = {
  kind: 'DirectiveDefinition',
  name: {
    kind: 'Name',
    value: 'complexity'
  },
  arguments: [
    {
      kind: 'InputValueDefinition',
      name: {
        kind: 'Name',
        value: 'multipliers'
      },
      type: {
        kind: 'ListType',
        type: {
          kind: "NonNullType",
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: 'String'
            }
          }
        }
      }
    },
    {
      kind: 'InputValueDefinition',
      name: {
        kind: 'Name',
        value: 'value'
      },
      type: {
        kind: "NonNullType",
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Int'
          }
        }
      }
    }
  ],
  repeatable: false,
  locations: [
    {
      kind: 'Name',
      value: 'FIELD_DEFINITION'
    }
  ]
}

/**
 * Directive describing the multipliers
 * 
 * e.g. @cost(multipliers: [ ... ])
 */
function multiplierArgument(values: StringValueNode[]): ArgumentNode {
 return {
    kind: 'Argument',
    value: {
      kind: 'ListValue',
      values
    },
    name: {
      kind: 'Name', 
      value: 'multipliers'
    }
  }
  
}

/**
 * Directive describing the complexity
 * 
 * @cost(value: 1)
 */
function getValueDirective(complexity: number): ArgumentNode {
  return {
    kind: 'Argument',
    value: {
      kind: 'IntValue',
      value: `${complexity}`
    },
    name: {
      kind: 'Name', 
      value: 'value'
    }
  }
}

/**
 * Utility function used to get the named type node from a type node
 */
function unwrapTypeNode(node: TypeNode): NamedTypeNode {
  if (node.kind === 'NamedType') {
    return node
  } else {
    return unwrapTypeNode(node.type)
  }
}

const ast = parse(fs.readFileSync('../graphql-schemas/schemas/github/github.graphql', 'utf8'))

const scalarNames = ['Int', 'Float', 'String', 'ID', 'Boolean']
// Add custom defined scalars to the scalarNames list
visit(ast, {
  ScalarTypeDefinition: {
    enter(node: ScalarTypeDefinitionNode) {
      scalarNames.push(node.name.value)
    }
  },
  EnumTypeDefinition: {
    enter(node: EnumTypeDefinitionNode) {
      scalarNames.push(node.name.value)
    }
  }
})

// Created edited schema with directives
const editedAst = visit(ast, {
  Document: {
    enter(node: DocumentNode) {
      // Copy existing definitions
      const definitions: DefinitionNode[] = []
      if (Array.isArray(node.definitions)) {
        node.definitions.forEach((definition) => {
          definitions.push(definition)
        })
      }

      // Add cost directive definition to definitions
      definitions.push(costDirectiveDefinition)

      const edited: DocumentNode = {
        ...node,
        ...{
          definitions
        }
      }

      return edited
    }
  },
  FieldDefinition: {
    enter(node: FieldDefinitionNode, key, parent, path, ancestors) {
      const parentType = ancestors[ancestors.length - 1] as ObjectTypeDefinitionNode

      const parentTypeName = parentType.name.value
      const fieldName = node.name.value
      const typeName = unwrapTypeNode(node.type).name.value

      const complexityDirective: any = {
        kind: 'Directive', 
        name: {
          kind: 'Name', 
          value: 'complexity'
        },
        arguments: []
      }

      // Add multipliers directive
      // NESTED - BLOW-UP LIKELY!
      if (fieldName === 'relatedTopics') {
        complexityDirective.arguments.push(multiplierArgument(
          [ 
            {
              kind: 'StringValue',
              value: 'first'
            }
          ]
        ))

      // Gist.files
      } else if (parentTypeName === 'Gist' && fieldName === 'files') {
        complexityDirective.arguments.push(multiplierArgument(
          [ 
            {
              kind: 'StringValue',
              value: 'limit'
            }
          ]
        ))

      // commit-, issue-, pullRequest-, pullRequestReview-...
      } else if (fieldName.endsWith('ContributionsByRepository')) {
        complexityDirective.arguments.push(multiplierArgument(
          [ 
            {
              kind: 'StringValue',
              value: 'maxRepositories'
            }
          ]
        ))

      // Add a first/last argument directive if the field is a connection type
      } else if (typeName.endsWith('Connection')) {
        complexityDirective.arguments.push(multiplierArgument(
          [
            {
              kind: 'StringValue',
              value: 'first'
            },
            {
              kind: 'StringValue',
              value: 'last'
            }
          ]
        ))
      }

      /**
       * Add a value directive to all fields
       *
       * The values 0 and 1 must be explicitly expressed or else the complexity
       * calculation behaves unpredictably.
       */
      if (!scalarNames.includes(typeName)) {
        complexityDirective.arguments.push(getValueDirective(1))
      } else {
        complexityDirective.arguments.push(getValueDirective(0))
      }

      // Finalize newly added directives
      if (complexityDirective.arguments.length > 0) {
        // Copy existing directives
        const directives: DirectiveNode[] = []
        if (Array.isArray(node.directives)) {
          node.directives.forEach((directive) => {
            directives.push(directive)
          })
        }

        // Add new directives
        directives.push(complexityDirective)
  
        const edited: FieldDefinitionNode = {
          ...node,
          ...{
            directives
          }
        }
  
        return edited
      }
    }
  }
})

fs.writeFileSync('./configurations/graphql-query-complexity/graphql-query-complexity_github.graphql', print(editedAst))