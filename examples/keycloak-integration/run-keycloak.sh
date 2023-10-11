#!/bin/bash

script_dir=$(dirname "$0")

podman run --rm -p 18080:8080 --name keycloak \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -v "${script_dir}/hawtio-demo-realm.json":/opt/keycloak/data/import/hawtio-demo-realm.json:Z \
  quay.io/keycloak/keycloak \
  -v start-dev --import-realm
