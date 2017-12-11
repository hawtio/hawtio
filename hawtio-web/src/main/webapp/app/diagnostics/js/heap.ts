/**
 * @module Diagnostics
 */
/// <reference path="./diagnosticsPlugin.ts"/>
/// <reference path="./diagnosticHelpers.ts"/>
/// <reference path="../../ide/js/openInIdeDirective.ts"/>
module Diagnostics {

    interface ClassStats {
        num: string;
        count: string;
        bytes: string;
        name: string;
        deltaCount: string;
        deltaBytes: string;
        sourceReference: IDE.SourceReference;
    }

    interface HeapControllerScope extends ng.IScope {
        classHistogram: string;
        status: string;
        loading: boolean;
        pid: string;
        lastLoaded: any;
        loadClassStats: () => void;
        classes: Array<ClassStats>;
        tableDef: any;
        pageTitle: string;
        instanceCounts: any;
        byteCounts: any;
    }
    
    _module.controller( "Diagnostics.HeapController", ["$scope",  "jolokia", ( $scope: HeapControllerScope, jolokia: Jolokia.IJolokia ) => {

        $scope.classHistogram = '';
        $scope.status = '';
        $scope.tableDef = tableDef();
        $scope.classes = [{ num: null, count: null, bytes: null, deltaBytes: null, deltaCount: null, name: 'Click reload to read class histogram', sourceReference: null }];
        $scope.loading = false;
        $scope.lastLoaded = 'n/a';
        $scope.pid = findMyPid($scope.pageTitle);

        $scope.loadClassStats = () => {
            $scope.loading = true;
            Core.$apply( $scope );
            jolokia.request( {
                type: 'exec',
                mbean: 'com.sun.management:type=DiagnosticCommand',
                operation: 'gcClassHistogram([Ljava.lang.String;)',
                arguments: ['']
            }, {
                    success: render,
                    error: ( response ) => {
                        $scope.status = 'Could not get class histogram : ' + response.error;
                        $scope.loading = false;
                        Core.$apply( $scope );
                    }
                });
        };


        function render( response ) {
            $scope.classHistogram = response.value;
            const lines = response.value.split('\n');
            const parsed = [];
            const classCounts = {};
            const bytesCounts = {};
            for (let i = 0; i < lines.length; i++ ) {
                const values = lines[i].match(/\s*(\d+):\s*(\d+)\s*(\d+)\s*(\S+)\s*/);
                if ( values && values.length >= 5 ) {
                    const className = translateJniName(values[4]);
                    const count = values[2];
                    const bytes = values[3];
                    const sourceReference = javaSource(className);
                    const entry = {
                        num: values[1],
                        count: count,
                        bytes: bytes,
                        name: className,
                        deltaCount: findDelta($scope.instanceCounts, className, count),
                        deltaBytes: findDelta($scope.byteCounts, className, bytes),
                        sourceReference: sourceReference,
                    };

                    parsed.push( entry );
                    classCounts[className] = count;
                    bytesCounts[className] = bytes;
                }
            }
            $scope.classes = parsed;
            $scope.instanceCounts = classCounts;
            $scope.byteCounts = bytesCounts;
            $scope.loading = false;
            $scope.lastLoaded = Date.now();
            Core.$apply( $scope );
        }

        function findDelta( oldCounts, className, newValue ) {
            if ( !oldCounts ) {
                return '';
            }
            const oldValue = oldCounts[className];
            if ( oldValue ) {
                return oldValue - newValue;
            } else {
                return newValue;
            }
        }

        function numberColumnTemplate( field ) {
            return '<div class="rightAlignedNumber ngCellText" title="{{row.entity.' + field + '}}">{{row.entity.' + field + '}}</div>';
        }

        function tableDef() {
            return {
                selectedItems: [],
                data: 'classes',
                showFilter: true,
                filterOptions: {
                    filterText: ''
                },
                showSelectionCheckbox: false,
                enableRowClickSelection: true,
                multiSelect: false,
                primaryKeyFn: function( entity, idx ) {
                    return entity.num;
                },
                columnDefs: [
                    {
                        field: 'num',
                        displayName: '#',
                    }, {
                        field: 'count',
                        displayName: 'Instances',
                        cellTemplate: numberColumnTemplate('count')
                    }, {
                        field: 'deltaCount',
                        displayName: '<delta',
                        cellTemplate: numberColumnTemplate('deltaCount')
                    }, {
                        field: 'bytes',
                        displayName: 'Bytes',
                        cellTemplate: numberColumnTemplate('bytes')
                    }, {
                        field: 'deltaBytes',
                        displayName: '<delta',
                        cellTemplate: numberColumnTemplate('deltaBytes')
                    }, {
                        field: 'name',
                        displayName: 'Class name',
                        cellTemplate: '<span ng-switch on="!!row.entity.sourceReference"><hawtio-open-ide ng-switch-when="true" file-name="{{row.entity.sourceReference.fileName}}" class-name="{{row.entity.sourceReference.className}}"></hawtio-open-ide> {{row.entity.name}}</span>'
                    }]
            };

        }

        function translateJniName( name ) {
            if ( name.length == 1 ) {
                switch ( name.charAt( 0 ) ) {
                    case 'I':
                        return 'int';
                    case 'S':
                        return 'short';
                    case 'C':
                        return 'char';
                    case 'Z':
                        return 'boolean';
                    case 'D':
                        return 'double';
                    case 'F':
                        return 'float';
                    case 'J':
                        return 'long';
                    case 'B':
                        return 'byte';
                }
            } else {
                switch ( name.charAt( 0 ) ) {
                    case '[':
                        return translateJniName( name.substring( 1 ) ) + '[]';
                    case 'L':
                        if(name.endsWith(';')) {
                          return translateJniName(name.substring(1, name.indexOf(';')));
                        }
                    default:
                        return name;
                }
            }

        }
        
        function javaSource(className):IDE.SourceReference {
            let baseName = className;

            //trim array types
            if(baseName.indexOf('[') > -1) {
                baseName = baseName.substring(0, className.indexOf('['));
            }

            const lastPackage = baseName.lastIndexOf('.');
            if(lastPackage < 0) {
                return null;
            }

            let simpleName = baseName.substring(lastPackage + 1);
            const nestedClassIndex = simpleName.indexOf('$');
            if(nestedClassIndex > -1) {
                simpleName = simpleName.substring(0, nestedClassIndex);
            }
            
            return {
                className: baseName,
                fileName: simpleName + '.java',
                line: null,
                column: null
            };
        }


    }] );

}
