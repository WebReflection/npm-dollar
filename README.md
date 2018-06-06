# npm-dollar

A package.json scripts helper.

### wut

It simplifies organization of `package.json` scripts using `bash`, instead of `sh`, and passing escaped arguments all along.

Following a configuration example:

```js
// inside the package.json file
{
  "devDependencies": {
    "node-dollar": "latest"
  },
  "scripts": {
    "$": "node-dollar"
  },
  "$": {
    "cat": {
      "some": "cat $1"
    },
    "bash": {
      "ls": "ls"
    },
    "complex": [
      "export TEST=123",
      "echo $TEST"
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
