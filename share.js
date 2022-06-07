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
    var filePaths = references.map(ref => findFilePath(ref, './'));
    // print the references in text format
    return filePaths
}

// test findReferences
// console.log(findReferences('./first.md'));

// find a file by filename in a directory recursively
function findFile(fileName, directory) {
    var found;
    const files = fs.readdirSync(directory);
    files.forEach(file => {
        const curSource = `${directory}/${file}`;
        if (fs.lstatSync(curSource).isDirectory()) {
            findFile(fileName, curSource);
        } else {
            if (file == fileName) {
                found = curSource;
            }
        }
    });
    return found;
}

// find the filepath of a file in the directory
function findFilePath(fileName, directory) {
    var file = findFile(fileName, directory);
    if (file != undefined) {
        return path.resolve(file);
    }
}

// test find filepath
// console.log(findFilePath('first.md', __dirname));

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

    // only copy media files if file isn't a '.md' file
    if (!file.includes('.md')) return false;

    // if '.md' file
    // skip if the file doesn't have a '#<tag>' tag
    if (!hasTag(file, tag)) return false;

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
function makeFileList({ source, fileList, condition }) {
    const files = fs.readdirSync(source);
    files.forEach(file => {
        const curSource = `${source}/${file}`;
        if (fs.lstatSync(curSource).isDirectory()) {
            makeFileList({ source: curSource, fileList, condition });
        } else {
            const absolutePath = path.resolve(curSource);

            if (condition(absolutePath) == true)
                fileList.push(absolutePath);
        }
    });
}

// make a list of dependent files for each file
function withDependencies(fileList) {
    var dependencies = [];
    fileList.forEach(file => {
        dependencies = [...dependencies, ...findReferences(file)];
    });
    dependencies = [...fileList, ...dependencies]
    return dependencies.filter(file => file != undefined);
}

// test makeDepedencies
// var files = [];
// makeFileList({ source: './', fileList: files, condition: obsidianFileConditions('csse3012') })
// var files = withDependencies(files);
// console.log(files)

// test makeFileList
// var sampleFileList = []
// makeFileList({ source: './', fileList: sampleFileList, condition: obsidianFileConditions('csse3012') });
// console.log(sampleFileList)

function copyByTopic(source, target, tag) {
    // files that contain the tag
    var fileList = [];
    makeFileList({ source: source, fileList: fileList, condition: obsidianFileConditions(tag) });

    // include the dependencies of each file
    fileList = withDependencies(fileList);

    // copy all files to their respective folders
    

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

    console.log(fileList)
}

// test copyByTopic
copyByTopic('./', './temp', 'csse3012');


// process("csse3012", "./")
