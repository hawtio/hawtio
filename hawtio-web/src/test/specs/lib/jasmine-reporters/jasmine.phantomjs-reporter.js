(function() {

    if (! jasmine) {
        throw new Exception("jasmine library does not exist in global namespace!");
    }

    function elapsed(startTime, endTime) {
        return (endTime - startTime)/1000;
    }

    function ISODateString(d) {
        function pad(n) { return n < 10 ? '0'+n : n; }

        return d.getFullYear() + '-'
            + pad(d.getMonth()+1) +'-'
            + pad(d.getDate()) + 'T'
            + pad(d.getHours()) + ':'
            + pad(d.getMinutes()) + ':'
            + pad(d.getSeconds());
    }

    function trim(str) {
        return str.replace(/^\s+/, "" ).replace(/\s+$/, "" );
    }

    function escapeInvalidXmlChars(str) {
        return str.replace(/\&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/\>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/\'/g, "&apos;");
    }

    /**
     * PhantomJS Reporter generates JUnit XML for the given spec run.
     * Allows the test results to be used in java based CI.
     * It appends some DOM elements/containers, so that a PhantomJS script can pick that up.
     *
     * @param {boolean} consolidate whether to save nested describes within the
     *                  same file as their parent; default: true
     * @param {boolean} useDotNotation whether to separate suite names with
     *                  dots rather than spaces (ie "Class.init" not
     *                  "Class init"); default: true
     */
    var PhantomJSReporter =  function(consolidate, useDotNotation) {
        this.consolidate = consolidate === jasmine.undefined ? true : consolidate;
        this.useDotNotation = useDotNotation === jasmine.undefined ? true : useDotNotation;
    };  

    PhantomJSReporter.prototype = {
        reportRunnerStarting: function(runner) {
            this.log("Runner Started.");
        },

        reportSpecStarting: function(spec) {
            spec.startTime = new Date();

            if (! spec.suite.startTime) {
                spec.suite.startTime = spec.startTime;
            }

            this.log(spec.suite.description + ' : ' + spec.description + ' ... ');
        },

        reportSpecResults: function(spec) {
            var results = spec.results();
            spec.didFail = !results.passed();
            spec.status = spec.didFail ? 'Failed.' : 'Passed.';
            if (results.skipped) {
                spec.status = 'Skipped.';
            }
            this.log(spec.status);

            spec.duration = elapsed(spec.startTime, new Date());
            spec.output = '<testcase classname="' + this.getFullName(spec.suite) +
                '" name="' + escapeInvalidXmlChars(spec.description) + '" time="' + spec.duration + '">';

            var failure = "";
            var failures = 0;
            var resultItems = results.getItems();
            for (var i = 0; i < resultItems.length; i++) {
                var result = resultItems[i];

                if (result.type == 'expect' && result.passed && !result.passed()) {
                    failures += 1;
                    failure += (failures + ": " + escapeInvalidXmlChars(result.message) + " ");
                }
            }
            if (failure) {
                spec.output += "<failure>" + trim(failure) + "</failure>";
            }
            spec.output += "</testcase>";
        },

        reportSuiteResults: function(suite) {
            var results = suite.results();
            var specs = suite.specs();
            var specOutput = "";
            // for JUnit results, let's only include directly failed tests (not nested suites')
            var failedCount = 0;

            suite.status = results.passed() ? 'Passed.' : 'Failed.';
            suite.statusPassed = results.passed();
            if (results.totalCount === 0) { // todo: change this to check results.skipped
                suite.status = 'Skipped.';
            }

            // if a suite has no (active?) specs, reportSpecStarting is never called
            // and thus the suite has no startTime -- account for that here
            suite.startTime = suite.startTime || new Date();
            suite.duration = elapsed(suite.startTime, new Date());

            for (var i = 0; i < specs.length; i++) {
                failedCount += specs[i].didFail ? 1 : 0;
                specOutput += "\n  " + specs[i].output;
            }
            suite.output = '\n<testsuite name="' + this.getFullName(suite) +
                '" errors="0" tests="' + specs.length + '" failures="' + failedCount +
                '" time="' + suite.duration + '" timestamp="' + ISODateString(suite.startTime) + '">';
            suite.output += specOutput;
            suite.output += "\n</testsuite>";
            this.log(suite.description + ": " + results.passedCount + " of " + results.totalCount + " expectations passed.");
        },

        reportRunnerResults: function(runner) {
            this.log("Runner Finished.");
            var suites = runner.suites(),
                passed = true;
            for (var i = 0; i < suites.length; i++) {
                var suite = suites[i],
                    filename = 'TEST-' + this.getFullName(suite, true) + '.xml',
                    output = '<?xml version="1.0" encoding="UTF-8" ?>';
                    
                passed = !suite.statusPassed ? false : passed;

                // if we are consolidating, only write out top-level suites
                if (this.consolidate && suite.parentSuite) {
                    continue;
                }
                else if (this.consolidate) {
                    output += "\n<testsuites>";
                    output += this.getNestedOutput(suite);
                    output += "\n</testsuites>";
                    this.createSuiteResultContainer(filename, output);
                }
                else {
                    output += suite.output;
                    this.createSuiteResultContainer(filename, output);
                }
            }
            this.createTestFinishedContainer(passed);
        },

        getNestedOutput: function(suite) {
            var output = suite.output;
            for (var i = 0; i < suite.suites().length; i++) {
                output += this.getNestedOutput(suite.suites()[i]);
            }
            return output;
        },

        createSuiteResultContainer: function(filename, xmloutput) {
            jasmine.phantomjsXMLReporterResults = jasmine.phantomjsXMLReporterResults || [];
            jasmine.phantomjsXMLReporterResults.push({
                "xmlfilename" : filename,
                "xmlbody" : xmloutput
            });
        },
        
        createTestFinishedContainer: function(passed) {
            jasmine.phantomjsXMLReporterPassed = passed
        },

        getFullName: function(suite, isFilename) {
            var fullName;
            if (this.useDotNotation) {
                fullName = suite.description;
                for (var parentSuite = suite.parentSuite; parentSuite; parentSuite = parentSuite.parentSuite) {
                    fullName = parentSuite.description + '.' + fullName;
                }
            }
            else {
                fullName = suite.getFullName();
            }

            // Either remove or escape invalid XML characters
            if (isFilename) {
                return fullName.replace(/[^\w]/g, "");
            }
            return escapeInvalidXmlChars(fullName);
        },

        log: function(str) {
            var console = jasmine.getGlobal().console;

            if (console && console.log) {
                console.log(str);
            }
        }
    };

    // export public
    jasmine.PhantomJSReporter = PhantomJSReporter;
})();
