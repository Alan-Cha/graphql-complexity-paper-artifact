import {
  parse,
  visit,
  DocumentNode,
  TypeInfo,
  ValidationContext,
  visitWithTypeInfo,
  GraphQLSchema,
} from "graphql";

// @ts-ignore
import createCostAnalysis from "graphql-cost-analysis";

import { replaceVariablesQuery } from "./utilities/replace_variables_graphql_query";
import { getTimeInNano } from "./utilities/time_utilities";
import { Data } from "./types/experiment";

/**
 * For a given GraphQL query (and schema and variables, if applicable),
 * calculate the cost of running the query using the graphql-cost-analysis
 * (libC) open-source library
 */
export function runGraphqlCostAnalysis(
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
  const typeInfo = new TypeInfo(schema);

  const startQueryNS = getTimeInNano();

  const context = new ValidationContext(schema, editedAST, typeInfo, (error) =>
    console.log(error)
  );
  const visitor = createCostAnalysis({
    maximumCost: 999999,
  })(context);

  visit(editedAST, visitWithTypeInfo(typeInfo, visitor));

  const stopQueryNS = getTimeInNano();
  const queryProcessingNS = stopQueryNS - startQueryNS;

  const cost = visitor.cost;

  return {
    typeComplexity: cost,
    queryProcessingNS,
  };
}
