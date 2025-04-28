#!/usr/bin/env bash

set -e

if [ -z "$1" ]; then
  echo Use this script to update @hawtio/react version in the project.
  echo
  echo Usage:
  echo "  $(basename "$0") <new version>"
  exit
fi

if ! command -v ag > /dev/null; then
  echo This script requires ag, the silver searcher. Install it and try again.
  echo
  echo "  dnf install the_silver_searcher"
  exit
fi

version=$1
echo Updating @hawtio/react to "$version"

ag @hawtio/react -G package.json -l | xargs gsed -i "s|\"@hawtio/react\": \".*\"|\"@hawtio/react\": \"^$version\"|g"

echo Run \'mvn install\' to update yarn.lock
