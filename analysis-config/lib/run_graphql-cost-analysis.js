"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runGraphqlCostAnalysis = void 0;
var graphql_1 = require("graphql");
// @ts-ignore
var graphql_cost_analysis_1 = __importDefault(require("graphql-cost-analysis"));
var replace_variables_graphql_query_1 = require("./utilities/replace_variables_graphql_query");
var time_utilities_1 = require("./utilities/time_utilities");
/**
 * For a given GraphQL query (and schema and variables, if applicable),
 * calculate the cost of running the query using the graphql-cost-analysis
 * (libC) open-source library
 */
function runGraphqlCostAnalysis(query, variables, schema) {
    var ast = graphql_1.parse(query);
    var editedAST = replace_variables_graphql_query_1.replaceVariablesQuery(ast, schema, variables);
    var typeInfo = new graphql_1.TypeInfo(schema);
    var startQueryNS = time_utilities_1.getTimeInNano();
    var context = new graphql_1.ValidationContext(schema, editedAST, typeInfo, function (error) {
        return console.log(error);
    });
    var visitor = graphql_cost_analysis_1.default({
        maximumCost: 999999,
    })(context);
    graphql_1.visit(editedAST, graphql_1.visitWithTypeInfo(typeInfo, visitor));
    var stopQueryNS = time_utilities_1.getTimeInNano();
    var queryProcessingNS = stopQueryNS - startQueryNS;
    var cost = visitor.cost;
    return {
        typeComplexity: cost,
        queryProcessingNS: queryProcessingNS,
    };
}
exports.runGraphqlCostAnalysis = runGraphqlCostAnalysis;
//# sourceMappingURL=run_graphql-cost-analysis.js.map