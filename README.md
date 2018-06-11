# npm-dollar

A package.json scripts helper.

### wut

It simplifies organization of `package.json` scripts using `bash`, instead of `sh`, and passing escaped arguments all along.

Following a configuration example:

```js
// inside the package.json file
{
  "devDependencies": {
    "npm-dollar": "latest"
  },
  "scripts": {
    "$": "npm-dollar"
  },
  "$": {
    "cat": {
      "some": "cat $1"
    },
    "bash": {
      "ls": "ls"
    },
    "complex": [
      // each entry is joined as &&
      "export TEST=123",
      "echo $TEST",
      // arrays per line are joined via space
      [
        "ls $TEST",
        "cat $TEST"
      ]
    ]
  }
}
```

This is how you'd use those scripts

```sh
# regular execution
npm run $ cat.some file.js

# or passing along all arguments
npm run $ -- bash.ls -la
```

The End.

### Windows users

As long as there is a `bash` environment you should be good to go (WLS, Git for Windows, others).

If not, consider [installing chocolatey](https://chocolatey.org/install) and then do `choco install git` to be able to use `bash` with, or without, the git shell.
