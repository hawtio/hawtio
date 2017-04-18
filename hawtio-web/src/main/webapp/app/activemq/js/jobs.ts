/// <reference path="activemqPlugin.ts"/>
module ActiveMQ {
  _module.controller("ActiveMQ.JobSchedulerController", ["$scope", "workspace", "jolokia", (
      $scope,
      workspace: Workspace,
      jolokia: Jolokia.IJolokia) => {

    $scope.workspace = workspace;
    $scope.refresh = loadTable;

    $scope.jobs = [];
    $scope.deleteJobsDialog = new UI.Dialog();

    $scope.gridOptions = {
      selectedItems: [],
      data: 'jobs',
      displayFooter: false,
      showFilter: false,
      showColumnMenu: true,
      enableColumnResize: true,
      enableColumnReordering: true,
      filterOptions: {
        filterText: ''
      },
      selectWithCheckboxOnly: true,
      showSelectionCheckbox: true,
      maintainColumnRatios: false,
      columnDefs: [
        {
          field: 'jobId',
          displayName: 'Job ID',
          width: '25%'
        },
        {
          field: 'cronEntry',
          displayName: 'Cron Entry',
          width: '10%'
        },
        {
          field: 'delay',
          displayName: 'Delay',
          width: '5%'
        },
        {
          field: 'repeat',
          displayName: 'repeat',
          width: '5%'
        },
        {
          field: 'period',
          displayName: 'period',
          width: '5%'
        },
        {
          field: 'start',
          displayName: 'Start',
          width: '25%'
        },
        {
          field: 'next',
          displayName: 'Next',
          width: '25%'
        }
      ]
    };

    $scope.$watch('workspace.selection', function () {
      if (workspace.moveIfViewInvalid()) return;

      // lets defer execution as we may not have the selection just yet
      setTimeout(loadTable, 50);
    });

    function loadTable() {
      var selection = workspace.selection;
      if (selection) {
        var mbean = selection.objectName;
        if (mbean) {
          jolokia.request(
            {type: 'read', mbean: mbean, attribute: "AllJobs"},
            onSuccess(populateTable));
        }
      }
      Core.$apply($scope);
    }

    function populateTable(response) {
      var data = response.value;
      if (!angular.isArray(data)) {
        $scope.jobs = [];
        angular.forEach(data, (value, idx) => {
          $scope.jobs.push(value);
        });
      } else {
        $scope.jobs = data
      }
      Core.$apply($scope);
    }

    $scope.deleteJobs = () => {
      var selection = workspace.selection;
      var mbean = selection.objectName;
      if (mbean && selection) {
        var selectedItems = $scope.gridOptions.selectedItems;
        $scope.message = "Deleted " + Core.maybePlural(selectedItems.length, "job");
        var operation = "removeJob(java.lang.String)";
        angular.forEach(selectedItems, (item, idx) => {
          var id = item.jobId;
          if (id) {
            var callback = (idx + 1 < selectedItems.length) ? intermediateResult : operationSuccess;
            jolokia.execute(mbean, operation, id, onSuccess(callback));
          }
        });
      }
    }

    function intermediateResult() {
    }

    function operationSuccess() {
      $scope.gridOptions.selectedItems.splice(0);
      Core.notification("success", $scope.message);
      setTimeout(loadTable, 50);
    }
  }]);
}
