/**
 * @module Fabric
 * @main Fabric
 */
module Fabric {

  export var jmxDomain = 'org.fusesource.fabric';

  export var templatePath = 'app/fabric/html/';

  export var currentContainerId = '';


  angular.module('fabric', ['bootstrap', 'ui.bootstrap', 'ui.bootstrap.dialog', 'ngResource', 'ngGrid', 'hawtio-forms', 'hawtioCore', 'ngDragDrop', 'wiki']).config(($routeProvider) => {
    $routeProvider.
            when('/createFabric', {templateUrl: templatePath + 'createFabric.html'}).
            when('/fabric/containers/createContainer', {templateUrl: templatePath + 'createContainer.html', reloadOnSearch: false }).
            when('/fabric/map', {templateUrl: templatePath + 'map.html'}).
            when('/fabric/clusters/*page', {templateUrl: templatePath + 'clusters.html'}).
            when('/fabric/containers', {templateUrl: templatePath + 'containers.html', reloadOnSearch: false}).
            when('/fabric/container/:containerId', {templateUrl: templatePath + 'container.html'}).
            when('/fabric/assignProfile', {templateUrl: templatePath + 'assignProfile.html'}).
            when('/fabric/activeProfiles', {templateUrl: templatePath + 'activeProfiles.html'}).
            //when('/fabric/profile/:versionId/:profileId', {templateUrl: templatePath + 'profile.html'}).
            when('/wiki/profile/:versionId/:profileId/editFeatures', {templateUrl: templatePath + 'editFeatures.html'}).
            when('/fabric/profile/:versionId/:profileId/:fname', {templateUrl: templatePath + 'pid.html'}).
            when('/fabric/view', { templateUrl: templatePath + 'fabricView.html', reloadOnSearch: false }).
            when('/fabric/migrate', { templateUrl: templatePath + 'migrateVersions.html' }).
            when('/fabric/patching', { templateUrl: templatePath + 'patching.html' }).
            when('/fabric/mq/brokers', { templateUrl: templatePath + 'brokers.html' }).
            when('/fabric/mq/brokerDiagram', { templateUrl: templatePath + 'brokerDiagram.html', reloadOnSearch: false }).
            when('/fabric/mq/brokerNetwork', { templateUrl: templatePath + 'brokerNetwork.html' }).
            when('/fabric/mq/createBroker', { templateUrl: templatePath + 'createBroker.html' }).
            when('/fabric/api', { templateUrl: templatePath + 'apis.html' }).

            // expose the API pages within the fabric namespace
            when('/fabric/api/wsdl', {templateUrl: 'app/api/html/wsdl.html'}).
            when('/fabric/api/wadl', {templateUrl: 'app/api/html/wadl.html'}).

            when('/fabric/test', { templateUrl: templatePath + 'test.html' });
  }).

