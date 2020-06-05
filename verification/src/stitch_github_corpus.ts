import * as fs from "fs";

const part1: any[] = JSON.parse(
  fs.readFileSync(
    "../query-response/github/github-query-response-part1.json",
    "utf-8"
  )
);
const part2: any[] = JSON.parse(
  fs.readFileSync(
    "../query-response/github/github-query-response-part2.json",
    "utf-8"
  )
);

fs.writeFileSync(
  "../query-response/github/github-query-response.json",
  JSON.stringify(([] as any[]).concat(part1, part2), null, 2)
);
