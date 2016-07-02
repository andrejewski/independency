const path = require('path');
const acorn = require('acorn/dist/acorn_loose');
const resolve = require('resolve');

function javascript(filepath, code) {
  const ast = acorn.parse_dammit(code, {locations: true});
  const resolveOptions = {
    basedir: path.dirname(filepath),
    extensions: ['.js', '.json'],
  };
  let imports = importStatements(ast);
  // if(!imports.length) imports = staticRequireStatements(ast);
  imports = imports.map(imp => {
    imp.file.path = resolve(imp.file.path, resolveOptions);
    return imp;
  });

  let exports = exportStatements(ast);
  // if(!exports.length) exports = moduleExportStatements(ast);

  return {imports, exports};
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

function exportStatments(ast) {
  return ast
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

module.exports = javascript;
