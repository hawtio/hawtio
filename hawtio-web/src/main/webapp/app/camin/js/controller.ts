/// <reference path="camelInsightPlugin.ts"/>
module Camin {

    _module.controller("Camin.Controller", ["$scope", "jolokia", "localStorage", "$routeParams", ($scope, jolokia, localStorage, $routeParams) => {

        $scope.query = "";
        $scope.result = "";
        $scope.breadcrumbs = [ ];

        $scope.onQueryChange = function() {
            $scope.result = "Querying exchanges related to " + $scope.query;
            $scope.breadcrumbs = [ $scope.query ];
            request();
        }

        var request = function() {
            var queryStr = "exchange.id:\""
                + $scope.breadcrumbs.join("\" or exchange.id:\"") + "\" or "
                +"exchange.in.headers.ExtendedBreadcrumb:\""
                + $scope.breadcrumbs.join("\" or exchange.in.headers.ExtendedBreadcrumb:\"") + "\" or "
                + "exchange.out.headers.ExtendedBreadcrumb:\""
                + $scope.breadcrumbs.join("\" or exchange.out.headers.ExtendedBreadcrumb:\"") + "\"";
            var query = { "query": { "query_string": { "query": queryStr } },
                          "fields": [ "exchange.id", "exchange.in.headers.ExtendedBreadcrumb", "exchange.out.headers.ExtendedBreadcrumb" ],
                          "from":0,
                          "size":1000
                        };
            var jreq = { type: 'exec',
                         mbean: 'org.elasticsearch:service=restjmx',
                         operation: 'exec',
                         arguments: [ 'POST', '/_all/camel/_search', angular.toJson(query) ] };
            jolokia.request(jreq, { method: 'POST',
              error: function(response) {
                $scope.result = $scope.result + "<br/>" + "Error: " + angular.toJson(response);
              },
              success: function(response) {
                var data : any = jQuery.parseJSON(response.value);
                var oldsize = $scope.breadcrumbs.length;
                for (var i = 0; i < data['hits']['hits'].length; i++) {
                    var fields = data['hits']['hits'][i].fields;
                    var concat = function(breadcrumbs) {
                        if ( breadcrumbs ) {
                            if ( typeof breadcrumbs === 'string' ) {
                                breadcrumbs = [ breadcrumbs ];
                            }
                            for (var j = 0; j < breadcrumbs.length; j++) {
                                var id = breadcrumbs[j];
                                if ( $scope.breadcrumbs.indexOf( id ) < 0 ) {
                                    $scope.breadcrumbs.push( id );
                                }
                            }
                        }
                    }
                    concat( fields["exchange.in.headers.ExtendedBreadcrumb"] );
                    concat( fields["exchange.out.headers.ExtendedBreadcrumb"] );
                }
                $scope.result = $scope.result + "<br/>" + "Found " + data.hits.total + " ids";
                if (oldsize != $scope.breadcrumbs.length) {
                    request();
                } else {
                    var ids = [ ];
                    for (var i = 0; i < data['hits']['hits'].length; i++) {
                        var id = data['hits']['hits'][i].fields["exchange.id"];
                        if ( ids.indexOf( id ) < 0 ) {
                            ids.push( id );
                        }
                    }
                    var queryStr = "exchange.id:\"" + ids.join("\" or exchange.id:\"") + "\"";
                    $scope.result = $scope.result + "<br/>" + query;
                    var query = { "query": { "query_string": { "query": queryStr } },
                                  "from": 0,
                                  "size": 1000,
                                  "sort": [ "timestamp" ]
                                };
                    var jreq = { type: 'exec',
                                 mbean: 'org.elasticsearch:service=restjmx',
                                 operation: 'exec',
                                 arguments: [ 'POST', '/_all/camel/_search', angular.toJson(query) ] };
                    jolokia.request(jreq, { method: 'POST',
                        error: function(response) {
                            $scope.result = $scope.result + "<br/>" + "Error: " + angular.toJson(response);
                        },
                        success: function(response) {
                            var data = jQuery.parseJSON(response.value);
                            $scope.result = $scope.result + "<br/>" + "Found " + data['hits']['total'] + " exchanges";
                            var events = [ ];
                            for (var i = 0; i < data['hits']['hits'].length; i++) {
                                var e = data['hits']['hits'][i]._source;
                                events.push( e );
                            }
                            draw(events);
                        }
                    });
                }
            }});
        }

        var isoDate = function(date: string): number {
            var timestamp, struct, minutesOffset = 0;
            var numericKeys = [ 1, 4, 5, 6, 7, 10, 11 ];
            // ES5 §15.9.4.2 states that the string should attempt to be parsed as a Date Time String Format string
            // before falling back to any implementation-specific date parsing, so that’s what we do, even if native
            // implementations could be faster
            //              1 YYYY                2 MM       3 DD           4 HH    5 mm       6 ss        7 msec        8 Z 9 ±    10 tzHH    11 tzmm
            if ((struct = /^(\d{4}|[+\-]\d{6})(?:-(\d{2})(?:-(\d{2}))?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{3}))?)?(?:(Z)|([+\-])(\d{2})(?::(\d{2}))?)?)?$/.exec(date))) {
                // avoid NaN timestamps caused by “undefined” values being passed to Date.UTC
                for (var i = 0, k; (k = numericKeys[i]); ++i) {
                    struct[k] = +struct[k] || 0;
                }

                // allow undefined days and months
                struct[2] = (+struct[2] || 1) - 1;
                struct[3] = +struct[3] || 1;

                if (struct[8] !== 'Z' && struct[9] !== undefined) {
                    minutesOffset = struct[10] * 60 + struct[11];

                    if (struct[9] === '+') {
                        minutesOffset = 0 - minutesOffset;
                    }
                }

                timestamp = Date.UTC(struct[1], struct[2], struct[3], struct[4], struct[5] + minutesOffset, struct[6], struct[7]);
            }
            else {
                timestamp = Date.parse(date);
            }

            return timestamp;
        }

