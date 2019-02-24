#!/usr/bin/env bash

echo "- number of images:"
ls -1 images | wc -l

echo "- total size of images:"
du -h images

echo "- number of not-founds:"
ls -1 errors | wc -l