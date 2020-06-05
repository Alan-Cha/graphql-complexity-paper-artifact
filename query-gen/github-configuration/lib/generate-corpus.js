"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
const graphql_1 = require("graphql");
const fs = require("fs");
const index_1 = require("./index");
// The number of randomly generated queries that should be created
const ITERATIONS = 5000;
if (process.env.GITHUB_ACCESS_TOKEN) {
  index_1
    .getGitHubQueryGenerator(process.env.GITHUB_ACCESS_TOKEN)
    .then((queryGenerator) => {
      const data = [];
      for (let i = 0; i < ITERATIONS; ) {
        try {
          const query = queryGenerator.generateRandomGitHubQuery();
          const { queryDocument, variableValues } = query;
          data.push({
            id: i,
            query: graphql_1.print(queryDocument),
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
    });
} else {
  console.log("Please provide a GitHub access token");
}
//# sourceMappingURL=generate-corpus.js.map
