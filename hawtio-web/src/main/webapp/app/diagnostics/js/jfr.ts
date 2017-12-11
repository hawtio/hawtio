/**
 * @module Diagnostics
 */
/// <reference path="diagnosticsPlugin.ts"/>
/// <reference path="../../forms/js/formInterfaces.ts"/>
module Diagnostics {

    function parseDumpFeedback(response:string ) {
        let parsed = response.match( /Dumped recording "(.+)", (.+) written to:\r?\n\r?\n(.+)/ );
        if(parsed && parsed.length == 4) {
            return {
                    number: parsed[1],
                    size: parsed[2],
                    file: parsed[3],
                    time: Date.now()
                };

            }
        return null;
    }

    function buildStartParams( jfrSettings: JfrSettings ) {
        const params = [];
        if ( jfrSettings.name && jfrSettings.name.length > 0 ) {
            params.push( 'name="' + jfrSettings.name + '"');
        }
        if ( jfrSettings.filename && jfrSettings.filename.length > 0 ) {
            params.push( 'filename="' + jfrSettings.filename + '"');
        }
        params.push( 'dumponexit=' + jfrSettings.dumpOnExit );
         if ( jfrSettings.limitType != 'unlimited' ) {
            params.push( jfrSettings.limitType + '=' + jfrSettings.limitValue );
        }

        return params;
    }

    function buildDumpParams( jfrSettings: JfrSettings ) {
        return [
            'filename="' + jfrSettings.filename + '"',
            'name="' + jfrSettings.name + '"'
        ];
    }
    interface JfrSettings {
        limitType: string;
        limitValue: string;
        recordingNumber: string;
        dumpOnExit: boolean;
        name: string;
        filename: string;
    }

    interface Recording {
        number: string;
        size: string;
        file: string;
        time: number;
    }

    interface JfrControllerScope extends ng.IScope {
        forms: any;
        jfrEnabled: boolean;
        isRecording: boolean;
        isRunning: boolean;
        jfrSettings: JfrSettings;
        unlock: () => void;
        startRecording: () => void;
        stopRecording: () => void;
        dumpRecording: () => void;
        formConfig: Forms.FormConfiguration;
        recordings: Array<Recording>;
        pid: string;
        jfrStatus: string;
        pageTitle: string;
        settingsVisible: boolean;
        toggleSettingsVisible: () => void;
        jcmd: string;
    }

    function updateJfrScope(response, scope: JfrControllerScope) : JfrControllerScope {
        let statusString = response.value;
        scope.jfrEnabled = statusString.indexOf("not enabled") == -1;
        scope.isRunning = statusString.indexOf("(running)") > -1;
        scope.isRecording = scope.isRunning || statusString.indexOf("(stopped)") > -1;
        if ((statusString.indexOf("Use JFR.") > -1 || statusString
                .indexOf("Use VM.") > -1)
            && scope.pid) {
            statusString = statusString.replace("Use ",
                "Use command line: jcmd " + scope.pid + " ");
        }
        scope.jfrStatus = statusString;
        if (scope.isRecording) {
            let regex = /recording=(\d+) name="(.+?)"/g;
            if (scope.isRunning) { //if there are several recordings (some stopped), make sure we parse the running one
                regex = /recording=(\d+) name="(.+?)".+?\(running\)/g;
            }

            const parsed = regex.exec(statusString);
            scope.jfrSettings.recordingNumber = parsed[1];
            scope.jfrSettings.name = parsed[2];
            const parsedFilename = statusString.match(/filename="(.+)"/);
            if (parsedFilename && parsedFilename[1]) {
                scope.jfrSettings.filename = parsedFilename[1];
            } else {
                scope.jfrSettings.filename = 'recording' + parsed[1] + '.jfr';
            }

        }
        return scope;
    }

