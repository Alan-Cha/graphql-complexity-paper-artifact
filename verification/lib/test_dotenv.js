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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = __importStar(require("dotenv"));
dotenv.config();
var fetch = __importStar(require("node-fetch"));
if (!process.env.GITHUB_ACCESS_TOKEN) {
    throw new Error("Please provide a GitHub access token");
}
if (!process.env.YELP_ACCESS_TOKEN) {
    throw new Error("Please provide a Yelp access token");
}
Promise.all([
    new Promise(function (resolve, reject) {
        fetch
            .default("https://api.github.com/graphql", {
            method: "POST",
            body: JSON.stringify({
                query: "{ \n          viewer { \n            login\n          }\n        }",
            }),
            headers: {
                Authorization: "token " + process.env.GITHUB_ACCESS_TOKEN,
            },
        })
            .then(function (res) {
            if (res.status !== 200) {
                throw new Error("Could not use GitHub access token to access the GitHub API. Received " + res.status + " " + res.statusText);
            }
        });
    }),
    new Promise(function (resolve, reject) {
        fetch
            .default("https://api.yelp.com/v3/graphql", {
            method: "POST",
            body: "{\n        event_search(limit: 5) {\n          total\n        }\n      }",
            headers: {
                Authorization: "Bearer " + process.env.YELP_ACCESS_TOKEN,
                "Content-Type": "application/graphql",
            },
        })
            .then(function (res) {
            if (res.status !== 200) {
                throw new Error("Could not use Yelp access token to access the Yelp API. Received " + res.status + " " + res.statusText);
            }
        });
    }),
]);
//# sourceMappingURL=test_dotenv.js.map