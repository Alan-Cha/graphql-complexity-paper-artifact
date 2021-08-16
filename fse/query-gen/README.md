# Summary

We open-sourced the query generator described in \$6.1 as a [standalone project](https://github.com/ibm/graphql-query-generator) (also available in the sub-directory [query-generator/](query-generator/)).

We have configured this query generator to create queries similar to the ones used in \$6 for the GitHub and Yelp APIs as of June 2020 (available in [github-configuration/](github-configuration/) and [yelp-configuration/](yelp-configuration/)).

## Table of Contents

| Item                                  | Location                                       |
| ------------------------------------- | ---------------------------------------------- |
| Query generator                       | [query-generator/](query-generator/)           |
| Query generator configured for GitHub | [github-configuration/](github-configuration/) |
| Query generator configured for Yelp   | [yelp-configuration/](yelp-configuration/)     |

---

To generate queries for GitHub and Yelp APIs, in [github-configuration/](github-configuration/) and [yelp-configuration/](yelp-configuration/) execute the following commands after adding your API key in a `.env` file:

```bash
npm ci
npm run generate-corpus
```

Additional details are provided in each directory.

## How we configured the query generator for our query-response corpus

As described in \$6.1, the tool recursively and randomly generates GraphQL queries based on a schema. It requires several parameters as well as a set of providers, a set of functions. The query generator inserts new fields based on these parameters and determines argument values by using the providers.

To learn more about these [parameters](https://github.com/ibm/graphql-query-generator#configuration) and [providers](https://github.com/ibm/graphql-query-generator#provider-map), please see the online [documentation](https://github.com/ibm/graphql-query-generator).

For reproducibility, next we describe how we configured those parameters in our experiments (cf. section 6.2).

### GitHub configuration

```JSON
{
  "breadthProbability": 0.5,
  "depthProbability": 0.5,
  "maxDepth": 10,
  "argumentsToConsider": ["first"],
  "considerUnions": true,
  "pickNestedQueryField": true,
}
```

The `breadthProbability` and `depthProbability` options probabilistically determine number of fields and the amount of nesting in the query, respecitvely. We used the value of `0.5` across the corpus.

The `maxDepth` option limits the maximum amount of nesting in the query. We picked a maximum nesting of `10` to ensure that we do not generate overly-complex queries (cf. lines 715-718).

The `argumentsToConsider` option describe arguments that the query generator must generate values for. In this case, we configured the query generator to always provide a value for the `first` argument, which is a limit argument (cf. line 736).

The `considerUnions` option allows the query generator to create queries that utilize [unions](https://graphql.org/learn/schema/#union-types) and [inline fragments](https://graphql.org/learn/queries/#inline-fragments). This allows for a greater variety of queries.

The `pickNestedQueryField` option ensures that the query generator always inserts at least one field on the `Query` operation type. This eliminates trivial queries.

### Yelp configuration

```JSON
{
  "breadthProbability": 0.5,
  "depthProbability": 0.5,
  "maxDepth": 4, // Yelp enforces a depth limit of 4
  "argumentsToConsider": [
    // to get queries of varying sizes:
    "limit",
    // for 'search' and 'event_search':
    "location",
    // for 'search':
    "term",
    // for 'reviews', 'search', and 'event_search':
    "offset",
    // for 'business' and 'event':
    "id",
    // for 'reviews':
    "business",
  ],
  "considerUnions": true,
  "pickNestedQueryField": true,
}
```

We used the same `breadthProbability` and `depthProbability` as the configuration we used for GitHub.

We used a `maxDepth` of 4 as it is a hard limit set by the Yelp API itself. The API will not run queries beyond four nested fields.

There are a number of arguments in `argumentsToConsider`. Many of these are required for the API to work. The `limit` argument is a limit argument (cf. line 736).

All other options are the same as the GitHub configuration.

### Providers

Unfortunately, we cannot share the exact providers that we used for our experiment for a similar reason why we needed to anonymize our query-response corpus, they contain personal information. However, we have provided scripts in [github-configuration/](github-configuration/) and [yelp-configuration/](yelp-configuration/) that will dynamically create providers by querying the GitHub and Yelp APIs, which are exactly the same in structure as the ones that we used in our experiment.
