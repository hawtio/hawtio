var io_hawt_dozer_schema_Mappings = {
  "type" : "object",
  "id" : "urn:jsonschema:io:hawt:dozer:schema:Mappings",
  "properties" : {
    "configuration" : {
      "type" : "object",
      "id" : "urn:jsonschema:io:hawt:dozer:schema:Configuration",
      "properties" : {
        "stop-on-errors" : {
          "type" : "boolean"
        },
        "date-format" : {
          "type" : "string"
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
                  "class-a" : {
                    "type" : "object",
                    "id" : "urn:jsonschema:io:hawt:dozer:schema:Class",
                    "required" : true,
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
                    "$ref" : "urn:jsonschema:io:hawt:dozer:schema:Class",
                    "required" : true
                  },
                  "type" : {
                    "type" : "string",
                    "required" : true
                  }
                }
              }
            }
          }
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
                  "value" : {
                    "type" : "string"
                  },
                  "name" : {
                    "type" : "string",
                    "required" : true
                  }
                }
              }
            }
          }
        }
      }
    },
    "mapping" : {
      "type" : "array",
      "items" : {
        "type" : "object",
        "id" : "urn:jsonschema:io:hawt:dozer:schema:Mapping",
        "properties" : {
          "class-a" : {
            "type" : "object",
            "$ref" : "urn:jsonschema:io:hawt:dozer:schema:Class"
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
      }
    }
  }
};

