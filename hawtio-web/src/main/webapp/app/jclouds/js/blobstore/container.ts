/**
 * @module Jclouds
 */
module Jclouds {

    export function BlobstoreContainerController($scope, $filter:ng.IFilterService, workspace:Workspace, $routeParams) {
        $scope.blobstoreId = $routeParams.blobstoreId
        $scope.containerId = $routeParams.containerId;
        $scope.directory = $routeParams.directory;
        $scope.contents = [];
        $scope.breadcrumbs = loadBreadcrumbs($scope.blobstoreId, $scope.containerId, $scope.directory);

        $scope.contentTable = {
            data: 'contents',
            displayFooter: false,
            columnDefs: [
                {
                    field: 'name',
                    displayName: 'Content',
                    cellTemplate: '<div class="ngCellText"><a href="#/jclouds/blobstore/container/{{blobstoreId}}/{{containerId}}/{{row.entity.fullpath}}{{hash}}">{{row.getProperty(col.field)}}</a></div>',
                    cellFilter: ""
                },
                {
                    field: 'createdDate',
                    displayName: 'Created',
                    cellFilter: "date:'EEE, MMM d, y : hh:mm:ss a'"
                },
                {
                    field: 'lastModifiedDate',
                    displayName: 'Modified',
                    cellFilter: "date:'EEE, MMM d, y : hh:mm:ss a'"
                }
            ]
        };

        updateTableContents();

        function setContainers(containers) {
            $scope.contents = populatePathAndName(filterContainers(containers, $scope.directory), $scope.directory);
            Core.$apply($scope);
        };


        function updateTableContents() {
            var jolokia = workspace.jolokia;
            var blobstoreMbean = getSelectionJcloudsBlobstoreMBean(workspace, $scope.blobstoreId);

            if (blobstoreMbean) {
                if ($scope.directory) {
                    setContainers(jolokia.request(
                        {type: 'exec', mbean: blobstoreMbean, operation: 'list(java.lang.String, java.lang.String)', arguments: [$scope.containerId, $scope.directory] }).value
                    );
                } else {
                    setContainers(jolokia.request(
                        {type: 'exec', mbean: blobstoreMbean, operation: 'list(java.lang.String)', arguments: [$scope.containerId] }).value
                    );
                }
            }
        }

        function filterContainers(containers, directory) {
            return containers.filter(function (container) {
                return container.name !== directory
            });
        }

        function populatePathAndName(containers, directory) {
            var updatedContainers = [];
            angular.forEach(containers , (container) => {
                var updateContainer = container;
                updateContainer.fullpath = container.name;
                if (updateContainer.name.startsWith(directory)) {
                    updateContainer.name = updateContainer.name.substring(directory.length + 1);
                }
                updatedContainers.push(updateContainer);
            });
            return updatedContainers;
        }

            $scope.isBlob = (container) => {
            return container.type === 'BLOB';
        }

        function loadBreadcrumbs(blobstore, container, directory) {
            var href = "#/jclouds/blobstore/container/" + blobstore + "/" +  container;
            var breadcrumbs = [
                {href: href, name: "/" + container}
            ];

            var array = directory ? directory.split("/") : [];
            angular.forEach(array, (name) => {
                if (!name.startsWith("/") && !href.endsWith("/")) {
                    href += "/";
                }
                href += name;
                breadcrumbs.push({href: href, name: name});
            });
            return breadcrumbs;
        }
   }
}
