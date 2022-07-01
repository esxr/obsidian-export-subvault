const {
    copyFolder,
    copyFiles,
    makeFileList,
    withDependencies,
    findReferences,
    noCondition,
    obsidianFileConditions
} = require('./utils.js');

const fs = require('fs');
const path = require("path");


/**
 * Takes a 'tag' as input
 * Copies all files with that tag into a new folder
 * Copies their dependencies into the new folder
 * @param {string} source
 * @param {string} target
 * @param {string} tag
 * 
 * @returns null
 */
function copyByTopic({ source, target, tag }) {
    // files that contain the tag
    var fileList = [];
    makeFileList({ source: source, fileList: fileList, condition: obsidianFileConditions({ tag }) });

    // include the dependencies of each file
    fileList = withDependencies(fileList);

    // copy all files to their respective folders
    copyFiles(fileList, target);


    // trim empty directories
    const files = fs.readdirSync(source);
    files.forEach(file => {
        const curSource = `${source}/${file}`;
        if (fs.lstatSync(curSource).isDirectory()) {
            if (fs.readdirSync(curSource).length == 0) {
                fs.rmdirSync(curSource);
            }
        }
    });

    // copy the obsidian folder into the new directory
    copyFolder(`${source}/.obsidian`, target);

    console.log(fileList)
}

// test copyByTopic
// copyByTopic({source: './', target: './temp', tag: 'csse3012'});


// export
module.exports = {
    copyByTopic
}