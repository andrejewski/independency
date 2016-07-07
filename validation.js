const assert = require('assert');

function Options(options) {
  assert.equal(typeof options.filepath, 'string');
  assert.equal(typeof options.shouldAddFile, 'function');
  assert.equal(typeof options.analyze, 'function');
}

function File(data) {
  assert(typeof data.path, 'string');
  assert(Array.isArray(data.imports));
  data.imports.forEach(imp => Import(imp));
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
  assert.equal(typeof data.as, 'string');
  assert.equal(typeof data.line, 'number');
  assert.equal(typeof data.column, 'number');
}

module.exports = {Options, File, Import, Value, Reference};