        var buildSequence = function(events) {
            var sequence = new Sequence();
            var exchangeToExec = { };
            // Sort events
            events = events.sort(function(a,b) { return isoDate(a.timestamp) - isoDate(b.timestamp); })
            // Extract endpoints and executions
            for (var i = 0; i < events.length; i++) {
                if (events[i].event === 'Created') {
                    var evtCreated   = events[i];
                    var evtCompleted = null;
                    for (var j = 0; j < events.length; j++) {
                        if (events[j].event === 'Completed' && evtCreated.exchange.id === events[j].exchange.id) {
                            evtCompleted = events[j];
                            break;
                        }
                    }
                    if (evtCompleted === null) {
                        console.log('Could not find matching Completed exchange for ' + evtCreated.exchange.id);
                        continue;
                    }
                    // We use the completed event here because the created event may miss the routeId information
                    var endpoint = sequence.endpoint(evtCompleted.exchange.fromEndpoint,
                                                     evtCompleted.exchange.routeId,
                                                     evtCompleted.exchange.contextId,
                                                     evtCompleted.host);
                    var exec = sequence.exec( evtCreated.exchange.id, endpoint, isoDate(evtCreated.timestamp), isoDate(evtCompleted.timestamp) );
                    exchangeToExec[ evtCreated.exchange.id ] = exec;
                }
            }
            // Extract calls
            var calls = { };
            for (var i = 0; i < events.length; i++) {
                if (events[i].event === 'Sending' && events[i].exchange.in && events[i].exchange.in.headers) {
                    var callId = events[i].exchange.in.headers.AuditCallId;
                    if (callId && calls[callId] === undefined) {
                        var evtSending = events[i];
                        var evtSent    = null;
                        var evtCreated = null;
                        for (var j = 0; j < events.length; j++) {
                            if (events[j].event === 'Sent' && evtSending.exchange.id === events[j].exchange.id
                                    && events[j].exchange.in.headers.AuditCallId === callId) {
                                evtSent = events[j];
                                break;
                            }
                        }
                        for (var j = 0; j < events.length; j++) {
                            if (events[j].event === 'Created' && evtSending.exchange.id !== events[j].exchange.id
                                    && events[j].exchange.in.headers.AuditCallId === callId) {
                                evtCreated = events[j];
                                break;
                            }
                        }
                        var execA = exchangeToExec[ evtSending.exchange.id ];
                        var execB = evtCreated ? exchangeToExec[ evtCreated.exchange.id ] : null;
                        if (evtSent !== null && evtCreated !== null && execA !== null && execB != null) {
                            var call = sequence.call( callId, execA, execB, isoDate(evtSending.timestamp), isoDate(evtSent.timestamp) );
                            calls[callId] = call;
                        } else {
                            console.log("Could not find Execution for exchange " + evtSending.exchange.id);
                        }
                    }
                }
            }
            return sequence;
        }

