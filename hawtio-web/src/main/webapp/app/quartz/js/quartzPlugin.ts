/**
 * @module Quartz
 * @main Quartz
 */
module Quartz {
  var pluginName = 'quartz';
  export var jmxDomain = 'quartz';

  var schedulerToolBar = "app/quartz/html/attributeToolBarScheduler.html";

  angular.module(pluginName, ['bootstrap', 'ngResource', 'hawtioCore']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/quartz/schedulers', {templateUrl: 'app/quartz/html/schedulers.html'})
          }).
          filter('quartzIconClass',() => iconClass).
          run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull, helpRegistry) => {

            viewRegistry['quartz'] = 'app/quartz/html/layoutQuartzTree.html';
            helpRegistry.addUserDoc('quartz', 'app/quartz/doc/help.md', () => {
              return workspace.treeContainsDomainAndProperties(jmxDomain);
            });

            workspace.topLevelTabs.push({
              id: "quartz",
              content: "Quartz",
              title: "Quartz Scheduler",
              isValid: (workspace: Workspace) => workspace.treeContainsDomainAndProperties(jmxDomain),
              href: () => "#/quartz/schedulers",
              isActive: (workspace: Workspace) => workspace.isTopTabActive("quartz")
            });

//            workspace.subLevelTabs.push({
//              content: '<i class="icon-gears"></i> Jobs',
//              title: "Jobs",
//              isValid: (workspace: Workspace) => Quartz.getSelectedSchedulerName(workspace),
//              href: () => "#/quartz/jobs"
//            });


/*            function postProcessTree(tree) {
              console.log("Post processing Quartz tree " + tree);

              var quartz = tree.get(jmxDomain);

              // lets move queue and topic as first children within brokers
              if (quartz) {
                angular.forEach(quartz.children, (scheduler) => {
                  angular.forEach(scheduler.children, (child) => {
                    // we need to move instance as the top level
                    // lets move Topic/Queue to the front.
                    var grandChildren = child.children;
                    if (grandChildren && grandChildren.length > 0) {
                      // move the grand up as new child, and detach current child
                      var newChild = grandChildren[0];
                      // steal title from child
                      newChild.title = child.title;
                      newChild.icon = "app/camel/img/camel.png"
                      scheduler.moveChild(newChild);
                      child.detach();
                      console.log("Replace child " + child + " with new child " + newChild)
                    }
                  });
                });
              }
            }*/

          });

  hawtioPluginLoader.addModule(pluginName);
}
