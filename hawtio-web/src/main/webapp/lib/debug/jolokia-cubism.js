/*
 * Copyright 2012 Roland Huss
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Jolokia integration into cubism (http://square.github.com/cubism/)
 *
 * This integration requires the following
 */

(function () {
    var builder = function (cubism,Jolokia) {
        
        var VERSION = "1.1.3";
        
        var ctx_jolokia = function (url, opts) {
            var source = {},
                context = this,
                j4p = createAgent(url, opts),
                step = 5e3;                    // 5 seconds by default

            try
            {
                // Connect to start and stop events
                context.on("start",function() {
                    j4p.start();
                });

                context.on("stop",function() {
                    j4p.stop();
                });
            }
            catch(err)
            {
                // Still waiting for pull request https://github.com/square/cubism/pull/19 for supporting
                // "start" and "stop" events
            }

            /**
             * Factory method for create a metric objects which has various variants.
             *
             * If the first argument is a Jolokia request object (i.e. not a function), this request
             * is used for sending requests periodically.
             *
             * If the first argument is a function, this function is used for calculating the numeric value
             * to be plotted. The rest of the arguments can be one or more request objects, which are registered and their
             * responses are put as arguments to the given callback function.
             *
             * The last argument, if an object but not a Jolokia request (i.e. there is no <code>type</code> key), is
             * taken as an option object with the following possible keys:
             *
             * <ul>
             *   <li><b>name</b>: name used in charts</li>
             *   <li><b>delta</b>: delta value in milliseconds for creating delta (velocity) charts. This is done by
             *            taking the value measured that many milliseconds ago and subtract them from each other.</li>
             *   <li><b>keepDelay</b>: how many seconds back the fetched values should be kept.</li>
             * </ul>
             *
             * Finally, if the last argument is a pure string, then this string is used as name for the chart.
             *
             * @return the metric objects which can be used in Cubism for creating charts.
             */
            source.metric = function () {
                var values = [];
                // If the first argument is a function, this callback function is used for calculating the
                // value of a data point. The remaining arguments should be one or more Jolokia requests objects
                // and the callback function given will be called with as many response objects after each server query.
                // The callback function needs to return a single calculated numerical value
                var name;
                var argsLen = arguments.length;
                var options = {};

                // Create metric upfront so that it can be used in extraction functions. The name defaults to the mbean name
                // but can be given as first argument
                var lastIdx = arguments.length - 1;
                var lastArg = arguments[lastIdx];
                if (typeof lastArg == "string") {
                    name = lastArg;
                    argsLen = lastIdx;
                }
                // Options can be given as an object (but not a request with a 'type' property)
                if (typeof lastArg == "object" && !lastArg.type) {
                    options = lastArg;
                    name = options.name;
                    argsLen = lastIdx;
                }
                if (!name && typeof arguments[0] != "function") {
                    name = arguments[0].mbean;
                }

                // Metric which maps our previously locally stored values to the ones requested by cubism
                var metric = context.metric(mapValuesFunc(values, options.keepDelay, context.width), name);
                if (options.delta) {
                    // Use cubism metric chaining for calculating the difference value and keep care that the
                    // metric keeps old values up to the delta value
                    var prevMetric = metric.shift(-options.delta);
                    metric = metric.subtract(prevMetric);
                    if (name) {
                        metric.toString = function () {
                            return name
                        };
                    }
                }

                // If an extraction function is given, this can be used for fine grained manipulations of
                // the answer
                if (typeof arguments[0] == "function") {
                    var func = arguments[0];
                    var respFunc = function (resp) {
                        var isError = false;
                        for (var i = 0; i < arguments.length; i++) {
                            if (j4p.isError(arguments[i])) {
                                isError = true;
                                break;
                            }
                        }
                        values.unshift(
                            { time:Date.now(), value:isError ? NaN : func.apply(metric, arguments) }
                        );
                    };
                    var args = [ respFunc ];
                    for (var i = 1; i < argsLen; i++) {
                        args.push(arguments[i]);
                    }
                    j4p.register.apply(j4p, args);
                } else {
                    // Register the argument given directly as a Jolokia request. The request must return a single
                    // numerical value
                    var request = arguments[0];
                    j4p.register(function (resp) {
                        values.unshift({
                            time: Date.now(),
                            value:j4p.isError(resp) ? NaN : Number(resp.value)
                        });
                    }, request);
                }

                return metric;
            };

            // Start up fetching of values in the background
            source.start = function (newStep) {
                newStep = newStep || step;
                j4p.start(newStep);
            };

            // Stop fetching of values in the background
            source.stop = function() { j4p.stop() };

            // Check whether the scheduler is running
            source.isRunning = function() { return j4p.isRunning() };

            // Startup poller which will call the agent periodically
            return source;

            // =======================================================================================
            // Private helper method

            // Create a new Jolokia agent or reuse a given one
            function createAgent(url, opts) {
                if (url instanceof Jolokia) {
                    return url;
                } else {
                    var args;
                    if (typeof url == "string") {
                        args = {url:url};
                        if (opts) {
                            for (var key in opts) {
                                if (opts.hasOwnProperty(key)) {
                                    args[key] = opts[key];
                                }
                            }
                        }
                    } else {
                        args = url;
                    }
                    return new Jolokia(args);
                }
            }

            // Generate function which picks the requested values from the values
            // stored periodically by the Jolokia poller.
            function mapValuesFunc(values, keepDelay, width) {
                return function (cStart, cStop, cStep, callback) {
                    cStart = +cStart;
                    cStop = +cStop;
                    var retVals = [],
                        cTime = cStop,
                        vLen = values.length,
                        vIdx = 0,
                        vStart = vLen > 0 ? values[vLen - 1].time : undefined;

                    if (!vLen || cStop < vStart) {
                        // Nothing fetched yet or seeked interval doesn't overlap with stored values --> return only NaNs
                        for (var t = cStart; t <= cStop; t += cStep) {
                            retVals.push(NaN);
                        }
                        return callback(null, retVals);
                    }

                    // Fill up wit NaN until we reach the first stored val
                    while (cTime > values[0].time + cStep) {
                        retVals.unshift(NaN);
                        cTime -= cStep;
                    }

                    while (cTime >= cStart && cTime >= vStart) {
                        // Count down stored values until we find the next best 'fit'
                        // (equals or closest before the step-calculated ime)
                        while (values[vIdx].time > cTime) {
                            vIdx++;
                        }
                        retVals.unshift(values[vIdx].value);
                        cTime -= cStep;
                    }

                    // Finally prepend with 'NaN' for data not yet fetched
                    while (cTime >= cStart) {
                        retVals.unshift(NaN);
                        cTime -= cStep;
                    }

                    // Remove older values
                    if (vLen > width) {
                        if (!keepDelay) {
                            values.length = width;
                        } else {
                            var keepUntil = values[width].time - keepDelay,
                                i = width;
                            while (i < vLen && values[i].time > keepUntil) {
                                i++;
                            }
                            values.length = i;
                        }
                    }
                    callback(null, retVals);
                }
            }
        };
        ctx_jolokia.VERSION = VERSION;

        cubism.context.prototype.jolokia  = ctx_jolokia;
        return ctx_jolokia;
    };

    // =====================================================================================================
    // Register either at the global Jolokia object global or as an AMD module
    (function (root) {
        if (typeof define === 'function' && define.amd) {
            // AMD. Register as a named module
            define(["cubism","jolokia"],function (cubism,Jolokia) {
                return builder(cubism,Jolokia);
            });
        } else {
            if (root.Jolokia && root.cubism) {
                builder(root.cubism,root.Jolokia);
            } else {
                console.error("No " + (root.cubism ? "Cubism" : "Jolokia") + " definition found. " +
                              "Please include jolokia.js and cubism.js before jolokia-cubism.js");
            }
        }
    })(this);
})();



