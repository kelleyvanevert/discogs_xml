
# Reading the Discogs XML datasets

The datasets in question: https://data.discogs.com/?prefix=data/2019/

These are some really big XML files. Instead of looking up the structure on their docs, or trying to open up a 6 GB XML file, I wrote a little script that discovers the XML structure. The key tool is using the SAX streaming XML parsing library.

Usage:

```sh
node discover_structure.js discogs_20190101_artists.xml
```

which will print out the following to stdout:

```
Discovering structure of discogs_20190101_artists.xml...
artists
  artist
    images
      - attr height
      - attr type
      - attr uri
      - attr uri150
      - attr width
      image
    id
    name
    realname
    profile
    data_quality
    namevariations
      name
    aliases
      - attr id
      name
    members
      id
      - attr id
      name
    urls
      url
    groups
      - attr id
      name
```
