#!/usr/bin/env node

var path = require('path');
var argv = process.argv.slice(2);

if (argv.length) {
  var spawn = require('child_process').spawn;
  var package = require(path.join(process.cwd(), 'package.json'));
  var how = {stdio: 'inherit'};
  var exe = argv[0].split('.').reduce(
    function (o, k) { return o[k]; },
    package.$ || package.scripts
  );
  if (typeof exe === 'string' && /^\S+$/.test(exe)) {
    spawn(
      exe,
      argv.slice(1),
      how
    );
  } else {
    spawn(
      'bash',
      ['-c'].concat([].concat(exe).join('\n'), 'bash', argv.slice(1)),
      how
    );
  }
} else {
  var package = require(path.join(
    require.resolve('npm-dollar'),
    '..',
    'package.json'
  ));
  console.log('\x1b[1m' + package.name + '\x1b[0m ' + package.version);
  console.log(package.homepage);
  console.log('');
  console.log('  npm run $ cat.some file.js');
  console.log('  npm run $ -- bash.ls -la');
  console.log('');
  console.log(JSON.stringify({
    scripts: {
      '$': package.name
    },
    '$': {
      cat: {
        some: 'cat $1'
      },
      bash: {
        ls: 'ls'
      }
    }
  }, null, '  ').replace(/^/gm, '  '));
  console.log('');
}
