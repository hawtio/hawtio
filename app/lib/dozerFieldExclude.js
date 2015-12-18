var io_hawt_dozer_schema_FieldExclude = {
  "type" : "object",
  "id" : "urn:jsonschema:io:hawt:dozer:schema:FieldExclude",
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
    "type" : {
      "type" : "string",
      "enum" : [ "ONE_WAY", "BI_DIRECTIONAL" ]
    }
  }
};

