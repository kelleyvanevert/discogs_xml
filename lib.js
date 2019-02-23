
const fs = require("fs");
const sax = require("sax");
const strict = true;

function streamWalk (xmlFile, pathRules) {

  const saxStream = sax.createStream(strict, {})

  const tree = {
    name: undefined,
    attributes: {},
    children: {},
    text: undefined,
  }
  let currentNode = tree
  let currentPath = []

  saxStream.onerror = function (e) {
    throw e
  }

  saxStream.onopentag = function ({ name, attributes }) {
    const node = {
      name,
      attributes,
      children: {},
      text: undefined,
      parent: currentNode,
      path: currentPath.concat([ name ]).join("/"),
    }
    currentNode.children[name] = currentNode.children[name] || []
    currentNode.children[name].push(node)

    currentPath.push(name)
    currentNode = node
  }

  saxStream.onclosetag = function ({ name }) {
    if (currentPath.length === 0) {
      throw `Cannot close tag at root of document!`
    }

    const node = currentNode;
    
    currentPath.pop()
    currentNode = currentNode.parent

    // apply rules

    const rule = pathRules[node.path]
    if (rule) {
      if (rule.after) {
        const rows = rule.after(node)
        rows.forEach(row => {
          console.log(row.join(", "))
        })
      }

      if (rule.remove) {
        const arr = node.parent.children[node.name]
        arr.splice(arr.indexOf(node), 1)
        delete node.parent
      }
    }
  }

  saxStream.ontext = function (text) {
    currentNode.text = text
  }

  fs.createReadStream(xmlFile)
    .pipe(saxStream)

}

module.exports = {
  streamWalk,
}
