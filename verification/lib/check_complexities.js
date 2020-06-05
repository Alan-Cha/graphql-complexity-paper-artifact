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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var measuredComplexityPath = "../measured-complexity/data/";
var analysisPath = "./analysis/";
var graphqlCostAnalysis = "graphql-cost-analysis.json";
var graphqlQueryComplexity = "graphql-query-complexity.json";
var graphqlValidationComplexity = "graphql-validation-complexity.json";
function matchingDataSets(pathA, pathB) {
    var dataA = JSON.parse(fs.readFileSync(pathA, "utf-8"));
    var dataB = JSON.parse(fs.readFileSync(pathB, "utf-8"));
    if (dataA.length !== dataB.length) {
        return false;
    }
    for (var i = 0; i < dataA.length; i++) {
        var entryA = dataA[i];
        var entryB = dataB[i];
        if (entryA.id !== entryB.id) {
            throw new Error("Mismatching entry IDs in " + pathA + " and " + pathB + " at index " + i);
        }
        if (entryA.typeComplexity !== entryB.typeComplexity) {
            return false;
        }
    }
    return true;
}
function printMatchingDataSets(pathA, pathB) {
    console.log("Matching data sets?");
    console.log(pathA + " and " + pathB);
    console.log("Verdict: " + matchingDataSets(pathA, pathB));
    console.log();
}
console.log("Verifying GitHub data sets...");
printMatchingDataSets(measuredComplexityPath + "github/" + graphqlCostAnalysis, analysisPath + "github/" + graphqlCostAnalysis);
printMatchingDataSets(measuredComplexityPath + "github/" + graphqlQueryComplexity, analysisPath + "github/" + graphqlQueryComplexity);
printMatchingDataSets(measuredComplexityPath + "github/" + graphqlValidationComplexity, analysisPath + "github/" + graphqlValidationComplexity);
console.log("Verifying Yelp data sets...");
printMatchingDataSets(measuredComplexityPath + "yelp/" + graphqlCostAnalysis, analysisPath + "yelp/" + graphqlCostAnalysis);
printMatchingDataSets(measuredComplexityPath + "yelp/" + graphqlQueryComplexity, analysisPath + "yelp/" + graphqlQueryComplexity);
//# sourceMappingURL=check_complexities.js.map