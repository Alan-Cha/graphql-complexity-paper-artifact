"use strict";
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
var dotenv = __importStar(require("dotenv"));
dotenv.config();
var graphql_1 = require("graphql");
var fs = __importStar(require("fs"));
var run_graphql_validation_complexity_1 = require("./run_graphql-validation-complexity");
var run_graphql_query_complexity_1 = require("./run_graphql-query-complexity");
var run_graphql_cost_analysis_1 = require("./run_graphql-cost-analysis");
var lib_1 = require("../../query-gen/github-configuration/lib");
var lib_2 = require("../../query-gen/yelp-configuration/lib");
// node lib/analyze_random_query.js <API>
if (process.argv.length === 3) {
    var api = process.argv[2];
    if (api === "github") {
        if (process.env.GITHUB_ACCESS_TOKEN) {
            var gitHubAccessToken = process.env.GITHUB_ACCESS_TOKEN;
            lib_1.getGitHubQueryGenerator(gitHubAccessToken).then(function (queryGenerator) {
                var query = queryGenerator.generateRandomGitHubQuery();
                var queryDocument = query.queryDocument, variableValues = query.variableValues;
                var queryString = graphql_1.print(queryDocument);
                console.log(queryString);
                console.log(JSON.stringify(variableValues, null, 2));
                console.log();
                try {
                    var graphqlValidationComplexitySchema = graphql_1.buildSchema(fs.readFileSync("./configurations/graphql-validation-complexity/graphql-validation-complexity_github.graphql", "utf-8"));
                    console.log("graphql-validation-complexity (libA) results:");
                    console.log(run_graphql_validation_complexity_1.runGraphqlValidationComplexity(queryString, variableValues, graphqlValidationComplexitySchema));
                    console.log();
                }
                catch (error) {
                    console.log("Could not run graphql-validation-complexity (libA). " + error);
                }
                try {
                    var graphqlQueryComplexity = graphql_1.buildSchema(fs.readFileSync("./configurations/graphql-query-complexity/graphql-query-complexity_github.graphql", "utf-8"));
                    console.log("graphql-query-complexity (libB) results:");
                    console.log(run_graphql_query_complexity_1.runGraphqlQueryComplexity(queryString, variableValues, graphqlQueryComplexity));
                    console.log();
                }
                catch (error) {
                    console.log("Could not run graphql-query-complexity (libB). " + error);
                }
                try {
                    var graphqlCostAnalysis = graphql_1.buildSchema(fs.readFileSync("./configurations/graphql-cost-analysis/graphql-cost-analysis_github.graphql", "utf-8"));
                    console.log("graphql-cost-analysis (libC) results:");
                    console.log(run_graphql_cost_analysis_1.runGraphqlCostAnalysis(queryString, variableValues, graphqlCostAnalysis));
                }
                catch (error) {
                    console.log("Could not run graphql-cost-analysis (libC). " + error);
                }
            });
        }
        else {
            console.log("Please provide a GitHub access token");
        }
    }
    else if (api === "yelp") {
        if (process.env.YELP_ACCESS_TOKEN) {
            var yelpAccessToken = process.env.YELP_ACCESS_TOKEN;
            lib_2.getYelpQueryGenerator(yelpAccessToken).then(function (queryGenerator) {
                var query = queryGenerator.generateRandomYelpQuery();
                var queryDocument = query.queryDocument, variableValues = query.variableValues;
                var queryString = graphql_1.print(queryDocument);
                console.log(queryString);
                console.log(JSON.stringify(variableValues, null, 2));
                console.log();
                // We do not provide a Yelp configuration for graphql-validation-complexity (libA)
                console.log("We do not provide a Yelp configuration for graphql-validation-complexity (libA)");
                console.log();
                try {
                    var graphqlQueryComplexity = graphql_1.buildSchema(fs.readFileSync("./configurations/graphql-query-complexity/graphql-query-complexity_yelp.graphql", "utf-8"));
                    console.log("graphql-query-complexity (libB) results:");
                    console.log(run_graphql_query_complexity_1.runGraphqlQueryComplexity(queryString, variableValues, graphqlQueryComplexity));
                    console.log();
                }
                catch (error) {
                    console.log("Could not run graphql-query-complexity (libB). " + error);
                }
                try {
                    var graphqlCostAnalysis = graphql_1.buildSchema(fs.readFileSync("./configurations/graphql-cost-analysis/graphql-cost-analysis_yelp.graphql", "utf-8"));
                    console.log("graphql-cost-analysis (libC) results:");
                    console.log(run_graphql_cost_analysis_1.runGraphqlCostAnalysis(queryString, variableValues, graphqlCostAnalysis));
                }
                catch (error) {
                    console.log("Could not run graphql-cost-analysis (libC). " + error);
                }
            });
        }
        else {
            console.log("Please provide a Yelp access token");
        }
    }
    else {
        console.log("Invalid API");
        console.log("node lib/analyze_random_query.js <API>");
        console.log('Please select an API from the following options: "github" or "yelp"');
    }
}
else {
    console.log("Incorrect number of options");
    console.log("node lib/analyze_random_query.js <API>");
    console.log('Please select an API from the following options: "github" or "yelp"');
}
//# sourceMappingURL=analyze_random_query.js.map