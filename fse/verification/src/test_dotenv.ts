import * as dotenv from "dotenv";
dotenv.config();

import * as fetch from "node-fetch";

if (!process.env.GITHUB_ACCESS_TOKEN) {
  throw new Error("Please provide a GitHub access token");
}

if (!process.env.YELP_ACCESS_TOKEN) {
  throw new Error("Please provide a Yelp access token");
}

Promise.all([
  new Promise((resolve, reject) => {
    fetch
      .default("https://api.github.com/graphql", {
        method: "POST",
        body: JSON.stringify({
          query: `{ 
          viewer { 
            login
          }
        }`,
        }),
        headers: {
          Authorization: `token ${process.env.GITHUB_ACCESS_TOKEN}`,
        },
      })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(
            `Could not use GitHub access token to access the GitHub API. Received ${res.status} ${res.statusText}`
          );
        }
      });
  }),
  new Promise((resolve, reject) => {
    fetch
      .default("https://api.yelp.com/v3/graphql", {
        method: "POST",
        body: `{
        event_search(limit: 5) {
          total
        }
      }`,
        headers: {
          Authorization: `Bearer ${process.env.YELP_ACCESS_TOKEN}`,
          "Content-Type": "application/graphql",
        },
      })
      .then((res) => {
        if (res.status !== 200) {
          throw new Error(
            `Could not use Yelp access token to access the Yelp API. Received ${res.status} ${res.statusText}`
          );
        }
      });
  }),
]);
