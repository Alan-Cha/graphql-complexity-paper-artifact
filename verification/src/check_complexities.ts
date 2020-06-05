import * as fs from "fs";

export type AnalysisData = {
  id: number;
  typeComplexity: number;
  queryProcessingNS: number;
};

const measuredComplexityPath = "../measured-complexity/data/";
const analysisPath = "./analysis/";

const graphqlCostAnalysis = "graphql-cost-analysis.json";
const graphqlQueryComplexity = "graphql-query-complexity.json";
const graphqlValidationComplexity = "graphql-validation-complexity.json";

function matchingDataSets(pathA: string, pathB: string): boolean {
  const dataA: AnalysisData[] = JSON.parse(fs.readFileSync(pathA, "utf-8"));
  const dataB: AnalysisData[] = JSON.parse(fs.readFileSync(pathB, "utf-8"));

  if (dataA.length !== dataB.length) {
    return false;
  }

  for (let i = 0; i < dataA.length; i++) {
    const entryA = dataA[i];
    const entryB = dataB[i];

    if (entryA.id !== entryB.id) {
      throw new Error(
        `Mismatching entry IDs in ${pathA} and ${pathB} at index ${i}`
      );
    }

    if (entryA.typeComplexity !== entryB.typeComplexity) {
      return false;
    }
  }

  return true;
}

function printMatchingDataSets(pathA: string, pathB: string) {
  console.log("Matching data sets?");
  console.log(`${pathA} and ${pathB}`);
  console.log(`Verdict: ${matchingDataSets(pathA, pathB)}`);
  console.log();
}

console.log("Verifying GitHub data sets...");
printMatchingDataSets(
  `${measuredComplexityPath}github/${graphqlCostAnalysis}`,
  `${analysisPath}github/${graphqlCostAnalysis}`
);
printMatchingDataSets(
  `${measuredComplexityPath}github/${graphqlQueryComplexity}`,
  `${analysisPath}github/${graphqlQueryComplexity}`
);
printMatchingDataSets(
  `${measuredComplexityPath}github/${graphqlValidationComplexity}`,
  `${analysisPath}github/${graphqlValidationComplexity}`
);

console.log("Verifying Yelp data sets...");
printMatchingDataSets(
  `${measuredComplexityPath}yelp/${graphqlCostAnalysis}`,
  `${analysisPath}yelp/${graphqlCostAnalysis}`
);
printMatchingDataSets(
  `${measuredComplexityPath}yelp/${graphqlQueryComplexity}`,
  `${analysisPath}yelp/${graphqlQueryComplexity}`
);
