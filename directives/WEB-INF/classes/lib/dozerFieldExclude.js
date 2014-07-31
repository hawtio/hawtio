var io_hawt_dozer_schema_FieldExclude = {
  "type" : "object",
  "id" : "urn:jsonschema:io:hawt:dozer:schema:FieldExclude",
  "properties" : {
    "b" : {
      "type" : "object",
      "$ref" : "urn:jsonschema:io:hawt:dozer:schema:FieldDefinition",
      "required" : true
    },
    "a" : {
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

