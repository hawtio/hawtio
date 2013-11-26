/**
 * @module Jmx
 */
module Jmx {

    export function AttributesOldController($scope, $routeParams, workspace:Workspace, $rootScope) {
      $scope.routeParams = $routeParams;
      $scope.workspace = workspace;

      $scope.isTable = (value) => {
        return value instanceof Table;
      };

      $scope.getAttributes = (value) => {
        if (angular.isArray(value) && angular.isObject(value[0])) return value;
        if (angular.isObject(value) && !angular.isArray(value)) return [value];
        return null;
      };

      $scope.rowValues = (row, col) => {
        return [row[col]];
      };

      var asQuery = (mbeanName) => {
        return { type: "READ", mbean: mbeanName, ignoreErrors: true};
      };

      var tidyAttributes = (attributes) => {
        var objectName = attributes['ObjectName'];
        if (objectName) {
          var name = objectName['objectName'];
          if (name) {
            attributes['ObjectName'] = name;
          }
        }
      };

      $scope.$watch('workspace.selection', function () {
        if (workspace.moveIfViewInvalid()) return;

        var node = $scope.workspace.selection;
        closeHandle($scope, $scope.workspace.jolokia);
        var mbean = null;
        if (node) {
          mbean = node.objectName;
        }
        var query = null;
        var jolokia = workspace.jolokia;
        var updateValues:any = function (response) {
          var attributes = response.value;
          if (attributes) {
            tidyAttributes(attributes);
            $scope.attributes = attributes;
            Core.$apply($scope);
          } else {
            console.log("Failed to get a response! " + response);
          }
        };
        if (mbean) {
          query = asQuery(mbean)
        } else if (node) {
          // lets query each child's details
          var children = node.children;
          if (children) {
            var childNodes = children.map((child) => child.objectName);
            var mbeans = childNodes.filter((mbean) => mbean);
            //console.log("Found mbeans: " + mbeans + " child nodes " + childNodes.length + " child mbeans " + mbeans.length);

            // lets filter out folders with different kind of typed children
            var typeNames = Jmx.getUniqueTypeNames(children);
            if (mbeans && typeNames.length <= 1) {
              query = mbeans.map((mbean) => asQuery(mbean));
              if (query.length === 1) {
                query = query[0];
              } else if (query.length === 0) {
                query = null;
              } else {
                // now lets create an update function for each row which are all invoked async
                $scope.attributes = new Table();
                updateValues = function (response) {
                  var attributes = response.value;
                  if (attributes) {
                    tidyAttributes(attributes);
                    var mbean = attributes['ObjectName'];
                    var request = response.request;
                    if (!mbean && request) {
                      mbean = request['mbean'];
                    }
                    if (mbean) {
                      var table = $scope.attributes;
                      if (!($scope.isTable(table))) {
                        table = new Table();
                        $scope.attributes = table;
                      }
                      table.setRow(mbean, attributes);
                      Core.$apply($scope);
                    } else {
                      console.log("no ObjectName in attributes " + Object.keys(attributes));
                    }
                  } else {
                    console.log("Failed to get a response! " + JSON.stringify(response));
                  }
                };
              }
            }
          }
        }
        if (query) {
          // lets get the values immediately
          jolokia.request(query, onSuccess(updateValues));
          var callback = onSuccess(updateValues,
                  {
                    error: (response) => {
                      updateValues(response);
                    }
                  });

          // listen for updates
          if (angular.isArray(query)) {
            if (query.length >= 1) {
              var args = [callback].concat(query);
              var fn = jolokia.register;
              scopeStoreJolokiaHandle($scope, jolokia, fn.apply(jolokia, args));
            }
          } else {
            scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(callback, query));
          }
        }
      });
    }
}

class Table {
  public columns = {};
  public rows = {};

  public values(row, columns) {
    var answer = [];
    if (columns) {
      for (name in columns) {
        //console.log("Looking up: " + name + " on row ");
        answer.push(row[name]);
      }
    }
    return answer;
  }

  public setRow(key, data) {
    this.rows[key] = data;
    Object.keys(data).forEach((key) => {
      // could store type info...
      var columns = this.columns;
      if (!columns[key]) {
        columns[key] = {name: key};
      }
    });
  }
}
