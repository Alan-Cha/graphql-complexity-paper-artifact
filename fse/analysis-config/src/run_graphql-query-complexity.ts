import { parse, DocumentNode, GraphQLSchema } from "graphql";

import { getComplexity, directiveEstimator } from "graphql-query-complexity";

import { replaceVariablesQuery } from "./utilities/replace_variables_graphql_query";
import { getTimeInNano } from "./utilities/time_utilities";
import { Data } from "./types/experiment";

/**
 * For a given GraphQL query (and schema and variables, if applicable),
 * calculate the cost of running the query using the graphql-query-complexity
 * (libB) open-source library
 */
export function runGraphqlQueryComplexity(
  query: string,
  variables: any,
  schema: GraphQLSchema
): Data {
  const ast = parse(query);
  const editedAST = replaceVariablesQuery(
    ast,
    schema,
    variables
  ) as DocumentNode;

  const startQueryNS = getTimeInNano();

  const complexity = getComplexity({
    estimators: [directiveEstimator()],
    schema,
    query: editedAST,
  });

  const stopQueryNS = getTimeInNano();
  const queryProcessingNS = stopQueryNS - startQueryNS;

  return {
    typeComplexity: complexity,
    queryProcessingNS,
  };
}
