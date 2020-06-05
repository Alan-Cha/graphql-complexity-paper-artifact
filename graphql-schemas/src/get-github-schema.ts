import * as fetch from "node-fetch";
import * as fs from "fs";

fetch
  .default(
    "https://raw.githubusercontent.com/octokit/graphql-schema/2a4687027d43125f92121aaa1a7d9f062d10a29e/schema.graphql"
  )
  .then((res) => {
    if (res.status === 200) {
      return res.text();
    } else {
      throw new Error(
        `Could not retrieve GitHub GraphQL schema. Status: ${res.status} ${res.statusText}`
      );
    }
  })
  .then((text) => {
    fs.writeFileSync("./schemas/github/github.graphql", text);
    console.log("Retrieved GitHub GraphQL schema");
  });
