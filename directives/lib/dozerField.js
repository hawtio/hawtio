var io_hawt_dozer_schema_Field = {
  "type" : "object",
  "id" : "urn:jsonschema:io:hawt:dozer:schema:Field",
  "properties" : {
    "b" : {
      "type" : "object",
      "$ref" : "urn:jsonschema:io:hawt:dozer:schema:FieldDefinition",
      "required" : true
    },
    "a-hint" : {
      "type" : "string"
    },
    "a-deep-index-hint" : {
      "type" : "string"
    },
    "copy-by-reference" : {
      "type" : "boolean"
    },
    "a" : {
      "type" : "object",
      "$ref" : "urn:jsonschema:io:hawt:dozer:schema:FieldDefinition",
      "required" : true
    },
    "relationship-type" : {
      "type" : "string",
      "enum" : [ "CUMULATIVE", "NON_CUMULATIVE" ]
    },
    "custom-converter-param" : {
      "type" : "string"
    },
    "type" : {
      "type" : "string",
      "enum" : [ "ONE_WAY", "BI_DIRECTIONAL" ]
    },
    "b-deep-index-hint" : {
      "type" : "string"
    },
    "custom-converter-id" : {
      "type" : "string"
    },
    "custom-converter" : {
      "type" : "string"
    },
    "remove-orphans" : {
      "type" : "boolean"
    },
    "b-hint" : {
      "type" : "string"
    },
    "map-id" : {
      "type" : "string"
    }
  }
};

