#!/usr/bin/env node

'use strict';

let arg;

// constants

// entry
function main(argv = process.argv.slice(2)): void {
  const args = parseArgv(argv);

  if (!args.tool) {
    console.error('请使用 -t 参数指定处理工具，如：-t name');
    process.exit(0);
  }

  if (args.tool === 'dir-diff') {
    if (!args.files.length) {
      console.error('dir-diff 工具需要使用 --files 指定一个或多个文件夹，如：--files 1,2,3');
      process.exit(0);
    }

    const dirDiff = require('../tools/dir-diff');

    // main
    dirDiff.default(...args.files);
  }
}

export { main };

// prase args
function parseArgv(argv) {
  arg !== null && arg !== void 0 ? arg : (arg = require('arg'));
  const args = arg(
    {
      '--tool': String,
      '--files': String,
      // alias
      '-t': '--tool',
    },
    {
      argv,
      stopAtPositional: false,
    }
  );

  let { '--tool': tool, '--files': filesString = '' } = args;

  return { tool, files: (filesString && filesString.split(',')) || [] };
}

// run
(() => {
  main();
})();
