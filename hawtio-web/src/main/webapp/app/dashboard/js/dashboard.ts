module Dashboard {

  export function DashboardController($scope, $location, $routeParams, $injector, $route,
                                      $templateCache,
                                      workspace:Workspace,
                                      dashboardRepository: DashboardRepository,
                                      $compile) {
    $scope.route = $route;
    $scope.injector = $injector;

    var gridSize = 150;
    var gridMargin = 6;
    var gridHeight;

    $scope.gridX = gridSize;
    $scope.gridY = gridSize;

    $scope.widgetMap = {};

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
      gridster.resize_widget(w, widget.size_x, widget.size_y);
      gridster.set_dom_grid_height();

      setTimeout(function() {
        var template = $templateCache.get("widgetTemplate");
        var div = $('<div></div>');
        div.html(template);
        w.html($compile(div.contents())(scope));

        makeResizable();
        $scope.$apply();

        setTimeout(function() {
          savefunc(widget);
        }, 50);
      }, 50);
    }

    $scope.onWidgetRenamed = function(widget) {
      updateDashboardRepository("Renamed widget to " + widget.title);
    };

    function updateWidgets() {
      $scope.id = $routeParams["dashboardId"];
      $scope.idx = $routeParams["dashboardIndex"];
      if ($scope.id) {
        dashboardRepository.getDashboard($scope.id, onDashboardLoad);
      } else {
        dashboardRepository.getDashboards((dashboards) => {
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
          //$scope.$apply();
        });
      }
    }

    function onDashboardLoad(dashboard) {
      $scope.dashboard = dashboard;
      var widgetElement = $("#widgets");

      var gridster = widgetElement.gridster({
        widget_margins: [gridMargin, gridMargin],
        widget_base_dimensions: [$scope.gridX, $scope.gridY],
        extra_rows: 10,
        extra_cols: 6,
        draggable: {
          stop: (event, ui) => {
            updateLayoutConfiguration();
          }
        }
      }).data('gridster');


      var template = $templateCache.get("widgetTemplate");
      var widgets = ((dashboard) ? dashboard.widgets : null) || [];
      angular.forEach(widgets, (widget) => {
        var childScope = $scope.$new(false);
        childScope.widget = widget;
        var path = widget.path;
        var search = Dashboard.decodeURIComponentProperties(widget.search);
        var hash = widget.hash; // TODO decode object?
        var location = new RectangleLocation($location, path, search, hash);

        var childWorkspace = workspace.createChildWorkspace(location);
        //var childWorkspace = workspace;
        childWorkspace.$location = location;

        // now we need to update the selection from the location search()
        var key = location.search()['nid'];
        if (key && workspace.tree) {
          // lets find the node for this key...
          childWorkspace.selection = workspace.keyToNodeMap[key];
          if (!childWorkspace.selection) {
            var decodedKey = decodeURIComponent(key);
            childWorkspace.selection = workspace.keyToNodeMap[decodedKey];
          }
        }

        var $$scopeInjections = {
          workspace: childWorkspace,
          location: location,
          $location: location,
          $routeParams: {x: "123", y: "Cheese!"}
        };
        childScope.$$scopeInjections = $$scopeInjections;

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

      if (!$scope.$$phase) {
        $scope.$apply();
      }

      function updateLayoutConfiguration() {
        var gridster = getGridster();
        if (gridster) {
          var data = gridster.serialize();
          console.log("got data: " + JSON.stringify(data));

          var widgets = $scope.dashboard.widgets || [];
          // lets assume the data is in the order of the widgets...
          angular.forEach(widgets, (widget, idx) => {
            var value = data[idx];
            if (value && widget) {
              // lets copy the values across
              angular.forEach(value, (attr, key) => widget[key] = attr);
            }
          });

          updateDashboardRepository("Changing dashboard layout");
        }
      }
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
      var elmObj = $(elmObj);
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
        updateDashboardRepository("Changed size of widget: " + widget.id);
      });

      /*
      var g = getGridster();

      g.resize_widget(elmObj, grid_w, grid_h);
      g.set_dom_grid_height();
      */
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
      return $("#widgets").gridster().data('gridster');
    }
  }
}
