import * as dotenv from "dotenv";
dotenv.config();

import * as fs from "fs";
import * as fetch from "node-fetch";
import * as graphql from "graphql";

if (process.env.YELP_ACCESS_TOKEN) {
  fetch
    .default("https://api.yelp.com/v3/graphql", {
      method: "POST",
      body: graphql.getIntrospectionQuery(),
      headers: {
        Authorization: `Bearer ${process.env.YELP_ACCESS_TOKEN}`,
        "Content-Type": "application/graphql",
      },
    })
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        throw new Error(
          `Could not Yelp GitHub GraphQL schema. Status: ${res.status} ${res.statusText}`
        );
      }
    })
    .then((json) => {
      fs.writeFileSync(
        "./schemas/yelp/yelp.graphql",
        graphql.printSchema(graphql.buildClientSchema(json.data))
      );
      console.log("Retrieved Yelp GraphQL schema");
    });
} else {
  console.log("Please provide a Yelp access token");
}
