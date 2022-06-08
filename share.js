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


// find the filepath of a file in the directory
function findFilePath(fileName, directory) {

    // find a file by filename in a directory recursively
    function findFile(fileName, directory, found) {
        const files = fs.readdirSync(directory);
        files.forEach(file => {
            const curSource = `${directory}/${file}`;
            if (fs.lstatSync(curSource).isDirectory()) {
                findFile(fileName, curSource, found);
            } else {
                if (file == fileName) {
                    found.push(curSource);
                }
            }
        });
    }

    var filePath = [];
    findFile(fileName, directory, filePath);

    if (filePath != undefined) {
        filePath = filePath[0];
        return path.relative(__dirname, filePath);
    }
}

// test find filepath
console.log(findFilePath('seventh.md', __dirname));

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

// copy all filepaths to new folder while preserving heirarchy
function copyFiles(fileList, target) {
    fileList.forEach(file => {
        const fileName = path.basename(file);
        const filePath = path.dirname(file);
        const targetFilePath = `${target}/${filePath}`;
        const targetFile = `${targetFilePath}/${fileName}`;

        if (!fs.existsSync(targetFilePath)) {
            fs.mkdirSync(targetFilePath, { recursive: true });
        }
        fs.copyFileSync(file, targetFile);
    });
}

// test copyFiles
var sampleFilePaths = [
    'C:/Users/dhool/OneDrive/Desktop/subgraph/first.md',
    'C:/Users/dhool/OneDrive/Desktop/subgraph/literature notes/seventh.md',
    'C:/Users/dhool/OneDrive/Desktop/subgraph/rough notes/science/first copy.md',
    'C:/Users/dhool/OneDrive/Desktop/subgraph/rough notes/maths/foo.md',
    'C:/Users/dhool/OneDrive/Desktop/subgraph/second.md',
    'C:/Users/dhool/OneDrive/Desktop/subgraph/x.png',
    'C:/Users/dhool/OneDrive/Desktop/subgraph/third'
]

// copyFiles(sampleFilePaths, './temp');




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

// test makeFileList
// var sampleFileList = []
// makeFileList({ source: './', fileList: sampleFileList, condition: obsidianFileConditions('csse3012') });
// console.log(sampleFileList)

// make a list of dependent files for each file
function withDependencies(fileList) {
    var dependencies = [];
    fileList.forEach(file => {
        dependencies = [...dependencies, ...findReferences(file)];
    });
    dependencies = [...fileList, ...dependencies]
    return dependencies.filter(file => file != undefined);
}

// test withDependencies
// var files = [];
// makeFileList({ source: './', fileList: files, condition: obsidianFileConditions('csse3012') })
// var files = withDependencies(files);
// console.log(files)

function copyByTopic(source, target, tag) {
    // files that contain the tag
    var fileList = [];
    makeFileList({ source: source, fileList: fileList, condition: obsidianFileConditions(tag) });

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

    console.log(fileList)
}

// test copyByTopic
// copyByTopic('./', './temp', 'csse3012');


// process("csse3012", "./")
