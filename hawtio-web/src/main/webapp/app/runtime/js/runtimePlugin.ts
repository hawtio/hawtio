/**
 * @module Runtime
 * 
 * The main entry point for the Runtime module
 * 
 */
/// <reference path="../../baseIncludes.ts"/>
/// <reference path="../../core/js/coreHelpers.ts"/>
module Runtime {

    interface Threading {
        ThreadCount: number;
        PeakThreadCount: number;
    }

    interface ClassLoading {
        LoadedClassCount: number;
        TotalLoadedClassCount: number;
    }

    interface OperatingSystem {
        Name: string;
        Arch: string;
        Version: string;
        AvailableProcessors: string;
        MaxFileDescriptorCount: number;
        OpenFileDescriptorCount: number;
        ProcessCpuLoad: number;
        ProcessCpuTime: number;
        SystemCpuLoad: number;
        SystemLoadAverage: number;
        FreePhysicalMemorySize: number;
        TotalPhysicalMemorySize: number;
        TotalSwapSpaceSize: number;
        FreeSwapSpaceSize: number;
    }


    interface SystemProperty {
        name: string;
        value: string;
    }

    interface Metric {
        index: number;//to prevent default sorting on names alphabetically
        name: string;
        category: string;
        value: any;
        referenceValue: any;
        link: string;
    }

    interface MbeanHandler {
        mbean: string;
        callback: ( value: any ) => void;
    }



    interface RuntimeControllerScope extends ng.IScope {
        systemPropertiesTableConfig: any;
        metricsTableConfig: any;
        pid: string;
        host: string;
        workingDirectory: string;
        systemProperties: Array<SystemProperty>;
        vmArgs: string;
        javaPath: string;
        runtime: Runtime;
        threading: Threading;
        operatingSystem: OperatingSystem;
        heapUsage: MemoryUsage;
        classLoading: ClassLoading;
        classPath: string;
        updaters: { [index: string]: ( any ) => void };
        metrics: Array<Metric>;
        uptime: String;
        garbageCollectors: { [index: string]: GarbageCollector };
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
        Uptime: number;
    }

    interface MemoryUsage {
        used: number;
        max: number;
        init: number;
        committed: number;
    }

    interface Memory {
        HeapMemoryUsage: MemoryUsage;
    }

    interface GarbageCollector {
        Name: string;
        CollectionCount: number;
        CollectionTime: number;
    }


    export var pluginName = 'runtime_plugin';
    export var log: Logging.Logger = Logger.get( 'Runtime' );
    export var contextPath = "app/runtime";
    export var templatePath = Runtime.contextPath + "/html/";

    export var _module = angular.module( pluginName, ['hawtioCore'] );

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
    function vmArgs( runtime: Runtime ) {

        var commandLine: string = "";
        for ( var argument in runtime.InputArguments ) {
            commandLine += escapeSpaces( runtime.InputArguments[argument] ) + ' ';
        }
        return commandLine;
    }

    function escapeSpaces( argument: string ) {
        return argument.replace( / /g, '\\ ' );
    }

