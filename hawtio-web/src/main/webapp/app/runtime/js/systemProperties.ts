///<reference path="./runtimeExports.ts"/>
module Runtime {
    interface SystemProperty {
        name: string;
        value: string;
    }
    
    interface SystemPropertiesControllerScope extends ng.IScope {
        systemPropertiesTableConfig: any;
        systemProperties: Array<SystemProperty>;
    }
    
    function systemPropertiesTableConfig() {

        return {
            selectedItems: [],
            data: 'systemProperties',
            showFilter: true,
            filterOptions: {
                filterText: ''
            },
            showSelectionCheckbox: false,
            enableRowClickSelection: true,
            multiSelect: false,
            primaryKeyFn: ( entity, idx ) => {
                return entity.name;
            },
            columnDefs: [
                {
                    field: 'name',
                    displayName: 'Property',
                    resizable: true,
                    cellTemplate: '<div class="forceBreakLongLines hardWidthLimitM" zero-clipboard data-clipboard-text="{{row.entity.name}}">{{row.entity.name}}</div>'
                },
                {
                    field: 'value',
                    displayName: 'Value',
                    resizable: true,
                    cellTemplate: '<div class="forceBreakLongLines hardWidthLimitM" zero-clipboard data-clipboard-text="{{row.entity.value}}">{{row.entity.value}}</div>'
                }
            ]
        };

    }

    _module.controller( "Runtime.SystemPropertiesController", ["$scope", "jolokia", "workspace", ( $scope: SystemPropertiesControllerScope, jolokia: Jolokia.IJolokia, workspace: Workspace ) => {
        $scope.systemPropertiesTableConfig = systemPropertiesTableConfig();
        $scope.systemProperties = [];
        function render( response )  {
            var runtime: Runtime = response.value;
            //system property table
            $scope.systemProperties = [];
            for ( var key in runtime.SystemProperties ) {
                $scope.systemProperties.push( { name: key, value: runtime.SystemProperties[key] });
            }
            Core.$apply($scope);
        }
        
        Core.register( jolokia, $scope, {
            
                type: 'read',
                mbean: runtimeMbean,
                arguments: []
            }
        , onSuccess( render ) );

    }]);
}