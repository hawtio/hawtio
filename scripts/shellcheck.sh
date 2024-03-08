#!/usr/bin/env bash

excludes=""

target_dirs=(
  "examples/keycloak-integration"
  "scripts"
  "tests/hawtio-test-suite"
)

for dir in "${target_dirs[@]}"; do
  echo Linting "$dir/*.sh"
  shellcheck "$dir"/*.sh -e "$excludes"
done
