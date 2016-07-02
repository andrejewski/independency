# Independency
Independency is a code dependency graph generator that is language agnostic and useful for doing project-wide static analysis.

```sh
npm install independency
```

```js
const assert = require('assert');
const independency = require('independency');

independency({
  filepath: __filename,
  shouldAddFile(info) {
    return !info.path.contains('node_modules');
  },
  analyze(filepath, code) {
    // see contrib/javascript for example
    const imports = getImports(code);
    const exports = getExports(code);
    return {imports, exports};
  }
}, (error, graph) => {
  assert.equal(graph.path, __filename);
  assert(Array.isArray(graph.imports));
  assert(Array.isArray(graph.exports));
});
```
