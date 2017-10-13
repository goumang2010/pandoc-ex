#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var inquirer = require('inquirer');
var build = require('./src/build');
var ora = require('ora');
var argv = require('minimist')(process.argv.slice(2));


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
const getFormat = (format) => format ? format : inquirer
    .prompt([{
        type: 'input',
        name: 'format',
        message: `Which format for the target?`,
        default: 'docx'
    }]).then((answer) => answer.format);
async function main() {
    const {
        watch,
        via
    } = argv;
    const format = await getFormat(argv.format);
    const src = await getSrcFolder(argv.src);
    const dist = await getDistFolder(argv.dist);
    const macro = await getMacroFile(argv.macro);
    console.log(`Source files folder:`, src);
    console.log(`Dist files folder:`, dist);
    const spinner = ora(`${watch ? 'Watching' : 'Writing'} markdown files ...`).start();
    await build({
        src,
        dist,
        watch,
        via,
        macro,
        format
    });

}

main().catch(err => console.error(err));