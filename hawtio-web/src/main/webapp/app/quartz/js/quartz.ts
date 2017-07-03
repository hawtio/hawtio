/**
 * @module Quartz
 */
/// <reference path="../../core/js/coreHelpers.ts"/>
/// <reference path="../../ui/js/dialog.ts"/>
/// <reference path="./quartzPlugin.ts"/>
module Quartz {

  _module.controller("Quartz.QuartzController", ["$scope", "$location", "workspace", "jolokia", ($scope, $location:ng.ILocationService, workspace:Workspace, jolokia) => {

    var log:Logging.Logger = Logger.get("Quartz");

    var stateTemplate = '<div class="ngCellText pagination-centered" title="{{row.entity.state}}"><i class="{{row.entity.state | quartzIconClass}}"></i></div>';
    var misfireTemplate = '<div class="ngCellText" title="{{row.entity.misfireInstruction}}">{{row.entity.misfireInstruction | quartzMisfire}}</div>';

    $scope.valueDetails = new UI.Dialog();

    $scope.selectedScheduler = null;
    $scope.selectedSchedulerMBean = null;
    $scope.triggers = [];
    $scope.jobs = [];

    $scope.misfireInstructions = [
      {id: '-1', title: 'Ignore'},
      {id: '0', title: 'Smart'},
      {id: '1', title: 'Fire once now'},
      {id: '2', title: 'Do nothing'}
    ];
    $scope.updatedTrigger = {};
    $scope.manualTrigger = {};
    $scope.triggerSchema = {
      properties: {
        'cron': {
          description: 'Cron expression',
          label: 'Cron expression',
          tooltip: 'Specify a cron expression for the trigger',
          type: 'string',
          hidden: false
        },
        'repeatCount': {
          description: 'Repeat count',
          tooltip: 'Number of times to repeat. Use -1 for forever.',
          type: 'integer',
          hidden: false
        },
        'repeatInterval': {
          description: 'Repeat interval',
          tooltip: 'Elapsed time in millis between triggering',
          type: 'integer',
          hidden: false
        },
        'misfireInstruction': {
          description: 'Misfire instruction',
          tooltip: 'What to do when misfiring happens',
          type: 'string',
          hidden: false,
          'input-element': 'select',
          'input-attributes': {
            'ng-options': "mi.id as mi.title for mi in misfireInstructions"
          }
        }
      }
    };

    $scope.manualTriggerSchema = {
      properties: {
        'name': {
          type: 'string'
        },
        'group': {
          type: 'string',
        },
        'parameters': {
          tooltip: 'Parameters if any (java.util.Map in JSON syntax)',
          type: 'string'
        }
      }
    };
    
    $scope.gridOptions = {
      selectedItems: [],
      data: 'triggers',
      showFilter: true,
      filterOptions: {
        filterText: ''
      },
      showSelectionCheckbox: false,
      enableRowClickSelection: true,
      multiSelect: false,
      primaryKeyFn: (entity, idx) => { return entity.group + "/" + entity.name },
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
          field: 'type',
          displayName: 'Type',
          resizable: false,
          width: 70
        },
        {
          field: 'expression',
          displayName: 'Expression',
          resizable: true,
          width: 180
        },
        {
          field: 'misfireInstruction',
          displayName: 'Misfire Instruction',
          cellTemplate: misfireTemplate,
          width: 150
        },
        {
          field: 'previousFireTime',
          displayName: 'Previous Fire'
        },
        {
          field: 'nextFireTime',
          displayName: 'Next Fire'
        },
        {
          field: 'finalFireTime',
          displayName: 'Final Fire'
        }
      ]
    };

    $scope.jobsGridOptions = {
      selectedItems: [],
      data: 'jobs',
      showFilter: true,
      filterOptions: {
        filterText: ''
      },
      showSelectionCheckbox: false,
      enableRowClickSelection: true,
      multiSelect: false,
      primaryKeyFn: (entity, idx) => { return entity.group + "/" + entity.name },
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
          width: 350
        },
        {
          field: 'description',
          displayName: 'Description',
          resizable: true
        }
      ]
    };

    $scope.openJobDetailView = () => {
      if ($scope.jobsGridOptions.selectedItems.length === 1) {
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

        // redraw table
        $scope.selectedScheduler = obj;
        $scope.triggers = [];
        $scope.job = [];

        // grab state for all triggers which requires to call a JMX operation per trigger
        obj.AllTriggers.forEach(t => {
          var state = jolokia.request({type: "exec", mbean: $scope.selectedSchedulerMBean,
            operation: "getTriggerState", arguments: [t.name, t.group]});
          if (state) {
            t.state = state.value;
          } else {
            t.state = "unknown";
          }

          // unique id of trigger
          t.id = t.name + "/" + t.group;

          // grab information about the trigger from the job map, as quartz does not have the information itself
          // so we had to enrich the job map in camel-quartz to include this information
          var job = obj.AllJobDetails[t.jobName];
          if (job) {
            job = job[t.group];
            if (job) {
              var repeatCounter;
              var repeatInterval;
              var jobDataMap = job.jobDataMap || {};
              t.type = jobDataMap["CamelQuartzTriggerType"];
              if (t.type && t.type == "cron") {
                t.expression = jobDataMap["CamelQuartzTriggerCronExpression"];
              } else if (t.type && t.type == "simple") {
                t.expression = "every " + jobDataMap["CamelQuartzTriggerSimpleRepeatInterval"] + " ms.";
                repeatCounter = jobDataMap["CamelQuartzTriggerSimpleRepeatCounter"];
                repeatInterval = jobDataMap["CamelQuartzTriggerSimpleRepeatInterval"];
                if (repeatCounter > 0) {
                  t.expression += " (" + repeatCounter + " times)";
                } else {
                  t.expression += " (forever)"
                }
                t.repeatCounter = repeatCounter;
                t.repeatInterval = repeatInterval;
              } else {
                // fallback and grab from Camel endpoint if that is possible (supporting older Camel releases)
                var uri = jobDataMap["CamelQuartzEndpoint"];
                if (uri) {
                  var cron = Core.getQueryParameterValue(uri, "cron");
                  if (cron) {
                    t.type = "cron";
                    // replace + with space as Camel uses + as space in the cron when specifying in the uri
                    cron = cron.replace(/\++/g, ' ');
                    t.expression = cron;
                  }
                  repeatCounter = Core.getQueryParameterValue(uri, "trigger.repeatCount");
                  repeatInterval = Core.getQueryParameterValue(uri, "trigger.repeatInterval");
                  if (repeatCounter || repeatInterval) {
                    t.type = "simple";
                    t.expression = "every " + repeatInterval + " ms.";
                    if (repeatCounter && repeatCounter > 0) {
                      t.expression += " (" + repeatCounter + " times)";
                    } else {
                      t.expression += " (forever)"
                    }
                    t.repeatCounter = repeatCounter;
                    t.repeatInterval = repeatInterval;
                  }
                }
              }
            }
          }

          $scope.triggers.push(t);
        });

        // grab state for all triggers which requires to call a JMX operation per trigger
        $scope.jobs = [];
        $scope.triggers.forEach(t => {
          var job = obj.AllJobDetails[t.jobName];
          if (job) {
            job = job[t.group];
            if (job) {
              generateJobDataMapDetails(job);

              // unique id of jobs
              job.id = job.jobName + "/" + job.group;

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
          operation: "standby"},
        onSuccess((response) => {
          Core.notification("success", "Paused scheduler " + $scope.selectedScheduler.SchedulerName);
        }
        ));
      }
    }

    $scope.startScheduler = () => {
      if ($scope.selectedSchedulerMBean) {
        jolokia.request({type: "exec", mbean: $scope.selectedSchedulerMBean,
          operation: "start"},
        onSuccess((response) => {
          Core.notification("success", "Started scheduler " + $scope.selectedScheduler.SchedulerName);
        }
        ));
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
          operation: "pauseTrigger", arguments: [triggerName, groupName]},
          onSuccess((response) => {
            Core.notification("success", "Paused trigger " + groupName + "/" + triggerName);
          }
        ));
      }
    }

    $scope.resumeTrigger = () => {
      if ($scope.gridOptions.selectedItems.length === 1) {
        var groupName = $scope.gridOptions.selectedItems[0].group;
        var triggerName = $scope.gridOptions.selectedItems[0].name;

        jolokia.request({type: "exec", mbean: $scope.selectedSchedulerMBean,
          operation: "resumeTrigger", arguments: [triggerName, groupName]},
          onSuccess((response) => {
            Core.notification("success", "Resumed trigger " + groupName + "/" + triggerName);
          }
        ));
      }
    }

    $scope.onBeforeUpdateTrigger = () => {
      var row = $scope.gridOptions.selectedItems[0];
      if (row && row.type === 'cron') {
        $scope.updatedTrigger["type"] = 'cron';
        $scope.updatedTrigger["cron"] = row.expression;
        $scope.updatedTrigger["repeatCount"] = null;
        $scope.updatedTrigger["repeatInterval"] = null;
        // must be a string type for the select-box to select it
        $scope.updatedTrigger["misfireInstruction"] = '' + row.misfireInstruction;
        $scope.triggerSchema.properties["cron"].hidden = false;
        $scope.triggerSchema.properties["repeatCount"].hidden = true;
        $scope.triggerSchema.properties["repeatInterval"].hidden = true;
        $scope.showTriggerDialog = true;
      } else if (row && row.type === 'simple') {
        $scope.updatedTrigger["type"] = 'simple';
        $scope.updatedTrigger["cron"] = null;
        $scope.updatedTrigger["repeatCount"] = row.repeatCounter;
        $scope.updatedTrigger["repeatInterval"] = row.repeatInterval;
        // must be a string type for the select-box to select it
        $scope.updatedTrigger["misfireInstruction"] = '' + row.misfireInstruction;
        $scope.triggerSchema.properties["cron"].hidden = true;
        $scope.triggerSchema.properties["repeatCount"].hidden = false;
        $scope.triggerSchema.properties["repeatInterval"].hidden = false;
        $scope.showTriggerDialog = true;
      } else {
        $scope.updatedTrigger = {};
        $scope.showTriggerDialog = false;
      }
    }
    
    $scope.onBeforeManualTrigger = () => {
      var row = $scope.gridOptions.selectedItems[0];
      if (row) {
        $scope.manualTrigger["name"] = row.jobName;
        $scope.manualTrigger["group"] = row.jobGroup;
        $scope.manualTrigger["parameters"] = '{}';
        $scope.showManualTriggerDialog = true;
      } else {
        $scope.manualTrigger = {};
        $scope.showManualTriggerDialog = false;
      }
    }
    

    $scope.onUpdateTrigger = () => {
      var cron = $scope.updatedTrigger["cron"];
      var repeatCounter = $scope.updatedTrigger["repeatCount"];
      var repeatInterval = $scope.updatedTrigger["repeatInterval"];
      var misfireInstruction = parseInt($scope.updatedTrigger["misfireInstruction"]);
      $scope.updatedTrigger = {};

      var groupName = $scope.gridOptions.selectedItems[0].group;
      var triggerName = $scope.gridOptions.selectedItems[0].name;

      if (cron) {
        log.info("Updating trigger " + groupName + "/" + triggerName + " with cron " + cron);

        jolokia.request({type: "exec", mbean: "hawtio:type=QuartzFacade",
          operation: "updateCronTrigger", arguments: [
            $scope.selectedSchedulerMBean,
            triggerName,
            groupName,
            misfireInstruction,
            cron,
            null]},
          onSuccess((response) => {
            Core.notification("success", "Updated trigger " + groupName + "/" + triggerName);
          }
        ));
      } else if (repeatCounter || repeatInterval) {

        if (repeatCounter == null) {
          repeatCounter = -1;
        }
        if (repeatInterval == null) {
          repeatInterval = 1000;
        }

        log.info("Updating trigger " + groupName + "/" + triggerName + " with interval " + repeatInterval + " ms. for " + repeatCounter + " times");

        jolokia.request({type: "exec", mbean: "hawtio:type=QuartzFacade",
            operation: "updateSimpleTrigger", arguments: [
              $scope.selectedSchedulerMBean,
              triggerName,
              groupName,
              misfireInstruction,
              repeatCounter,
              repeatInterval]},
          onSuccess((response) => {
              Core.notification("success", "Updated trigger " + groupName + "/" + triggerName);
            }
          ));
      }
    }
    function onManualTriggerError(response) {
      Core.notification("error", "Could not manually fire trigger " + response.request.arguments[1] + "/" + response.request.arguments[0] + " due to: " + response.error);
    }
    
    function onManualTriggerSuccess(response) {
      Core.notification("success", "Manually fired trigger " + response.request.arguments[1] + "/" + response.request.arguments[0]);
    }
    
    $scope.onManualTrigger = () => {
      var parameters = JSON.parse($scope.manualTrigger["parameters"]);
      var groupName = $scope.manualTrigger["group"];
      var triggerName = $scope.manualTrigger["name"];

      $scope.manualTrigger = {};
      log.info("Mannually firing trigger " + groupName + "/" + triggerName + " with parameters " + parameters);

      jolokia.request({type: "exec", mbean: $scope.selectedSchedulerMBean,
          operation: "triggerJob", arguments: [
            triggerName,
            groupName,
            parameters]},
          onSuccess(onManualTriggerSuccess, {error: onManualTriggerError}) );      
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
        $location.search("nid", data.key);

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
        $scope.updatedTrigger = {};
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
  }]);

}
