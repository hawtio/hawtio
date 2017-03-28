/**
 * @module Osgi
 */
/// <reference path="./osgiPlugin.ts"/>
module Osgi {

  // These functions are exported independently to facilitate unit testing
  export function readBSNHeaderData(header:string):string {
    var idx = header.indexOf(";");
    if (idx <= 0) {
      return "";
    }
    return header.substring(idx + 1).trim();
  }

  export function formatAttributesAndDirectivesForPopover(data:{}, skipVersion:boolean):string {
    var str = "";
    if (!data) {
      return str;
    }
    var sortedKeys = Object.keys(data).sort();
    for (var i = 0; i < sortedKeys.length; i++) {
      var da:any = sortedKeys[i];
      var type = da.charAt(0);

      var separator = "";
      var txtClass;
      if (type === "A") {
        separator = "=";
        txtClass = "text-info";
      }
      if (type === "D") {
        separator = ":=";
        txtClass = "muted";
      }

      if (separator !== "") {
        if (skipVersion) {
          if (da === "Aversion") {
            // We're using the 'ReportedVersion' as it comes from PackageAdmin
            continue;
          }
        }

        var value = data[da];
        if (value.length > 15) {
          value = value.replace(/[,]/g, ",<br/>&nbsp;&nbsp;");
        }
        str += "<tr><td><strong class='" + txtClass + "'>" + da.substring(1) + "</strong>" + separator + value + "</td></tr>";
      }
    }
    return str;
  }

  export function formatServiceName(objClass:any):string {
    if (Object.isArray(objClass)) {
      return formatServiceNameArray(objClass);
    }
    var name = objClass.toString();
    var idx = name.lastIndexOf('.');
    return name.substring(idx + 1);
  }

  function formatServiceNameArray(objClass:string[]):string {
    var rv = [];
    for (var i = 0; i < objClass.length; i++) {
      rv.add(formatServiceName(objClass[i]));
    }
    rv = rv.filter(function (elem, pos, self) {
      return self.indexOf(elem) === pos;
    });

    rv.sort();
    return rv.toString();
  }

