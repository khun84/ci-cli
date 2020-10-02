const yargs = require('yargs')

const options = yargs.command(
    '',
    'list pull requests',
    function (yargs) {
      return yargs.option(
          'state',
          {
            alias: 's',
            describe: 'filter by state ["open", "closed"]'
          }
      )
    },
    function (argv) {
      console.log(argv.state);
    }
).help().argv;

