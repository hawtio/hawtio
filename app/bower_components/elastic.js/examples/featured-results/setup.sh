#!/bin/bash

# create index and define "string_lowercase" analyzer
curl -XPUT 'http://localhost:9200/featured/' -d '{
    "analysis": {
        "analyzer": {
            "string_lowercase": {
                "tokenizer": "keyword",
                "filter": "lowercase"
            }
        }
    }
}'

# setup mapping for featured "keywords" field
curl -XPUT 'http://localhost:9200/featured/doc/_mapping' -d '{
    "doc" : {
        "properties" : {
            "keywords" : { 
                "type" : "string", 
                "analyzer" : "string_lowercase"
            }
        }
    }
}'

exit 0
