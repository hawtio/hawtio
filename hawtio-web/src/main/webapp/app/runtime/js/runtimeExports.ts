/**
 * @module Runtime
 * 
 * Define shared code for this module
 * 
 */
module Runtime {

    export interface Runtime {
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

    export interface OperatingSystem {
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


    export var pluginName = 'runtime';
    export var log: Logging.Logger = Logger.get( 'Runtime' );
    export var contextPath = "app/runtime";
    export var templatePath = Runtime.contextPath + "/html/";
    export var runtimeMbean = 'java.lang:type=Runtime';
    export var osMbean = 'java.lang:type=OperatingSystem';

    export var _module = angular.module( pluginName, ['hawtioCore'] );
    
    export function configureScope($scope, $location:ng.ILocationService, workspace:Workspace) {

      $scope.isActive = (href) => {
        var tidy = Core.trimLeading(href, "#");
        var loc = $location.path();
        return loc === tidy;
      };

      $scope.isValid = (link) => {
        return link && link.isValid(workspace);
      };

      $scope.breadcrumbs = [
        {
          content: 'Overview',
          title: "Summary of Java process",
          isValid: (workspace:Workspace) => true,
          href: "#/runtime/overview"
        },
        {
          content: 'System Properties',
          title: "List system properties",
          isValid: (workspace:Workspace) => true,
          href: "#/runtime/systemProperties"
        },
        {
          content: 'Metrics',
          title: "JVM Flags",
          isValid: (workspace:Workspace) => true,
          href: "#/runtime/metrics"
        }
      ];
    }

};

