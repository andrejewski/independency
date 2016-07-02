function pathLength(start, end) {
  let length = 0;
  const destPath = end.path;
  if(start.path === destPath) return length;
  let pathList = [stat.path];
  let importList = start.imports;
  while(searchList.length) {
    length++;
    const len = searchList.length;
    let newList = [];
    for(let i = 0; i < len; i++) {
      const file = importList[i].file;
      const currentPath = file.path;
      if(pathList.indexOf(currentPath) === -1) {
        if(currentPath === destPath) return length;
        pathList.push(currentPath);
        const len = file.imports.length;
        for(let i = 0; i < len; i++) {
          newList.push(file.imports[i]);
        }
      }
    }
    importList = newList;
  }
  return Infinity;
}

module.exports = pathLength;
