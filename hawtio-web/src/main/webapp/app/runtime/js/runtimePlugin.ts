/**
 * @module Runtime
 * 
 * The main entry point for the Runtime module
 * 
 */
/// <reference path="../../baseIncludes.ts"/>
/// <reference path="../../core/js/coreHelpers.ts"/>
module Runtime {

    interface SystemProperty {
        name: string;
        value: string;
    }

    interface RuntimeControllerScope extends ng.IScope {
        gridOptions: any;
        pid: string;
        host: string;
        workingDirectory: string;
        showFilterBar: boolean;
        systemProperties: Array<SystemProperty>;
        vmArgs: string;
        javaPath: string;
        runtime: Runtime;
        classPath: string;
    }
    
    interface Runtime {
        VmName: string;
        SpecVersion: string;
        VmVersion: string;
        VmVendor: string;
        StartTime: string;
        SystemProperties: { [index: string]: string; };
        Name: string;
        InputArguments: Array<string>;
        ClassPath: string;
    }


    export var pluginName = 'runtime_plugin';
    export var log: Logging.Logger = Logger.get( 'Runtime' );
    export var contextPath = "app/runtime";
    export var templatePath = Runtime.contextPath + "/html/";

    export var _module = angular.module( pluginName, ['hawtioCore'] );
    _module.config(
        ['$routeProvider', ( $routeProvider: ng.route.IRouteProvider ) => {

            $routeProvider.when( '/runtime_plugin', {
                templateUrl: templatePath + 'runtime.html'
            });
        }] );


    _module.run(( workspace: Workspace, viewRegistry, layoutFull ) => {

        viewRegistry[pluginName] = layoutFull;

        workspace.topLevelTabs.push( {
            id: "runtime",
            content: "Runtime",
            title: "Java Runtime Process Information",
            isValid: ( workspace:Workspace ) => {
                return true;
            },
            href: () => {
                return "#/" + pluginName;
            },
            isActive: ( workspace:Workspace ) => {
                return workspace.isLinkActive( pluginName );
            }
        });

    });

	/**
	 * @function RuntimeController
	 * @param $scope
	 * @param jolokia
	 * 
	 * The controller for runtime.html, only requires the jolokia service from
	 * hawtioCore
	 * 
	 */
    _module.controller( "Runtime.RuntimeController", ["$scope", "jolokia", "workspace", ( $scope: RuntimeControllerScope, jolokia: Jolokia.IJolokia, workspace: Workspace ) => {

        $scope.gridOptions = setupGridOptions();

        // register a watch with jolokia on this mbean to
        // get updated metrics
        Core.register( jolokia, $scope, {
            type: 'read',
            mbean: 'java.lang:type=Runtime',
            arguments: []
        }, onSuccess( render ) );

        function javaPath( runtime: Runtime ) {
            var commandLine = '';
            var javaHome = runtime.SystemProperties['java.home'];
            if ( javaHome ) {
                var fileSeparator = runtime.SystemProperties['file.separator'];
                commandLine += javaHome + fileSeparator + 'bin' + fileSeparator;
            }
            commandLine += 'java ';
            return commandLine;
        }
        function vmArgs( runtime:Runtime ) {

            var commandLine: string = "";
            for (var argument in runtime.InputArguments) {
                commandLine += escapeSpaces( runtime.InputArguments[argument] ) + ' ';
            }
            return commandLine;
        }

        function escapeSpaces( argument:string ) {
            return argument.replace( / /g, '\\ ' );
        }

        // update display of metric
        function render( response ) {
            var runtime:Runtime = response.value;
            $scope.runtime = runtime;
//            $scope.user = runtime.SystemProperties['user.name'];
            var regex = /(\d+)@(.+)/g;
            var pidAndHost = regex.exec( runtime.Name );
            $scope.pid = pidAndHost[1];
            $scope.host = pidAndHost[2];
            $scope.javaPath = javaPath( runtime );
            $scope.classPath = escapeSpaces(runtime.ClassPath);
            $scope.vmArgs = vmArgs( runtime );
            $scope.workingDirectory = runtime.SystemProperties['user.dir'];

            //system property table
            $scope.showFilterBar = true;
            $scope.systemProperties = [];

            for ( var key in runtime.SystemProperties ) {
                $scope.systemProperties.push( { name: key, value: runtime.SystemProperties[key] });
            }
            Core.$apply( $scope );
        }

        function setupGridOptions() {

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
    }] );
    hawtioPluginLoader.addModule( pluginName );
};

