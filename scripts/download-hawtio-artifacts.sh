#!/usr/bin/env bash

set -e

if [ -z "$1" ]; then
  echo Use this script to download Hawtio release artifacts from Maven Central.
  echo
  echo Usage:
  echo "  $(basename "$0") <version>"
  exit
fi

version=$1
echo Downloading Hawtio "$version" artifacts

base_url="https://repo1.maven.org/maven2/io/hawt"
artifacts=(
  "hawtio-war"
  "hawtio-war-minimal"
  "hawtio-default"
)
exts=("war" "war.asc" "war.md5" "war.sha1" "war.sha256" "war.sha512")

for artifact in "${artifacts[@]}"; do
  for ext in "${exts[@]}"; do
    url="$base_url/$artifact/$version/$artifact-$version.$ext"
    echo "Downloading $url"
    curl -LO "$url"
  done
done
