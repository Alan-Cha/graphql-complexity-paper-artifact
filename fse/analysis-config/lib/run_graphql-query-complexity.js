"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runGraphqlQueryComplexity = void 0;
var graphql_1 = require("graphql");
var graphql_query_complexity_1 = require("graphql-query-complexity");
var replace_variables_graphql_query_1 = require("./utilities/replace_variables_graphql_query");
var time_utilities_1 = require("./utilities/time_utilities");
/**
 * For a given GraphQL query (and schema and variables, if applicable),
 * calculate the cost of running the query using the graphql-query-complexity
 * (libB) open-source library
 */
function runGraphqlQueryComplexity(query, variables, schema) {
    var ast = graphql_1.parse(query);
    var editedAST = replace_variables_graphql_query_1.replaceVariablesQuery(ast, schema, variables);
    var startQueryNS = time_utilities_1.getTimeInNano();
    var complexity = graphql_query_complexity_1.getComplexity({
        estimators: [graphql_query_complexity_1.directiveEstimator()],
        schema: schema,
        query: editedAST,
    });
    var stopQueryNS = time_utilities_1.getTimeInNano();
    var queryProcessingNS = stopQueryNS - startQueryNS;
    return {
        typeComplexity: complexity,
        queryProcessingNS: queryProcessingNS,
    };
}
exports.runGraphqlQueryComplexity = runGraphqlQueryComplexity;
//# sourceMappingURL=run_graphql-query-complexity.js.map