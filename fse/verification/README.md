# Verification

We have provided a script that will rerun the analysis of the three open-source libraries on the query-response corpus and compare those results with the ones we originally calculated in [../measured-complexity/](../measured-complexity/). We expect that the complexities calculated by these libraries will stay the same.

On a high level, the scripts will do the following steps:

1. Fetch the GitHub and Yelp schemas in [../graphql-schemas/](../graphql-schemas/)
2. Create the configurations for the open-source libraries so that they can perform the estimation in [../analysis-config/](../analysis-config/)
3. Unzip the query-response corpuses and stitch together the GitHub corpus in [../query-response/](../query-response/)
4. Perform the analysis of the query-response corpus using the open-source libraries and storing the result in [analysis/](analysis/)
5. Compare the results with the baseline found in [../measured-complexity/](../measured-complexity/)

## Usage

Obtain a GitHub [personal access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) and a Yelp [API key](https://www.yelp.com/developers/documentation/v3/authentication). These tokens are used to fetch the schema as well as to retrieve data from the APIs to conduct the verfication.

Save these tokens in a file named `.env` with the following format:

```
GITHUB_ACCESS_TOKEN={GitHub access token}
YELP_ACCESS_TOKEN={Yelp API key}
```

Then, to begin the verification, run the following commands

```bash
npm ci
npm run verify
```

The script should, at the end, print out the following content:

```
Verifying GitHub data sets...
Matching data sets?
../measured-complexity/data/github/graphql-cost-analysis.json and ./analysis/github/graphql-cost-analysis.json
Verdict: true

Matching data sets?
../measured-complexity/data/github/graphql-query-complexity.json and ./analysis/github/graphql-query-complexity.json
Verdict: true

Matching data sets?
../measured-complexity/data/github/graphql-validation-complexity.json and ./analysis/github/graphql-validation-complexity.json
Verdict: true

Verifying Yelp data sets...
Matching data sets?
../measured-complexity/data/yelp/graphql-cost-analysis.json and ./analysis/yelp/graphql-cost-analysis.json
Verdict: true

Matching data sets?
../measured-complexity/data/yelp/graphql-query-complexity.json and ./analysis/yelp/graphql-query-complexity.json
Verdict: true
```

If all five `Verdict` statements are true, then that means we were able to recreate the evaluation of the open-source libraries.
