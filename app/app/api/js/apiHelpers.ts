/**
 * @module API
 */
module API {

  export var log:Logging.Logger = Logger.get("API");

  export var wadlNamespace = "http://schemas.xmlsoap.org/wsdl/";

  /**
   * Loads the XML for the given url if its defined or ignore if not valid
   * @method loadXml
   * @for API
   * @static
   * @param {String} url
   * @param {Function} onXml
   *
   */
  export function loadXml(url, onXml) {
    if (url) {
      log.info("Loading XML: " + url);

      var ajaxParams = {
        type: "GET",
        url: url,
        beforeSend: (xhr) => {
            xhr.setRequestHeader('Authorization', null);
        },

        dataType: "xml",
        contextType: "text/xml",
        success: onXml,
        error: (jqXHR, textStatus, errorThrow) => {
          log.error("Failed to query XML for: " + url + " status:" + textStatus + " error: " + errorThrow);
        }
      };
      $.ajax(ajaxParams);
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

  export function initScope($scope, $location, jolokia) {
    var search = $location.search();
    $scope.container = search["container"];
    $scope.objectName = search["objectName"];

    $scope.showHide = (resource) => {
      if (resource) {
        resource.hide = resource.hide ? false : true;
      }
    };

    $scope.showOperations = (resource) => {
      showHideOperations(resource, false);
    };

    $scope.expandOperations = (resource) => {
      showHideOperations(resource, true);
    };

    function showHideOperations(resource, flag) {
      if (resource) {
        resource.hide = false;
        angular.forEach(resource.resource, (childResource) => {
          showHideOperations(childResource, flag);
        });
        angular.forEach(resource.method || resource.operations, (method) => {
          method.expanded = flag;
        });
      }
    }

    $scope.autoFormat = (codeMirror) => {
      if (!codeMirror) {
        // lets try find the codeMirror in a child scope as a hack :)
        codeMirror = findChildScopeValue($scope, "codeMirror");
      }
      if (codeMirror) {
        setTimeout(() => {
          CodeEditor.autoFormatEditor(codeMirror);
        }, 50);
      }
    };


    /**
     * Note using this method is usually a dirty hack ;)
     */
    function findChildScopeValue(scope, name) {
      var answer = scope[name];
      var childScope = scope.$$childHead;
      while (childScope && !answer) {
        answer = findChildScopeValue(childScope, name);
        childScope = childScope.$$nextSibling;
      }
      return answer;
    }

    if ($scope.container && $scope.objectName) {
      Fabric.containerJolokia(jolokia, $scope.container, (remoteJolokia) => {
        $scope.remoteJolokia = remoteJolokia;
        if (remoteJolokia) {
          API.loadJsonSchema(remoteJolokia, $scope.objectName, (jsonSchema) => {
            //log.info("Got JSON Schema: " + JSON.stringify(jsonSchema, null, "  "));
            $scope.jsonSchema = jsonSchema;
            Core.$apply($scope);
          })
        } else {
          log.info("No Remote Jolokia!");
        }
      });
    } else {
      log.info("No container or objectName");
    }
    log.info("container: " + $scope.container + " objectName: " + $scope.objectName + " url: " + $scope.url);
  }

  /**
   * Loads the JSON schema from a given CXF endpoint mbean
   * @method loadJsonSchema
   * @for API
   * @static
   * @paran {*} jolokia
   * @param {String} mbean
   * @param {Function} onJsonSchemaFn
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
   * @method onWadlXmlLoaded
   * @for API
   * @static
   * @param {any} response
   * @return {any}
   */
  export function onWadlXmlLoaded(response) {
    var root = response.documentElement;
    var output = {};
    return API.convertWadlToJson(root, output);
  }


  /**
   * Converts the given XML element from WADL to JSON
   * @method convertWadlToJson
   * @for API
   * @static
   * @param {any} element
   * @param {any} obj
   * @return {any}
   */
  export function convertWadlToJson(element, obj = {}) {
    return API.convertXmlToJson(element, obj, wadlXmlToJavaConfig);
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
   * @method convertXmlToJson
   * @for API
   * @static
   * @param {any} element
   * @param {any} obj
   * @param {any} config
   * @return {any}
   */
  export function convertXmlToJson(element, obj, config) {

    var elementProperyFn = config.elementToPropertyName || nodeName;
    var attributeProperyFn = config.attributeToPropertyName || nodeName;

    angular.forEach(element.childNodes, (child) => {
      if (child.nodeType === 1) {
        var propertyName = elementProperyFn(element, child);
        if (propertyName) {
          // TODO should we assume everything is a list and then flatten later?
          var array = obj[propertyName] || [];
          if (!angular.isArray(array)) {
            array = [array];
          }
          var value = {};
          convertXmlToJson(child, value, config);
          array.push(value);
          obj[propertyName] = array;
        }
      }
    });
    angular.forEach(element.attributes, (attr) => {
      var propertyName = attributeProperyFn(element, attr);
      if (propertyName) {
        var value = attr.nodeValue;
        obj[propertyName] = value;
      }
    });
    return obj;
  }



  /**
   * Concatenate all the non-null arrays into a single array
   * @param arrays an array of arrays
   * @return the single flatten arrays with any null/undefined values ignored
   */
  export function concatArrays(arrays: any[]) {
    var answer: any = [];
    angular.forEach(arrays, (array) => {
      if (array) {
        if (angular.isArray(array)) {
          answer = answer.concat(array);
        } else {
          answer.push(array);
        }
      }
    });
    return answer;
  }

}
