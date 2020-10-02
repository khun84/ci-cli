#!/usr/bin/env node
const { debug } = require('console');
const path = require('path');
const yargs = require('yargs');
const { getWorkflow, approveWorkflow } = require('../src/circleci.js')
const { getPullRequestStatus } = require('../src/github.js')

const options = yargs.usage(
    'ci-approval [branch-name] Use branch name to trigger approval'
).option(
  'cm', {
    alias: 'c',
    describe: '--cm [commit-hash] Use commit hash to trigger approval',
    type: 'string'
  }
).help().argv

async function main() {
  const gitRef = options._[0] || options.pr || options.cm
  if (gitRef === null) {
    console.error('Must provide branch name or PR number');
    return
  }

  let res = await getPullRequestStatus(gitRef)

  if (!res.success) {
    console.error(res.errors);
    return
  }

  const status = res.result;

  res = await getWorkflow(status.workflow_id)
  if (!res.success) {
    console.log(res.errors);
    return
  }

  res = await approveWorkflow(status.workflow_id, res.result)

  if (res.success) {
    console.log(res.result);
  } else {
    console.log(res.errors);
  }
}

main().catch((err) => {
  console.log(err);})
