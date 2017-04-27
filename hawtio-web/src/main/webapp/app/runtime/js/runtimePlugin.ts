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
        vmName: string;
        version: string;
        build: string;
        vendor: string;
        os: string;
        osVersion: string;
        architecture: string;
        user: string;
        pid: string;
        host: string;
        startTime: string;
        commandLine: string;
        workingDirectory: string;
        showFilterBar: boolean;
        systemProperties: Array<SystemProperty>;    
    }


    export var pluginName = 'runtime_plugin';
    export var log: Logging.Logger = Logger.get( 'Runtime' );
    export var contextPath = "app/runtime";
    export var templatePath = Runtime.contextPath + "/html/";

    export var _module = angular.module( pluginName, ['hawtioCore'] );
    _module.config(
        ['$routeProvider', ( $routeProvider:ng.route.IRouteProvider ) => {

            $routeProvider.when( '/runtime_plugin', {
                templateUrl: templatePath + 'runtime.html'
            });
        }] );


    _module.run(( workspace:Workspace, viewRegistry, layoutFull ) => {

        log.info( Runtime.pluginName, " loaded" );
        viewRegistry[pluginName] = layoutFull;

        workspace.topLevelTabs.push( {
            id: "runtime",
            content: "Runtime",
            title: "Java Runtime Process Information",
            isValid: ( workspace ) => {
                return true;
            },
            href: function() {
                return "#/" + pluginName;
            },
            isActive: function( workspace ) {
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
    _module.controller( "Runtime.RuntimeController", ["$scope", "jolokia", "workspace", ( $scope:RuntimeControllerScope, jolokia: Jolokia.IJolokia, workspace:Workspace ) => {

        $scope.gridOptions = setupGridOptions();

        // register a watch with jolokia on this mbean to
        // get updated metrics
        Core.register( jolokia, $scope, {
            type: 'read',
            mbean: 'java.lang:type=Runtime',
            arguments: []
        }, onSuccess( render ) );

        function reconstructCommandLine( runtime ) {
            var commandLine = '';
            var javaHome = runtime.SystemProperties['java.home'];
            if ( javaHome ) {
                var fileSeparator = runtime.SystemProperties['file.separator'];
                commandLine += javaHome + fileSeparator + 'bin' + fileSeparator;
            }
            commandLine += 'java ';

            for (var i=0;i< runtime.InputArguments.lenght; i++ ) {
                commandLine += escapeSpaces( runtime.InputArguments[i] ) + ' ';
            }
            commandLine += '-classpath ' + runtime.SystemProperties['java.class.path'] + ' ';
            commandLine += runtime.SystemProperties['sun.java.command'];
            return commandLine;
        }

        function escapeSpaces( string ) {
            return string.replace( / /g, '\\ ' );
        }

        // update display of metric
        function render( response ) {
            $scope.vmName = response.value['VmName'];
            $scope.version = response.value['SpecVersion'];
            $scope.build = response.value['VmVersion'];
            $scope.vendor = response.value['VmVendor'];
            $scope.os = response.value.SystemProperties['os.name'];
            $scope.osVersion = response.value.SystemProperties['os.version'];
            $scope.architecture = response.value.SystemProperties['os.arch'];
            $scope.user = response.value.SystemProperties['user.name'];
            var regex = /(\d+)@(.+)/g;
            var pidAndHost = regex.exec( response.value.Name );
            $scope.pid = pidAndHost[1];
            $scope.host = pidAndHost[2];
            $scope.startTime = response.value['StartTime'];
            $scope.commandLine = reconstructCommandLine( response.value );
            $scope.workingDirectory = response.value.SystemProperties['user.dir'];

            //system property table
            $scope.showFilterBar = true;
            $scope.systemProperties = [];

            var systemProperties: { [index: string]: string; } = response.value['SystemProperties'];

            for(var key in systemProperties)  {
                $scope.systemProperties.push( { name: key, value: systemProperties[key] });
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
                primaryKeyFn: function( entity, idx ) {
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

