# Summary

This directory contains the configuration files that we used for the static analyses in our evaluation ($6.2 and $6.4).

## Table of contents

| Item                                                       | Location                                      |
| ---------------------------------------------------------- | --------------------------------------------- |
| Configuration for our analysis                             | configurations/our-analysis/                  |
| Configuration for 4Catalyzer/graphql-validation-complexity | configurations/graphql-validation-complexity/ |
| Configuration for slicknode/graphql-query-complexity       | configurations/graphql-query-complexity/      |
| Configuration for pa-bru/graphql-cost-analysis             | configurations/graphql-cost-analysis/         |

We included configurations for our analysis for both GitHub and Yelp, used to answer RQ1-RQ5.

We included scripts that can generate configurations for the three open-source libraries for GitHub, to answer RQ5. We also included scripts that can generate configurations for Yelp for two of the open-source libraries. We did not include an analysis of the Yelp configurations in the paper due to space limitations.

## Generating the open-source configurations

We could not include the generated configurations directly as they are annotated versions of the Yelp and GitHub schemas. We instead included scripts that can produce the configurations.

First, follow the instructions described in [../graphql-schemas/README.md](../graphql-schemas/README.md) to obtain the Yelp and GitHub schemas which will be copied and annotated.

Then run the following commands:

```bash
npm ci
npm run create-configurations
```

After doing so, the [configurations/](configurations/) folders should now be populated with the configurations for the open-source libraries.

## Analyzing a random query

We provided two scripts that can analyze a randomly generated GitHub query using the three open-source libraries and a randomly generated Yelp query using two of the open-source libraries.

First, generate the open-source configurations using the above section.

To analyze a randomly generated GitHub query, run:

```bash
npm run analyze-random-github-query
```

To analyze a randomly generated Yelp query, run:

```bash
npm run analyze-random-yelp-query
```

## Analyzing a corpus

We provided a script that can analyze a corpus of GitHub queries using the three open-source libraries or a corpus of Yelp queries using the two open-source libraries.

First, generate the open-source configurations, described above.

To analyze a corpus, run:

```bash
npm run analyze-corpus <API> <query corpus path> <analysis folder path>
```

Where `API` is either `github` or `yelp`, `query corpus path` is the path to the corpus that should be analyzed, and `analysis folder path` is where the analyses of the open-source libraries should be saved.

The analyses is similar to the format described in [../measured-complexity](../measured-complexity):

| Field name        | Description                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| id                | A numerical ID ranging from 0-4999 that can be used to identify queries and responses from the query-response data set |
| typeComplexity    | The complexity of the query using the library                                                                          |
| queryProcessingNS | The amount of time required to perform the query analysis using the library in nanoseconds                             |

## RQ5: Configuration details

### Our analysis

To influence how the characteristics are calculated, an _analysis configurations_ object can be provided. An analysis configuration contains the following sections:

- `types` (optional, `object`) contains configurations affecting the counts and complexity of the object types affected by the query.
- `resolvers` (optional, `object`) contains configuration affecting the counts and complexity of the resolver functions invoked when executing the query.

Types can be targetted using exact type name (e.g., `User`), a regular expression (e.g., `'/.+Connection$/'`), or a wildcard (i.e., `'*'`).

Resolver functions can be targeted by a combination of the parent type and field name, delimited by a full-stop (`.`), where both parts can be either exact matches (e.g., `User.employer`), regular expressions (e.g., `'/.+Connection$/.employer'`), wildcards (e.g., `'*.employer'`), or any combination of these. Resolver functions can also be targeted by a single type name, using exact matches, regular expressions, or wildcards. In this case, any resolver function returning an object of the matched type is targeted.

The values of the configurations determine how this library calculates characteristics:

- For `types`, configurations may include the following properties:
  - `typeWeight` (optional, `number`, default: `1`): The weight to apply to the resource complexity calculation when that type is requested in the query.
