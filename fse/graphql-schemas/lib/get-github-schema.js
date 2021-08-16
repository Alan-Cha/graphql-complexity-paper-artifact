"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fetch = __importStar(require("node-fetch"));
var fs = __importStar(require("fs"));
fetch
    .default("https://raw.githubusercontent.com/octokit/graphql-schema/2a4687027d43125f92121aaa1a7d9f062d10a29e/schema.graphql")
    .then(function (res) {
    if (res.status === 200) {
        return res.text();
    }
    else {
        throw new Error("Could not retrieve GitHub GraphQL schema. Status: " + res.status + " " + res.statusText);
    }
})
    .then(function (text) {
    fs.writeFileSync("./schemas/github/github.graphql", text);
    console.log("Retrieved GitHub GraphQL schema");
});
//# sourceMappingURL=get-github-schema.js.map