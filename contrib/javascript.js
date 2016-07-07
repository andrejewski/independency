const path = require('path');
const acorn = require('acorn/dist/acorn_loose');
const walk = require('acorn/dist/walk');
const resolve = require('resolve');

function javascript(filepath, code, next) {
  const ast = acorn.parse_dammit(code, {locations: true});
  const resolveOptions = {
    basedir: path.dirname(filepath),
    extensions: ['.js', '.json'],
  };
  let imports = importStatements(ast);
  if(!imports.length) imports = staticRequireStatements(ast);
  let exports = exportStatements(ast);
  // if(!exports.length) exports = moduleExportStatements(ast);

  if(next) {
    async.map(imports, (imp, next) => {
      resolve(imp.file.path, resolveOptions, (error, path) => {
        if(error) return next(error);
        imp.file.path = path;
        next(null, imp);
      });
    }, (error, imports) => {
      next(error, {imports, exports});
    })
  } else {
    return {imports, exports};
  }
}

function importStatements(ast) {
  return ast.body
    .filter(node => node.type === 'ImportDeclaration')
    .map(node => {
      const file = {path: node.source.value};
      const values = node.specificers.map(spec => {
        return {
          name: spec.imported
            ? spec.imported.name
            : spec.local.name,
          isDefault: spec.type === 'ImportDefaultSpecifier',
          declaration: {
            as: spec.local.name,
            line: spec.loc.start.line,
            column: spec.loc.start.column,
          },
          references: [],
        };
      });
      return {file, values};
    });
}

function exportStatements(ast) {
  return ast.body
    .filter(node => {
      return node.type === 'ExportDefaultDeclaration' ||
        node.type === 'ExportNamedDeclaration';
    })
    .map(node => {
      const isDefault = node.type === 'ExportDefaultDeclaration';
      const name = isDefault ? '__default' : node.declaration.id.name;
      return {
        name,
        isDefault,
        declaration: {
          as: name,
          line: node.declaration.loc.line,
          column: node.declaration.loc.column,
        },
        references: []
      };
    });
}

function staticRequireStatements(ast) {
  var requires = [];
  var visitors = {
    CallExpression(node) {
      const namedRequire = node.callee.name === 'require';
      const arg = node.arguments.pop();
      const hasSingleStringArg = (
        arg &&
        !node.arguments.length &&
        arg.type === 'Literal' && (
          arg.raw.startsWith(`'`) ||
          arg.raw.startsWith(`"`)));
      if(namedRequire && hasSingleStringArg) {
        const file = {path: arg.value};
        requires.push({file, values: []});
      }
    }
  };
  walk.simple(ast, visitors);
  return requires;
}

module.exports = javascript;
