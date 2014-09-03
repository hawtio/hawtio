var io_hawt_dozer_schema_Mappings = {
  "type" : "object",
  "id" : "urn:jsonschema:io:hawt:dozer:schema:Mappings",
  "properties" : {
    "mapping" : {
      "type" : "array",
      "items" : {
        "$ref" : "urn:jsonschema:io:hawt:dozer:schema:Mapping"
      }
    },
    "configuration" : {
      "type" : "object",
      "id" : "urn:jsonschema:io:hawt:dozer:schema:Configuration",
      "properties" : {
        "trim-strings" : {
          "type" : "boolean"
        },
        "wildcard" : {
          "type" : "boolean"
        },
        "bean-factory" : {
          "type" : "string"
        },
        "map-null" : {
          "type" : "boolean"
        },
        "copy-by-references" : {
          "type" : "object",
          "id" : "urn:jsonschema:io:hawt:dozer:schema:CopyByReferences",
          "properties" : {
            "copy-by-reference" : {
              "type" : "array",
              "required" : true,
              "items" : {
                "type" : "string"
              }
            }
          }
        },
        "date-format" : {
          "type" : "string"
        },
        "stop-on-errors" : {
          "type" : "boolean"
        },
        "relationship-type" : {
          "type" : "string",
          "enum" : [ "CUMULATIVE", "NON_CUMULATIVE" ]
        },
        "custom-converters" : {
          "type" : "object",
          "id" : "urn:jsonschema:io:hawt:dozer:schema:CustomConverters",
          "properties" : {
            "converter" : {
              "type" : "array",
              "required" : true,
              "items" : {
                "type" : "object",
                "id" : "urn:jsonschema:io:hawt:dozer:schema:ConverterType",
                "properties" : {
                  "type" : {
                    "type" : "string"
                  },
                  "class-a" : {
                    "type" : "object",
                    "$ref" : "urn:jsonschema:io:hawt:dozer:schema:Class",
                    "required" : true
                  },
                  "class-b" : {
                    "type" : "object",
                    "$ref" : "urn:jsonschema:io:hawt:dozer:schema:Class",
                    "required" : true
                  }
                }
              }
            }
          }
        },
        "map-empty-string" : {
          "type" : "boolean"
        },
        "variables" : {
          "type" : "object",
          "id" : "urn:jsonschema:io:hawt:dozer:schema:Variables",
          "properties" : {
            "variable" : {
              "type" : "array",
              "required" : true,
              "items" : {
                "type" : "object",
                "id" : "urn:jsonschema:io:hawt:dozer:schema:Variable",
                "properties" : {
                  "name" : {
                    "type" : "string"
                  },
                  "value" : {
                    "type" : "string"
                  }
                }
              }
            }
          }
        },
        "allowed-exceptions" : {
          "type" : "object",
          "id" : "urn:jsonschema:io:hawt:dozer:schema:AllowedExceptions",
          "properties" : {
            "exception" : {
              "type" : "array",
              "required" : true,
              "items" : {
                "type" : "string"
              }
            }
          }
        }
      }
    }
  }
};

