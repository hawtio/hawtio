module Quartz {

  export function QuartzController($scope, $location:ng.ILocationService, workspace:Workspace, jolokia) {

    var log:Logging.Logger = Logger.get("Quartz");

    var stateTemplate = '<div class="ngCellText pagination-centered" title="{{row.getProperty(col.field)}}"><i class="{{row.getProperty(col.field) | quartzIconClass}}"></i></div>';

    $scope.schedulers = [];

    $scope.gridOptions = {
      selectedItems: [],
      data: 'schedulers',
      displayFooter: false,
      showFilter: false,
      filterOptions: {
        filterText: ''
      },
      showColumnMenu: true,
      showSelectionCheckbox: false,
      columnDefs: [
        {
          field: 'Started',
          displayName: 'State',
          cellTemplate: stateTemplate,
          width: 56,
          minWidth: 56,
          maxWidth: 56,
          resizable: false
        },
        {
          field: 'SchedulerName',
          displayName: 'Name'
        },
        {
          field: 'Version',
          displayName: 'Version'
        },
      ]
    };

    function selectQuartzScheduler(mbean) {
      function onAttributes(response) {
        var obj = response.value;
        if (obj) {
          $scope.schedulers.push(obj);
        }
        Core.$apply($scope);
      }
      jolokia.request({type: "read", mbean: mbean}, onSuccess(onAttributes));
    }

    function reloadTree() {
      log.info("Reloading Quartz Tree")
      var mbean = Quartz.getQuartzMBean(workspace);
      var domain = "quartz";
      var rootFolder = new Folder("Quartz Schedulers");
      rootFolder.addClass = "quartzSchedulers";
      rootFolder.typeName = "quartzSchedulers";
      rootFolder.domain = domain;
      rootFolder.key = "";
      var children = [rootFolder];

      if (mbean) {
        function render(results) {

          log.info("Render Tree")

          angular.forEach(results, function (value, key) {
            var name = jolokia.request({type: "read", mbean: value,
              attribute: ["SchedulerName"]});

            var txt = name.value["SchedulerName"];
            var scheduler = new Folder(txt)
            scheduler.addClass = "quartzScheduler";
            scheduler.typeName = "quartzScheduler";
            scheduler.domain = domain;
            scheduler.key = value;
            rootFolder.children.push(scheduler);
          });

          Core.$apply($scope);

          var treeElement = $("#quartztree");
          Jmx.enableTree($scope, $location, workspace, treeElement, children, true, (selectedNode) => {
            var data = selectedNode.data;
            selectionChanged(data);
            Core.$apply($scope);
          });
          // lets do this asynchronously to avoid Error: $digest already in progress
          setTimeout(updateSelectionFromURL, 50);
        }

        jolokia.search("quartz:type=QuartzScheduler,*", onSuccess(render));
      }
    }

    function updateSelectionFromURL() {
      Jmx.updateTreeSelectionFromURL($location, $("#quartztree"), true);
    }

    function selectionChanged(data) {
      var selectionKey = data ? data.key : null;
      log.info("Selection is now: " + selectionKey);
      if (selectionKey) {
        selectQuartzScheduler(selectionKey)
      } else {
        $scope.schedulers = [];
      }
    }

    // force tree to be loaded on startup
    reloadTree();

  }
}