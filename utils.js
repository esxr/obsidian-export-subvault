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
        if (filePath != undefined)
            return path.relative(__dirname, filePath);
        return null
    }
}

// test find filepath
// console.log(findFilePath('seventh.md', __dirname));


const obsidianFileConditions = ({ tag, filename }) => (file) => {

    // only copy media files if file isn't a '.md' file
    if (!file.includes('.md')) return false;

    // handle bad input
    if (tag && filename) throw ('Cannot have both tag and filename');
    if (!(tag || filename)) throw ('Options not provided');

    // skip if the file doesn't have a '#<tag>' tag
    if (tag) {
        if (!hasTag(file, tag)) return false;
    }

    // skip if the file doesn't have the name 'filename'
    if (filename) {
        // return false if filename is not the desired name
        if (!file.includes(filename)) return false;
    }

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
    'first.md',
    'literature notes\\seventh.md',
    'rough notes\\maths\\foo.md',
    'rough notes\\science\\first copy.md',
    'second.md',
    'x.png',
    'third'
]

// test copyFiles
// copyFiles(sampleFilePaths, './temp');


// recursively make a list of all the filepaths in the directory
function makeFileList({ source, fileList, condition }) {
    // if directory doesn't exist, return
    if (!fs.existsSync(source)) return;
    const files = fs.readdirSync(source);
    files.forEach(file => {
        const curSource = `${source}/${file}`;
        if (fs.lstatSync(curSource).isDirectory()) {
            makeFileList({ source: curSource, fileList, condition });
        } else {
            const absolutePath = path.resolve(curSource);

            if (condition(absolutePath) == true) {
                let relativeFilePath = path.relative(__dirname, absolutePath);
                fileList.push(relativeFilePath);
            }
        }
    });
}

function testMakeFileList() {
    var sampleFileList = []
    makeFileList({ source: './', fileList: sampleFileList, condition: obsidianFileConditions('csse3012') });
    console.log(sampleFileList)
}

// testMakeFileList()

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
    var filePaths = references.map(ref => findFilePath(ref, './'))
        .filter(filePath => filePath != null);
    // print the references in text format
    return filePaths
}

// test findReferences
// console.log(findReferences('./seventh.md'));

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
function testMakeDependencies() {
    var files = [];
    makeFileList({ source: './', fileList: files, condition: obsidianFileConditions('csse3012') })
    var files = withDependencies(files);
    console.log(files)
}
// testMakeDependencies()

// Copy a source folder into target folder recursively
function copyFolder(source, target) {
    function copyFileSync(source, target) {

        var targetFile = target;

        // If target is a directory, a new file with the same name will be created
        if (fs.existsSync(target)) {
            if (fs.lstatSync(target).isDirectory()) {
                targetFile = path.join(target, path.basename(source));
            }
        }

        fs.writeFileSync(targetFile, fs.readFileSync(source));
    }

    var files = [];

    // Check if folder needs to be created or integrated
    var targetFolder = path.join(target, path.basename(source));
    if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder);
    }

    // Copy
    if (fs.lstatSync(source).isDirectory()) {
        files = fs.readdirSync(source);
        files.forEach(function (file) {
            var curSource = path.join(source, file);
            if (fs.lstatSync(curSource).isDirectory()) {
                copyFolder(curSource, targetFolder);
            } else {
                copyFileSync(curSource, targetFolder);
            }
        });
    }
}

// test copyFolder
// copyFolder('./.obsidian', './temp/');

module.exports = {
    copyFolder,
    copyFiles,
    makeFileList,
    withDependencies,
    findReferences,
    obsidianFileConditions,
    noCondition
}