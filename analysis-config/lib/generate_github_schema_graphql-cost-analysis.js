"use strict";
// Change the GitHub GraphQL schema to fit the graphql-cost-analysis library
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
 * directive @cost(multipliers: [String], useMultipliers: Boolean, complexity: Int) on OBJECT | FIELD_DEFINITION
 */
var costDirectiveDefinition = {
    kind: 'DirectiveDefinition',
    name: {
        kind: 'Name',
        value: 'cost'
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
                    kind: 'NamedType',
                    name: {
                        kind: 'Name',
                        value: 'String'
                    }
                }
            }
        },
        {
            kind: 'InputValueDefinition',
            name: {
                kind: 'Name',
                value: 'useMultipliers'
            },
            type: {
                kind: 'NamedType',
                name: {
                    kind: 'Name',
                    value: 'Boolean'
                }
            }
        },
        {
            kind: 'InputValueDefinition',
            name: {
                kind: 'Name',
                value: 'complexity'
            },
            type: {
                kind: 'NamedType',
                name: {
                    kind: 'Name',
                    value: 'Int'
                }
            }
        }
    ],
    repeatable: false,
    locations: [
        {
            kind: 'Name',
            value: 'OBJECT'
        },
        {
            kind: 'Name',
            value: 'FIELD_DEFINITION'
        }
    ]
};
/**
 * Directive describing the multipliers
 *
 * e.g. @cost(multipliers: [ ... ])
 */
function multiplierArgument(values) {
    return {
        kind: 'Argument',
        value: {
            kind: 'ListValue',
            values: values
        },
        name: {
            kind: 'Name',
            value: 'multipliers'
        }
    };
}
/**
 * Directive describing the complexity
 *
 * @cost(complexity: 1)
 */
function getComplexityDirective(complexity) {
    return {
        kind: 'Argument',
        value: {
            kind: 'IntValue',
            value: "" + complexity
        },
        name: {
            kind: 'Name',
            value: 'complexity'
        }
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
var ast = graphql_1.parse(fs.readFileSync('../graphql-schemas/schemas/github/github.graphql', 'utf8'));
var scalarNames = ['Int', 'Float', 'String', 'ID', 'Boolean'];
// Add custom defined scalars to the scalarNames list
graphql_1.visit(ast, {
    ScalarTypeDefinition: {
        enter: function (node) {
            scalarNames.push(node.name.value);
        }
    },
    EnumTypeDefinition: {
        enter: function (node) {
            scalarNames.push(node.name.value);
        }
    }
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
                definitions: definitions
            });
            return edited;
        }
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
                    value: 'cost'
                },
                arguments: []
            };
            // Add multipliers directive
            // NESTED - BLOW-UP LIKELY!
            if (fieldName === 'relatedTopics') {
                complexityDirective.arguments.push(multiplierArgument([
                    {
                        kind: 'StringValue',
                        value: 'first'
                    }
                ]));
                // Gist.files
            }
            else if (parentTypeName === 'Gist' && fieldName === 'files') {
                complexityDirective.arguments.push(multiplierArgument([
                    {
                        kind: 'StringValue',
                        value: 'limit'
                    }
                ]));
                // commit-, issue-, pullRequest-, pullRequestReview-...
            }
            else if (fieldName.endsWith('ContributionsByRepository')) {
                complexityDirective.arguments.push(multiplierArgument([
                    {
                        kind: 'StringValue',
                        value: 'maxRepositories'
                    }
                ]));
                // Add a first/last argument directive if the field is a connection type
            }
            else if (typeName.endsWith('Connection')) {
                complexityDirective.arguments.push(multiplierArgument([
                    {
                        kind: 'StringValue',
                        value: 'first'
                    },
                    {
                        kind: 'StringValue',
                        value: 'last'
                    }
                ]));
            }
            // Add a complexity directive to all fields that are non-scalar
            if (!scalarNames.includes(typeName)) {
                complexityDirective.arguments.push(getComplexityDirective(1));
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
                    directives: directives_1
                });
                return edited;
            }
        }
    }
});
fs.writeFileSync('./configurations/graphql-cost-analysis/graphql-cost-analysis_github.graphql', graphql_1.print(editedAst));
//# sourceMappingURL=generate_github_schema_graphql-cost-analysis.js.map