const path = require('path');
const { config, buildResult } = require('./app.js');
const axios = require('axios');
const { info } = require('console');

REPO_BASE_PATH = `https://api.github.com/repos/${config.repo_owner}/${config.repo}`

async function getPullRequestStatus(ref, options = {}) {
  let outcome;

  console.info(`Fetching status for ${ref} from Github....`);

  await axios.get(
      `${REPO_BASE_PATH}/commits/${ref}/status`,
      {
        auth: {
          username: config.github_username,
          password: config.github_token
        }
      }
  ).then((res) => {
    if (options.status === 'all') {
      outcome = buildResult(res.data.statuses)
      return
    }

    status = res.data.statuses.find(status => !!status.context.match('start-testing'));

    if (status && status.state !== 'pending') {
      outcome = buildResult(null, new Error(`Pull request status is ${status.state}`));
    }

    outcome = buildResult({
      ...status,
      workflow_id: extractWorkflowId(status.target_url)
    });
  }).catch((error) => {
    outcome = buildResult(null, error);
  });

  return outcome;
}

async function getPullRequest(number) {
  let outcome;

  console.info(`Fetching PR detail for ${number} from Github....`);
  await axios.get(
      `${REPO_BASE_PATH}/pulls/${number}`,
      {
        auth: {
          username: config.github_username,
          password: config.github_token
        }
      }
  ).then((res) => {
    outcome = buildResult(res.data)
  }).catch((error) => {
    outcome = buildResult(null, error);
  });

  return outcome;
}

function extractWorkflowId(ref) {
  // var input = 'https://circleci.com/workflow-run/9b081d1f-a4dc-4daf-ac1d-5c24450fcfa6?utm_campaign=vcs-integration-link&utm_medium=referral&utm_source=github-workflow-link'
  try {
    ref = new URL(ref);
    ref = path.basename(ref.pathname);
  } catch (error) {
    console.log(error);
  }
  return ref;
}

module.exports = { getPullRequestStatus, getPullRequest };
