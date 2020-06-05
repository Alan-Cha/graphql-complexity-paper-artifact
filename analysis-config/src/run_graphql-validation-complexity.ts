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
import * as graphqlValidationComplexity from "graphql-validation-complexity";

import { replaceVariablesQuery } from "./utilities/replace_variables_graphql_query";
import { getTimeInNano } from "./utilities/time_utilities";
import { Data } from "./types/experiment";

/**
 * For a given GraphQL query (and schema and variables, if applicable),
 * calculate the cost of running the query using the graphql-validation-complexity
 * (libA) open-source library
 */
export function runGraphqlValidationComplexity(
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

  const context = new ValidationContext(schema, editedAST, typeInfo, (error) =>
    console.log(error)
  );

  const visitor = new graphqlValidationComplexity.ComplexityVisitor(context, {
    scalarCost: 0,
    objectCost: 1,
  });

  const startQueryNS = getTimeInNano();

  visit(editedAST, visitWithTypeInfo(typeInfo, visitor));

  const stopQueryNS = getTimeInNano();
  const queryProcessingNS = stopQueryNS - startQueryNS;

  const cost = visitor.getCost();

  return {
    typeComplexity: cost,
    queryProcessingNS,
  };
}
