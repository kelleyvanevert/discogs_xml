#!/usr/bin/env bash

grep -rL "Release not found" errors | xargs rm