    directive('fabricVersionSelector', function() {
      return new Fabric.VersionSelector();
    }).
    directive('fabricProfileSelector', function() {
      return new Fabric.ProfileSelector();
    }).
    directive('fabricContainerList', () => {
      return new Fabric.ContainerList();
    }).
    directive('fabricProfileDetails', () => {
      return new Fabric.ProfileDetails();
    }).
    directive('fabricActiveProfileList', () => {
      return new Fabric.ActiveProfileList();
    }).
    directive('fabricProfileLink', (workspace, jolokia, localStorage) => {
        return {
            restrict: 'A',
            link: ($scope, $element, $attrs) => {
            var profileId = $attrs['fabricProfileLink'];

            if (profileId && !profileId.isBlank() && Fabric.fabricCreated(workspace)) {
              var container = Fabric.getCurrentContainer(jolokia, ['versionId']);
              var versionId = container['versionId'];
              if (versionId && !versionId.isBlank()) {
                var url = '#' + Fabric.profileLink(workspace, jolokia, localStorage, versionId, profileId);
                if (angular.isDefined($attrs['file'])) {
                  url = url + "/" + $attrs['file'];
                }

                $element.attr('href', url);
              }
            }
          }
        }
    }).
    directive('fabricContainers', ($location, jolokia, workspace, $compile) => {
        return {
            restrict: 'A',
            link: ($scope, $element, $attrs) => {
            var model = $attrs['fabricContainers'];
            var profileId = $attrs['profile'];
            var version = $scope.versionId || $scope.version || "1.0";
            if (model && !model.isBlank() && profileId && !profileId.isBlank()) {
              // lets expose the $scope.connect object!

              Fabric.initScope($scope, $location, jolokia, workspace);
              var containerIds = Fabric.getContainerIdsForProfile(jolokia, version, profileId);
              log.info("Searching for containers for profile: " + profileId + " version " + version + ". Found: " + containerIds);
              $scope[model] = containerIds;

              $scope["onCancel"] = () => {
                console.log("In our new cancel thingy!");
              };

              // now lets add the connect dialog
              var dialog = $("<div ng-include=\"'app/fabric/html/connectToContainerDialog.html'\"></div>");
              var answer = $compile(dialog)($scope);
              $element.append(answer);
            }
          }
        }
    }).
    directive('fabricContainerLink', ($location, jolokia, workspace) => {
        return {
            restrict: 'A',
            link: ($scope, $element, $attrs) => {
            var containerId = $attrs['fabricContainerLink'];
            if (containerId && !containerId.isBlank()) {
              var fields = ["alive", "provisionResult", "versionId", "jmxDomains"];
              var container = Fabric.getContainerFields(jolokia, containerId, fields);

              var link = "#/fabric/container/" + containerId;
              var title = Fabric.statusTitle(container) || "container " + containerId;
              var icon = Fabric.statusIcon(container) || "";

              var html = "<a href='" + link + "' title='" + title + "'><i class='" + icon + "'></i> " + containerId + "</a>";
              $element.html(html);

              Core.$apply($scope);
            }
          }
        }
    }).
    directive('fabricContainerConnect', ($location, jolokia) => {
        return {
            restrict: 'A',
            link: ($scope, $element, $attrs) => {
            var containerId = $attrs['fabricContainerConnect'];
            var view = $attrs['view'];
            if (containerId && !containerId.isBlank()) {
              //var fields = ["parentId", "profileIds", "versionId", "provisionResult", "jolokiaUrl", "root", 'jmxDomains'];
              var fields = ["jolokiaUrl"];
              //Fabric.initScope($scope, $location, jolokia, workspace);

              var connectFn = () => {
                var container = Fabric.getContainerFields(jolokia, containerId, fields);
                log.info("Connecting to container id " + containerId + " view + " + view);
                container["id"]  = containerId;
                $scope.doConnect(container, view);
                Core.$apply($scope);
              };
              $element.on("click", connectFn);
            }
          }
        }
    }).
    directive('fabricVersionLink', (workspace, jolokia, localStorage) => {
        return {
            restrict: 'A',
            link: ($scope, $element, $attrs) => {
            var versionLink = $attrs['fabricVersionLink'];

            if (versionLink && !versionLink.isBlank() && Fabric.fabricCreated(workspace)) {
              var container = Fabric.getCurrentContainer(jolokia, ['versionId']);
              var versionId = container['versionId'] || "1.0";
              if (versionId && !versionId.isBlank()) {
                var url = "#/wiki/branch/" + versionId + "/" + Core.trimLeading(versionLink, "/");
                $element.attr('href', url);
              }
            }
          }
        }
    }).

          run(($location: ng.ILocationService, workspace: Workspace, jolokia, viewRegistry, pageTitle:Core.PageTitle, helpRegistry, layoutFull) => {

            viewRegistry['fabric'] = templatePath + 'layoutFabric.html';
            viewRegistry['createFabric'] = layoutFull;

            pageTitle.addTitleElement( ():string => {
              if (Fabric.currentContainerId === '' && Fabric.fabricCreated(workspace)) {
                try {
                  Fabric.currentContainerId = jolokia.getAttribute(Fabric.managerMBean, 'CurrentContainerName', {timeout: 1});
                } catch (e) {
                  // ignore
                }
              }
              return Fabric.currentContainerId;
            });

            workspace.topLevelTabs.push( {
              content: "Create Fabric",
              title: "Create a fabric starting with this container",
              isValid: (workspace) => Fabric.canBootstrapFabric(workspace) && !Fabric.fabricCreated(workspace),
              href: () => "#/createFabric",
              isActive: (workspace) => workspace.isLinkActive("createFabric")
            });
            workspace.topLevelTabs.push( {
              content: "Runtime",
              title: "Manage your containers in this fabric",
              isValid: (workspace) => Fabric.isFMCContainer(workspace),
              href: () => "#/fabric/containers",
              isActive: (workspace: Workspace) => workspace.isLinkActive("fabric")
            });
            workspace.topLevelTabs.push( {
              content: "Configuration",
              title: "Manage the configuration of your profiles in Fabric",
              isValid: (workspace) => Fabric.isFMCContainer(workspace),
              href: () => {
                return "#/wiki/branch/" + Fabric.activeVersion($location) + "/view/fabric/profiles";
              },
              isActive: (workspace: Workspace) => workspace.isLinkActive("/wiki") && (workspace.linkContains("fabric", "profiles") || workspace.linkContains("editFeatures"))
            });
            workspace.topLevelTabs.push( {
              id: "fabric.insight",
              content: "Insight",
              title: "View insight into your fabric looking at logs, metrics and messages across the fabric",
              isValid: (workspace) => {
                return Fabric.isFMCContainer(workspace) && Insight.hasInsight(workspace)
              },
              href: () => {
                return "#/insight/all?p=insight";
              },
              isActive: (workspace:Workspace) => workspace.isLinkActive("/insight")
            });

            helpRegistry.addUserDoc('fabric', 'app/fabric/doc/help.md', () => {
              return Fabric.isFMCContainer(workspace);
            });
            // don't need to pass the isValid parameter in subsequent calls...
            helpRegistry.addDevDoc("fabric", 'app/fabric/doc/developer.md');

          });

  hawtioPluginLoader.addModule('fabric');
}
