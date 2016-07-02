
const fs = require('fs');
const path = require('path');
const async = require('async');
const {Option, File} = require('./validation');

function graph(options, callback) {
  Options(options);
  options.main = {path: options.filepath};
  options.cache = {};
  if(!callback) return buildGraphSync(options.main, options);
  buildGraph(options.main, options, callback);
}

function buildGraphSync(file, options) {
  const cached = options.cache[file.path];
  if(cached) return cached;
  options.cache[file.path] = file;
  const shouldAdd = options.shouldAddFile({file, options});
  if(!shouldAdd) return file;
  const text = fs.readFileSync(file.path, {encoding: 'utf8'});
  const {imports, exports} = options.analyze(file.path, text);
  const fileNode = Object.assign(file, {visited: true}, {imports, exports});
  fileNode.imports.map(file => buildGraphSync(file, options));
  File(fileNode);
  return fileNode;
}

function buildGraph(file, options, next) {
  const cached = options.cache[file.path];
  if(cached) return cached;
  options.cache[file.path] = file;
  const shouldAdd = options.shouldAddFile({file, options});
  if(!shouldAdd) return next(null, file);
  fs.readFile(file.path, {encoding: 'utf8'}, (error, text) => {
    if(error) return next(error);
    const {imports, exports} = options.analyze(file.path, text);
    const fileNode = Object.assign(file, {visited: true}, {imports, exports});
    async.map(fileNode.imports, buildGraphSync, (error, imports) => {
      if(error) return next(error);
      fileNode.imports = imports;
      File(fileNode);
      next(null, fileNode);
    });
  });
}

module.exports = graph;
