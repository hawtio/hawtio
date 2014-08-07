/**
 * @module JVM
 */
module JVM {

  export var log:Logging.Logger = Logger.get("JVM");

  export var connectControllerKey = "jvmConnectSettings";
  export var connectionSettingsKey = Core.connectionSettingsKey;

  export var logoPath = 'img/icons/jvm/';

  export var logoRegistry = {
    'jetty': logoPath + 'jetty-logo-80x22.png',
    'tomcat': logoPath + 'tomcat-logo.gif',
    'generic': logoPath + 'java-logo.svg'
  };

  /**
   * Adds common properties and functions to the scope
   * @method configureScope
   * @for Jvm
   * @param {*} $scope
   * @param {ng.ILocationService} $location
   * @param {Core.Workspace} workspace
   */
  export function configureScope($scope, $location, workspace) {

    $scope.isActive = (href) => {
      var tidy = Core.trimLeading(href, "#");
      var loc = $location.path();
      return loc === tidy;
    };

    $scope.isValid = (link) => {
      return link && link.isValid(workspace);
    };

    $scope.hasLocalMBean = () => {
      return JVM.hasLocalMBean(workspace);
    };

    $scope.breadcrumbs = [
      {
        content: '<i class=" icon-signin"></i> Remote',
        title: "Connect to a remote JVM running Jolokia",
        isValid: (workspace:Workspace) => true,
        href: "#/jvm/connect"
      },
      {
        content: '<i class="icon-list-ul"></i> Local',
        title: "View a diagram of the route",
        isValid: (workspace:Workspace) => hasLocalMBean(workspace),
        href: "#/jvm/local"
      },
      {
        content: '<i class="icon-signin"></i> Discovery',
        title: "Discover",
        isValid: (workspace:Workspace) => hasDiscoveryMBean(workspace),
        href: "#/jvm/discover"
      }
    ];
  }

  export function hasLocalMBean(workspace) {
    return workspace.treeContainsDomainAndProperties('hawtio', {type: 'JVMList'});
  }

  export function hasDiscoveryMBean(workspace) {
    return workspace.treeContainsDomainAndProperties('jolokia', {type: 'Discovery'});
  }

}
