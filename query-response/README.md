# Summary

The corpus presented \$6.1 of the paper that contains 10,000 unique query-response pairs, 5,000 from GitHub and 5,000 from Yelp.
All queries and responses were collected between April 2019 and March 2020.

## Table of contents

| Item          | Location |
| ------------- | -------- |
| GitHub corpus | github/  |
| Yelp corpus   | yelp/    |

---

The query-response pairs are stored in JSON arrays where each element has the following structure:

- `id`: unique identifier of the pair
- `query`: query string
- `variableValues`: values of the variables used in the query
- `response`: JSON object of the response (anonymized)

## Anonymization

This project is supported by IBM, and we followed its corporate policies to comply with privacy laws to anonymize the corpus.
In particular, we removed all information that we believed could be used to uniquely identify a GitHub project or user.
This more-or-less "skeletonized" the corpus, leaving appropriate structure but not content, yet sufficient for the purpose of this research.

This is the process we followed:

_In the queries:_

- Limit arguments that are critical for the analysis have been preserved.
- Enum arguments have been preserved (these values are publicly available in the schema).
- All other string values for the arguments have been changed to `REDACTED`.

_In the responses:_

- All integer values have been changed to 0
- All float values have been changed to 0.0
- All string values have been changed to `REDACTED`
- All boolean values have been changed to `false`

The anonymization prevents the execution of most of the queries.
We kept as much information as possible, and preserved the structure and the complexity of both queries and responses.
Here are ways you can use this corpus in future research:

- To reproduce and further analyze the experimental results presented in the paper.
- To evaluate new query cost metrics to improve on our approach or the open-source libraries cited in the paper (e.g., taking into account the type of scalar values, the length of the string values, etc.).
- For performance evaluations of GraphQL implementations (e.g., regarding linting of queries, or query validation).

If you need raw data, we have provided the query generation tools we used.
See [here](../query-gen/) for instructions.

## Data generation and analysis

The data generation approach was described in section 6.1 of the paper.
We analyzed the data in sections 6.2, 6.3, and 6.4.