    function deriveMetrics( scope: RuntimeControllerScope, filter: ng.IFilterService ) {

        function toPercentage( value: number ) {
            return filter( "number" )( value * 100.0, 2 ) + '%';
        }

        function withSpaceAsThousandSeparator( value: number ) {
            var firstString: string = '' + value;
            var formatted: string = '';
            for ( var i = 0; i < firstString.length; i++ ) {
                var character = firstString.charAt( i );
                if ( ( firstString.length - i ) % 3 == 0 ) {
                    formatted += ' ';
                }
                formatted += character;
            }
            return formatted;
        }

        function separatedAndWithPercent( value: number, referenceValue: number ) {
            var result = withSpaceAsThousandSeparator( value );
            result += ' (';
            result += toPercentage( 1.0 * value / referenceValue );
            result += ')';
            return result;
        }

        var newMetrics: Array<Metric> = [];
        var index = 1;

        if ( scope.operatingSystem ) {
            var osLink = 'jmx/attributes?nid=root-java.lang-OperatingSystem';
            newMetrics.push( { index: index++, name: 'File descriptors (open/max)', category: 'OS', value: withSpaceAsThousandSeparator( scope.operatingSystem.OpenFileDescriptorCount ), referenceValue: withSpaceAsThousandSeparator( scope.operatingSystem.MaxFileDescriptorCount ), link: osLink });
            newMetrics.push( { index: index++, name: 'System CPU load', category: 'OS', value: toPercentage( scope.operatingSystem.SystemCpuLoad ), referenceValue: '' , link: osLink});
            newMetrics.push( {
                index: index++, name: 'Physical memory (free/total)', category: 'OS', link: osLink,
                value: separatedAndWithPercent( scope.operatingSystem.FreePhysicalMemorySize, scope.operatingSystem.TotalPhysicalMemorySize ),
                referenceValue: withSpaceAsThousandSeparator( scope.operatingSystem.TotalPhysicalMemorySize )
            });

            newMetrics.push( {
                index: index++, name: 'Swap memory space (free/total)', category: 'OS', link: osLink,
                value: separatedAndWithPercent( scope.operatingSystem.FreeSwapSpaceSize, scope.operatingSystem.TotalSwapSpaceSize ),
                referenceValue: withSpaceAsThousandSeparator( scope.operatingSystem.TotalSwapSpaceSize )
            });

            newMetrics.push( {
                index: index++, name: 'Process CPU (load/time)', category: 'OS', link: osLink,
                value: toPercentage( scope.operatingSystem.ProcessCpuLoad ),
                referenceValue: Core.humanizeMilliseconds( scope.operatingSystem.ProcessCpuTime / 1000000 )
            });

        }

        if ( scope.heapUsage ) {
            newMetrics.push( {
                index: index++, name: 'Heap usage (used/max)', category: 'Memory', link: 'diagnostics/heap',
                value: separatedAndWithPercent( scope.heapUsage.used, scope.heapUsage.max ),
                referenceValue: withSpaceAsThousandSeparator( scope.heapUsage.max )
            });
        }

        if ( scope.threading ) {
            newMetrics.push( { index: index++, name: 'Thread count (current/peak)', category: 'Threads', link: 'threads',
                value: scope.threading.ThreadCount, referenceValue: scope.threading.PeakThreadCount });
        }

        if ( scope.classLoading ) {
            newMetrics.push( { index: index++, name: 'Classes loaded (current/peak)', category: 'Code', link: 'diagnostics/heap',
                value: withSpaceAsThousandSeparator( scope.classLoading.LoadedClassCount ), 
                referenceValue: withSpaceAsThousandSeparator( scope.classLoading.TotalLoadedClassCount ) });
        }

        for ( var name in scope.garbageCollectors ) {
            var garbageCollector: GarbageCollector = scope.garbageCollectors[name];

            newMetrics.push( { index: index++, name: garbageCollector.Name + ' (collections/time)', category: 'GC', link: 'jmx/attributes?nid=root-java.lang-GarbageCollector',
                value: garbageCollector.CollectionCount, referenceValue: withSpaceAsThousandSeparator( garbageCollector.CollectionTime ) });
        
        }
        return newMetrics;
    }

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
            isValid: ( workspace: Workspace ) => {
                return true;
            },
            href: () => {
                return "#/" + pluginName;
            },
            isActive: ( workspace: Workspace ) => {
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
    _module.controller( "Runtime.RuntimeController", ["$scope", "jolokia", "workspace", "$filter", ( $scope: RuntimeControllerScope, jolokia: Jolokia.IJolokia, workspace: Workspace, $filter ) => {

        // update display of metric
        function render( response ) {
            var mbean = response.request.mbean;
            var updater = $scope.updaters[mbean];
            if ( updater ) {
                updater( response.value );

            }
            if ( mbean = 'java.lang:type=Memory' ) { //the last response
                $scope.metrics = deriveMetrics( $scope, $filter );
                Core.$apply( $scope );
            }

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

        function metricsTableConfig() {

            return {
                selectedItems: [],
                data: 'metrics',
                showFilter: true,
                filterOptions: {
                    filterText: ''
                },
                showSelectionCheckbox: false,
                enableRowClickSelection: true,
                multiSelect: false,
                primaryKeyFn: ( entity, idx ) => {
                    return entity.index;
                },
                columnDefs: [
                    {
                        field: 'index',
                        displayName: '#'
                    },
                    {
                        field: 'name',
                        displayName: 'Metric',
                        resizable: true
                    },
                    {
                        field: 'category',
                        displayName: 'Category',
                        resizable: true,
                        cellTemplate: '<div class="ngCellText ng-binding" title="row.entity.category"><a href="{{row.entity.link}}">{{row.entity.category}}</a></div>'
                    },
                    {
                        field: 'value',
                        displayName: 'Value',
                        resizable: true,
                        cellTemplate: '<div class="align-right ngCellText ng-binding" title="row.entity.value">{{row.entity.value}}</div>'
                    },
                    {
                        field: 'referenceValue',
                        displayName: '',
                        resizable: true,
                        cellTemplate: '<div class="align-right ngCellText ng-binding" title="row.entity.referenceValue">{{row.entity.referenceValue}}</div>'

                    }
                ]
            };

        }

        $scope.systemPropertiesTableConfig = systemPropertiesTableConfig();
        $scope.metricsTableConfig = metricsTableConfig();
        $scope.updaters = {};
        $scope.garbageCollectors = {};
        $scope.updaters['java.lang:type=Runtime'] = ( runtime: Runtime ) => {
            $scope.runtime = runtime;
            //        $scope.user = runtime.SystemProperties['user.name'];
            var regex = /(\d+)@(.+)/g;
            var pidAndHost = regex.exec( runtime.Name );
            $scope.pid = pidAndHost[1];
            $scope.host = pidAndHost[2];
            $scope.javaPath = javaPath( runtime );
            $scope.classPath = escapeSpaces( runtime.ClassPath );
            $scope.vmArgs = vmArgs( runtime );
            $scope.workingDirectory = runtime.SystemProperties['user.dir'];

            //system property table
            $scope.systemProperties = [];
            $scope.uptime = Core.humanizeMilliseconds( runtime.Uptime );

            for ( var key in runtime.SystemProperties ) {
                $scope.systemProperties.push( { name: key, value: runtime.SystemProperties[key] });
            }

        };
        $scope.updaters['java.lang:type=Threading'] = ( threading: Threading ) => { $scope.threading = threading };
        $scope.updaters['java.lang:type=OperatingSystem'] = ( operatingSystem: OperatingSystem ) => { $scope.operatingSystem = operatingSystem; };
        $scope.updaters['java.lang:type=ClassLoading'] = ( classLoading: ClassLoading ) => { $scope.classLoading = classLoading; };
        //find garbage collectors (if any in JMX tree and set up for metrics calculation)
        if ( workspace.tree ) {
            var collectors = workspace.tree.get( 'java.lang' ).map['GarbageCollector'];
            if ( collectors && collectors.children ) {
                for ( var i = 0; i < collectors.children.length; i++ ) {
                    var collector = collectors.children[i];
                    var mbeanKey = '' + collector.domain + ':type=' + collector.entries['type'] + ',name=' + collector.entries['name'];
                    $scope.updaters[mbeanKey] = ( garbageCollector: GarbageCollector ) => { $scope.garbageCollectors[garbageCollector.Name] = garbageCollector; };
                }
            }
        }
        $scope.updaters['java.lang:type=Memory'] = ( memory: Memory ) => { $scope.heapUsage = memory.HeapMemoryUsage };


        var requests = [];
        for ( var mbean in $scope.updaters ) {
            requests.push( {
                type: 'read',
                mbean: mbean,
                arguments: []
            });
        }

        Core.register( jolokia, $scope, requests, onSuccess( render ) );


    }] );
    hawtioPluginLoader.addModule( pluginName );
};

