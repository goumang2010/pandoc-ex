#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var inquirer = require('inquirer');
var ora = require('ora');
var omit = require('lodash.omit');
var chalk = require('chalk');
var build = require('./src/build');
var pkg  = require('./package');
var argv = require('minimist')(process.argv.slice(2));

const println = (...str) => {
    process.stdout.write(`${str && str.join(' ') || ''}\n`);
};

const help = () => {
    println();
    println(chalk.gray(`${pkg.name} - ${pkg.version}`));
    println();
    println('  Usage: pandox-ex [options]');
    println();
    println('  options:');
    println();
    println('  --src=DIRECTORY ' , 'specify the source folder(absolute/relative path)');
    println('  --dist=DIRECTORY' , 'specify the destination folder(absolute/relative path)');
    println('  --from=FORMAT   ' , 'source format, default is markdown');
    println('  --to=FORMAT     ' , 'target format, default is docx');
    println('  --via=FORMAT    ' , 'middle format for transformation, from -> via -> to')
    println('for more information, please visit: https://github.com/jgm/pandoc/issues/3924/');
    println('  --macro=FILENAME' , 'specify pp macro file, you can find some in: https://github.com/tajmone/pandoc-goodies/tree/master/pp/macros');
    println('  --watch         ' , 'watch the source files');
    println('  --help         ');
    println();
    println('  other pandoc option is available, note that path option should be filled with absolute path other than relative path');
    println();
}

if (argv.help) {
    help();
    return;
}

const readDir = (_fullpath) => fs.existsSync(_fullpath) ? fs.readdirSync(_fullpath).map(x => ({
    path: x,
    fullpath: path.join(_fullpath, x)
})) : [];

const getSubFolders = (_path) => (Array.isArray(_path) ? _path : readDir(_path)).filter(x => fs.statSync(x.fullpath).isDirectory());
// const getSubFiles = (_path) => readDir(_path).filter(x => fs.statSync(x.fullpath).isFile());

const getFolderName = (purpose) => function (folderList) {
    const callee = arguments.callee;
    return inquirer
        .prompt([{
            type: 'list',
            name: 'option',
            message: `Which folder for ${purpose}?`,
            choices: folderList.map(x => x.path)
        }]).then((answer) => {
            var pathObj = folderList.find(x => x.path === answer.option);
            var subFolders = getSubFolders(pathObj.fullpath);
            return subFolders.length ? callee(subFolders) : pathObj.fullpath;
        });
}
const cwd = process.cwd();
const getSrcName = getFolderName('src');
const getDistName = getFolderName('dist');
const rootStuff = readDir(cwd)
const rootFolders = getSubFolders(rootStuff);
const _getMacroFile = (fileList) => inquirer
    .prompt([{
        type: 'list',
        name: 'option',
        message: `Which file for pp macro?`,
        choices: fileList.map(x => x.path)
    }]).then((answer) => {
        var pathObj = fileList.find(x => x.path === answer.option);
        if (fs.statSync(pathObj.fullpath).isDirectory()) {
            return _getMacroFile(readDir(pathObj.fullpath));
        } else {
            return pathObj.fullpath
        }
    });

const getMacroFile = (macro, defaultAnswer = false) => macro ? path.resolve(cwd, macro) : inquirer
    .prompt([{
        type: 'confirm',
        name: 'macro',
        message: 'Use macro?',
        default: defaultAnswer
    }]).then((answer) => answer.macro ? _getMacroFile(rootStuff) : undefined);

const getSrcFolder = (src) => src ? path.resolve(cwd, src) : getSrcName(rootFolders);
const getDistFolder = (dist) => dist ? path.resolve(cwd, dist) : getDistName(rootFolders);
const getFormat = (format, key, _default) => format ? format : inquirer
    .prompt([{
        type: 'input',
        name: 'format',
        message: `Which to for the ${key}?`,
        default: _default
    }]).then((answer) => answer.format);
async function main() {
    const {
        watch,
        via
    } = argv;
    const from = await getFormat(argv.from, 'source format', 'markdown');
    const to = await getFormat(argv.to, 'target format', 'docx');
    const src = await getSrcFolder(argv.src);
    const dist = await getDistFolder(argv.dist);
    const macro = await getMacroFile(argv.macro);
    const option = {
        src,
        dist,
        watch,
        via,
        macro,
        from,
        to
    };
    const other = omit(argv, ['_', ...Object.keys(option)]);
    option.other = other;
    console.log(`Source files folder:`, src);
    console.log(`Dist files folder:`, dist);
    const spinner = ora(`${watch ? 'Watching' : 'Writing'} markdown files ...`).start();
    await build(option);

}

main().catch(err => console.error(err));