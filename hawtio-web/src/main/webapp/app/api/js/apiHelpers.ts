module API {

  var log:Logging.Logger = Logger.get("API");

  /**
   * Loads the XML for the given url if its defined or ignore if not valid
   */
  export function loadXml(url, onXml) {
    if (url) {
      log.info("Loading XML: " + url);

      $.ajax({
        type: "GET",
        url: url,
        dataType: "xml",
        success: onXml
      });
    }
  }


  var wadlXmlToJavaConfig = {
    /*
     elementToPropertyName: (owner, element) => {
     },
     attributeToPropertyName: (owner, attribute) => {
     }
     */
  };

  export function parseJson(json) {
    var answer = null;
    try {
      //console.log("got JSON: " + responseJson);
      answer = JSON.parse(json);
    } catch (e) {
      log.info("Failed to parse JSON " + e);
      log.info("JSON: " + json);
    }
    return answer;
  }

  /**
   * Loads the JSON schema from a given CXF endpoint mbean
   */
  export function loadJsonSchema(jolokia, mbean, onJsonSchemaFn) {
    function onResults(response) {
      var schema = {};
      if (response) {
        var json = response;
        if (json) {
          schema = parseJson(json);
        }
      }
      onJsonSchemaFn(schema);
    }
    if (mbean) {
      return jolokia.execute(mbean, "getJSONSchema", onSuccess(onResults));
    } else {
      var schema = {};
      onJsonSchemaFn(schema);
      return schema;
    }
  }

  /**
   * When a WADL XML document is loaded, lets convert it to JSON and return it
   */
  export function onWadlXmlLoaded(response) {
    var root = response.documentElement;
    var output = {};
    return API.convertWadlToJson(root, output);
  }


  /**
   * Converts the given XML element from WADL to JSON
   */
  export function convertWadlToJson(element, object = {}) {
    return API.convertXmlToJson(element, object, wadlXmlToJavaConfig);
  }

  export function convertWadlJsonToSwagger(object) {
    // now lets convert to swagger style json
    var apis = [];
    var basePath:string = null;
    var resourcePath:string = null;

    var resources = Core.pathGet(object, ["resources", 0]);
    if (resources) {
      basePath = resources.base;
      angular.forEach(resources.resource, (resource) => {
        var path = resource.path;
        var operations = [];
        angular.forEach(resource.method, (method) => {
          var name = method.name;
          var responseMessages = [];
          /*
           {
           "code": 404,
           "message": "There are no businesses"
           }
           */

          var parameters = [];
          /*
           {
           "name": "query",
           "description": "a text query to search across facilities",
           "required": false,
           "allowMultiple": false,
           "dataType": "string",
           "paramType": "query"
           }

           */

          operations.push({
            "method": method.name,
            "summary": method.summary,
            "notes": method.notes,
            "nickname": method.nickname,
            "type": method.type,
            "parameters": parameters,
            "produces": [
              "application/json"
            ],
            "responseMessages": responseMessages
          });
        });

        apis.push({
          path: path,
          operations: operations
        });
      });
    }
    return {
      "apiVersion": "1.0",
      "swaggerVersion": "1.2",
      "basePath": basePath,
      "resourcePath": resourcePath,
      "produces": [
        "application/json"
      ],
      apis: apis
    };
  }

  function nodeName(owner, node) {
    return node ? node.localName : null;
  }

  /**
   * Converts the given child elements or attributes into properties on the object
   * to convert the XML into JSON using the given config to customise which properties should
   * be considered singular
   */
  export function convertXmlToJson(element, object, config) {

    var elementProperyFn = config.elementToPropertyName || nodeName;
    var attributeProperyFn = config.attributeToPropertyName || nodeName;

    angular.forEach(element.children, (child) => {
      if (child.nodeType === 1) {
        var propertyName = elementProperyFn(element, child);
        if (propertyName) {
          // TODO should we assume everything is a list and then flatten later?
          var array = object[propertyName] || [];
          if (!angular.isArray(array)) {
            array = [array];
          }
          var value = {};
          convertXmlToJson(child, value, config);
          array.push(value);
          object[propertyName] = array;
        }
      }
    });
    angular.forEach(element.attributes, (attr) => {
      var propertyName = attributeProperyFn(element, attr);
      if (propertyName) {
        var value = attr.nodeValue;
        object[propertyName] = value;
      }
    });
    return object;
  };

}