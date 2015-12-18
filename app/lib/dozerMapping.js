var io_hawt_dozer_schema_Mapping = {
  "type" : "object",
  "id" : "urn:jsonschema:io:hawt:dozer:schema:Mapping",
  "properties" : {
    "class-a" : {
      "type" : "object",
      "id" : "urn:jsonschema:io:hawt:dozer:schema:Class",
      "properties" : {
        "value" : {
          "type" : "string"
        },
        "bean-factory" : {
          "type" : "string"
        },
        "factory-bean-id" : {
          "type" : "string"
        },
        "map-set-method" : {
          "type" : "string"
        },
        "map-get-method" : {
          "type" : "string"
        },
        "create-method" : {
          "type" : "string"
        },
        "map-null" : {
          "type" : "boolean"
        },
        "map-empty-string" : {
          "type" : "boolean"
        },
        "is-accessible" : {
          "type" : "boolean"
        }
      }
    },
    "class-b" : {
      "type" : "object",
      "$ref" : "urn:jsonschema:io:hawt:dozer:schema:Class"
    },
    "fieldOrFieldExclude" : {
      "type" : "array"
    },
    "date-format" : {
      "type" : "string"
    },
    "stop-on-errors" : {
      "type" : "boolean"
    },
    "wildcard" : {
      "type" : "boolean"
    },
    "trim-strings" : {
      "type" : "boolean"
    },
    "map-null" : {
      "type" : "boolean"
    },
    "map-empty-string" : {
      "type" : "boolean"
    },
    "bean-factory" : {
      "type" : "string"
    },
    "type" : {
      "type" : "string",
      "enum" : [ "ONE_WAY", "BI_DIRECTIONAL" ]
    },
    "relationship-type" : {
      "type" : "string",
      "enum" : [ "CUMULATIVE", "NON_CUMULATIVE" ]
    },
    "map-id" : {
      "type" : "string"
    }
  }
};

