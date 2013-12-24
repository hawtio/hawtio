module Quartz {

  export function QuartzController($scope, $location:ng.ILocationService, workspace:Workspace, jolokia) {

    var log:Logging.Logger = Logger.get("Quartz");

    var stateTemplate = '<div class="ngCellText pagination-centered" title="{{row.getProperty(col.field)}}"><i class="{{row.getProperty(col.field) | quartzIconClass}}"></i></div>';
    var misfireTemplate = '<div class="ngCellText" title="{{row.getProperty(col.field)}}">{{row.getProperty(col.field) | quartzMisfire}}</div>';

    $scope.selectedSchedulerDetails = [];
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
      showColumnMenu: true,
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
          field: 'misfireInstruction',
          displayName: 'Misfire Instruction',
          cellTemplate: misfireTemplate
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

    $scope.renderTrigger = (response) => {
      $scope.selectedSchedulerDetails = [];

      log.debug("Selected scheduler mbean " + $scope.selectedScheduler)
      var obj = response.value;
      if (obj) {
        $scope.selectedScheduler = obj;
        $scope.selectedSchedulerIcon = Quartz.iconClass(obj.Started);

        // add extra details about the selected scheduler, and turn that into human readable details
        angular.forEach(obj, (value, key) => {
          if (includePropertyValue(key, value)) {
            $scope.selectedSchedulerDetails.push({
              field: humanizeValue(key),
              displayName: value
            });
          }
        });
        // .. which we then sort also
        $scope.selectedSchedulerDetails.sort((a, b) => {
          var ta = a.field.toString();
          var tb = b.field.toString();
          return ta.localeCompare(tb);
        });

        // grab state for all triggers which requires to call a JMX operation per trigger
        obj.AllTriggers.forEach(t => {
          var state = jolokia.request({type: "exec", mbean: $scope.selectedSchedulerMBean,
            operation: "getTriggerState", arguments: [t.name, t.group]});
          if (state) {
            t.state = state.value;
          } else {
            t.state = "unknown";
          }

          // update existing trigger, so the UI remembers it selection
          // and we don't have flicker if the table is very long
          var existing = $scope.triggers.filter(e => {
            return e.name === t.name && e.group === t.group;
          });
          if (existing && existing.length === 1) {
            for (var prop in t) {
              existing[0][prop] = t[prop];
            }
          } else {
            $scope.triggers.push(t);
          }
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
      Jmx.updateTreeSelectionFromURLAndAutoSelect($location, $("#quartztree"), (first) => {
        // use function to auto select first scheduler if there is only one scheduler
          var schedulers = first.getChildren();
          if (schedulers && schedulers.length === 1) {
            first = schedulers[0];
            return first;
          }
        }, true);
    }

    function selectionChanged(data) {
      var selectionKey = data ? data.key : null;
      log.debug("Selection is now: " + selectionKey);
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

    function includePropertyValue(key: string, value) {
      // skip these keys as we have hardcoded them to be shown already
      if ("SchedulerName" === key || "Version" === key || "Started" === key) {
        return false;
      }

      return !angular.isObject(value);
    }

    function humanizeValue(value:any):string {
      if (value) {
        var text = value.toString();
        try {
          text = text.underscore();
        } catch (e) {
          // ignore
        }
        try {
          text = text.humanize();
        } catch (e) {
          // ignore
        }
        return trimQuotes(text);
      }
      return value;
    }

    function safeNull(value:any):string {
      if (value) {
        return value;
      } else {
        return "";
      }
    }

    function trimQuotes(text:string) {
      while (text.endsWith('"') || text.endsWith("'")) {
        text = text.substring(0, text.length - 1);
      }
      while (text.startsWith('"') || text.startsWith("'")) {
        text = text.substring(1, text.length);
      }
      return text;
    }

    // force tree to be loaded on startup
    reloadTree();
  }

}