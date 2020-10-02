# What it does?

A simple command line tool to

1. trigger Circle CI workflow approval, `ci-approval`
2. fetch workflow status from Circle CI, `ci-status`

## Commands

1. `ci-approval --help`
1. `ci-status --help`

## Configuration

1. Define an environment variable `CI_CONFIG_PATH`. This should be a file path that contains the following configuration

```json5
{
  "token":"circle-ci-api-token",
  "github_username": "github-username",
  "github_token": "github-api-token",
  "repo": "repo-name",
  "repo_owner": "repo-owner"
}
```