  _module.controller("Osgi.BundleController", ["$scope", "$location", "$timeout", "workspace", "$routeParams", "jolokia", ($scope, $location, $timeout, workspace:Workspace, $routeParams, jolokia) => {
    $scope.bundleId = $routeParams.bundleId;

    updateTableContents();

    $scope.showValue = (key) => {
      switch (key) {
        case "Bundle-Name":
        case "Bundle-SymbolicName":
        case "Bundle-Version":
        case "Export-Package":
        case "Import-Package":
          return false;
        default:
          return true;
      }
    };

    $scope.showStartEventFeedback = false;
    $scope.showStopEventFeedback = false;
    $scope.showRefreshEventFeedback = false;
    $scope.showUpdateEventFeedback = false;
    $scope.showUninstallEventFeedback = false;
    $scope.defaultTimeout = 3000;

    $scope.executeLoadClass = (clazz) => {
      var mbean = getHawtioOSGiToolsMBean(workspace);
      if (mbean) {
        jolokia.request(
                {type: 'exec', mbean: mbean, operation: 'getLoadClassOrigin', arguments: [$scope.bundleId, clazz]},
                {
                  success: function (response) {
                    var divEl = document.getElementById("loadClassResult");
                    var resultBundle = response.value;
                    var style;
                    var resultTxt;
                    if (resultBundle === -1) {
                      style = "";
                      resultTxt = "Class can not be loaded from this bundle.";
                    } else {
                      style = "alert-success";
                      resultTxt = "Class is served from Bundle " + bundleLinks(workspace, resultBundle);
                    }
                    divEl.innerHTML +=
                            "<div class='alert " + style + "'>" +
                                    "<button type='button' class='close' data-dismiss='alert'>&times;</button>" +
                                    "Loading class <strong>" + clazz + "</strong> in Bundle " + $scope.bundleId + ". " + resultTxt + "</div>";
                  },
                  error: function (response) {
                    inspectReportError(response);
                  }
                });
      } else {
        inspectReportNoMBeanFound();
      }
    };

    $scope.executeFindResource = (resource) => {
      var mbean = getHawtioOSGiToolsMBean(workspace);
      if (mbean) {
        jolokia.request(
                {type: 'exec', mbean: mbean, operation: 'getResourceURL', arguments: [$scope.bundleId, resource]},
                {
                  success: function (response) {
                    var divEl = document.getElementById("loadClassResult");
                    var resultURL = response.value;
                    var style;
                    var resultTxt;
                    if (resultURL === null) {
                      style = "";
                      resultTxt = "Resource can not be found from this bundle.";
                    } else {
                      style = "alert-success";
                      resultTxt = "Resource is available from: " + resultURL;
                    }
                    divEl.innerHTML +=
                            "<div class='alert " + style + "'>" +
                                    "<button type='button' class='close' data-dismiss='alert'>&times;</button>" +
                                    "Finding resource <strong>" + resource + "</strong> in Bundle " + $scope.bundleId + ". " + resultTxt + "</div>";
                  },
                  error: function (response) {
                    inspectReportError(response);
                  }
                }
        )
      } else {
        inspectReportNoMBeanFound();
      }
    };


    $scope.mavenLink = (row) => {
      if (angular.isObject(row)) {
        return Maven.mavenLink(row.Location);
      }
      // TODO try using the LogQuery mbean to find the mvn coords for a bundle id?
      return "";
    };

    $scope.startBundle = (bundleId) => {
      $scope.showStartEventFeedback = true;
      $timeout(function () { $scope.showStartEventFeedback = false; }, $scope.defaultTimeout);
      jolokia.request([
        {type: 'exec', mbean: getSelectionFrameworkMBean(workspace), operation: 'startBundle', arguments: [bundleId]}
      ],
              onSuccess(updateTableContents));
    };

    $scope.stopBundle = (bundleId) => {
      $scope.showStopEventFeedback = true;
      $timeout(function () { $scope.showStopEventFeedback = false; }, $scope.defaultTimeout);
      jolokia.request([
        {type: 'exec', mbean: getSelectionFrameworkMBean(workspace), operation: 'stopBundle', arguments: [bundleId]}
      ],
              onSuccess(updateTableContents));
    };

    $scope.updateBundle = (bundleId) => {
      $scope.showUpdateEventFeedback = true;
      $timeout(function () { $scope.showUpdateEventFeedback = false; }, $scope.defaultTimeout);
      jolokia.request([
        {type: 'exec', mbean: getSelectionFrameworkMBean(workspace), operation: 'updateBundle', arguments: [bundleId]}
      ],
              onSuccess(updateTableContents));
    };

    $scope.refreshBundle = (bundleId) => {
      $scope.showRefreshEventFeedback = true;
      $timeout(function () { $scope.showRefreshEventFeedback = false; }, $scope.defaultTimeout);
      jolokia.request([
        {type: 'exec', mbean: getSelectionFrameworkMBean(workspace), operation: 'refreshBundle', arguments: [bundleId]}
      ],
              onSuccess(updateTableContents));
    };

    $scope.uninstallBundle = (bundleId) => {
      $scope.showUninstallEventFeedback = true;
      $timeout(function () { $scope.showUninstallEventFeedback = false; }, $scope.defaultTimeout);
      jolokia.request([{
        type: 'exec', 
        mbean: getSelectionFrameworkMBean(workspace), 
        operation: 'uninstallBundle', 
        arguments: [bundleId]
        }], onSuccess(function() { 
          $location.path("/osgi/bundle-list");
          Core.$apply($scope); 
        }));
    };

    function inspectReportNoMBeanFound() {
      var divEl = document.getElementById("loadClassResult");
      divEl.innerHTML +=
              "<div class='alert alert-error'>" +
                      "<button type='button' class='close' data-dismiss='alert'>&times;</button>" +
                      "The hawtio.OSGiTools MBean is not available. Please contact technical support." +
                      "</div>";
    }

    function inspectReportError(response) {
      var divEl = document.getElementById("loadClassResult");
      divEl.innerHTML +=
              "<div class='alert alert-error'>" +
                      "<button type='button' class='close' data-dismiss='alert'>&times;</button>" +
                      "Problem invoking hawtio.OSGiTools MBean. " + response +
                      "</div>";
    }

    function populateTable(response) {
      var values = response.value;
      $scope.bundles = values;
      // now find the row based on the selection ui
      Osgi.defaultBundleValues(workspace, $scope, values);
      $scope.row = Osgi.findBundle($scope.bundleId, values);
      Core.$apply($scope);

      // This trick is to ensure that the popover is properly visible if it is
      // smaller than the accordion
      $('.accordion-body.collapse').hover(
              function () {
                $(this).css('overflow', 'visible');
              },
              function () {
                $(this).css('overflow', 'hidden');
              }
      );

      // setup tooltips
      $("#bsn").tooltip({title: readBSNHeaderData($scope.row.Headers["Bundle-SymbolicName"].Value),
        placement: "right"});

      createImportPackageSection();
      createExportPackageSection();
      populateServicesSection();
    }

    function createImportPackageSection():void {
      // setup popovers
      var importPackageHeaders = Osgi.parseManifestHeader($scope.row.Headers, "Import-Package");
      for (var pkg in $scope.row.ImportData) {
        var data = importPackageHeaders[pkg];
        var po = "<small><table>" +
                "<tr><td><strong>Imported Version=</strong>" + $scope.row.ImportData[pkg].ReportedVersion + "</td></tr>";
        if (data !== undefined) {
          // This happens in case the package was imported due to a DynamicImport-Package
          po += formatAttributesAndDirectivesForPopover(data, false);
          if (importPackageHeaders[pkg]["Dresolution"] !== "optional") {
            $(document.getElementById("import." + pkg)).addClass("badge-info");
          }
        } else {
          // This is a dynamic import
          $(document.getElementById("import." + pkg)).addClass("badge-important");
          var reason = $scope.row.Headers["DynamicImport-Package"];
          if (reason !== undefined) {
            reason = reason.Value;
            po += "<tr><td>Dynamic Import. Imported due to:</td></tr>";
            po += "<tr><td><strong>DynamicImport-Package=</strong>" + reason + "</td></tr>";
          }
        }
        po += "</table></small>";
        $(document.getElementById("import." + pkg)).
                popover({title: "attributes and directives", content: po, trigger: "hover", html: true });

        // Unset the value so that we can see whether there are any unbound optional imports left...
        importPackageHeaders[pkg] = undefined;
      }

      var unsatisfied = "";
      for (var pkg in importPackageHeaders) {
        if (importPackageHeaders[pkg] === undefined) {
          continue;
        }
        if ($scope.row.ExportData[pkg] !== undefined) {
          // The bundle exports this package and also imports it. In this case it is satisfied from the bundle
          // itself so it should not be listed as unsatisfied.
          continue;
        }
        unsatisfied += "<tr><td><div class='less-big badge badge-warning' id='unsatisfied." + pkg + "'>" + pkg + "</div></td></tr>";
      }

      if (unsatisfied !== "") {
        unsatisfied = "<p/><p class='text-warning'>The following optional imports were not satisfied:<table>" + unsatisfied + "</table></p>"
        document.getElementById("unsatisfiedOptionalImports").innerHTML = unsatisfied;
      }

      for (var pkg in importPackageHeaders) {
        if (importPackageHeaders[pkg] === undefined) {
          continue;
        }
        var po = "<small><table>";
        po += formatAttributesAndDirectivesForPopover(importPackageHeaders[pkg], false);
        po += "</table></small>";
        $(document.getElementById("unsatisfied." + pkg)).
                popover({title: "attributes and directives", content: po, trigger: "hover", html: true });
      }
    }

    function createExportPackageSection():void {
      // setup popovers
      var exportPackageHeaders = Osgi.parseManifestHeader($scope.row.Headers, "Export-Package");
      for (var pkg in $scope.row.ExportData) {
        var po = "<small><table>" +
                "<tr><td><strong>Exported Version=</strong>" + $scope.row.ExportData[pkg].ReportedVersion + "</td></tr>";
        po += formatAttributesAndDirectivesForPopover(exportPackageHeaders[pkg], true);
        po += "</table></small>";
        $(document.getElementById("export." + pkg)).
                popover({title: "attributes and directives", content: po, trigger: "hover", html: true });
      }
    }

    function populateServicesSection():void {
      if (($scope.row.RegisteredServices === undefined || $scope.row.RegisteredServices.length === 0) &&
              ($scope.row.ServicesInUse === undefined || $scope.row.ServicesInUse === 0)) {
        // no services for this bundle
        return;
      }

      var mbean = getSelectionServiceMBean(workspace);
      if (mbean) {
        jolokia.request(
                {type: 'exec', mbean: mbean, operation: 'listServices()'},
                onSuccess(updateServices));
      }
    }

    function updateServices(result) {
      var data = result.value;
      for (var id in data) {
        var reg = document.getElementById("registers.service." + id);
        var uses = document.getElementById("uses.service." + id);

        if ((reg === undefined || reg === null) && (uses === undefined || uses === null)) {
          continue;
        }

        jolokia.request({
                  type: 'exec', mbean: getSelectionServiceMBean(workspace),
                  operation: 'getProperties', arguments: [id]},
                onSuccess(function (svcId, regEl, usesEl) {
                  return function (resp) {
                    var props = resp.value;
                    var sortedKeys = Object.keys(props).sort();
                    var po = "<small><table>";
                    for (var i = 0; i < sortedKeys.length; i++) {
                      var value = props[sortedKeys[i]];
                      if (value !== undefined) {
                        var fval = value.Value;
                        if (fval.length > 15) {
                          fval = fval.replace(/[,]/g, ",<br/>&nbsp;&nbsp;");
                        }

                        po += "<tr><td valign='top'>" + sortedKeys[i] + "</td><td>" + fval + "</td></tr>"
                      }
                    }

                    var regBID = data[svcId].BundleIdentifier;
                    po += "<tr><td>Registered&nbsp;by</td><td>Bundle " + regBID + " <div class='less-big label'>" + $scope.bundles[regBID].SymbolicName
                            + "</div></td></tr>";
                    po += "</table></small>";

                    if (regEl !== undefined && regEl !== null) {
                      regEl.innerText = " " + formatServiceName(data[svcId].objectClass);
                      $(regEl).popover({title: "service properties", content: po, trigger: "hover", html: true});
                    }
                    if (usesEl !== undefined && usesEl !== null) {
                      usesEl.innerText = " " + formatServiceName(data[svcId].objectClass);
                      $(usesEl).popover({title: "service properties", content: po, trigger: "hover", html: true});
                    }
                  }
                }(id, reg, uses)));
      }
    }

    function updateTableContents() {
      //console.log("Loading the bundles");
      var mbean = getSelectionBundleMBean(workspace);
      if (mbean) {
        jolokia.request(
                {type: 'exec', mbean: mbean, operation: 'listBundles()'},
                onSuccess(populateTable));
      }
    }
  }]);

}
