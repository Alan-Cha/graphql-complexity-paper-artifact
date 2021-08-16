# Summary

This directory describes the schemas that we used for the GitHub and Yelp APIs.
We provide scripts to obtain these schemas rather than copies of the schemas, to avoid violating those companies' copyright.

**GitHub**
The GitHub schema was obtained from [octokit/graphql-schema](https://github.com/octokit/graphql-schema) repository. We used the version from commit [2a4687027d43125f92121aaa1a7d9f062d10a29e](https://github.com/octokit/graphql-schema/tree/2a4687027d43125f92121aaa1a7d9f062d10a29e) (April 2019).

**Yelp**
The Yelp schema was obtained using an introspection query in April 2019. We sent this query to [https://api.yelp.com/v3/graphql](https://api.yelp.com/v3/graphql), supplying an access token. See [this site](https://www.yelp.com/developers/graphql/guides/intro) for instructions.

## Table of contents

| Item          | Location        |
| ------------- | --------------- |
| GitHub schema | schemas/github/ |
| Yelp schema   | schemas/yelp/   |

## Fetching schemas

We have provided scripts that can fetch the GitHub schema by downloading it from the specified commit and the Yelp schema by running an introspection query.

Running the introspection query against the Yelp GraphQL API requires an [API key](https://www.yelp.com/developers/documentation/v3/authentication), which you will need to provide. To do so, create a file named `.env` with the following:

```
YELP_ACCESS_TOKEN={your API key}
```

Then, run the following commands:

```bash
npm ci
npm run fetch-schemas
```

After doing so, the [schemas/](schemas/) folder should be populated with the Yelp and GitHub schemas.

## Disclaimer

Please note that we cannot point to a single point in time for the Yelp API and the retrieved schema may not be representative of the schema that we used at the time of experimentation.
