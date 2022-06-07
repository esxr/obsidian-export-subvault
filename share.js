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

// return the list of references inside a file
function findReferences(file) {
    var fileContent
    try {
        fileContent = fs.readFileSync(file, { encoding: 'utf-8' });
    } catch (err) {
        console.log(err)
        return;
    }
    const regexString = `\\[\\[(.*?)\\]\\]`
    const referenceMatch = [...fileContent.matchAll(new RegExp(regexString, 'g'))];
    var references = referenceMatch.map(match => match[1]);
    // print the references in text format
    return references
}

// test hasReference
// console.log(findReferences('./first.md'));

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
    // exclude the '.git. folder

    // only copy media files if file isn't a '.md' file
    if (!file.includes('.md')) return false;

    // if '.md' file
    // skip if the file doesn't have a '#<tag>' tag
    // if (!hasTag(file, tag)) return false;

    return true;
}

const noCondition = (tag) => (file) => {
    return true;
}

// recursively copy all files to another folder while preserving structure
function copyFiles({ source, target, condition, fileList }) {
    const files = fs.readdirSync(source);
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target);
    }
    files.forEach(file => {
        const curSource = `${source}/${file}`;
        const curTarget = `${target}/${file}`;
        if (fs.lstatSync(curSource).isDirectory()) {
            copyFiles({ source: curSource, target: curTarget, condition: condition, fileList: fileList });
        } else {
            if (condition(file) == true) {
                // find the absolute path of the file
                const absolutePath = path.resolve(curSource);

                copyFiles(
                    {
                        source: curSource, target: curTarget, condition: condition,
                        fileList: [...fileList, absolutePath]
                    }
                );
            }
        }
    });
}

// recursively make a list of all the filepaths in the directory
function makeFileList({ source, fileList, condition, gitignore }) {
    var files;
    try {
        files = fs.readdirSync(source);
    } catch (err) {
        return fileList;
    }
    files.forEach(file => {
        const curSource = `${source}/${file}`;
        const absolutePath = path.resolve(curSource);
        if (fs.lstatSync(curSource).isDirectory()) {
            var options = {
                source: curSource,
                fileList: [...fileList, absolutePath],
                condition: condition,
                gitignore: gitignore
            }
            fileList = makeFileList(options);
        } else {
            if (condition(file) == true)
                fileList.push(absolutePath);
        }
    });
    return fileList;
}

// test makeFileList
var options = {
    source: '.',
    condition: obsidianFileConditions('csse3012'),
    fileList: [],
    gitignore: []
}
console.log(makeFileList(options));

// copyFiles(
//     options
// );
// copyFiles('.', './temp', noCondition('any'));
// console.log(fileList);

function copyByTag(source, target, tag) {
    // copy all the files that have the tag 'csse3012'
    copyFiles(source, target, { condition: obsidianFileConditions(tag) });

    // copy the obsidian folder
    copyFiles('./.obsidian', './temp/.obsidian', { condition: noCondition });

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
}

// test copyByTag
// copyByTag('./', './temp', 'csse3012');


// process("csse3012", "./")
