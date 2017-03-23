/**
 * @module Diagnostics
 */
/// <reference path="./diagnosticsPlugin.ts"/>
module Diagnostics {

    _module.controller( "Diagnostics.FlagsController", ["$scope", "$window", "$location", "localStorage", "workspace", "jolokia", "mbeanName", ( $scope, $window, $location, localStorage: WindowLocalStorage, workspace, jolokia, mbeanName ) => {

        Diagnostics.configureScope( $scope, $location, workspace );
        $scope.flags = [];
        $scope.tableDef=tableDef();


        Core.register(jolokia, $scope, {
                type: 'read',
                mbean: 'com.sun.management:type=HotSpotDiagnostic',
                arguments: []
                
            }, onSuccess(render));




        function render( response ) {
            $scope.flags = response.value.DiagnosticOptions;
            Core.$apply( $scope );
        }


        function tableDef() {
            return {
                selectedItems: [],
                data: 'flags',
                showFilter: true,
                filterOptions: {
                    filterText: ''
                },
                showSelectionCheckbox: false,
                enableRowClickSelection: true,
                multiSelect: false,
                primaryKeyFn: function( entity, idx ) {
                    return entity.name;
                },
                columnDefs: [
                    {
                        field: 'name',
                        displayName: 'VM Flag',
                        resizable: true
                    }, {
                        field: 'origin',
                        displayName: 'Origin',
                        resizable: true
                    }, {
                        field: 'value',
                        displayName: 'Value',
                        resizable: true,
                        cellTemplate: '<div>{{row.entity.value}}<button ng-show="row.entity.writeable">{{row.entity.writeable}}</button></div>'
                    }]
            };

        }
    }] );

}
