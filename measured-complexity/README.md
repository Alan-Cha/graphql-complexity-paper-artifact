# Summary

This subdirectory contains the complexity measurements associated with the query-response corpus.

The results for our analysis cannot be recomputed because institutional policy precludes sharing the prototype of our own static analysis.

## Table of contents

| Item                                             | Location      |
| ------------------------------------------------ | ------------- |
| Tarred data                                      | data.tgz      |
| Untar tool                                       | unzip-data.pl |
| (Untarred) measured GitHub queries and responses | data/github/  |
| (Untarred) measured Yelp queries and responses   | data/yelp/    |
| Generate the heatmaps from the paper             | gen-charts.py |

## Reproduce the paper results

The data presented in the paper are in the `data.tgz` archive.

The entries for our analysis differ somewhat from the entries derived from the open-source libraries.

The entries for our analysis have the following fields:

| Field name                | Description                                                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| id                        | A numerical ID ranging from 0-4999 that can be used to identify queries and responses from the query-response data set |
| resolveComplexity         | The resolve complexity of the query                                                                                    |
| typeComplexity            | The type complexity of the query                                                                                       |
| queryProcessingNS         | The amount of time required to perform the query analysis in nanoseconds                                               |
| responseResolveComplexity | The resolve complexity of the response                                                                                 |
| responseTypeComplexity    | The type complexity of the response                                                                                    |
| responseProcessingNS      | The amount of time required to perform the response analysis in nanoseconds                                            |

The entries for the open-source libraries have the following fields:

| Field name             | Description                                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| id                     | A numerical ID ranging from 0-4999 that can be used to identify queries and responses from the query-response data set |
| typeComplexity         | The complexity of the query using the library                                                                          |
| queryProcessingNS      | The amount of time required to perform the query analysis using the library in nanoseconds                             |
| responseTypeComplexity | The type complexity of the response using our analysis                                                                 |
| responseProcessingNS   | The amount of time required to perform the response analysis using our analysis in nanoseconds                         |

### Expanding the data

The [data/](data/) directory is compressed by default.
Run the following command to expand it:

```
./unzip-data.pl
```

### Generating charts

After you expand the data, you can generate the charts from Figures 5 and 6 by running the following command:

```
python3 gen-charts.py
```

The charts will be placed in the directory [figs/](figs/).
