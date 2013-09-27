module Perspective {
  var pluginName = 'perspective';
  angular.module(pluginName, ['hawtioCore']).
          config(($routeProvider) => {
            $routeProvider.
                    when('/perspective/defaultPage', {templateUrl: 'app/perspective/html/defaultPage.html',
                      controller: Perspective.DefaultPageController});
          }).
          run(($location:ng.ILocationService, workspace:Workspace, viewRegistry, layoutFull, $rootScope, jolokia, localStorage) => {

            viewRegistry['perspective'] = layoutFull;

            $rootScope.$on('$locationChangeStart', (event, newRoute, oldRoute) => {

              var perspectives = Perspective.getPerspectives($location, workspace, jolokia, localStorage);
              var currentId = Perspective.currentPerspectiveId($location, workspace, jolokia, localStorage);

              var perspective = perspectives.find({id: currentId});

              if (perspective) {
                Core.pathSet(perspective, ['lastPage'], Core.extractHashURL(oldRoute));
              }
            });


          });

  hawtioPluginLoader.addModule(pluginName);
}