        var buildDiagram = function(sequence) {
            var diagram = new Diagram();
            var actors = { };
            var signals = [ ];
            var base = sequence.start();
            for (var i = 0; i < sequence.endpoints.length; i++) {
                var actor = diagram.actor("ep" + i);
                var ep = sequence.endpoints[i];
                var key = ep.url + "|" + ep.routeId + "|" + ep.contextId + "|" + ep.host;
                actors[ key ] = actor;
            }
            for (var i = 0; i < sequence.calls.length; i++) {
                var call   = sequence.calls[i];
                if ( call.execB ) {
                    var epA    = call.execA.endpoint;
                    var keyA   = epA.url + "|" + epA.routeId + "|" + epA.contextId + "|" + epA.host;
                    var epB    = call.execB.endpoint;
                    var keyB   = epB.url + "|" + epB.routeId + "|" + epB.contextId + "|" + epB.host;
                    var actorA = actors[ keyA ];
                    var actorB = actors[ keyB ];
                    var start1 = call.start - base;
                    var stop1  = call.execB.start - base;
                    var start2 = call.execB.stop - base;
                    var stop2  = call.stop - base;
                    signals.push( { actorA: actorA,
                                    actorB: actorB,
                                    message: start1 + "ms - " + stop1 + "ms",
                                    timestamp: start1 });
                    signals.push( { actorA: actorB,
                                    actorB: actorA,
                                    message: start2 + "ms - " + stop2 + "ms",
                                    timestamp: start2 });
                }
            }
            signals = signals.sort(function(a,b) { return a.timestamp - b.timestamp });
            for (var i = 0; i < signals.length; i++) {
                diagram.signal( signals[i].actorA, signals[i].actorB, signals[i].message );
            }
            return diagram;
        }

        var buildGantt = function( sequence ) {
            var gantt = new Gantt();
            for (var i = 0; i < sequence.endpoints.length; i++) {
                var endpoint = sequence.endpoints[i];
                var resource = gantt.resource(endpoint);
                for (var j = 0; j < sequence.execs.length; j++) {
                    var exec = sequence.execs[j];
                    if (exec.endpoint === endpoint) {
                        gantt.task(resource, exec.start, exec.stop, exec);
                    }
                }
            }
            for (var i = 0; i < sequence.calls.length; i++) {
                var call = sequence.calls[i];
                if (call.execB) {
                    var taskA = gantt.taskByData(call.execA);
                    var taskB = gantt.taskByData(call.execB);
                    gantt.link(call.start, taskA, call.stop, taskB, call);
                }
            }
            gantt.layout();
            return gantt;
        }

        var eventTypeValue = { "Created": 0, "Sending": 1, "Sent": 2, "Completed": 3 };

        var draw = function(events) {
            $scope.definition = "";

            events = events.sort(function (a,b) { return isoDate(a.timestamp) - isoDate(b.timestamp); });
            console.log( events );

            var sequence = buildSequence( events );
            console.log( sequence );

            var gantt = buildGantt( sequence );
            console.log( gantt );
            $('#gantt').html('');
            drawGantt('#gantt', gantt);

            var diagram = buildDiagram( sequence );
            console.log( diagram );
            $('#diagram').html('');
            drawDiagram('#diagram', diagram);
        }

