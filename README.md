# Summary

Welcome to the artifact for ESEC/FSE'20 research paper, ["A Principled Approach to GraphQL Query Cost Analysis"](https://github.com/Alan-Cha/fse20/blob/master/submissions/functional/FSE-24/graphql-paper.pdf).

## Table of contents

This artifact contains the items discussed in paper.

The sub-directories contain their own README.md files to clarify their contents.

| Item                                          | Description                                                                                                                             | Location                                     |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| GraphQL query-response corpus                 | The 10,000 unique queries we generated for GitHub (5,000) and Yelp (5,000), and the responses from those service providers (anonymized) | [query-response/](query-response/)           |
| Configuration of static analyses              | Our configuration of the static analyses (our own and those we compared against)                                                        | [analysis-config/](analysis-config/)         |
| Complexity measures for queries and responses | Data used to generate Figures 5 and 6, plus charts generator                                                                            | [measured-complexity/](measured-complexity/) |
| Novel GraphQL query generator                 | Configuration details and link to the open-source tool                                                                                  | [query-gen/](query-gen/)                     |
| GraphQL schemas                               | GraphQL schemas for GitHub and Yelp at the time of the study                                                                            | [graphql-schemas/](graphql-schemas/)         |
| Verification                                  | Rerun the open-source library evaluation portion of the experiment                                                                      | [verification/](verification/)               |

Institutional policy precludes sharing the prototype of our own static analysis.
We have described the algorithms in enough detail to permit an independent implementation.

# How to use the artifact

## Verification

The sub-directory [verification/](verification/) contains a script that will recreate the open-source evaluation portion of the experiment.

## Reproducing the paper results

The sub-directory [measured-complexity/](measured-complexity/) contains all the data (complexity measures for the opensource libraries and our own solution), and a tool to regenerate the plots.

The sub-directory [query-response/](query-response/) contains an anonymized version of the corpus used for these experiments.

## Run your own experiments

To generate your own corpus of random queries for the Yelp and Github APIs:

1. Retrieve the schemas of the two APIs (see [graphql-schemas/](graphql-schemas/))
2. Generate a corpus of random queries (see [query-gen/](query-gen/))
3. Compute the complexity of the queries with three open-source libraries (see [analysis-config/](analysis-config/))
