import * as dotenv from "dotenv";
dotenv.config();

import { print, buildSchema } from "graphql";
import * as fs from "fs";

import { runGraphqlValidationComplexity } from "./run_graphql-validation-complexity";
import { runGraphqlQueryComplexity } from "./run_graphql-query-complexity";
import { runGraphqlCostAnalysis } from "./run_graphql-cost-analysis";

import { getGitHubQueryGenerator } from "../../query-gen/github-configuration/lib";
import { getYelpQueryGenerator } from "../../query-gen/yelp-configuration/lib";

// node lib/analyze_random_query.js <API>

if (process.argv.length === 3) {
  const api = process.argv[2];

  if (api === "github") {
    if (process.env.GITHUB_ACCESS_TOKEN) {
      const gitHubAccessToken = process.env.GITHUB_ACCESS_TOKEN;
      getGitHubQueryGenerator(gitHubAccessToken).then((queryGenerator) => {
        const query = queryGenerator.generateRandomGitHubQuery();
        const { queryDocument, variableValues } = query;

        const queryString = print(queryDocument);

        console.log(queryString);
        console.log(JSON.stringify(variableValues, null, 2));
        console.log();

        try {
          const graphqlValidationComplexitySchema = buildSchema(
            fs.readFileSync(
              "./configurations/graphql-validation-complexity/graphql-validation-complexity_github.graphql",
              "utf-8"
            )
          );
          console.log("graphql-validation-complexity (libA) results:");
          console.log(
            runGraphqlValidationComplexity(
              queryString,
              variableValues,
              graphqlValidationComplexitySchema
            )
          );
          console.log();
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
          console.log("graphql-query-complexity (libB) results:");
          console.log(
            runGraphqlQueryComplexity(
              queryString,
              variableValues,
              graphqlQueryComplexity
            )
          );
          console.log();
        } catch (error) {
          console.log(
            `Could not run graphql-query-complexity (libB). ${error}`
          );
        }

        try {
          const graphqlCostAnalysis = buildSchema(
            fs.readFileSync(
              "./configurations/graphql-cost-analysis/graphql-cost-analysis_github.graphql",
              "utf-8"
            )
          );
          console.log("graphql-cost-analysis (libC) results:");
          console.log(
            runGraphqlCostAnalysis(
              queryString,
              variableValues,
              graphqlCostAnalysis
            )
          );
        } catch (error) {
          console.log(`Could not run graphql-cost-analysis (libC). ${error}`);
        }
      });
    } else {
      console.log("Please provide a GitHub access token");
    }
  } else if (api === "yelp") {
    if (process.env.YELP_ACCESS_TOKEN) {
      const yelpAccessToken = process.env.YELP_ACCESS_TOKEN;
      getYelpQueryGenerator(yelpAccessToken).then((queryGenerator) => {
        const query = queryGenerator.generateRandomYelpQuery();
        const { queryDocument, variableValues } = query;

        const queryString = print(queryDocument);

        console.log(queryString);
        console.log(JSON.stringify(variableValues, null, 2));
        console.log();

        // We do not provide a Yelp configuration for graphql-validation-complexity (libA)
        console.log(
          "We do not provide a Yelp configuration for graphql-validation-complexity (libA)"
        );
        console.log();

        try {
          const graphqlQueryComplexity = buildSchema(
            fs.readFileSync(
              "./configurations/graphql-query-complexity/graphql-query-complexity_yelp.graphql",
              "utf-8"
            )
          );
          console.log("graphql-query-complexity (libB) results:");
          console.log(
            runGraphqlQueryComplexity(
              queryString,
              variableValues,
              graphqlQueryComplexity
            )
          );
          console.log();
        } catch (error) {
          console.log(
            `Could not run graphql-query-complexity (libB). ${error}`
          );
        }

        try {
          const graphqlCostAnalysis = buildSchema(
            fs.readFileSync(
              "./configurations/graphql-cost-analysis/graphql-cost-analysis_yelp.graphql",
              "utf-8"
            )
          );
          console.log("graphql-cost-analysis (libC) results:");
          console.log(
            runGraphqlCostAnalysis(
              queryString,
              variableValues,
              graphqlCostAnalysis
            )
          );
        } catch (error) {
          console.log(`Could not run graphql-cost-analysis (libC). ${error}`);
        }
      });
    } else {
      console.log("Please provide a Yelp access token");
    }
  } else {
    console.log("Invalid API");
    console.log("node lib/analyze_random_query.js <API>");
    console.log(
      'Please select an API from the following options: "github" or "yelp"'
    );
  }
} else {
  console.log("Incorrect number of options");
  console.log("node lib/analyze_random_query.js <API>");
  console.log(
    'Please select an API from the following options: "github" or "yelp"'
  );
}
