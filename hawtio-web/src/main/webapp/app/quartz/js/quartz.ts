module Quartz {

  export function QuartzController($scope, $location:ng.ILocationService, workspace:Workspace, jolokia) {

    var log:Logging.Logger = Logger.get("Quartz");

    var stateTemplate = '<div class="ngCellText pagination-centered" title="{{row.getProperty(col.field)}}"><i class="{{row.getProperty(col.field) | quartzIconClass}}"></i></div>';

    $scope.selectedSchedulerIcon = null;
    $scope.selectedScheduler = null;
    $scope.selectedSchedulerMBean = null;
    $scope.triggers = [];

    $scope.gridOptions = {
      selectedItems: [],
      data: 'triggers',
      displayFooter: false,
      showFilter: false,
      filterOptions: {
        filterText: ''
      },
      showColumnMenu: false,
      showSelectionCheckbox: false,
      multiSelect: false,
      columnDefs: [
        {
          field: 'state',
          displayName: 'State',
          cellTemplate: stateTemplate,
          width: 56,
          minWidth: 56,
          maxWidth: 56,
          resizable: false
        },
        {
          field: 'group',
          displayName: 'Group'
        },
        {
          field: 'name',
          displayName: 'Name'
        },
        {
          field: 'previousFireTime',
          displayName: 'Previous Fire Timestamp'
        },
        {
          field: 'nextFireTime',
          displayName: 'Next Fire Timestamp'
        }
      ]
    };

    // TODO: only update data, instead of clear and refresh, as that causes table to de-select
    $scope.renderTrigger = (response) => {
      $scope.triggers = [];
      log.info("Selected scheduler mbean " + $scope.selectedScheduler)
      var obj = response.value;
      if (obj) {
        $scope.selectedScheduler = obj;
        $scope.selectedSchedulerIcon = Quartz.iconClass(obj.Started);

        // grab state for all triggers
        obj.AllTriggers.forEach(t => {
          var state = jolokia.request({type: "exec", mbean: $scope.selectedSchedulerMBean,
            operation: "getTriggerState", arguments: [t.name, t.group]});
          if (state) {
            t.state = state.value;
          } else {
            t.state = "unknown";
          }
          $scope.triggers.push(t);
        })
      }
      Core.$apply($scope);
    }

    $scope.pause = () => {
      if ($scope.gridOptions.selectedItems.length === 1) {
        var groupName = $scope.gridOptions.selectedItems[0].group;
        var triggerName = $scope.gridOptions.selectedItems[0].name;

        jolokia.request({type: "exec", mbean: $scope.selectedSchedulerMBean,
          operation: "pauseTrigger", arguments: [triggerName, groupName]});

        notification("success", "Paused trigger " + groupName + "/" + triggerName);
      }
    }

    $scope.resume = () => {
      if ($scope.gridOptions.selectedItems.length === 1) {
        var groupName = $scope.gridOptions.selectedItems[0].group;
        var triggerName = $scope.gridOptions.selectedItems[0].name;

        jolokia.request({type: "exec", mbean: $scope.selectedSchedulerMBean,
          operation: "resumeTrigger", arguments: [triggerName, groupName]});

        notification("success", "Resumed trigger " + groupName + "/" + triggerName);
      }
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
        // if we selected a scheduler then register a callback to get its trigger data updated in-real-time
        // as the trigger has prev/next fire times that changes
        $scope.selectedSchedulerMBean = selectionKey;

        var request = [{type: "read", mbean: $scope.selectedSchedulerMBean}];
        Core.register(jolokia, $scope, request, onSuccess($scope.renderTrigger));
      } else {
        Core.unregister(jolokia, $scope);
        $scope.selectedSchedulerMBean = null;
        $scope.selectedScheduler = null;
        $scope.triggers = [];
      }
    }

    // force tree to be loaded on startup
    reloadTree();
  }

}