- For `resolvers`, configurations may include the following properties:
  - `limitArguments` (optional, `[string]`): List of names of numeric arguments whose value limits the amount of returned objects of the targeted type (see example below).
  - `limitedFields` (optional, `[string]`): In some cases, a resolver function with limit arguments does not directly return a list itself, but rather an object with one or more fields that returns that list. This is, for example, commonly observed when using the [connections](https://blog.apollographql.com/explaining-graphql-connections-c48b7c3d6976) pattern for pagination.
  - `resolveWeight` (optional, `number`, default: `1`): The weight to apply to the resolve complexity calculation when a resolve function for the targeted type is addressed by the query.
  - `defaultLimit` (optional, `number`): A default value to assume when a query does not define a limit argument.

#### Configuration strategy

By default, all type weights have a default weight of 1. Therefore, we do not need to touch the `types` section.

We used the `resolvers` section to define the limit arguments, default limits, and limited fields.

#### Configuration for GitHub: BQ1 and BQ2

For the GitHub API, we configured all paginated lists by targeting all fields returning types ending with "Connection" using the regular expression `/.+Connection$/`. All of these fields have the limit arguments `first` and `last`, which we were able to configure using `limitArguments`. All of these fields also have the limited fields `edges` and `nodes`, which we were able to configure using `limitedFields`. Lastly, we identified all unpaginated lists, determined appropriate default limits by exploring the documentation and sending experimental queries, and set them using `defaultLimit`.

#### Configuration for Yelp: BQ1 and BQ2

We used a similar process to configure the Yelp API. Paginated lists do not share a common type so we had to configure each field one at a time using exact matches. All paginated lists use the limit argument `limit`, which we were able to configure using `limitArguments`. Yelp does not consistently use one pagination style over another. Fields utilizing the connections pattern also do not share the same limited fields. We identified the limited fields one at a time and configured them using `limitedFields`. For all unpaginated lists, like with the GitHub API, we determined appropriate default limits by exploring the documentation and sending experimental queries, and set them using `defaultLimit`.

### libA: 4Catalyzer/graphql-validation-complexity

These are the configuration details for the [4Catalyzer/graphql-validation-complexity](https://github.com/4Catalyzer/graphql-validation-complexity) project, which we refer to as _libA_ in the paper.

This configuration is for 4Catalyzer/graphql-validation-complexity [v0.2.5](https://www.npmjs.com/package/graphql-validation-complexity/v/0.2.5).

#### Configuration strategy

We configured this library using schema directives and a configuration object.

A `cost` and a `costFactor` directive can be defined on each field. The `cost` and `costFactor` are similar to the `resolverWeight` and `defaulLimit` in our analysis, respectively.

The configuration object allowed us to set global costs to all scalars and objects.

This library cannot define limit arguments so it depends on hard-coded default limits, which can lead to overestimation.

#### Configuration for GitHub: BQ1

Using the configuration object, we set the cost of objects and lists of objects to one and the cost of scalars and lists of scalars to zero.

```
{
  objectCost: 1,
  scalarCost: 0
}
```

We configured all fields returning unpaginated lists using `costFactor` and the default limits we discovered in the GitHub API, as described in the paper.

We set the `costFactor` for all lists (paginated and non-paginated) to a hard-coded limit of 100.
According to the [GitHub documentation](https://developer.github.com/v4/guides/resource-limitations/), the `first` and `last` limit arguments have a maximum value of 100. This limit was also more than the apparent maximum length of any unpaginated list returned by the API.

### libB: slicknode/graphql-query-complexity

These are the configuration details for the [slicknode/graphql-query-complexity](https://github.com/slicknode/graphql-query-complexity) project, which we refer to as _libB_ in the paper.

This configuration is for slicknode/graphql-query-complexity [v0.4.1](https://www.npmjs.com/package/graphql-query-complexity/v/0.4.1).

#### Configuration strategy

We configured this library using schema directives.

A `complexity` directive can be defined on each field. The directive has two arguments, `value` and `multipliers` which are similar to `typeWeight` and `limitArguments` in our analysis.

The library cannot define default limits, at least when it is configured using schema directives. Additionally, it cannot handle the level of indirection present in the connections pattern. These two factors can lead to both over- and under-estimation.

#### Configuration for GitHub: BQ1

- We set the `value` of fields returning objects and lists of objects to one and fields returning scalars and lists of scalars to zero.
- We defined limit arguments using `multipliers`.

We could not define default limits for GitHub's unpaginated fields.

### libC: pa-bru/graphql-cost-analysis

These are the configuration details for the [pa-bru/graphql-cost-analysis](https://github.com/pa-bru/graphql-cost-analysis) project, which we refer to as _libC_ in the paper.

This configuration is for pa-bru/graphql-cost-analysis [v1.0.3](https://www.npmjs.com/package/graphql-cost-analysis/v/1.0.3).

#### Configuration strategy

We configured this library using schema directives.

A `cost` directive can be defined on each field **and** type. The directive has two arguments, `complexity` and `multipliers`, which are similar to `typeWeight` and `limitArguments` in our analysis.

This library shares many of the pitfalls of libB. Both libraries cannot define default limits and do not handle the connections pattern properly.

#### Configuration for GitHub: BQ1

We only used the `cost` directive on fields.

We set the `complexity` of fields returning objects and lists of objects to one and fields returning scalars and lists of scalars to zero. We defined limit arguments using `multipliers`. And similar to libB, we were not able to define default limits for unpaginated fields, present in both APIs.
