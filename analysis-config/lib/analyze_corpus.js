"use strict";
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
var fs = __importStar(require("fs"));
var graphql_1 = require("graphql");
var run_graphql_validation_complexity_1 = require("./run_graphql-validation-complexity");
var run_graphql_query_complexity_1 = require("./run_graphql-query-complexity");
var run_graphql_cost_analysis_1 = require("./run_graphql-cost-analysis");
if (process.argv.length === 5) {
    var api = process.argv[2];
    var queryCorpusPath = process.argv[3];
    var analysisFolderPath = process.argv[4];
    var data = JSON.parse(fs.readFileSync(queryCorpusPath, "utf-8"));
    if (api === "github") {
        var graphqlValidationComplexityAnalysis = [];
        var graphqlQueryComplexityAnalysis = [];
        var graphqlCostAnalysisAnalysis = [];
        for (var i = 0; i < data.length; i++) {
            console.log("Processing GitHub corpus, " + (i + 1) + " out of " + data.length);
            var entry = data[i];
            try {
                var graphqlValidationComplexitySchema = graphql_1.buildSchema(fs.readFileSync("./configurations/graphql-validation-complexity/graphql-validation-complexity_github.graphql", "utf-8"));
                graphqlValidationComplexityAnalysis.push(__assign(__assign({}, run_graphql_validation_complexity_1.runGraphqlValidationComplexity(entry.query, entry.variableValues, graphqlValidationComplexitySchema)), { id: i }));
            }
            catch (error) {
                console.log("Could not run graphql-validation-complexity (libA). " + error);
            }
            try {
                var graphqlQueryComplexity = graphql_1.buildSchema(fs.readFileSync("./configurations/graphql-query-complexity/graphql-query-complexity_github.graphql", "utf-8"));
                graphqlQueryComplexityAnalysis.push(__assign(__assign({}, run_graphql_query_complexity_1.runGraphqlQueryComplexity(entry.query, entry.variableValues, graphqlQueryComplexity)), { id: i }));
            }
            catch (error) {
                console.log("Could not run graphql-query-complexity (libB). " + error);
            }
            try {
                var graphqlCostAnalysis = graphql_1.buildSchema(fs.readFileSync("./configurations/graphql-cost-analysis/graphql-cost-analysis_github.graphql", "utf-8"));
                graphqlCostAnalysisAnalysis.push(__assign(__assign({}, run_graphql_cost_analysis_1.runGraphqlCostAnalysis(entry.query, entry.variableValues, graphqlCostAnalysis)), { id: i }));
            }
            catch (error) {
                console.log("Could not run graphql-cost-analysis (libC). " + error);
            }
        }
        fs.writeFileSync(analysisFolderPath + "/graphql-validation-complexity.json", JSON.stringify(graphqlValidationComplexityAnalysis, null, 2));
        fs.writeFileSync(analysisFolderPath + "/graphql-query-complexity.json", JSON.stringify(graphqlQueryComplexityAnalysis, null, 2));
        fs.writeFileSync(analysisFolderPath + "/graphql-cost-analysis.json", JSON.stringify(graphqlCostAnalysisAnalysis, null, 2));
    }
    else if (api === "yelp") {
        var graphqlQueryComplexityAnalysis = [];
        var graphqlCostAnalysisAnalysis = [];
        for (var i = 0; i < data.length; i++) {
            console.log("Processing Yelp corpus, " + (i + 1) + " out of " + data.length);
            var entry = data[i];
            try {
                var graphqlQueryComplexity = graphql_1.buildSchema(fs.readFileSync("./configurations/graphql-query-complexity/graphql-query-complexity_yelp.graphql", "utf-8"));
                graphqlQueryComplexityAnalysis.push(__assign(__assign({}, run_graphql_query_complexity_1.runGraphqlQueryComplexity(entry.query, entry.variableValues, graphqlQueryComplexity)), { id: i }));
            }
            catch (error) {
                console.log("Could not run graphql-query-complexity (libB). " + error);
            }
            try {
                var graphqlCostAnalysis = graphql_1.buildSchema(fs.readFileSync("./configurations/graphql-cost-analysis/graphql-cost-analysis_yelp.graphql", "utf-8"));
                graphqlCostAnalysisAnalysis.push(__assign(__assign({}, run_graphql_cost_analysis_1.runGraphqlCostAnalysis(entry.query, entry.variableValues, graphqlCostAnalysis)), { id: i }));
            }
            catch (error) {
                console.log("Could not run graphql-cost-analysis (libC). " + error);
            }
        }
        fs.writeFileSync(analysisFolderPath + "/graphql-query-complexity.json", JSON.stringify(graphqlQueryComplexityAnalysis, null, 2));
        fs.writeFileSync(analysisFolderPath + "/graphql-cost-analysis.json", JSON.stringify(graphqlCostAnalysisAnalysis, null, 2));
    }
    else {
        console.log("Invalid API");
        console.log("node lib/analyze_corpus.js <API> <query corpus path> <analysis folder path>");
        console.log('Please select an API from the following options: "github" or "yelp"');
    }
}
else {
    console.log("Incorrect number of options");
    console.log("node lib/analyze_corpus.js <API> <query corpus path> <analysis folder path>");
    console.log('Please select an API from the following options: "github" or "yelp"');
    console.log("Please provide a path to the query corpus");
    console.log("Please provide a path to the analysis folder");
}
//# sourceMappingURL=analyze_corpus.js.map