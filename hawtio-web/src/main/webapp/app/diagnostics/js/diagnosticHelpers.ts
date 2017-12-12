/**
 * @module Diagnostics
 */
/// <reference path="../../baseIncludes.ts"/>
/// <reference path="../../core/js/coreHelpers.ts"/>
namespace Diagnostics {
  export const log:Logging.Logger = Logger.get("Diagnostics");


  /**
   * Adds common properties and functions to the scope
   * @method configureScope
   * @for Diagnostics
   * @param {*} $scope
   * @param {ng.ILocationService} $location
   * @param {Core.Workspace} workspace
   */
  export function configureScope($scope, $location, workspace) {

    $scope.isActive = (href) => {
      const tidy = Core.trimLeading(href, "#");
      const loc = $location.path();
      return loc === tidy;
    };

    $scope.isValid = (link) => {
      return link && link.isValid(workspace);
    };

    $scope.breadcrumbs = [
      {
        content: '<i class="icon-plane"></i> Flight Recorder',
        title: "Make flight recordings",
        isValid: (workspace:Workspace) => hasDiagnosticFunction(workspace, 'jfrCheck'),
        href: "#/diagnostics/jfr"
      },
      {
        content: '<i class="icon-hdd"></i> Heap Use',
        title: "See heap use",
        isValid: (workspace:Workspace) => hasDiagnosticFunction(workspace, 'gcClassHistogram'),
        href: "#/diagnostics/heap"
      },
      {
        content: '<i class="icon-gear"></i> JVM Flags',
        title: "JVM Flags",
        isValid: (workspace:Workspace) => hasHotspotDiagnostic(workspace),
        href: "#/diagnostics/flags"
      }
    ];
  }



  export function hasHotspotDiagnostic(workspace) {
    return workspace.treeContainsDomainAndProperties('com.sun.management', {type: 'HotSpotDiagnostic'});
  }

  export function hasDiagnosticFunction(workspace:Workspace, operation:string) {
      const diagnostics:Folder=workspace.findMBeanWithProperties('com.sun.management', {type: 'DiagnosticCommand'});
      return diagnostics && diagnostics.mbean && diagnostics.mbean.op && diagnostics.mbean.op[operation];
  }
    
  export function initialTab(workspace:Workspace) : string {
      if (hasDiagnosticFunction(workspace, 'jfrCheck')) {
          return '/jfr';
      } else if (hasDiagnosticFunction(workspace, 'gcClassHistogram')) {
          return '/heap';
      } else if (hasHotspotDiagnostic(workspace)) {
          return '/flags';
      } else {
          return '';
      }
      
  }

  export function findMyPid(title) {
     //snatch PID from window title
     const regex = /pid:(\d+)/g;
     const pid = regex.exec(title);
     if (pid && pid[1]) {
         return pid[1];
     } else {
         return null;
     }
  }

}
