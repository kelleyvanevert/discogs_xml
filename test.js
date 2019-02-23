
const fs = require("fs");
const sax = require("sax");
const strict = true;

const saxStream = sax.createStream(strict, {})

let loc = [];

function indented_log (str) {
  const indent = Array.from({ length: loc.length + 1 }).join("  ")
  console.log(indent + str)
}

saxStream.onerror = function (e) {
  throw e
}

saxStream.ontext = function (text) {
  if (text.trim() !== "") {
    indented_log(`text: ${text}`)
  }
}

saxStream.onopentag = function (node) {
  indented_log(node.name)
  loc.push(node.name)
}

saxStream.onclosetag = function (node) {
  if (loc.length === 0) {
    throw `Cannot close tag at root of document!`
  }
  //if (loc[loc.length - 1] !== node.name) {
  //  indented_log("/") // tag was auto-closed
  //}
  loc.pop();
}

saxStream.onattribute = function (attr) {
  indented_log(`- attr ${attr.name} = ${attr.value}`)
}

saxStream.onend = function () {
  indented_log("done")
}

fs.createReadStream("./discogs_20190101_artists.xml")
  .pipe(saxStream)
