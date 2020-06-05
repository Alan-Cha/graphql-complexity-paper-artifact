"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, {
          enumerable: true,
          get: function () {
            return m[k];
          },
        });
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.runGraphqlValidationComplexity = void 0;
var graphql_1 = require("graphql");
// @ts-ignore
var graphqlValidationComplexity = __importStar(
  require("graphql-validation-complexity")
);
var replace_variables_graphql_query_1 = require("./utilities/replace_variables_graphql_query");
var time_utilities_1 = require("./utilities/time_utilities");
/**
 * For a given GraphQL query (and schema and variables, if applicable),
 * calculate the cost of running the query using the graphql-validation-complexity
 * (libA) open-source library
 */
function runGraphqlValidationComplexity(query, variables, schema) {
  var ast = graphql_1.parse(query);
  var editedAST = replace_variables_graphql_query_1.replaceVariablesQuery(
    ast,
    schema,
    variables
  );
  var typeInfo = new graphql_1.TypeInfo(schema);
  var context = new graphql_1.ValidationContext(
    schema,
    editedAST,
    typeInfo,
    function (error) {
      return console.log(error);
    }
  );
  var visitor = new graphqlValidationComplexity.ComplexityVisitor(context, {
    scalarCost: 0,
    objectCost: 1,
  });
  var startQueryNS = time_utilities_1.getTimeInNano();
  graphql_1.visit(editedAST, graphql_1.visitWithTypeInfo(typeInfo, visitor));
  var stopQueryNS = time_utilities_1.getTimeInNano();
  var queryProcessingNS = stopQueryNS - startQueryNS;
  var cost = visitor.getCost();
  return {
    typeComplexity: cost,
    queryProcessingNS: queryProcessingNS,
  };
}
exports.runGraphqlValidationComplexity = runGraphqlValidationComplexity;
//# sourceMappingURL=run_graphql-validation-complexity.js.map
