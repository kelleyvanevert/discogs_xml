
const { streamWalk } = require("./lib")

const rules = {
  "releases/release": {
    after: node => {
      return [
        [
          node.attributes.id,
          `"${node.children.title[0].text.replace(/"/g, `\\"`)}"`,
          node.children.images
            ? node.children.images[0].children.image.length
            : 0
          ,
        ],
      ]
    },
    remove: true,
  },
}

const file = "discogs_20190101_releases.xml"

streamWalk(file, rules)
