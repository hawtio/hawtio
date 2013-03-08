module DataTable {
  var pluginName = 'datatable';
  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).
          directive('hawtioDatatable', function (workspace, $timeout, $filter, $compile) {
            // return the directive link function. (compile function not needed)
            return function (scope, element, attrs) {
              var gridOptions = null;
              var data = null;
              var widget = null;
              var timeoutId = null;
              var initialised = false;
              var childScopes = [];

              // used to update the UI
              function updateGrid() {
                // console.log("updating the grid!!");
                Core.$applyNowOrLater(scope);
              }

              function convertToDataTableColumn(columnDef) {
                var data = {
                  mData: columnDef.field
                };
                var name = columnDef.displayName;
                if (name) {
                  data["sTitle"] = name;
                }
                var width = columnDef.width;
                if (angular.isNumber(width)) {
                  data["sWidth"] = "" + width + "px";
                } else if (angular.isString(width)) {
                  data["sWidth"] = width;
                }
                var template = columnDef.cellTemplate;
                if (template) {
                  data["fnCreatedCell"] = function (nTd, sData, oData, iRow, iCol) {
                    var childScope = childScopes[iRow];
                    if (!childScope) {
                      childScope = scope.$new(false);
                      childScopes[iRow] = childScope;
                    }
                    var entity = oData;
                    childScope["row"] = {
                      entity: entity,

                      getProperty: (name) => {
                        return entity[name];
                      }
                    };

                    var elem = $(nTd);
                    elem.html(template);
                    $compile(elem.contents())(childScope);
                  };
                } else {
                  var cellFilter = columnDef.cellFilter;
                  if (cellFilter) {
                    var filter = $filter(cellFilter);
                    if (filter) {
                      data["mRender"] = function (data, type, full) {
                        return filter(data);
                      }
                    }
                  }
                }
                return data;
              }

              function destroyChildScopes() {
                angular.forEach(childScopes, (childScope) => {
                  childScope.$destroy();
                });
                childScopes = [];
              }

              function onTableDataChange(value) {
                gridOptions = value;
                if (gridOptions) {
                  // TODO deal with updating the gridOptions on the fly?
                  if (widget === null) {
                    var widgetOptions = {
                      disableAddColumns: true,
                      rowDetailTemplateId: 'activemqMessageTemplate',
                      ignoreColumns: gridOptions.ignoreColumns,
                      flattenColumns: gridOptions.flattenColumns
                    };

                    // lets find a child table element
                    // or lets add one if there's not one already
                    var rootElement = $(element);
                    var tableElement = rootElement.children("table");
                    if (!tableElement.length) {
                      $("<table class='table'></table>").appendTo(rootElement);
                      tableElement = rootElement.children("table");
                    }
                    var trElement = Core.getOrCreateElements(tableElement, ["thead", "tr"]);

                    destroyChildScopes();

                    // convert the column configurations
                    var columns = [];
                    var columnCounter = 1;
                    columns.push(
                            {
                              "mDataProp": null,
                              "sClass": "control center",
                              "sWidth": "30px",
                              "sDefaultContent": '<i class="icon-plus"></i>'
                            });

                    var th = trElement.children("th");
                    if (th.length < columnCounter++) {
                      $("<th></th>").appendTo(trElement);
                    }
                    angular.forEach(gridOptions.columnDefs, (columnDef) => {
                      // if there's not another <tr> then lets add one
                      th = trElement.children("th");
                      if (th.length < columnCounter++) {
                        var name = columnDef.displayName || "";
                        $("<th>" + name + "</th>").appendTo(trElement);
                      }
                      columns.push(convertToDataTableColumn(columnDef));
                    });
                    widget = new TableWidget(scope, workspace, columns, widgetOptions);
                    widget.tableElement = tableElement;

                    // if all the column definitions have an sWidth then lets turn off
                    // the auto-width calculations
                    if (columns.every(col => col.sWidth)) {
                      console.log("All columns have sWidth!");
                      widget.dataTableConfig.bAutoWidth = false;
                    }


                    var filterText = null;
                    var filterOptions = gridOptions.filterOptions;
                    if (filterOptions) {
                      filterText = filterOptions.filterText;
                    }
                    if (filterText) {
                      // disable the text filter box
                      widget.dataTableConfig.sDom = 'Rlrtip';

                      scope.$watch(filterText, function (value) {
                        var dataTable = widget.dataTable;
                        if (dataTable) {
                          dataTable.fnFilter(value);
                        }
                      });
                    }

                    // TODO....
                    // lets make sure there is enough th headers for the columns!
                  }
                  if (!data) {
                    // TODO deal with the data name changing one day?
                    data = gridOptions.data;
                    if (data) {
                      scope.$watch(data, function (value) {
                        if (initialised || (value && value.length)) {
                          initialised = true;
                          destroyChildScopes();
                          widget.populateTable(value);
                          updateLater();
                        }
                      });
                    }
                  }
                }
                updateGrid();
              }

              // watch the expression, and update the UI on change.
              scope.$watch(attrs.hawtioDatatable, onTableDataChange);

              // schedule update in one second
              function updateLater() {
                // save the timeoutId for canceling
                timeoutId = $timeout(function () {
                  updateGrid(); // update DOM
                }, 300);
              }

              // listen on DOM destroy (removal) event, and cancel the next UI update
              // to prevent updating ofter the DOM element was removed.
              element.bind('$destroy', function () {
                destroyChildScopes();
                $timeout.cancel(timeoutId);
              });

              updateLater(); // kick off the UI update process.
            }
          }
  );

  hawtioPluginLoader.addModule(pluginName);
}
