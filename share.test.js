const {
    findFilePath,
    copyFolder,
    copyFiles,
    makeFileList,
    withDependencies,
    findReferences,
    noCondition,
    obsidianFileConditions
} = require('./utils.js');

const { copyByTopic } = require('./share');
const fs = require('fs');


//------TEST CODE---------
// TEST CODE

// var a = {tag: "tag"}
// var b = {filename: "filename"}
// var c = {tag: "tag1", filename: "filename1"}
// var d = {}

// function _temp({tag, filename}) {
//     if(tag && filename) throw('Cannot have both tag and filename');
//     if(!(tag || filename)) throw('Options not provided');
//     return tag || filename
// }

// console.log(_temp(d))
// console.log(_temp(c))

//-----------------------


test('findFilePath', () => {
    expect(findFilePath('seventh.md', __dirname)).toBe('literature notes\\seventh.md');
})

test('makeFileList', () => {
    var fileList = [];
    makeFileList({ source: __dirname, fileList: fileList, condition: obsidianFileConditions({ tag: 'csse3012' }) });
    expect(fileList).toEqual([
        'first.md',
        'literature notes\\seventh.md',
        'rough notes\\maths\\foo.md',
        'rough notes\\science\\first copy.md',
        'second.md'
    ]);
})

test('findReferences', () => {
    var fileListFirst = [ 'x.png', 'third' ]
    var fileListSeventh = []

    expect(findReferences('./first.md')).toEqual(fileListFirst);
    expect(findReferences('./literature notes\\seventh.md')).toEqual(fileListSeventh);
})

test('copyByTopic', () => {
    const expectedFileList = [
        'temp\\.obsidian\\somefile.js',
        'temp\\first.md',
        'temp\\literature notes\\seventh.md',
        'temp\\rough notes\\maths\\foo.md',
        'temp\\rough notes\\science\\first copy.md',
        'temp\\second.md',
        'temp\\third',
        'temp\\x.png'
    ]

    function testMakeFileList() {
        var sampleFileList = []
        makeFileList({ source: './temp', fileList: sampleFileList, condition: noCondition('csse3012') });
        return sampleFileList
    }


    copyByTopic({ source: './', target: './temp', tag: 'csse3012' });
    expect(testMakeFileList()).toEqual(expectedFileList);

    // remove the temp directory (cleanup)
    fs.rmdirSync('./temp', { recursive: true });
})