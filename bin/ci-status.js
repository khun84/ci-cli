#!/usr/bin/env node

const { debug } = require('console');
const path = require('path');
const yargs = require('yargs');
const { getWorkflow, approveWorkflow } = require('../src/circleci.js');
const { getPullRequestStatus, getPullRequest } = require('../src/github.js');
const colorizer = require('json-colorizer');

const colorScheme = {
  "pending": 'yellow',
  "success": 'green',
  "failure": 'magenta'
}

const options = yargs.usage('ci-status [branch-name] Use branch name to fetch its CI status')
    .option(
      'pr', {
        alias: 'p',
        describe: '--pr [pr-number], Use Pull request number to fetch status',
        type: 'number'
      })
    .option(
      'cm', {
        alias: 'c',
        describe: '--cm [commit-hash], Use commit hash to fetch status',
        type: 'string'
      })
    .help().argv;

async function main() {
  let strategy;
  let gitRef;

  if (options._[0]) {
    gitRef = options._[0];
    strategy = 'branch';
  } else if (options.cm) {
    gitRef = options.cm;
    strategy = 'commit';
  } else if (options.pr) {
    gitRef = options.pr;
    strategy = 'pr_number';
  } else {
    console.error('Must provide branch name or PR number or commit Hash');
    return;
  }

  if (strategy === 'pr_number') {
    const res = await getPullRequest(gitRef);

    if (res.success) {
      gitRef = res.result.head.sha;
    } else {
      console.log(res.errors);
      return;
    }
  }

  let res = await getPullRequestStatus(gitRef, { status: 'all' });

  if (!res.success) {
    console.error(res.errors);
    return;
  }

  const statuses = res.result;

  const simplifiedStatuses = statuses.map(({ context, state, description, target_url }) => {
    return { context, state, description, target_url };
  });
  for (const status of simplifiedStatuses) {
    console.log(colorizer(status, {
      colors: {
        STRING_KEY: 'white',
        STRING_LITERAL: colorScheme[status.state]
      },
      pretty: true
    }));
    console.log('\n');
  }
}

main()
