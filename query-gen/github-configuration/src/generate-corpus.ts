import * as dotenv from "dotenv";
dotenv.config();

import { print } from "graphql";
import * as fs from "fs";

import { getGitHubQueryGenerator } from "./index";

// The number of randomly generated queries that should be created
const ITERATIONS = 5000;

if (process.env.GITHUB_ACCESS_TOKEN) {
  getGitHubQueryGenerator(process.env.GITHUB_ACCESS_TOKEN).then(
    (queryGenerator) => {
      const data = [];

      for (let i = 0; i < ITERATIONS; ) {
        try {
          const query = queryGenerator.generateRandomGitHubQuery();
          const { queryDocument, variableValues } = query;

          data.push({
            id: i,
            query: print(queryDocument),
            variableValues,
          });

          // Only increment iterations if the random query generator succeeds
          i++;
          console.log(`Generated query ${i} out of ${ITERATIONS}`);
        } catch (error) {
          console.log(error);
        }
      }

      fs.writeFileSync(
        "./query-corpus/github-query.json",
        JSON.stringify(data, null, 2)
      );
      console.log("Finished generating query corpus");
    }
  );
} else {
  console.log("Please provide a GitHub access token");
}
