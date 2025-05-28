#!/usr/bin/env bash

crdDir=${1:?Provide path to hawtio_v1alpha1_hawtio_crd.yaml from the hawtio-operator project}
baseDir=$(dirname "$0")


jbang io.fabric8:java-generator-cli:6.0.0 -s "$crdDir" -t "$baseDir"/src/main/java
#Specify the plural for the CRD - otherwise it's hawtioes
sed '5i @io.fabric8.kubernetes.model.annotation.Plural("hawtios")' -i "$baseDir"/src/main/java/io/hawt/v*/Hawtio.java
echo "Java classes are generated in the src/main/java directory"
