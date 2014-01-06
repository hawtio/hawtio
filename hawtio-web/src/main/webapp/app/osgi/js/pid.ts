/**
 * @module Osgi
 */
module Osgi {
  export function PidController($scope, $filter:ng.IFilterService, workspace:Workspace, $routeParams, jolokia) {
    $scope.deletePropDialog = new Core.Dialog();
    $scope.deletePidDialog = new Core.Dialog();
    $scope.addPropertyDialog = new Core.Dialog();
    $scope.pid = $routeParams.pid;

    updateTableContents();

    $scope.pidSave = () => {
      var table = document.getElementById("configValues");

      var els:any = table.getElementsByClassName("pid-value");
      var props = "";
      var td = {};
      for (var i = 0; i < els.length; i++) {
        props += "\n " + els[i].previousElementSibling.textContent + " " + els[i].textContent;
        td[els[i].previousElementSibling.textContent] = els[i].textContent;
      }

      var mbean = getHawtioConfigAdminMBean(workspace);
      if (mbean) {
        jolokia.request({
          type: "exec",
          mbean: mbean,
          operation: "configAdminUpdate",
          arguments: [$scope.pid, JSON.stringify(td)]
        }, {
          error: function (response) {
            notification("error", response.error);
          },
          success: function (response) {
            enableSave(false);
            notification("success", "Successfully updated pid: " + $scope.pid);
          }
        });
      }
    };

    $scope.addPropertyConfirmed = (key, value) => {
      $scope.addPropertyDialog.close();
      $scope.row[key] = {
        Key: key,
        Value: value,
        Type: "String"
      };
      enableSave(true);
    };

    $scope.deletePidProp = (e) => {
      $scope.deleteKey = e.Key;
      $scope.deletePropDialog.open();
    };

    $scope.deletePidPropConfirmed = () => {
      $scope.deletePropDialog.close();
      var cell:any = document.getElementById("pid." + $scope.deleteKey);
      cell.parentElement.remove();
      enableSave(true);
    };

    $scope.deletePidConfirmed = () => {
      $scope.deletePidDialog.close();

      var mbean = getSelectionConfigAdminMBean(workspace);
      if (mbean) {
        jolokia.request({
          type: "exec",
          mbean: mbean,
          operation: 'delete',
          arguments: [$scope.pid]
        }, {
          error: function (response) {
            notification("error", response.error);
          },
          success: function (response) {
            notification("success", "Successfully deleted pid: " + $scope.pid);
            // Move back to the overview page
            window.location.href = "#/osgi/configurations";
          }
        });
      }
    };

    function jmxError(response) {
      notification("error", "Oops: " + response);
    }

    function populateTable(response) {
      $scope.row = response.value;
      Core.$apply($scope);
    }

    function onMetaType(response) {
      $scope.metaType = response;
      Core.$apply($scope);
    }

    function updateTableContents() {
      var mbean = getSelectionConfigAdminMBean(workspace);
      if (mbean) {
        jolokia.request(
          {type: 'exec', mbean: mbean, operation: 'getProperties', arguments: [$scope.pid]},
          onSuccess(populateTable));
      }
      var metaTypeMBean = getMetaTypeMBean(workspace);
      if (metaTypeMBean) {
        var locale = null;
        jolokia.execute(metaTypeMBean, "getPidMetaTypeObject", $scope.pid, locale, onSuccess(onMetaType));
      }
    }
  }

  export function editPidValueCell(e) {
    e.contentEditable = true;
    enableSave(true);
  }

  function enableSave(enablement:boolean) {
    var saveBtn = document.getElementById("saveButton");
    saveBtn.disabled = !enablement;
  }
}
