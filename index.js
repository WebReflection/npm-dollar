#!/usr/bin/env node

var PACKAGE_NAME = 'npm-dollar';
var PACKAGE_JSON = 'package.json';
var RE_COMMENT = /^#/;
var RE_PRODUCTION = /^\!prod(?:uction)?\b\s*/;
var IS_PRODUCTION = /^prod(?:uction)?$/i.test(process.env.npm_config_only) ||
                    !!process.env.npm_config_production;

var path = require('path');
var argv = process.argv.slice(2);
var cwd = process.cwd();

if (argv.length) {
  var childProcess = require('child_process');
  var how = {
    cwd: cwd,
    env: process.env,
    stdio: ['inherit', 'inherit', 'inherit']
  };
  childProcess.exec(
    process.platform === 'win32' ?
      'echo bash' : 'which bash',
    how,
    function (err, bash, stderr) {
      if (err) {
        childProcess.exec(
          'npm config get script-shell',
          function (err, bash, stderr) {
            if (err || !bash) {
              console.error(stderr || 'Unable to find an executable `bash`');
              process.exit(1);
            } else
              run(childProcess.spawn, bash.trim(), how);
          }
        );
      } else
        run(childProcess.spawn, bash.trim(), how);
    }
  );
} else {
  var package = require(path.join(
    require.resolve(PACKAGE_NAME),
    '..',
    PACKAGE_JSON
  ));
  console.log('\x1b[1m' + package.name + '\x1b[0m ' + package.version);
  console.log(package.homepage);
  console.log('');
  console.log('  npm run $ cat.some file.js');
  console.log('  npm run $ cat file.js');
  console.log('  npm run $ -- bash.ls -la');
  console.log('');
  console.log(JSON.stringify({
    scripts: {
      '$': package.name
    },
    '$': {
      cat: {
        some: 'cat $1',
        list: 'ls $1'
      },
      bash: {
        ls: 'ls'
      }
    }
  }, null, '  ').replace(/^/gm, '  '));
  console.log('');
}

function dropProduction(command) {
  return command.replace(RE_PRODUCTION, '');
}

function error(name) {
  console.error('\x1B[31mERR!\x1B[0m unable to execute \x1B[1m' + name + '\x1B[0m');
  process.exit(1);
}

function commandFilter(command) {
  return notComment(command) && notProduction(command);
}

function notComment(command) {
  return !RE_COMMENT.test(command);
}

function notProduction(command) {
  return IS_PRODUCTION ? !RE_PRODUCTION.test(command) : true;
}

function run(spawn, bash, how) {
  var package = require(path.join(cwd, PACKAGE_JSON));
  var exe = argv[0].split('.').reduce(
    function (o, k) {
      if (o[k] == null)
        error(argv[0]);
      return o[k];
    },
    package.$ || package[PACKAGE_NAME] || package.scripts
  );
  // direct execution as in {"$": {"ls": "ls"}}
  if (typeof exe === 'string' && /^\S+$/.test(exe)) {
    spawn(exe, argv.slice(1), how).on('exit', exitOnError);
  }
  // indirect / normalized execution through bash -c
  else if (exe) {
    var params = [];
    [].concat(exe).forEach(function add(cmd) {
      if (typeof cmd === 'string')
        params.push(cmd);
      // Arrays inside arrays are joined inline
      else if (Array.isArray(cmd))
        params.push(cmd.join(' '));
      else
        for (var key in cmd)
          [].concat(cmd[key]).forEach(add);
    });
    spawn(
      bash,
      ['-c'].concat(
        params
          .filter(commandFilter)
          .map(dropProduction)
          .join(' && ')
          .replace(
            /(^|;|\s)\$ /g,
            ('$1npm run $ ')
          ),
        bash,
        argv.slice(1)
      ),
      how
    ).on('exit', exitOnError);
  }
  // nothing to do, show there's an error
  else
    error(argv[0]);
}

function exitOnError(code) {
  if (code)
    process.exit(1);
}
