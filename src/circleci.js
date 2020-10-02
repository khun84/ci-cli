const { config, buildResult } = require('./app.js')
const axios = require('axios')

const API_KEY = config.token

async function getWorkflow(workflowId) {
  var approvalJob, outcome;
  console.log(`Fetching workflow for ${workflowId} from Circle-CI...`);

  await axios.get(
    `https://circleci.com/api/v2/workflow/${workflowId}/job`,
    {
      headers: {
        'Circle-Token': API_KEY
      }
    }
  ).then((res) => {
    approvalJob = res.data.items.find((item) => { return item.type === 'approval' })

    if (approvalJob && approvalJob.status === 'on_hold') {
      outcome = buildResult(approvalJob)
    } else {
      outcome = buildResult(null, new Error('Job status is not on hold!'))
    }
  }).catch((err) => {
    outcome = buildResult(null, err)
  })
  return outcome
}

async function approveWorkflow(id, workflow) {
  console.info(`Sending approval action for ${workflow.name} to Circle-CI...`)

  var outcome
  await axios.post(
    `https://circleci.com/api/v2/workflow/${id}/approve/${workflow.approval_request_id}`,
    {},
    {
      headers: {
        'Circle-Token': API_KEY
      }
    }
  ).then((res) => {
    outcome = buildResult(res.data)
  }).catch((err) => {
    outcome = buildResult(null, err)
  })

  return outcome
}

module.exports = { getWorkflow, approveWorkflow }