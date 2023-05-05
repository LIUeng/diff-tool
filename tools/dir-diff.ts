'use strict';

// 文件夹对比 - 输出字节大小对比

import { statSync, readdirSync, writeFileSync } from 'node:fs';
import { join, isAbsolute, basename } from 'node:path';
import * as prettier from 'prettier';

import type * as fs from 'node:fs';

// type define
// type FileProps = { [key: string]: string };
// type FileArrayProps<T> = Array<T>;
// type FileItem = FileArrayProps<FileProps>;
// type fileListProps = { rootbase: string; fileList: Array<FileItem> };
type fileDiffProps = { rootbase: string; sizes: Map<string, number> };
export type FsStats = fs.Stats | { size?: number };

// cache
const cacheFs = new Map();

function main(...dirs: string[]): void {
  let i;
  let size = dirs.length;

  for (i = 0; i < size; i++) {
    let dir = dirs[i];
    let stats;
    try {
      stats = statSync(dir, { throwIfNoEntry: false });
      if (!stats || !stats.isDirectory()) {
        throw new Error(`${dir} is not a directory`);
      }
    } catch (e) {
      console.error(`\x1b[37;41mERROR: ${e.message}`);
      process.exit(0);
    }
  }

  run(dirs);
}

function run(dirs: string[]): void {
  let pwd = process.cwd();
  let result: Array<fileDiffProps> = dirs.map(dir => {
    let absolutePath = dir;
    let rootbase = basename(dir);

    if (!isAbsolute(dir)) {
      absolutePath = join(pwd, dir);
    }

    let sizes;

    if (cacheFs.has(absolutePath)) {
      sizes = cacheFs.get(absolutePath);
    } else {
      sizes = getFileSizes(absolutePath);
      cacheFs.set(absolutePath, sizes);
    }

    return { rootbase, sizes };
  });

  write(codeFrame(...result));
}

function write(code, format = true): void {
  if (format) {
    code = prettier.format(code, {
      parser: 'markdown',
    });
  }
  writeFileSync(`DIR_DIFF-${new Date().toLocaleDateString().replace(/\//g, '-')}.md`, code, { encoding: 'utf-8' });
  console.log('写入成功');
}

function codeFrame(...arr: Array<fileDiffProps>): string {
  let md = [];

  md.push('# 文件对比\n\n');
  md.push('> 结果如下所示\n\n');

  // diff write to markdown file
  let i = 0;
  let size = arr.length;

  while (i < size) {
    let j = i + 1;
    let cur = arr[i];
    let next;

    if (size === 1) {
      md.push(mdTable(cur));
      break;
    }

    while (j < size) {
      // do
      next = arr[j];
      md.push(mdTable(cur, next));
      j++;
    }

    i++;
  }

  return md.join('');
}

function mdTable(...arr: Array<fileDiffProps>) {
  let table = [];
  let headers = [];
  arr.forEach(item => {
    headers.push('文件夹 ' + item.rootbase);
  });
  table.push(`## ${headers.join(' - ')}\n\n`);

  headers.unshift('文件名');
  headers.push('区别（byte）');
  headers.push('区别（kb）');
  headers.push('区别（mb）');

  table.push(`|${headers.join('|')}|\n`);
  table.push(`|${Array(headers.length).fill('').join('-|')}-|\n`);

  let [cur, next] = arr;
  let used: Map<string, boolean> = new Map();
  for (let [key, size] of cur.sizes) {
    table.push(`|${key}|${size}`);
    used.set(key, true);
    let nextSize = 0;

    if (next) {
      let nextSizes = next.sizes;
      if (nextSizes.has(key)) {
        nextSize = nextSizes.get(key);
        table.push(`|${nextSize}`);
      } else {
        nextSize = 0;
        table.push(`|-`);
      }
    }

    let diffNum = Math.abs(nextSize - size);
    table.push(`|${diffNum}`);
    table.push(`|${Math.round(diffNum / 1024)}`);
    table.push(`|${(diffNum / 1024 / 1024).toFixed(2)}`);
    table.push('|\n');
  }

  if (next) {
    for (let [key, size] of next.sizes) {
      if (used.has(key)) continue;

      table.push(`|${key}`);
      table.push(`|-`);
      table.push(`|${size}`);
      let diffNum = Math.abs(0 - size);
      table.push(`|${diffNum}`);
      table.push(`|${Math.round(diffNum / 1024)}`);
      table.push(`|${(diffNum / 1024 / 1024).toFixed(2)}`);
      table.push('|\n');
    }
  }

  return table.join('');
}

function cacheFileFn() {
  let cache: Map<string, number> = new Map();

  return (key, value) => {
    if (cache.has(key)) {
      return cache.get(key);
    }

    let size: number = statSync(value).size;
    cache.set(key, size);

    return size;
  };
}

// file sizes
function getFileSizes(dir: string): Map<string, number> {
  let sizes = new Map();
  let cacheFn = cacheFileFn();

  // recursive directory
  const loopDirs = (paths: string, prefix: string = ''): void => {
    let list = readdirSync(paths, { encoding: 'utf-8' });

    list.forEach(item => {
      let newDir = join(paths, item);
      let stats = statSync(newDir);

      if (stats.isDirectory()) {
        loopDirs(newDir, item);
      } else {
        let key = join(prefix || '', item);
        let size = cacheFn(key, newDir);
        sizes.set(key, size);
      }
    });
  };

  // invoke
  loopDirs(dir);

  return sizes;
}

export default main;
