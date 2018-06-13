#!/usr/bin/env node

var PACKAGE_NAME = 'npm-dollar';
var PACKAGE_JSON = 'package.json';

var path = require('path');
var argv = process.argv.slice(2);
var cwd = process.cwd();

if (argv.length) {
  var spawn = require('child_process').spawn;
  var package = require(path.join(cwd, PACKAGE_JSON));
  var how = {
    cwd: cwd,
    env: process.env,
    stdio: 'inherit'
  };
  var exe = argv[0].split('.').reduce(
    function (o, k) { return o[k]; },
    package.$ || package[PACKAGE_NAME] || package.scripts
  );
  // direct execution as in {"$": {"ls": "ls"}}
  if (typeof exe === 'string' && /^\S+$/.test(exe)) {
    spawn(exe, argv.slice(1), how);
  }
  // indirect / normalized execution through bash -c
  else {
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
      'bash',
      ['-c'].concat(
        params.join(' && ').replace(
          /(^|;|\s)\$ /g,
          ('$1npm run $ ')
        ),
        'bash',
        argv.slice(1)
      ),
      how
    );
  }
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
