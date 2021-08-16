import { DocumentNode, GraphQLSchema, TypeNode } from "graphql";
import { ProviderMap } from "./provide-variables";
export declare type Configuration = {
  depthProbability?: number | ((depth: number) => number);
  breadthProbability?: number | ((depth: number) => number);
  maxDepth?: number;
  ignoreOptionalArguments?: boolean;
  argumentsToIgnore?: string[];
  argumentsToConsider?: string[];
  providerMap?: ProviderMap;
  considerInterfaces?: boolean;
  considerUnions?: boolean;
  seed?: number;
  pickNestedQueryField?: boolean;
};
export declare function getTypeName(type: TypeNode): string;
export declare function generateRandomMutation(
  schema: GraphQLSchema,
  config?: Configuration
): {
  mutationDocument: DocumentNode;
  variableValues: {
    [varName: string]: any;
  };
  seed: number;
};
export declare function generateRandomQuery(
  schema: GraphQLSchema,
  config?: Configuration
): {
  queryDocument: DocumentNode;
  variableValues: {
    [varName: string]: any;
  };
  seed: number;
  typeCount: number;
  resolveCount: number;
};
