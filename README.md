# Tools

## Install

```bash
npm i -g usediff
```

## Usage

```bash
usediff -t 指定工具 --files 指定文件夹（支持多个）
```

| 指定参数 | 指定值    | 描述                           |
| -------- | --------- | ------------------------------ |
| -t       | dir-diff  | dir-diff 文件夹对比工具        |
| --files  | a, b etc. | 指定文件夹，支持多个，逗号分开 |

## Tool list

- dir-diff 文件夹大小对比工具

## Demo

### Demo1

> Command

```bash
usediff -t dir-dff --files dist,bin
```

> Output

```md
# 文件夹对比

## 文件夹 dist - 文件夹 bin

| 文件名            | 文件夹 dist | 文件夹 bin | 大小（byte） | 大小（kb） | 大小（mb） |
| ----------------- | ----------- | ---------- | ------------ | ---------- | ---------- |
| .DS_Store         | 6148        | -          | 6148         | 6          | 0.01       |
| cli/diff.js       | 1195        | -          | 1195         | 1          | 0.00       |
| src/index.js      | 127         | -          | 127          | 0          | 0.00       |
| tools/dir-diff.js | 5037        | -          | 5037         | 5          | 0.00       |
| diff.js           | -           | 53         | 53           | 0          | 0.00       |
```
