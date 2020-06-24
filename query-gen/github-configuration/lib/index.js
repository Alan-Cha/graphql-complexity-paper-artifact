"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGitHubQueryGenerator = void 0;
const fs = require("fs");
const path = require("path");
const graphql_1 = require("graphql");
const ibm_graphql_query_generator_1 = require("ibm-graphql-query-generator");
const github_providers_1 = require("./github-providers");
class GitHubQueryGenerator {
    constructor(gitHubSchema, gitHubQueryConfig) {
        this.gitHubSchema = gitHubSchema;
        this.gitHubQueryConfig = gitHubQueryConfig;
    }
    generateRandomGitHubQuery() {
        return ibm_graphql_query_generator_1.generateRandomQuery(this.gitHubSchema, this.gitHubQueryConfig);
    }
}
function getGitHubQueryGenerator(gitHubAccessToken) {
    return new Promise((resolve, reject) => {
        const gitHubSchemaStr = fs.readFileSync(path.resolve(__dirname, "../../../graphql-schemas/schemas/github/github.graphql"), "utf8");
        const gitHubSchema = graphql_1.buildSchema(gitHubSchemaStr);
        github_providers_1.getProviderMap(gitHubAccessToken).then((gitHubProviders) => {
            resolve(new GitHubQueryGenerator(gitHubSchema, {
                breadthProbability: 0.5,
                depthProbability: 0.5,
                maxDepth: 10,
                providerMap: gitHubProviders,
                argumentsToConsider: ["first"],
                considerUnions: true,
                pickNestedQueryField: true,
            }));
        });
    });
}
exports.getGitHubQueryGenerator = getGitHubQueryGenerator;
//# sourceMappingURL=index.js.map