        var drawDiagram = function(container, diagram) {

            var arrow_size = 10;
            var margin = 10;
            var actor_width = 100;
            var actor_margin = 30;
            var actor_height = 40;
            var signal_height = 30;
            var actor_font = 20;
            var signal_font = 14;
            var width = diagram.actors.length * (actor_width + actor_margin * 2);
            var height = (diagram.signals.length + 1) * signal_height + actor_height * 2 + margin * 2;

            var svg = d3.select(container)
                .append('svg')
                .attr('width', width + 2 * margin)
                .attr('height', height + 2 * margin);
            var g = svg
                .append('g')
                .attr('text-anchor', 'middle');
            for (var i = 0; i < diagram.actors.length; i++) {
                var actor = diagram.actors[i];
                var gu = g
                    .append('g')
                    .attr('transform', 'translate(' + (i * (actor_width + actor_margin * 2) + actor_margin) + ',' + actor_height + ')');
                gu.append('rect')
                    .attr('width', actor_width)
                    .attr('height', actor_height)
                    .attr('stroke', '#000')
                    .attr('stroke-width', '2')
                    .attr('fill', '#FFFFFF');
                gu.append('text')
                    .attr('x', actor_width/2)
                    .attr('y', actor_height/2)
                    .attr('stroke-width', '0')
                    .attr('dominant-baseline', 'middle')
                    .attr('font-size', actor_font)
                    .text(actor.name);

                g.append('line')
                    .attr('x1', i * (actor_width + actor_margin * 2) + actor_width / 2 + actor_margin)
                    .attr('y1', actor_height * 2)
                    .attr('x2', i * (actor_width + actor_margin * 2) + actor_width / 2 + actor_margin)
                    .attr('y2', height - actor_height)
                    .attr('stroke', '#000')
                    .attr('stroke-width', '2');

                var gu = g
                    .append('g')
                    .attr('transform', 'translate(' + (i * (actor_width + actor_margin * 2) + actor_margin) + ',' + (height - actor_height) + ')');
                gu.append('rect')
                    .attr('width', actor_width)
                    .attr('height', actor_height)
                    .attr('stroke', '#000')
                    .attr('stroke-width', '2')
                    .attr('fill', 'white');
                gu.append('text')
                    .attr('x', actor_width/2)
                    .attr('y', actor_height/2)
                    .attr('stroke-width', '0')
                    .attr('dominant-baseline', 'middle')
                    .attr('font-size', actor_font)
                    .text(actor.name);
            }
            for (var i = 0; i < diagram.signals.length; i++) {
                var x;
                var y;
                var length;
                var direction;
                var text;

                x = diagram.signals[i].actorA.index * (actor_width + actor_margin * 2) + actor_width / 2 + actor_margin;
                y = (i + 1) * signal_height + actor_height * 2;
                length = Math.abs(diagram.signals[i].actorA.index - diagram.signals[i].actorB.index) * (actor_width + actor_margin * 2);
                direction = diagram.signals[i].actorB.index > diagram.signals[i].actorA.index ? +1 : -1;
                text = diagram.signals[i].message;

                var gu = g
                    .append('g')
                    .attr('transform', 'translate(' + x + ',' + y + ')')
                    .attr('stroke-width', '2');
                gu.append('rect')
                    .attr('x', Math.min(3, length*direction+3))
                    .attr('y', '-16')
                    .attr('width', Math.abs((length-6)*direction))
                    .attr('height', '19')
                    .attr('stroke', 'white')
                    .attr('stroke-width', '0')
                    .attr('fill', 'white');
                gu.append('line')
                    .attr('x1', 0)
                    .attr('y1', 0)
                    .attr('x2', length*direction)
                    .attr('y2', 0)
                    .attr('stroke', '#000')
                    .attr('stroke-width', '2');
                gu.append('line')
                    .attr('x1', length*direction - arrow_size*direction)
                    .attr('y1', -arrow_size)
                    .attr('x2', length*direction)
                    .attr('y2', 0)
                    .attr('stroke', '#000')
                    .attr('stroke-width', '2');
                gu.append('line')
                    .attr('x1', length*direction)
                    .attr('y1', 0)
                    .attr('x2', length*direction - arrow_size*direction)
                    .attr('y2', arrow_size)
                    .attr('stroke', '#000')
                    .attr('stroke-width', '2');
                gu.append('text')
                    .attr('x', length*direction/2)
                    .attr('y', -8)
                    .attr('stroke-width', '0')
                    .attr('dominant-baseline', 'middle')
                    .attr('font-size', signal_font)
                    .text(text);
            }
        }

        var drawGantt = function(container, gantt) {
            var lineHeight = 35;
            var lineMargin = 3;
            var arrowWidth = 4;

            var width = 800;
            var height = lineHeight * gantt.resources.length;
            var margin = {
            	top : 20,
            	right : 40,
            	bottom : 20,
            	left : 250
            };

            var begin = gantt.start;
            var end   = gantt.stop;

            var x = d3.scale.linear().domain([ begin - (end - begin) * 0.1, end + (end - begin) * 0.1 ]).range([ 0, width ]);
            var yt = function(t) { return t.resource.index * lineHeight + lineMargin + t.index * (lineHeight - 2 * lineMargin) / (t.max + 1); };
            var ht = function(t) { return 2 * (lineHeight - 2 * lineMargin) / (t.max + 1); };

            var svg = d3.select(container)
              .append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom);

