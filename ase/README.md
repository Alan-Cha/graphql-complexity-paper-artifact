# Summary

Welcome to the artifact for ASE'21 research paper, "Learning GraphQL Query Cost".

## Table of contents

Each sub-directories contains its own `README.md` files that clarifies its contents.

| Item                                          | Description                                                                                                                             | Location                                     |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| GraphQL query-response corpus                 | The 150,000 unique (anonymized) query-response pairs from GitHub and 30,000 from Yelp | [query-response/](query-response/)              |
| Configuration of static analyses              | Our configuration of the static analyses                                                                                                | [analysis-config/](analysis-config/)         |
| Complexity measures for queries and responses | Data used to generate Figures 3 and 4, plus charts generator                                                                            | [measured-complexity/](measured-complexity/) |
| Query generator configuration                 | Configuration details and link to the open-source tool                                                                                  | [query-gen/](query-gen/)                     |
| GraphQL schemas                               | GraphQL schemas for GitHub and Yelp at the time of the study                                                                            | [graphql-schemas/](graphql-schemas/)         |
| Verification                                  | Rerun the open-source library evaluation portion of the experiment                                                                      | [verification/](verification/)               |

# How to use the artifact

## Verification

The sub-directory [verification/](verification/) contains a script that will recreate the open-source evaluation portion of the experiment.

## Reproducing the paper results

The sub-directory [measured-complexity/](measured-complexity/) contains all the data (complexity measures for the open-source libraries and our own solution), and a tool to regenerate the plots.

The sub-directory [query-response/](query-response/) contains an anonymized version of the corpus used for these experiments.

## Run your own experiments

To generate your own corpus of random queries for the Yelp and GitHub APIs:

1. Retrieve the schemas of the two APIs (see [graphql-schemas/](graphql-schemas/))
2. Generate a corpus of random queries (see [query-gen/](query-gen/))
3. Compute the complexity of the queries with three open-source libraries (see [analysis-config/](analysis-config/))
