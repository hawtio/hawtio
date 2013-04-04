describe("Forms", function() {
  beforeEach(function() {
  });

  it("typeNameAliasWorks", function() {
    var schema = {
      "description": "Show some stuff in a form from JSON",
    	"definitions": {
    		"foo": {
    			"type": "object",
    	    "properties": {
    	        "name": { "type": "string" },
    	        "value": { "type": "string" }
    	    }
    		},
    		"bar": {
    			"type": "object",
          "extends": {
            "type": "foo"
          },
    	    "properties": {
    	        "cheese": { "type": "number" }
    	    }
    		}
    	},
      "properties": {
        "key": { "description": "Argument key", "type": "java.lang.String" },
        "value": { "description": "Argument value", "type": "java.lang.String" },
    		"tableValue": {
    			"description": "A table of values with nested schema properties",
    			"type": "array",
    			"items": {
    				"properties": {
    	        "key": { "type": "string" },
    	        "value": { "type": "string" }
    				}
    			}
    		},
    		"fooValue": {
    			"description": "A table of values with referenced foo type definition",
    			"type": "array",
    			"items": {
    				"type": "foo"
    			}
    		},
        "longArg": { "description": "Long argument", "type": "Long" },
        "intArg": { "description": "Int argument", "type": "Integer" }
    	}
    };
    var s1 = Forms.findArrayItemsSchema(schema.properties.tableValue, schema);
    var s2 = Forms.findArrayItemsSchema(schema.properties.fooValue, schema);
    var bar = Forms.lookupDefinition("bar", schema);

    expect(Forms.resolveTypeNameAlias(null, schema)).toEqual(null);
    expect(Forms.resolveTypeNameAlias("something", schema)).toEqual("something");
    expect(Forms.resolveTypeNameAlias("foo", schema)).toEqual("object");

    expect(Forms.isArrayOrNestedObject(schema.properties.key, schema)).toEqual(false);
    expect(Forms.isArrayOrNestedObject(schema.properties.value, schema)).toEqual(false);
    expect(Forms.isArrayOrNestedObject(schema.properties.tableValue, schema)).toEqual(true);
    expect(Forms.isArrayOrNestedObject(schema.properties.fooValue, schema)).toEqual(true);

    expect(s1).toEqual(schema.properties.tableValue.items);
    expect(s2).toEqual(schema.definitions.foo);

    expect(s1.properties.key.type).toEqual("string");
    expect(s2.properties.name.type).toEqual("string");

    expect(bar.properties.cheese.type).toEqual("number");
    expect(bar.properties.name.type).toEqual("string");
    expect(bar.properties.value.type).toEqual("string");
  });

  it("camel model has inheritence", function() {
    var toSchema = Forms.lookupDefinition("to", _apacheCamelModel);

    expect(toSchema.properties.id.type).toEqual("string");
  });

  it("properties lookup in json schema", function() {
    var propertiesSchema = Forms.findArrayItemsSchema(_jsonSchema.properties.properties, _jsonSchema);

    console.log("Properties schema is " + JSON.stringify(propertiesSchema));
    // we should have some properties
    //expect(propertiesSchema.properties).toEqual("string");

  });

});