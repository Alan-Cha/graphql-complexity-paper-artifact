"use strict";
// Change the Yelp GraphQL schema to fit the graphql-cost-analysis library
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var graphql_1 = require("graphql");
var fs = __importStar(require("fs"));
/**
 * Cost directive definition
 *
 * directive @complexity(multipliers: [String!], value: Int!) on FIELD_DEFINITION
 */
var costDirectiveDefinition = {
    kind: 'DirectiveDefinition',
    name: {
        kind: 'Name',
        value: 'complexity',
    },
    arguments: [
        {
            kind: 'InputValueDefinition',
            name: {
                kind: 'Name',
                value: 'multipliers',
            },
            type: {
                kind: 'ListType',
                type: {
                    kind: 'NonNullType',
                    type: {
                        kind: 'NamedType',
                        name: {
                            kind: 'Name',
                            value: 'String',
                        },
                    },
                },
            },
        },
        {
            kind: 'InputValueDefinition',
            name: {
                kind: 'Name',
                value: 'value',
            },
            type: {
                kind: 'NonNullType',
                type: {
                    kind: 'NamedType',
                    name: {
                        kind: 'Name',
                        value: 'Int',
                    },
                },
            },
        },
    ],
    repeatable: false,
    locations: [
        {
            kind: 'Name',
            value: 'FIELD_DEFINITION',
        },
    ],
};
/**
 * Directive describing the multipliers
 *
 * @cost(multipliers: ['limit'])
 */
var limitArgumentDirective = {
    kind: 'Argument',
    value: {
        kind: 'ListValue',
        values: [
            {
                kind: 'StringValue',
                value: 'limit',
            },
        ],
    },
    name: {
        kind: 'Name',
        value: 'multipliers',
    },
};
/**
 * Directive describing the complexity
 *
 * @cost(value: 1)
 */
function getValueDirective(complexity) {
    return {
        kind: 'Argument',
        value: {
            kind: 'IntValue',
            value: "" + complexity,
        },
        name: {
            kind: 'Name',
            value: 'value',
        },
    };
}
/**
 * Utility function used to get the named type node from a type node
 */
function unwrapTypeNode(node) {
    if (node.kind === 'NamedType') {
        return node;
    }
    else {
        return unwrapTypeNode(node.type);
    }
}
var ast = graphql_1.parse(fs.readFileSync('../graphql-schemas/schemas/yelp/yelp.graphql', 'utf8'));
var scalarNames = ['Int', 'Float', 'String', 'ID', 'Boolean'];
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
            // Add cost directive definition to definitions
            definitions.push(costDirectiveDefinition);
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
            var complexityDirective = {
                kind: 'Directive',
                name: {
                    kind: 'Name',
                    value: 'complexity',
                },
                arguments: [],
            };
            // Add a limit argument directive
            if (parentTypeName === 'Query') {
                if (['business_match', 'reviews', 'search', 'event_search'].includes(fieldName)) {
                    complexityDirective.arguments.push(limitArgumentDirective);
                }
            }
            // Add a limit argument directive
            if (parentTypeName === 'Business' && fieldName === 'reviews') {
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
            }
            else {
                complexityDirective.arguments.push(getValueDirective(0));
            }
            // Finalize newly added directives
            if (complexityDirective.arguments.length > 0) {
                // Copy existing directives
                var directives_1 = [];
                if (Array.isArray(node.directives)) {
                    node.directives.forEach(function (directive) {
                        directives_1.push(directive);
                    });
                }
                // Add new directives
                directives_1.push(complexityDirective);
                var edited = __assign(__assign({}, node), {
                    directives: directives_1,
                });
                return edited;
            }
        },
    },
});
fs.writeFileSync('./configurations/graphql-query-complexity/graphql-query-complexity_yelp.graphql', graphql_1.print(editedAst));
//# sourceMappingURL=generate_yelp_schema_graphql-query-complexity.js.map