const fs = require('fs');

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(process.env['CI_CONFIG_PATH']));
  } catch(_) {
    throw new Error('Please define environment variable CI_CONFIG_PATH. This should be a json file that contains the configuration')
  }
}

const Config = loadConfig();

const buildResult = (result, error) => {
  return {
    result: error ? null : result,
    errors: error,
    success: !!result
  }
}

module.exports = {
  config: Config,
  buildResult: buildResult
}

