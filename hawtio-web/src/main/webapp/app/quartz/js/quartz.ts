/**
 * @module Quartz
 */
module Quartz {

  export function QuartzController($scope, $location:ng.ILocationService, workspace:Workspace, jolokia) {

    var log:Logging.Logger = Logger.get("Quartz");

    var stateTemplate = '<div class="ngCellText pagination-centered" title="{{row.getProperty(col.field)}}"><i class="{{row.getProperty(col.field) | quartzIconClass}}"></i></div>';
    var misfireTemplate = '<div class="ngCellText" title="{{row.getProperty(col.field)}}">{{row.getProperty(col.field) | quartzMisfire}}</div>';
    var jobMapTemplate = '<div class="ngCellText" ng-click="openDetailView(row.entity)" ng-bind-html-unsafe="row.getProperty(col.field) | quartzJobDataClassText"></div>';

    $scope.valueDetails = new Core.Dialog();

    $scope.selectedScheduler = null;
    $scope.selectedSchedulerMBean = null;
    $scope.triggers = [];
    $scope.jobs = [];

    $scope.gridOptions = {
      selectedItems: [],
      data: 'triggers',
      displayFooter: false,
      showFilter: true,
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
          displayName: 'Group',
          resizable: true,
          width: 150
        },
        {
          field: 'name',
          displayName: 'Name',
          resizable: true,
          width: 150
        },
        {
          field: 'misfireInstruction',
          displayName: 'Misfire Instruction',
          cellTemplate: misfireTemplate,
          width: 150
        },
        {
          field: 'previousFireTime',
          displayName: 'Previous Fire Timestamp'
        },
        {
          field: 'nextFireTime',
          displayName: 'Next Fire Timestamp'
        },
        {
          field: 'finalFireTime',
          displayName: 'Final Fire Timestamp',
          visible: false
        }
      ]
    };

    $scope.jobsGridOptions = {
      selectedItems: [],
      data: 'jobs',
      displayFooter: false,
      showFilter: true,
      filterOptions: {
        filterText: ''
      },
      showColumnMenu: true,
      showSelectionCheckbox: false,
      multiSelect: false,
      columnDefs: [
        {
          field: 'group',
          displayName: 'Group',
          resizable: true,
          width: 150
        },
        {
          field: 'name',
          displayName: 'Name',
          resizable: true,
          width: 150
        },
        {
          field: 'durability',
          displayName: 'Durable',
          width: 70,
          resizable: false
        },
        {
          field: 'shouldRecover',
          displayName: 'Recover',
          width: 70,
          resizable: false
        },
        {
          field: 'jobClass',
          displayName: 'Job ClassName',
          cellTemplate: jobMapTemplate,
          width: 350
        },
        {
          field: 'description',
          displayName: 'Description',
          resizable: true,
          visible: false
        }
      ]
    };

    $scope.openDetailView = (entity) => {
      $scope.row = entity;
      if (entity.detailHtml) {
        $scope.valueDetails.open();
      }
    };

    $scope.renderIcon = (state) => {
      return Quartz.iconClass(state);
    }

    $scope.renderQuartz = (response) => {
      $scope.selectedSchedulerDetails = [];

      log.debug("Selected scheduler mbean " + $scope.selectedScheduler);
      var obj = response.value;
      if (obj) {

        // did we change scheduler
        var newScheduler = $scope.selectedScheduler !== obj;
        if (newScheduler) {
          $scope.triggers = [];
          $scope.selectedScheduler = obj;
        }

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

        // grab state for all triggers which requires to call a JMX operation per trigger
        $scope.jobs = [];
        $scope.triggers.forEach(t => {
          var job = obj.AllJobDetails[t.jobName];
          if (job) {
            job = job[t.group];
            if (job) {
              generateJobDataMapDetails(job);
              $scope.jobs.push(job);
            }
          }
        });
      }

      Core.$apply($scope);
    }

    function generateJobDataMapDetails(data) {
      var value = data.jobDataMap;
      if (!angular.isArray(value) && angular.isObject(value)) {
        var detailHtml = "<table class='table table-striped'>";
        detailHtml += "<thead><th>Key</th><th>Value</th></thead>";
        var object = value;
        var keys = Object.keys(value).sort();
        angular.forEach(keys, (key) => {
          var value = object[key];
          detailHtml += "<tr><td>" + safeNull(key) + "</td><td>" + safeNull(value) + "</td></tr>";
        });
        detailHtml += "</table>";
        data.detailHtml = detailHtml;
      }
    }

    $scope.pauseScheduler = () => {
      if ($scope.selectedSchedulerMBean) {
        jolokia.request({type: "exec", mbean: $scope.selectedSchedulerMBean,
          operation: "standby"});

        notification("success", "Paused scheduler " + $scope.selectedScheduler.SchedulerName);
      }
    }

    $scope.startScheduler = () => {
      if ($scope.selectedSchedulerMBean) {
        jolokia.request({type: "exec", mbean: $scope.selectedSchedulerMBean,
          operation: "start"});

        notification("success", "Started scheduler " + $scope.selectedScheduler.SchedulerName);
      }
    }

    $scope.enableSampleStatistics = () => {
      if ($scope.selectedSchedulerMBean) {
        jolokia.setAttribute($scope.selectedSchedulerMBean, "SampledStatisticsEnabled", true);
      }
    }

    $scope.disableSampleStatistics = () => {
      if ($scope.selectedSchedulerMBean) {
        jolokia.setAttribute($scope.selectedSchedulerMBean, "SampledStatisticsEnabled", false);
      }
    }

    $scope.pauseTrigger = () => {
      if ($scope.gridOptions.selectedItems.length === 1) {
        var groupName = $scope.gridOptions.selectedItems[0].group;
        var triggerName = $scope.gridOptions.selectedItems[0].name;

        jolokia.request({type: "exec", mbean: $scope.selectedSchedulerMBean,
          operation: "pauseTrigger", arguments: [triggerName, groupName]});

        notification("success", "Paused trigger " + groupName + "/" + triggerName);
      }
    }

    $scope.resumeTrigger = () => {
      if ($scope.gridOptions.selectedItems.length === 1) {
        var groupName = $scope.gridOptions.selectedItems[0].group;
        var triggerName = $scope.gridOptions.selectedItems[0].name;

        jolokia.request({type: "exec", mbean: $scope.selectedSchedulerMBean,
          operation: "resumeTrigger", arguments: [triggerName, groupName]});

        notification("success", "Resumed trigger " + groupName + "/" + triggerName);
      }
    }

    $scope.updateTrigger = () => {
      if ($scope.gridOptions.selectedItems.length === 1) {
        var groupName = $scope.gridOptions.selectedItems[0].group;
        var triggerName = $scope.gridOptions.selectedItems[0].name;

        var jobMap = jolokia.request({type: "exec", mbean: $scope.selectedSchedulerMBean,
          operation: "getJobDetail", arguments: [triggerName, groupName]});

        if (jobMap && jobMap.value != null) {
          jobMap = jobMap.value;

          var triggerMap = {cronExpression: '0/3 * * * * ?'}

          var status = jolokia.request({type: "exec", mbean: $scope.selectedSchedulerMBean,
            operation: "scheduleBasicJob", arguments: [jobMap, triggerMap]});

          log.info(status);

          notification("success", "Updated trigger " + groupName + "/" + triggerName);
        }
      }
    }

    function reloadTree() {
      log.debug("Reloading Quartz Tree")
      var mbean = Quartz.getQuartzMBean(workspace);
      var domain = "quartz";
      var rootFolder = new Folder("Quartz Schedulers");
      rootFolder.addClass = "quartz-folder";
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
            scheduler.addClass = "quartz-scheduler";
            scheduler.typeName = "quartzScheduler";
            scheduler.domain = domain;
            scheduler.objectName = value;
            // use scheduler name as key as that is unique for us
            scheduler.key = txt;
            rootFolder.children.push(scheduler);
          });

          log.debug("Setitng up Quartz tree with nid " + $location.search()["nid"]);
          var nid = $location.search()["nid"];
          if (nid) {
            var data = rootFolder.children.filter(folder => {
              return folder.key === nid;
            });
            log.debug("Found nid in tree " + data);
            if (data && data.length === 1) {
              selectionChanged(data[0]);
            }
          }

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
        } else {
          return first;
        }
      }, true);
    }

    function selectionChanged(data) {
      var selectionKey = data ? data.objectName : null;
      log.debug("Selection is now: " + selectionKey);

      if (selectionKey) {
        // if we selected a scheduler then register a callback to get its trigger data updated in-real-time
        // as the trigger has prev/next fire times that changes
        $scope.selectedSchedulerMBean = selectionKey;

        // TODO: is there a better way to add our nid to the uri parameter?
        $location.search({nid: data.key});

        var request = [
          {type: "read", mbean: $scope.selectedSchedulerMBean}
        ];
        // unregister before registering new
        Core.unregister(jolokia, $scope);
        Core.register(jolokia, $scope, request, onSuccess($scope.renderQuartz));
      } else {
        Core.unregister(jolokia, $scope);
        $scope.selectedSchedulerMBean = null;
        $scope.selectedScheduler = null;
        $scope.triggers = [];
        $scope.jobs = [];
      }
    }

    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
      // lets do this asynchronously to avoid Error: $digest already in progress
      setTimeout(updateSelectionFromURL, 50);
    });

    $scope.$on('jmxTreeUpdated', function () {
      reloadTree();
    });

    // reload tree on startup
    reloadTree();
  }

}