            var text = svg.append('g')
              .attr('width', width)
              .attr('height', height)
              .attr('transform', 'translate(0,' + margin.top + ')')
              .selectAll('text')
              .data(gantt.resources).enter();
            text
              .append('text')
              .attr('x', 0)
              .attr('y', function(r) { return r.index * lineHeight + lineHeight / 2; })
              .attr('dy', '-0.2em')
              .attr('text-anchor', 'start')
              .text(function(r) {
                var endpoint = r.data;
                var text = endpoint.url;
                if (text.indexOf("Endpoint[") == 0) {
                    text = text.substring(9, text.length - 1);
                }
                return text;
              });
            text
              .append('text')
              .attr('x', 0)
              .attr('y', function(r) { return r.index * lineHeight + lineHeight / 2; })
              .attr('dy', '0.8em')
              .attr('text-anchor', 'start')
              .text(function(r) {
                var endpoint = r.data;
                return endpoint.host + "/" + endpoint.contextId + "/" + endpoint.routeId;
              });

            var g = svg.append('g')
              .attr('width', width)
              .attr('height', height)
              .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            g.append('g')
              .attr('width', width)
              .attr('height', height)
              .selectAll('rect')
              .data(gantt.tasks).enter()
              .append('rect')
              .attr('rx', lineMargin * 2)
              .attr('ry', lineMargin * 2)
              .attr('x',      function(t) { return x(t.start); })
              .attr('y',      yt)
              .attr('height', ht)
              .attr('width',  function(t) { return x(t.stop) - x(t.start); })
              .attr('stroke', '#000000')
              .attr('stroke-width', '2')
              .attr('fill',   function(t) { return d3.hsl(Math.random() * 360, 0.8, 0.8).toString(); });

            var lines = g.append('g')
              .attr('width', width)
              .attr('height', height)
              .attr('stroke', '#404040')
              .attr('stroke-width', '2')
              .selectAll('line')
              .data(gantt.links).enter();
            lines.append('line')
              .attr('x1', function(l) { return x(l.start); })
              .attr('y1', function(l) { return yt(l.taskA) + ht(l.taskA); })
              .attr('x2', function(l) { return x(l.start); })
              .attr('y2', function(l) { return yt(l.taskB) + ht(l.taskB) / 2; });
            lines.append('line')
              .attr('x1', function(l) { return x(l.start); })
              .attr('y1', function(l) { return yt(l.taskB) + ht(l.taskB) / 2; })
              .attr('x2', function(l) { return x(l.taskB.start); })
              .attr('y2', function(l) { return yt(l.taskB) + ht(l.taskB) / 2; });
            lines.append('line')
              .attr('x1', function(l) { return x(l.taskB.start); })
              .attr('y1', function(l) { return yt(l.taskB) + ht(l.taskB) / 2; })
              .attr('x2', function(l) { return x(l.taskB.start) - arrowWidth; })
              .attr('y2', function(l) { return yt(l.taskB) + ht(l.taskB) / 2 - arrowWidth; });
            lines.append('line')
              .attr('x1', function(l) { return x(l.taskB.start); })
              .attr('y1', function(l) { return yt(l.taskB) + ht(l.taskB) / 2; })
              .attr('x2', function(l) { return x(l.taskB.start) - arrowWidth; })
              .attr('y2', function(l) { return yt(l.taskB) + ht(l.taskB) / 2 + arrowWidth; });
            lines.append('line')
              .attr('x1', function(l) { return x(l.taskB.stop); })
              .attr('y1', function(l) { return yt(l.taskB) + ht(l.taskB) / 2; })
              .attr('x2', function(l) { return x(l.stop); })
              .attr('y2', function(l) { return yt(l.taskB) + ht(l.taskB) / 2; });
            lines.append('line')
              .attr('x1', function(l) { return x(l.stop); })
              .attr('y1', function(l) { return yt(l.taskB) + ht(l.taskB) / 2; })
              .attr('x2', function(l) { return x(l.stop); })
              .attr('y2', function(l) { return yt(l.taskA) + ht(l.taskA); });
            lines.append('line')
              .attr('x1', function(l) { return x(l.stop); })
              .attr('y1', function(l) { return yt(l.taskA) + ht(l.taskA); })
              .attr('x2', function(l) { return x(l.stop) - arrowWidth; })
              .attr('y2', function(l) { return yt(l.taskA) + ht(l.taskA) + arrowWidth; });
            lines.append('line')
              .attr('x1', function(l) { return x(l.stop); })
              .attr('y1', function(l) { return yt(l.taskA) + ht(l.taskA); })
              .attr('x2', function(l) { return x(l.stop) + arrowWidth; })
              .attr('y2', function(l) { return yt(l.taskA) + ht(l.taskA) + arrowWidth; });
        }

        if ($routeParams["exchangeId"]) {
            $scope.query = $routeParams["exchangeId"];
            $scope.onQueryChange();
        }

    }]);
}
