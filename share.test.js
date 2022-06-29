var a = {tag: "tag"}
var b = {filename: "filename"}
var c = {tag: "tag1", filename: "filename1"}
var d = {}

function _temp({tag, filename}) {
    if(tag && filename) throw('Cannot have both tag and filename');
    if(!(tag || filename)) throw('Options not provided');
    return tag || filename
}

// console.log(_temp(d))
// console.log(_temp(c))

//-----------------------

const share = require('./share');
test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });