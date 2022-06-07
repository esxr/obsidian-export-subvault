const fs = require('fs');
const path = require("path");

// check if a file has a tag inside it
function hasTag(file, tag) {
    var fileContent
    try {
        fileContent = fs.readFileSync(file, { encoding: 'utf-8' });
    } catch (err) {
        return;
    }
    const regexString = `^#(${tag})`
    const tagMatch = fileContent.match(new RegExp(regexString));
    return tagMatch !== null;
}

// test hasTag
// console.log(hasTag('./first.md', 'csse3012'));

// find out if a filepath has been referenced in a file
function hasFilePath(file, filePath) {
    const fileContent = fs.readFileSync(file, { encoding: 'utf-8' });
    const regexString = `\\[\\[${filePath}\\]\\]`
    const filePathMatch = fileContent.match(new RegExp(regexString));
    return filePathMatch !== null;
}

// test hasFilePath
// console.log(hasFilePath('./first.md', 'x.png'));

const obsidianFileConditions = (tag) => (file) => {
    // skip if file isn't a '.md' file
    if (!file.endsWith('.md')) {
        // check if the file is a media file
        if (!(file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.gif'))) return false;
    }

    // skip if the file doesn't have a '#<tag>' tag
    if (!hasTag(file, tag)) return false;

    return true;
}

function noCondition(file) {
    return true;
}

// recursively copy all files to another folder while preserving structure
function copyFiles(source, target, condition) {
    const files = fs.readdirSync(source);
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target);
    }
    files.forEach(file => {
        const curSource = `${source}/${file}`;
        const curTarget = `${target}/${file}`;
        if (fs.lstatSync(curSource).isDirectory()) {
            copyFiles(curSource, curTarget, condition);
        } else {
            if (condition(file) == true)
                fs.copyFileSync(curSource, curTarget);
        }
    });
}

// copyFiles('./', './temp', obsidianFileConditions);

function copyByTag(source, target, tag) {
    // copy all the files that have the tag 'csse3012'
    copyFiles(source, target, obsidianFileConditions(tag));

    // copy the obsidian folder
    copyFiles('./.obsidian', './temp/.obsidian', noCondition);
}

// test copyByTag
copyByTag('./', './temp', 'csse3012');


// process("csse3012", "./")
