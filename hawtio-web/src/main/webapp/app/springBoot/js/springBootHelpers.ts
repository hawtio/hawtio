module SpringBoot {

    export var metricsMBean = 'org.springframework.boot:type=Endpoint,name=metricsEndpoint';

    export var metricsMBeanOperation = 'getData()';

    export function callIfSpringBootAppAvailable(jolokia, callbackFunc) {
        jolokia.execute(metricsMBean, metricsMBeanOperation, onSuccess(function (data) {
            callbackFunc()
        }));
    }

    // Printing user friendly metrics

    var metricsFriendlyNames = {
        'counter.status.200.favicon.ico': 'Successful Favicon requests',
        'counter.status.200.jolokia': 'Successful Jolokia requests',
        'counter.status.200.jolokia.exec.org.springframework.boot:type=Endpoint,name=metricsEndpoint.getData()': 'Successful metrics Jolokia requests',
        'counter.status.200.jolokia.read.java.lang:type=Runtime.Name': 'Successful Jolokia Runtime.Name reads',
        'counter.status.200.jolokia.root': 'Successful Jolokia root requests',
        'counter.status.200.jolokia.search.*:type=Connector,*': 'Successful Jolokia connectors search queries',
        'counter.status.200.metrics': 'Successful metrics REST requests',
        'counter.status.405.auth.login.root': 'Method Not Allowed (405) login responses',
        'gauge.response.auth.login.root': 'Authentication time (ms)',
        'gauge.response.jolokia': 'Jolokia response time (ms)',
        'gauge.response.jolokia.exec.org.springframework.boot:type=Endpoint,name=metricsEndpoint.getData()': 'Metrics Jolokia response time (ms)',
        'gauge.response.jolokia.root': 'Jolokia root response time (ms)',
        'gauge.response.metrics': 'Metrics response time (ms)',
        'gc.ps_marksweep.count': 'Parallel scavenge mark-sweep collector count',
        'gc.ps_marksweep.time':	'Parallel scavenge mark-sweep collector time (ms)',
        'gc.ps_scavenge.count':	'Parallel scavenge collector count',
        'gc.ps_scavenge.time': 'Parallel scavenge collector time (ms)',
        'mem': 'Memory used (bytes)',
        'mem.free': 'Memory available (bytes)',
        'processors': 'Processors number',
        'uptime': 'Node uptime (ms)',
        'instance.uptime': 'Service uptime (ms)',
        'heap.committed': 'Heap committed (bytes)',
        'heap.init': 'Initial heap (bytes)',
        'heap.used': 'Heap used (bytes)',
        'heap': 'Total Heap (bytes)',
        'classes': 'Classes',
        'classes.loaded': 'Classes loaded',
        'classes.unloaded': 'Classes unloaded',
        'threads' : 'Threads count',
        'threads.daemon': 'Daemon threads',
        'threads.peak' : 'Threads peak count'
    };

    export function convertRawMetricsToUserFriendlyFormat(scope, data) {
        var userFriendlyData = [];
        var metricIndex;
        for (metricIndex in Object.keys(data)) {
            var metric = Object.keys(data)[metricIndex];
            var friendlyName = metricsFriendlyNames[metric];
            if (!friendlyName) {
                userFriendlyData[metricIndex] = {code: metric, name: metric, value: data[metric]}
            } else {
                userFriendlyData[metricIndex] = {code: metric, name: friendlyName, value: data[metric]}
            }
        }
        scope.metrics = userFriendlyData;
        scope.$apply();
    }

}
