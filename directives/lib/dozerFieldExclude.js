var io_hawt_dozer_schema_FieldExclude = {
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
    "type" : {
      "type" : "string",
      "enum" : [ "ONE_WAY", "BI_DIRECTIONAL" ]
    }
  }
};

