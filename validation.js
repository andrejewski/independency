const assert = require('assert');

function Options(options) {
  assert.equals(typeof options.filepath, 'string');
  assert.equals(typeof options.shouldAddFile, 'function');
  assert.equals(typeof options.analyze, 'function');
}

function File(data) {
  assert(typeof data.path, 'string');
  assert(Array.isArray(data.imports));
  data.imports.forEach(import => Import(import));
  assert(Array.isArray(data.exports));
  data.exports.forEach(value => Value(value));
}

function Import(data) {
  File(data.file);
  assert(Array.isArray(data.values));
  data.values.map(value => Value(value));
}

function Value(data) {
  assert.equal(typeof data.name, 'string');
  Reference(data.declaration);
  assert(Array.isArray(data.references));
  data.references.forEach(ref => Reference(ref));
}

function Reference(data) {
  assert.equals(typeof data.as, 'string');
  assert.equals(typeof data.line, 'number');
  assert.equals(typeof data.column, 'number');
}

module.exports = {Options, File, Import, Value, Reference};
