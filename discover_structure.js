
/*
  This little script opens an XML file in streaming format,
    and then prints every piece of newly discovered structure
    (the nesting of nodes and usage of attributes).
  
  Note:
    For the Discogs XML files, this means that the full structure
      will be printed out immediately, and then the program
      will happily continue to try to find more structure
      throughout the entire file. But we know for sure that
      no additional structure will be found, so it's OK to
      kill it right after it stops giving output.
  
  Usage:
    Just discover the structure
      node discover_structure.js MY_XML_FILE
    
    With example values / text content
      node discover_structure.js MY_XML_FILE yes
    
    Save it to a file
      node discover_structure.js MY_XML_FILE > SOME_FILE
*/

const xmlFile = process.argv[2]
const withEg = process.argv[3] === "yes"

const fs = require("fs");
const sax = require("sax");
const strict = true;

console.log(`Discovering structure of ${xmlFile}...`)

const saxStream = sax.createStream(strict, {})

let known_structure = {
  __parent: null,
  __attrs: [],
}
let at = known_structure

let loc = []

function indented_log (str) {
  const indent = Array.from({ length: loc.length + 1 }).join("  ")
  console.log(indent + str)
}

saxStream.onerror = function (e) {
  throw e
}

saxStream.onopentag = function (node) {
  if (!at[node.name]) {
    // => we don't know of this node yet

    // register
    at[node.name] = {
      __parent: at,
      __attrs: [],
      __new: true,
    }

    // print
    indented_log(node.name)
  } else {
    at[node.name].__new = false
  }
  
  // navigate
  at = at[node.name]
  loc.push(node.name)
}

saxStream.onclosetag = function (node) {
  if (loc.length === 0) {
    throw `Cannot close tag at root of document!`
  }
  
  at = at.__parent
  loc.pop()
}

saxStream.ontext = function (text) {
  if (withEg && at.__new) {
    if (text.trim()) {
      indented_log(`- text e.g. "${text.trim().replace(/"g/, `\\"`).replace(/\r?\n/g, "\\n")}"`)
      at.__new = false
    }
  }
}

saxStream.onattribute = function (attr) {
  if (at.__attrs.indexOf(attr.name) < 0) {
    // => we don't know of this attribute yet

    // register
    at.__attrs.push(attr.name)

    // print
    indented_log(`- attr ${attr.name}${withEg ? ` e.g. "${attr.value}"` : ``}`)
  }
}

saxStream.onend = function () {
  indented_log("done")
}

fs.createReadStream(xmlFile)
  .pipe(saxStream)
