var io_hawt_dozer_schema_Mappings = {
  "type" : "object",
  "properties" : {
    "mapping" : {
      "type" : "array",
      "items" : {
        "type" : "object",
        "properties" : {
          "wildcard" : {
            "type" : "boolean"
          },
          "trim-strings" : {
            "type" : "boolean"
          },
          "map-null" : {
            "type" : "boolean"
          },
          "bean-factory" : {
            "type" : "string"
          },
          "relationship-type" : {
            "type" : "string",
            "enum" : [ "CUMULATIVE", "NON_CUMULATIVE" ]
          },
          "type" : {
            "type" : "string",
            "enum" : [ "ONE_WAY", "BI_DIRECTIONAL" ]
          },
          "map-empty-string" : {
            "type" : "boolean"
          },
          "class-a" : {
            "type" : "object",
            "properties" : {
              "factory-bean-id" : {
                "type" : "string"
              },
              "is-accessible" : {
                "type" : "boolean"
              },
              "map-null" : {
                "type" : "boolean"
              },
              "bean-factory" : {
                "type" : "string"
              },
              "value" : {
                "type" : "string"
              },
              "create-method" : {
                "type" : "string"
              },
              "map-get-method" : {
                "type" : "string"
              },
              "map-set-method" : {
                "type" : "string"
              },
              "map-empty-string" : {
                "type" : "boolean"
              }
            }
          },
          "class-b" : {
            "type" : "object",
            "properties" : {
              "factory-bean-id" : {
                "type" : "string"
              },
              "is-accessible" : {
                "type" : "boolean"
              },
              "map-null" : {
                "type" : "boolean"
              },
              "bean-factory" : {
                "type" : "string"
              },
              "value" : {
                "type" : "string"
              },
              "create-method" : {
                "type" : "string"
              },
              "map-get-method" : {
                "type" : "string"
              },
              "map-set-method" : {
                "type" : "string"
              },
              "map-empty-string" : {
                "type" : "boolean"
              }
            }
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
          "map-id" : {
            "type" : "string"
          }
        }
      }
    },
    "configuration" : {
      "type" : "object",
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
        "copy-by-references" : {
          "type" : "object",
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
          "properties" : {
            "converter" : {
              "type" : "array",
              "required" : true,
              "items" : {
                "type" : "object",
                "properties" : {
                  "type" : {
                    "type" : "string"
                  },
                  "class-a" : {
                    "type" : "object",
                    "required" : true,
                    "properties" : {
                      "factory-bean-id" : {
                        "type" : "string"
                      },
                      "is-accessible" : {
                        "type" : "boolean"
                      },
                      "map-null" : {
                        "type" : "boolean"
                      },
                      "bean-factory" : {
                        "type" : "string"
                      },
                      "value" : {
                        "type" : "string"
                      },
                      "create-method" : {
                        "type" : "string"
                      },
                      "map-get-method" : {
                        "type" : "string"
                      },
                      "map-set-method" : {
                        "type" : "string"
                      },
                      "map-empty-string" : {
                        "type" : "boolean"
                      }
                    }
                  },
                  "class-b" : {
                    "type" : "object",
                    "required" : true,
                    "properties" : {
                      "factory-bean-id" : {
                        "type" : "string"
                      },
                      "is-accessible" : {
                        "type" : "boolean"
                      },
                      "map-null" : {
                        "type" : "boolean"
                      },
                      "bean-factory" : {
                        "type" : "string"
                      },
                      "value" : {
                        "type" : "string"
                      },
                      "create-method" : {
                        "type" : "string"
                      },
                      "map-get-method" : {
                        "type" : "string"
                      },
                      "map-set-method" : {
                        "type" : "string"
                      },
                      "map-empty-string" : {
                        "type" : "boolean"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "variables" : {
          "type" : "object",
          "properties" : {
            "variable" : {
              "type" : "array",
              "required" : true,
              "items" : {
                "type" : "object",
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

