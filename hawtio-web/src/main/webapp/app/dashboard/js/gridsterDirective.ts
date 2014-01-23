/**
 * @module Dashboard
 */
module Dashboard {

  export class GridsterDirective {
    public restrict = 'A';
    public replace = true;

    public controller = ($scope, $element, $attrs, $location, $routeParams, $injector, $route,
                         $templateCache,
                         workspace:Workspace,
                         dashboardRepository: DashboardRepository,
                         $compile) => {

      $scope.route = $route;
      $scope.injector = $injector;

      var gridSize = 150;
      var gridMargin = 6;
      var gridHeight;

      $scope.gridX = gridSize;
      $scope.gridY = gridSize;

      $scope.widgetMap = {};

      $scope.$on('$destroy', () => {
        angular.forEach($scope.widgetMap, (value, key) => {
          if ('scope' in value) {
            var scope = value['scope'];
            scope.$destroy();
          }
        });
      });

      updateWidgets();

      $scope.removeWidget = function(widget) {
        var gridster = getGridster();
        var widgetElem = null;

        // lets destroy the widgets's scope
        var widgetData = $scope.widgetMap[widget.id];
        if (widgetData) {
          delete $scope.widgetMap[widget.id];
          var scope = widgetData.scope;
          widgetElem = widgetData.widget;
          if (scope) {
            scope.$destroy();
          }
        }
        if (!widgetElem) {
          // lets get the li parent element of the template
          widgetElem = $("div").find("[data-widgetId='" + widget.id + "']").parent();
        }
        if (gridster && widgetElem) {
          gridster.remove_widget(widgetElem);
        }
        // no need to remove it...
        //widgetElem.remove();

        // lets trash the JSON metadata
        if ($scope.dashboard) {
          var widgets = $scope.dashboard.widgets;
          if (widgets) {
            widgets.remove(widget);
          }
        }

        updateDashboardRepository("Removed widget " + widget.title);
      };

      function changeWidgetSize(widget, sizefunc, savefunc) {
        var gridster = getGridster();
        var entry = $scope.widgetMap[widget.id];
        var w = entry.widget;
        var scope = entry.scope;
        sizefunc(entry);
        gridster.resize_widget(w, entry.size_x, entry.size_y);
        gridster.set_dom_grid_height();

        setTimeout(function() {
          var template = $templateCache.get("widgetTemplate");
          var div = $('<div></div>');
          div.html(template);
          w.html($compile(div.contents())(scope));

          makeResizable();
          Core.$apply($scope);

          setTimeout(function() {
            savefunc(widget);
          }, 50);
        }, 30);
      }

      $scope.onWidgetRenamed = function(widget) {
        updateDashboardRepository("Renamed widget to " + widget.title);
      };

      function updateWidgets() {
        $scope.id = $routeParams["dashboardId"];
        $scope.idx = $routeParams["dashboardIndex"];
        if ($scope.id) {
          $scope.$emit('loadDashboards');
          dashboardRepository.getDashboard($scope.id, onDashboardLoad);
        } else {
          dashboardRepository.getDashboards((dashboards) => {
            $scope.$emit('dashboardsUpdated', dashboards);

            var idx = $scope.idx ? parseInt($scope.idx) : 0;
            var id = null;
            if (dashboards.length > 0) {
              var dashboard = dashboards.length > idx ? dashboards[idx] : dashboard[0];
              id = dashboard.id;
            }
            if (id) {
              $location.path("/dashboard/id/" + id);
            } else {
              $location.path("/dashboard/edit?tab=dashboard");
            }
            Core.$apply($scope);
          });
        }
      }

      function onDashboardLoad(dashboard) {
        $scope.dashboard = dashboard;
        var widgets = ((dashboard) ? dashboard.widgets : null) || [];

        var minHeight = 10;
        var minWidth = 6;

        angular.forEach(widgets, (widget) => {
          if (angular.isDefined(widget.row) && minHeight < widget.row) {
            minHeight = widget.row + 1;
          }
          if (angular.isDefined(widget.size_x
              && angular.isDefined(widget.col))) {
            var rightEdge = widget.col + widget.size_x;
            if (rightEdge > minWidth) {
              minWidth = rightEdge + 1;
            }
          }

        });

        var gridster = $element.gridster({
          widget_margins: [gridMargin, gridMargin],
          widget_base_dimensions: [$scope.gridX, $scope.gridY],
          extra_rows: minHeight,
          extra_cols: minWidth,
          max_size_x: minWidth,
          max_size_y: minHeight,
          draggable: {
            stop: (event, ui) => {
              if (serializeDashboard()) {
                updateDashboardRepository("Changing dashboard layout");
              }
            }
          }
        }).data('gridster');

        var template = $templateCache.get("widgetTemplate");
        angular.forEach(widgets, (widget) => {
          var childScope = $scope.$new(false);
          childScope.widget = widget;
          var path = widget.path;
          var search = null;
          if (widget.search) {
            search = Dashboard.decodeURIComponentProperties(widget.search);
          }
          var hash = widget.hash; // TODO decode object?
          var location = new RectangleLocation($location, path, search, hash);
          var routeParams = null;
          if (widget.routeParams) {
            routeParams = angular.fromJson(widget.routeParams);
          }

          var childWorkspace = workspace.createChildWorkspace(location);
          //var childWorkspace = workspace;
          childWorkspace.$location = location;

          // now we need to update the selection from the location search()
          if (search) {
            var key = location.search()['nid'];
            if (key && workspace.tree) {
              // lets find the node for this key...
              childWorkspace.selection = workspace.keyToNodeMap[key];
              if (!childWorkspace.selection) {
                var decodedKey = decodeURIComponent(key);
                childWorkspace.selection = workspace.keyToNodeMap[decodedKey];
              }
            }
          }

          var $$scopeInjections = {
            workspace: childWorkspace,
            location: location,
            $location: location,
            $routeParams: routeParams
          };
          childScope.$$scopeInjections = $$scopeInjections;
          childScope.inDashboard = true;

          if (!widget.size_x || widget.size_x < 1) {
            widget.size_x = 1;
          }
          if (!widget.size_y || widget.size_y < 1) {
            widget.size_y = 1;
          }
          var div = $('<div></div>');
          div.html(template);

          var outerDiv = $('<li class="grid-block" style="display: list-item; position: absolute"></li>');
          outerDiv.html($compile(div.contents())(childScope));
          var w = gridster.add_widget(outerDiv, widget.size_x, widget.size_y, widget.col, widget.row);

          $scope.widgetMap[widget.id] = {
            widget: w,
            scope: childScope
          };


        });

        makeResizable();
        getGridster().enable();

        Core.$apply($scope);
      }

      function serializeDashboard() {
        var gridster = getGridster();
        if (gridster) {
          var data = gridster.serialize();
          //console.log("got data: " + JSON.stringify(data));

          var widgets = $scope.dashboard.widgets || [];
          // console.log("Widgets: ", widgets);

          // lets assume the data is in the order of the widgets...
          angular.forEach(widgets, (widget, idx) => {
            var value = data[idx];
            if (value && widget) {
              // lets copy the values across
              angular.forEach(value, (attr, key) => widget[key] = attr);
            }
          });
          return true;
        }
        return false;
      }

      function makeResizable() {

        var blocks:any = $('.grid-block');
        blocks.resizable('destroy');

        blocks.resizable({
          grid: [gridSize + (gridMargin * 2), gridSize + (gridMargin * 2)],
          animate: false,
          minWidth: gridSize,
          minHeight: gridSize,
          autoHide: false,
          start: function(event, ui) {
            gridHeight = getGridster().$el.height();
          },
          resize: function(event, ui) {
            //set new grid height along the dragging period
            var g = getGridster();
            var delta = gridSize + gridMargin * 2;
            if (event.offsetY > g.$el.height())
            {
              var extra = Math.floor((event.offsetY - gridHeight) / delta + 1);
              var newHeight = gridHeight + extra * delta;
              g.$el.css('height', newHeight);
            }
          },
          stop: function(event, ui) {
            var resized = $(this);
            setTimeout(function() {
              resizeBlock(resized);
            }, 300);
          }
        });

        $('.ui-resizable-handle').hover(function() {
          getGridster().disable();
        }, function() {
          getGridster().enable();
        });
      }


      function resizeBlock(elmObj) {
        //var elmObj = $(elmObj);
        var area = elmObj.find('.widget-area');
        var w = elmObj.width() - gridSize;
        var h = elmObj.height() - gridSize;

        for (var grid_w = 1; w > 0; w -= (gridSize + (gridMargin * 2))) {
          grid_w++;
        }

        for (var grid_h = 1; h > 0; h -= (gridSize + (gridMargin * 2))) {
          grid_h++;
        }

        var widget = {
          id: area.attr('data-widgetId')
        };

        changeWidgetSize(widget, function(widget) {
          widget.size_x = grid_w;
          widget.size_y = grid_h;
        }, function(widget) {
          if (serializeDashboard()) {
            updateDashboardRepository("Changed size of widget: " + widget.id);
          }
        });

      }

      function updateDashboardRepository(message: string) {
        if ($scope.dashboard) {
          var commitMessage = message;
          if ($scope.dashboard && $scope.dashboard.title) {
            commitMessage += " on dashboard " + $scope.dashboard.title;
          }
          dashboardRepository.putDashboards([$scope.dashboard], commitMessage, Dashboard.onOperationComplete);
        }
      }

      function getGridster() {
        return $element.gridster().data('gridster');
      }

    };

  }

}
