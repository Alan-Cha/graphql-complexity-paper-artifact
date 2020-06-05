import * as fs from "fs";
import { buildSchema } from "graphql";

import { Data } from "./types/experiment";

import { runGraphqlValidationComplexity } from "./run_graphql-validation-complexity";
import { runGraphqlQueryComplexity } from "./run_graphql-query-complexity";
import { runGraphqlCostAnalysis } from "./run_graphql-cost-analysis";

// node lib/analyze_corpus.js <API> <query corpus path> <analysis folder path>

export type AnalysisData = {
  id: number;
  typeComplexity: number;
  queryProcessingNS: number;
};

if (process.argv.length === 5) {
  const api = process.argv[2];
  const queryCorpusPath = process.argv[3];
  const analysisFolderPath = process.argv[4];

  const data: any = JSON.parse(fs.readFileSync(queryCorpusPath, "utf-8"));

  if (api === "github") {
    const graphqlValidationComplexityAnalysis: AnalysisData[] = [];
    const graphqlQueryComplexityAnalysis: AnalysisData[] = [];
    const graphqlCostAnalysisAnalysis: AnalysisData[] = [];

    for (let i = 0; i < data.length; i++) {
      console.log(`Processing GitHub corpus, ${i + 1} out of ${data.length}`);
      const entry = data[i];

      try {
        const graphqlValidationComplexitySchema = buildSchema(
          fs.readFileSync(
            "./configurations/graphql-validation-complexity/graphql-validation-complexity_github.graphql",
            "utf-8"
          )
        );
        graphqlValidationComplexityAnalysis.push({
          ...runGraphqlValidationComplexity(
            entry.query,
            entry.variableValues,
            graphqlValidationComplexitySchema
          ),
          id: i,
        });
      } catch (error) {
        console.log(
          `Could not run graphql-validation-complexity (libA). ${error}`
        );
      }

      try {
        const graphqlQueryComplexity = buildSchema(
          fs.readFileSync(
            "./configurations/graphql-query-complexity/graphql-query-complexity_github.graphql",
            "utf-8"
          )
        );
        graphqlQueryComplexityAnalysis.push({
          ...runGraphqlQueryComplexity(
            entry.query,
            entry.variableValues,
            graphqlQueryComplexity
          ),
          id: i,
        });
      } catch (error) {
        console.log(`Could not run graphql-query-complexity (libB). ${error}`);
      }

      try {
        const graphqlCostAnalysis = buildSchema(
          fs.readFileSync(
            "./configurations/graphql-cost-analysis/graphql-cost-analysis_github.graphql",
            "utf-8"
          )
        );
        graphqlCostAnalysisAnalysis.push({
          ...runGraphqlCostAnalysis(
            entry.query,
            entry.variableValues,
            graphqlCostAnalysis
          ),
          id: i,
        });
      } catch (error) {
        console.log(`Could not run graphql-cost-analysis (libC). ${error}`);
      }
    }

    fs.writeFileSync(
      `${analysisFolderPath}/graphql-validation-complexity.json`,
      JSON.stringify(graphqlValidationComplexityAnalysis, null, 2)
    );
    fs.writeFileSync(
      `${analysisFolderPath}/graphql-query-complexity.json`,
      JSON.stringify(graphqlQueryComplexityAnalysis, null, 2)
    );
    fs.writeFileSync(
      `${analysisFolderPath}/graphql-cost-analysis.json`,
      JSON.stringify(graphqlCostAnalysisAnalysis, null, 2)
    );
  } else if (api === "yelp") {
    const graphqlQueryComplexityAnalysis: AnalysisData[] = [];
    const graphqlCostAnalysisAnalysis: AnalysisData[] = [];

    for (let i = 0; i < data.length; i++) {
      console.log(`Processing Yelp corpus, ${i + 1} out of ${data.length}`);
      const entry = data[i];

      try {
        const graphqlQueryComplexity = buildSchema(
          fs.readFileSync(
            "./configurations/graphql-query-complexity/graphql-query-complexity_yelp.graphql",
            "utf-8"
          )
        );
        graphqlQueryComplexityAnalysis.push({
          ...runGraphqlQueryComplexity(
            entry.query,
            entry.variableValues,
            graphqlQueryComplexity
          ),
          id: i,
        });
      } catch (error) {
        console.log(`Could not run graphql-query-complexity (libB). ${error}`);
      }

      try {
        const graphqlCostAnalysis = buildSchema(
          fs.readFileSync(
            "./configurations/graphql-cost-analysis/graphql-cost-analysis_yelp.graphql",
            "utf-8"
          )
        );
        graphqlCostAnalysisAnalysis.push({
          ...runGraphqlCostAnalysis(
            entry.query,
            entry.variableValues,
            graphqlCostAnalysis
          ),
          id: i,
        });
      } catch (error) {
        console.log(`Could not run graphql-cost-analysis (libC). ${error}`);
      }
    }

    fs.writeFileSync(
      `${analysisFolderPath}/graphql-query-complexity.json`,
      JSON.stringify(graphqlQueryComplexityAnalysis, null, 2)
    );
    fs.writeFileSync(
      `${analysisFolderPath}/graphql-cost-analysis.json`,
      JSON.stringify(graphqlCostAnalysisAnalysis, null, 2)
    );
  } else {
    console.log("Invalid API");
    console.log(
      "node lib/analyze_corpus.js <API> <query corpus path> <analysis folder path>"
    );
    console.log(
      'Please select an API from the following options: "github" or "yelp"'
    );
  }
} else {
  console.log("Incorrect number of options");
  console.log(
    "node lib/analyze_corpus.js <API> <query corpus path> <analysis folder path>"
  );
  console.log(
    'Please select an API from the following options: "github" or "yelp"'
  );
  console.log("Please provide a path to the query corpus");
  console.log("Please provide a path to the analysis folder");
}
