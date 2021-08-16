import * as fs from "fs";

const dotenvContent = fs.readFileSync(".env", "utf-8");

fs.writeFileSync("../graphql-schemas/.env", dotenvContent);
fs.writeFileSync("../analysis-config/.env", dotenvContent);
fs.writeFileSync("../query-gen/github-configuration/.env", dotenvContent);
fs.writeFileSync("../query-gen/yelp-configuration/.env", dotenvContent);
