'use string';

/* Jasmine Unit Tests - Filters */

describe("log filtering", function() {
    beforeEach(module("log"));

    var _filterLogLevelFilter;
    var logs;
    var unfilteredLogs;

    // The naming of this is important, it has a trailing 'Filter' added to it
    beforeEach(inject(function(filterLogLevelFilter) {
         _filterLogLevelFilter = filterLogLevelFilter;

        // Set up the test data - This can be moved to an external data file
        logs = {
            TRACE: [],
            DEBUG: [],
            INFO: [
                {
                    "host": "ubuntu", "exception": null, "properties": {}, "message": "created logQuery: org.fusesource.insight.log.log4j.Log4jLogQuery@1a3e9cb",
                    "timestamp": "2013-02-17T14:34:59-08:00", "level": "INFO", "thread": "io.hawt.sample.Main.main()",
                    "containerName": null, "fileName": "?", "logger": "io.hawt.sample.Main", "seq": 1361140499866,
                    "lineNumber": "?", "className": "?", "methodName": "?", "$$hashKey": "01Z"
                }
            ],
            WARN: [
                {
                    "host": "ubuntu", "exception": null, "properties": {}, "message": "Don't run with scissors!",
                    "timestamp": "2013-02-17T14:34:59-08:00", "level": "WARN", "thread": "io.hawt.sample.Main.main()",
                    "containerName": null, "fileName": "?", "logger": "io.hawt.sample.Main", "seq": 1361140499866,
                    "lineNumber": "?", "className": "?", "methodName": "?", "$$hashKey": "021"
                }
            ],
            ERROR: [
                {
                    "host": "ubuntu", "exception": null, "properties": {}, "message": "Someone somewhere is not using Fuse! :)",
                    "timestamp": "2013-02-17T14:34:59-08:00", "level": "ERROR", "thread": "io.hawt.sample.Main.main()",
                    "containerName": null, "fileName": "?", "logger": "io.hawt.sample.Main", "seq": 1361140499866,
                    "lineNumber": "?", "className": "?", "methodName": "?", "$$hashKey": "023"
                }
            ]
        };

        unfilteredLogs = [].concat(logs.TRACE, logs.DEBUG, logs.INFO, logs.WARN, logs.ERROR);
    }));

    describe("filtering by exact match", function() {
        it("should return the same dataset when queried with no input", function() {
            expect(_filterLogLevelFilter(unfilteredLogs, "", true)).toEqual(unfilteredLogs);
        });

        it("should return only 'WARN' logs when 'WARN' is given", function() {
            expect(_filterLogLevelFilter(unfilteredLogs, "WARN", true)).toEqual(logs.WARN);
        });
    });

    describe("filtering by ordinal value ", function() {
        it("should return the same dataset when in ordinal filter", function() {
            expect(_filterLogLevelFilter(unfilteredLogs, "", false)).toEqual(unfilteredLogs);
        });

        it("should show 'WARN' and 'ERROR' messages when 'WARN' is selected", function() {
            expect(_filterLogLevelFilter(unfilteredLogs, "WARN", false)).toEqual([].concat(logs.WARN, logs.ERROR));
        });
    });

});