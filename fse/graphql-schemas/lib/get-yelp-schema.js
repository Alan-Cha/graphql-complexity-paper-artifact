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
var dotenv = __importStar(require("dotenv"));
dotenv.config();
var fs = __importStar(require("fs"));
var fetch = __importStar(require("node-fetch"));
var graphql = __importStar(require("graphql"));
if (process.env.YELP_ACCESS_TOKEN) {
    fetch
        .default("https://api.yelp.com/v3/graphql", {
        method: "POST",
        body: graphql.getIntrospectionQuery(),
        headers: {
            Authorization: "Bearer " + process.env.YELP_ACCESS_TOKEN,
            "Content-Type": "application/graphql",
        },
    })
        .then(function (res) {
        if (res.status === 200) {
            return res.json();
        }
        else {
            throw new Error("Could not Yelp GitHub GraphQL schema. Status: " + res.status + " " + res.statusText);
        }
    })
        .then(function (json) {
        fs.writeFileSync("./schemas/yelp/yelp.graphql", graphql.printSchema(graphql.buildClientSchema(json.data)));
        console.log("Retrieved Yelp GraphQL schema");
    });
}
else {
    console.log("Please provide a Yelp access token");
}
//# sourceMappingURL=get-yelp-schema.js.map