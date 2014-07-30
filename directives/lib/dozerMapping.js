var io_hawt_dozer_schema_Mapping = {
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
};

