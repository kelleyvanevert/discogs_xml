
// loads environment variables from .env
require("dotenv").config()

const fs = require("fs-extra")
const Discogs = require("disconnect").Client

const { performance } = require("perf_hooks")
const util = require("util")
const exec = util.promisify(require("child_process").exec)

const db = new Discogs("hello", { userToken: process.env.TOKEN }).database()

fs.ensureDirSync(`./images`)
fs.ensureDirSync(`./errors`)

const download_releases = Array.from({ length: 9999 }).map((__, i) => i + 1);

async function getNextRelease () {
  if (download_releases.length === 0) {
    console.log("DONE")
    return process.exit()
  }

  const id = download_releases.shift()

  process.stdout.write(`${id}: `)

  if (fs.pathExistsSync(`./images/${id}.jpg`)) {
    console.log("already have image")
    setTimeout(getNextRelease, 0)
    return
  }

  if (fs.pathExistsSync(`./errors/${id}.error`)) {
    console.log("did not exist")
    setTimeout(getNextRelease, 0)
    return
  }

  // right before we make this call: schedule the next call for after 1.3 s
  const t0 = performance.now()
  process.stdout.write("getting release... ")
  try {
    const release = await db.getRelease(id)

    if (release.images) {
      process.stdout.write(`downloading image... `)
      await exec(`wget -O ./images/${id}.jpg "${release.images[0].resource_url}"`)
      console.log("OK")
    } else {
      console.log(`no images`)
    }
  } catch (e) {
    fs.writeFileSync(`./errors/${id}.error`, e.message, "utf-8")
    console.log(`error`, e.message)
  }

  const wait_ms = Math.max(0, 1300 - (performance.now() - t0))
  setTimeout(getNextRelease, wait_ms)
}

// kickstart
getNextRelease()

// example image url:
// https://img.discogs.com/xf0KghfVd7miDuEV0i4ILEzc-Ds=/fit-in/600x602/filters:strip_icc():format(jpeg):mode_rgb():quality(90)/discogs-images/R-176126-1322456477.jpeg.jpg