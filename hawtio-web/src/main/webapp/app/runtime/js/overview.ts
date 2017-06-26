/// <reference path="./runtimeExports.ts"/>
module Runtime {



    interface OverviewControllerScope extends ng.IScope {
        pid: string;
        host: string;
        workingDirectory: string;
        vmArgs: string;
        javaPath: string;
        runtime: Runtime;
        operatingSystem: OperatingSystem;
        classPath: string;
        uptime: String;
    }

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
    function vmArgs( runtime: Runtime ):string {

        var commandLine: string = "";
        for ( var argument in runtime.InputArguments ) {
            commandLine += escapeSpaces( runtime.InputArguments[argument] ) + ' ';
        }
        return commandLine;
    }

    function escapeSpaces( argument: string ):string {
        return argument.replace( / /g, '\\ ' );
    }

    _module.controller( "Runtime.OverviewController", ["$scope", "jolokia", "workspace", "$location", ( $scope: OverviewControllerScope, jolokia: Jolokia.IJolokia, workspace: Workspace, $location: ng.ILocationService ) => {
        configureScope( $scope, $location, workspace );

        function render( response ) {
            var mbean: string = response.request.mbean;
            if ( mbean === runtimeMbean ) {
                var runtime: Runtime = response.value;
                $scope.runtime = runtime;
                var regex = /(\d+)@(.+)/g;
                var pidAndHost = regex.exec( runtime.Name );
                $scope.pid = pidAndHost[1];
                $scope.host = pidAndHost[2];
                $scope.javaPath = javaPath( runtime );
                $scope.classPath = escapeSpaces( runtime.ClassPath );
                $scope.vmArgs = vmArgs( runtime );
                $scope.workingDirectory = runtime.SystemProperties['user.dir'];
                $scope.uptime = Core.humanizeMilliseconds( runtime.Uptime );
            } else if ( mbean === osMbean ) {
                $scope.operatingSystem = response.value;
            }
            Core.$apply( $scope );

        }

        Core.register( jolokia, $scope, [{
            type: 'read',
            mbean: runtimeMbean,
            arguments: []
        }, {
            type: 'read',
            mbean: osMbean,
            arguments: []
        }], onSuccess( render ) );
    }] );
};

