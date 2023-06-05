#!/bin/bash

podman run --rm -p 18080:8080 --name keycloak \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=admin \
  -v "$PWD/hawtio-demo-realm.json":/opt/keycloak/data/import/hawtio-demo-realm.json:Z \
  quay.io/keycloak/keycloak \
  -v start-dev --import-realm
