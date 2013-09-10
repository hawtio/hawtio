module Osgi {
    export function ServiceDependencyController($scope, $element, workspace:Workspace, osgiDataService: OsgiDataService) {

        osgiDataService.register(function() {
            $scope.$apply(function() {
                createGraph();
                //$scope.bundles = osgiDataService.getBundles();
            });
        });

        createGraph();

        function createGraph() {

            var canvasDiv = $element;
            var svg = canvasDiv.children("svg")[0];

            var nodes = [];
            var transitions = [];

            $scope.bundles = osgiDataService.getBundles();

            $scope.bundles.forEach((bundle) => {

               if (bundle.RegisteredServices.length > 0 || bundle.ServicesInUse.length > 0) {

                   var node = {
                       id: "Bundle-" + bundle.Identifier,
                       label: bundle.SymbolicName
                   };

                   bundle.RegisteredServices.forEach((sid) => {
                       var svcNode = {
                           id: "Service-" + sid,
                           label: "" + sid
                       };

                       nodes.push(svcNode);

                       transitions.push({
                           source: "Bundle-" + bundle.Identifier,
                           target: "Service-" + sid
                       });
                   });

                   bundle.ServicesInUse.forEach((sid) => {
                       transitions.push({
                           source: "Service-" + sid,
                           target: "Bundle-" + bundle.Identifier
                       });
                   });

                   nodes.push(node);
               }

            });

            Core.dagreLayoutGraph(nodes, transitions, 400, 400, svg);
        }

        function getHeight() {
            return $($element).height();
        }

        function getWidth() {
            return $($element).width();
        }
    }

}
