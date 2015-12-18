var io_hawt_dozer_schema_Field = {
  "type" : "object",
  "id" : "urn:jsonschema:io:hawt:dozer:schema:Field",
  "properties" : {
    "a" : {
      "type" : "object",
      "id" : "urn:jsonschema:io:hawt:dozer:schema:FieldDefinition",
      "required" : true,
      "properties" : {
        "value" : {
          "type" : "string"
        },
        "date-format" : {
          "type" : "string"
        },
        "type" : {
          "type" : "string",
          "enum" : [ "ITERATE", "GENERIC" ]
        },
        "set-method" : {
          "type" : "string"
        },
        "get-method" : {
          "type" : "string"
        },
        "key" : {
          "type" : "string"
        },
        "map-set-method" : {
          "type" : "string"
        },
        "map-get-method" : {
          "type" : "string"
        },
        "is-accessible" : {
          "type" : "boolean"
        },
        "create-method" : {
          "type" : "string"
        }
      }
    },
    "b" : {
      "type" : "object",
      "$ref" : "urn:jsonschema:io:hawt:dozer:schema:FieldDefinition",
      "required" : true
    },
    "a-hint" : {
      "type" : "string"
    },
    "b-hint" : {
      "type" : "string"
    },
    "a-deep-index-hint" : {
      "type" : "string"
    },
    "b-deep-index-hint" : {
      "type" : "string"
    },
    "relationship-type" : {
      "type" : "string",
      "enum" : [ "CUMULATIVE", "NON_CUMULATIVE" ]
    },
    "remove-orphans" : {
      "type" : "boolean"
    },
    "type" : {
      "type" : "string",
      "enum" : [ "ONE_WAY", "BI_DIRECTIONAL" ]
    },
    "map-id" : {
      "type" : "string"
    },
    "copy-by-reference" : {
      "type" : "boolean"
    },
    "custom-converter" : {
      "type" : "string"
    },
    "custom-converter-id" : {
      "type" : "string"
    },
    "custom-converter-param" : {
      "type" : "string"
    }
  }
};

