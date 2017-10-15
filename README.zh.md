[![NPM version][npm-image]][npm-url]

# pandoc-ex

> 支持watch文件以及pp macro的pandoc，如：<https://github.com/tajmone/pandoc-goodies/tree/master/pp/macros>。
> 主要用于使用markdown编写word/pdf文档。

## 安装

```bash
npm i pandoc-ex -g
```

## 使用

### 使用命令行指引配置

```bash
pandoc-ex
```

### 直接使用命令

例子：

```bash
pandoc-ex --watch --to=docx --from=markdown --src=./test/src --reference-docx=/absolute_path/template.docx --dist=./test/dist --macro=./macros/macros.pp
```

### 配置解释

```bash
  --src=DIRECTORY  指定源目录
  --dist=DIRECTORY 指定输出目录
  --from=FORMAT    指定源格式，默认为markdown
  --to=FORMAT      指定目标格式，默认为docx
  --via=FORMAT     中间格式, from -> via -> to，更多信息: https://github.com/jgm/pandoc/issues/3924/
  --macro=FILENAME 指定pp宏脚本
  --watch          监视源文件变化（新增、修改、删除）
  --help           帮助
```

[npm-image]: https://img.shields.io/npm/v/pandoc-ex.svg?style=flat
[npm-url]: https://npmjs.org/package/pandoc-ex