var io_hawt_dozer_schema_Field = {
  "type" : "object",
  "properties" : {
    "b" : {
      "type" : "object",
      "required" : true,
      "properties" : {
        "is-accessible" : {
          "type" : "boolean"
        },
        "set-method" : {
          "type" : "string"
        },
        "get-method" : {
          "type" : "string"
        },
        "date-format" : {
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
        "type" : {
          "type" : "string",
          "enum" : [ "ITERATE", "GENERIC" ]
        },
        "key" : {
          "type" : "string"
        }
      }
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
      "required" : true,
      "properties" : {
        "is-accessible" : {
          "type" : "boolean"
        },
        "set-method" : {
          "type" : "string"
        },
        "get-method" : {
          "type" : "string"
        },
        "date-format" : {
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
        "type" : {
          "type" : "string",
          "enum" : [ "ITERATE", "GENERIC" ]
        },
        "key" : {
          "type" : "string"
        }
      }
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