    var JfrController = _module.controller( "Diagnostics.JfrController", ["$scope", "$location", "workspace", "jolokia", ( $scope: JfrControllerScope, $location: ng.ILocationService, workspace: Core.Workspace, jolokia: Jolokia.IJolokia ) => {

        function render( response ) {
            updateJfrScope(response, $scope);
            Core.$apply( $scope );
        }
        
        function addRecording(recording:Recording, recordings:Array<Recording>) {
            for(let i=0; i < recordings.length; i++) {
                if(recordings[i].file === recording.file) {
                    recordings[i] = recording;
                    return;
                }  
            }
            recordings.add(recording);
        }
        
        function showArguments(arguments: Array<any>) {
            let result = '';
            let first = true;
            for (let i = 0; i < arguments.length; i++) {
                if (first) {
                  first = false;
                } else {
                  result += ',';
                }
                result += arguments[i];
            }
            return result;
        }

        function executeDiagnosticFunction( operation: string, jcmd: string, arguments, callback ) {
            Diagnostics.log.debug( Date.now() + " Invoking operation "
                + operation + " with arguments" + arguments + " settings: " + JSON.stringify( $scope.jfrSettings ) );
            $scope.jcmd='jcmd ' + $scope.pid + ' ' + jcmd + ' ' + showArguments(arguments);
            jolokia.request( [{
                type: "exec",
                operation: operation,
                mbean: 'com.sun.management:type=DiagnosticCommand', 
                arguments: arguments
            }, {
                type: 'exec',
                operation: 'jfrCheck([Ljava.lang.String;)',
                mbean: 'com.sun.management:type=DiagnosticCommand',
                arguments: ['']
            }], onSuccess( function( response ) {

                Diagnostics.log.debug("Diagnostic Operation "
                    + operation + " was successful" + response.value );
                if ( response.request.operation.indexOf( "jfrCheck" ) > -1 ) {
                    render( response );
                } else {
                    if ( callback ) {
                        callback( response.value );
                    }
                    Core.$apply( $scope );
                }
            }, {error: function(response){
                        Diagnostics.log.warn("Diagnostic Operation "
                    + operation + " failed" , response );
                        }} ));
        }


        $scope.forms = {};
        $scope.pid = findMyPid($scope.pageTitle);
        $scope.recordings = [];
        $scope.settingsVisible=false;

        $scope.jfrSettings = {
            limitType: 'unlimited',
            limitValue: '',
            name: '',
            dumpOnExit: true,
            recordingNumber: '',
            filename: ''
        };


        $scope.formConfig = <Forms.FormConfiguration>{
            properties: <Forms.FormProperties>{
                name: <Forms.FormElement>{
                    type: "java.lang.String",
                    tooltip: "Name for this connection",
                    "input-attributes": {
                        "placeholder": "Recording name (optional)..."
                    }
                },
                limitType: <Forms.FormElement>{
                    type: "java.lang.String",
                    tooltip: "Duration if any",
                    enum: ['unlimited', 'duration', 'maxsize']
                },
                limitValue: <Forms.FormElement>{
                    type: "java.lang.String",
                    tooltip: "Limit value. duration: [val]s/m/h, maxsize: [val]kB/MB/GB",
                    required: false,
                    "input-attributes": {
                        "ng-show": "jfrSettings.limitType != 'unlimited'"
                    }
                },
                dumpOnExit: <Forms.FormElement>{
                    type: "java.lang.Boolean",
                    tooltip: "Automatically dump recording on VM exit"
                },
                filename: <Forms.FormElement>{
                    type: "java.lang.String",
                    tooltip: "Filename",
                    "input-attributes": {
                        "placeholder": "Specify file name *.jfr (optional)..."
                    }
                },
            }
        };

        $scope.unlock = () => {
            executeDiagnosticFunction( 'vmUnlockCommercialFeatures()', 'VM.unlock_commercial_features', [], null );
        };

        $scope.startRecording = () => {
            if($scope.isRecording) {//this means that there is a stopped recording, clear state before starting the next
                $scope.jfrSettings.name = null;
                $scope.jfrSettings.filename = null;
            }
            executeDiagnosticFunction( 'jfrStart([Ljava.lang.String;)', 'JFR.start', [buildStartParams( $scope.jfrSettings )], null );
        };

        $scope.dumpRecording = () => {

            executeDiagnosticFunction( 'jfrDump([Ljava.lang.String;)', 'JFR.dump',
                [buildDumpParams( $scope.jfrSettings )], ( response ) => {

                    const recoding = parseDumpFeedback(response);
                    Diagnostics.log.debug( "response: " + response
                        + " split: " + recoding + "split2: "
                        + recoding );
                    if ( recoding ) {

                        Diagnostics.log.debug( "data: "
                            + recoding );
                        addRecording(recoding, $scope.recordings);
                    }

                });


        };

        $scope.stopRecording = () => {
            const name = $scope.jfrSettings.name;
            $scope.jfrSettings.filename = '';
            $scope.jfrSettings.name = '';
            executeDiagnosticFunction( 'jfrStop([Ljava.lang.String;)', 'JFR.stop',
                ['name="' + name + '"'], null );
        };
        
        $scope.toggleSettingsVisible = () => {
            $scope.settingsVisible = !$scope.settingsVisible;
            Core.$apply($scope);
        };

        Core.register( jolokia, $scope, [{
            type: 'exec',
            operation: 'jfrCheck([Ljava.lang.String;)',
            mbean: 'com.sun.management:type=DiagnosticCommand',
            arguments: ['']
        }], onSuccess( render ) );




    }] );
}
