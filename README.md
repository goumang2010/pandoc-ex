[![NPM version][npm-image]][npm-url]

# pandoc-ex

> Enhanced pandoc which support watching files and pp macro, eg：<https://github.com/tajmone/pandoc-goodies/tree/master/pp/macros>
> Generate pretty word/pdf document with markdown files.

## Installation

```bash
npm i pandoc-ex -g
```

## Usage

### CommandLine

```bash
pandoc-ex
```

### CommandLine Usage

例子：

```bash
pandoc-ex --watch --to=docx --from=markdown --src=./test/src --reference-docx=/absolute_path/template.docx --dist=./test/dist --macro=./macros/macros.pp
```

### Options

```bash
  --src=DIRECTORY  specify the source folder(absolute/relative path)
  --dist=DIRECTORY specify the destination folder(absolute/relative path)
  --from=FORMAT    source format, default is markdown
  --to=FORMAT      target format, default is docx
  --via=FORMAT     middle format for transformation, from -> via -> to
for more information, please visit: https://github.com/jgm/pandoc/issues/3924/
  --macro=FILENAME specify pp macro file
  --watch          watch the source files
  --help
```

[npm-image]: https://img.shields.io/npm/v/pandoc-ex.svg?style=flat
[npm-url]: https://npmjs.org/package/pandoc-ex