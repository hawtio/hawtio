/**
* @module Core
*/
var Core;
(function (Core) {
    if (!Object.keys) {
        Object.keys = function (obj) {
            var keys = [], k;
            for (k in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, k)) {
                    keys.push(k);
                }
            }
            return keys;
        };
    }

    /**
    * Adds the specified CSS file to the document's head, handy
    * for external plugins that might bring along their own CSS
    * @param path
    */
    function addCSS(path) {
        if ('createStyleSheet' in document) {
            // IE9
            document.createStyleSheet(path);
        } else {
            // Everyone else
            var link = $("<link>");
            $("head").append(link);

            link.attr({
                rel: 'stylesheet',
                type: 'text/css',
                href: path
            });
        }
    }
    Core.addCSS = addCSS;

    var dummyStorage = {};

    /**
    * Wrapper to get the window local storage object
    * @returns {WindowLocalStorage}
    */
    function getLocalStorage() {
        // TODO Create correct implementation of windowLocalStorage
        var storage = window.localStorage || (function () {
            return dummyStorage;
        })();
        return storage;
    }
    Core.getLocalStorage = getLocalStorage;

    /**
    * If the value is not an array then wrap it in one
    * @method asArray
    * @for Core
    * @static
    * @param {any} value
    * @return {Array}
    */
    function asArray(value) {
        return angular.isArray(value) ? value : [value];
    }
    Core.asArray = asArray;

    /**
    * Ensure whatever value is passed in is converted to a boolean
    *
    * In the branding module for now as it's needed before bootstrap
    *
    * @method parseBooleanValue
    * @for Core
    * @param {any} value
    * @return {Boolean}
    */
    function parseBooleanValue(value) {
        if (!angular.isDefined(value)) {
            return false;
        }

        if (value.constructor === Boolean) {
            return value;
        }

        if (angular.isString(value)) {
            switch (value.toLowerCase()) {
                case "true":
                case "1":
                case "yes":
                    return true;
                default:
                    return false;
            }
        }

        if (angular.isNumber(value)) {
            return value !== 0;
        }

        throw new Error("Can't convert value " + value + " to boolean");
    }
    Core.parseBooleanValue = parseBooleanValue;

    function parseIntValue(value, description) {
        if (angular.isString(value)) {
            try  {
                return parseInt(value);
            } catch (e) {
                console.log("Failed to parse " + description + " with text '" + value + "'");
            }
        }
        return null;
    }
    Core.parseIntValue = parseIntValue;

    function parseFloatValue(value, description) {
        if (angular.isString(value)) {
            try  {
                return parseFloat(value);
            } catch (e) {
                console.log("Failed to parse " + description + " with text '" + value + "'");
            }
        }
        return null;
    }
    Core.parseFloatValue = parseFloatValue;

    /**
    * Navigates the given set of paths in turn on the source object
    * and returns the last most value of the path or null if it could not be found.
    * @method pathGet
    * @for Core
    * @static
    * @param {Object} object the start object to start navigating from
    * @param {Array} paths an array of path names to navigate or a string of dot separated paths to navigate
    * @return {*} the last step on the path which is updated
    */
    function pathGet(object, paths) {
        var pathArray = (angular.isArray(paths)) ? paths : (paths || "").split(".");
        var value = object;
        angular.forEach(pathArray, function (name) {
            if (value) {
                try  {
                    value = value[name];
                } catch (e) {
                    // ignore errors
                    return null;
                }
            } else {
                return null;
            }
        });
        return value;
    }
    Core.pathGet = pathGet;

    /**
    * Navigates the given set of paths in turn on the source object
    * and updates the last path value to the given newValue
    * @method pathSet
    * @for Core
    * @static
    * @param {Object} object the start object to start navigating from
    * @param {Array} paths an array of path names to navigate or a string of dot separated paths to navigate
    * @param {Object} newValue the value to update
    * @return {*} the last step on the path which is updated
    */
    function pathSet(object, paths, newValue) {
        var pathArray = (angular.isArray(paths)) ? paths : (paths || "").split(".");
        var value = object;
        var lastIndex = pathArray.length - 1;
        angular.forEach(pathArray, function (name, idx) {
            var next = value[name];
            if (idx >= lastIndex || !angular.isObject(next)) {
                next = (idx < lastIndex) ? {} : newValue;
                value[name] = next;
            }
            value = next;
        });
        return value;
    }
    Core.pathSet = pathSet;

    /**
    * Performs a $scope.$apply() if not in a digest right now otherwise it will fire a digest later
    * @method $applyNowOrLater
    * @for Core
    * @static
    * @param {*} $scope
    */
    function $applyNowOrLater($scope) {
        if ($scope.$$phase || $scope.$root.$$phase) {
            setTimeout(function () {
                Core.$apply($scope);
            }, 50);
        } else {
            $scope.$apply();
        }
    }
    Core.$applyNowOrLater = $applyNowOrLater;

    /**
    * Performs a $scope.$apply() after the given timeout period
    * @method $applyLater
    * @for Core
    * @static
    * @param {*} $scope
    * @param {Integer} timeout
    */
    function $applyLater($scope, timeout) {
        if (typeof timeout === "undefined") { timeout = 50; }
        setTimeout(function () {
            Core.$apply($scope);
        }, timeout);
    }
    Core.$applyLater = $applyLater;

    /**
    * Performs a $scope.$apply() if not in a digest or apply phase on the given scope
    * @method $apply
    * @for Core
    * @static
    * @param {*} $scope
    */
    function $apply($scope) {
        var phase = $scope.$$phase || $scope.$root.$$phase;
        if (!phase) {
            $scope.$apply();
        }
    }
    Core.$apply = $apply;

    function $digest($scope) {
        var phase = $scope.$$phase || $scope.$root.$$phase;
        if (!phase) {
            $scope.$digest();
        }
    }
    Core.$digest = $digest;

    /**
    * Look up a list of child element names or lazily create them.
    *
    * Useful for example to get the <tbody> <tr> element from a <table> lazily creating one
    * if not present.
    *
    * Usage: var trElement = getOrCreateElements(tableElement, ["tbody", "tr"])
    * @method getOrCreateElements
    * @for Core
    * @static
    * @param {Object} domElement
    * @param {Array} arrayOfElementNames
    * @return {Object}
    */
    function getOrCreateElements(domElement, arrayOfElementNames) {
        var element = domElement;
        angular.forEach(arrayOfElementNames, function (name) {
            if (element) {
                var children = $(element).children(name);
                if (!children || !children.length) {
                    $("<" + name + "></" + name + ">").appendTo(element);
                    children = $(element).children(name);
                }
                element = children;
            }
        });
        return element;
    }
    Core.getOrCreateElements = getOrCreateElements;

    var _escapeHtmlChars = {
        "#": "&#35;",
        "'": "&#39;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
    };

    function unescapeHtml(str) {
        angular.forEach(_escapeHtmlChars, function (value, key) {
            var regex = new RegExp(value, "g");
            str = str.replace(regex, key);
        });
        str = str.replace(/&gt;/g, ">");
        return str;
    }
    Core.unescapeHtml = unescapeHtml;

    function escapeHtml(str) {
        if (angular.isString(str)) {
            var newStr = "";
            for (var i = 0; i < str.length; i++) {
                var ch = str.charAt(i);
                var ch = _escapeHtmlChars[ch] || ch;
                newStr += ch;
                /*
                var nextCode = str.charCodeAt(i);
                if (nextCode > 0 && nextCode < 48) {
                newStr += "&#" + nextCode + ";";
                }
                else {
                newStr += ch;
                }
                */
            }
            return newStr;
        } else {
            return str;
        }
    }
    Core.escapeHtml = escapeHtml;

    /**
    * Returns true if the string is either null or empty
    *
    * @method isBlank
    * @for Core
    * @static
    * @param {String} str
    * @return {Boolean}
    */
    function isBlank(str) {
        if (!str) {
            return true;
        }
        return str.isBlank();
    }
    Core.isBlank = isBlank;

    /**
    * Displays an alert message which is typically the result of some asynchronous operation
    *
    * @method notification
    * @static
    * @param type which is usually "success" or "error" and matches css alert-* css styles
    * @param message the text to display
    *
    */
    function notification(type, message, options) {
        if (typeof options === "undefined") { options = null; }
        var w = window;

        if (options === null) {
            options = {};
        }

        if (type === 'error' || type === 'warning') {
            if (!angular.isDefined(options.onclick)) {
                options.onclick = window['showLogPanel'];
            }
        }

        w.toastr[type](message, '', options);
    }
    Core.notification = notification;

    /**
    * Clears all the pending notifications
    * @method clearNotifications
    * @static
    */
    function clearNotifications() {
        var w = window;
        w.toastr.clear();
    }
    Core.clearNotifications = clearNotifications;

    function humanizeValue(value) {
        if (value) {
            var text = value.toString();
            try  {
                text = text.underscore();
            } catch (e) {
                // ignore
            }
            try  {
                text = text.humanize();
            } catch (e) {
                // ignore
            }
            return trimQuotes(text);
        }
        return value;
    }
    Core.humanizeValue = humanizeValue;

    function trimQuotes(text) {
        if (text) {
            while (text.endsWith('"') || text.endsWith("'")) {
                text = text.substring(0, text.length - 1);
            }
            while (text.startsWith('"') || text.startsWith("'")) {
                text = text.substring(1, text.length);
            }
        }
        return text;
    }
    Core.trimQuotes = trimQuotes;
})(Core || (Core = {}));

// Lots of code refers to these functions in the global namespace
var notification = Core.notification;
var clearNotifications = Core.clearNotifications;
var humanizeValue = Core.humanizeValue;
var trimQuotes = Core.trimQuotes;
var ForceGraph;
(function (ForceGraph) {
    /**
    * GraphBuilder
    *
    * @class GraphBuilder
    */
    var GraphBuilder = (function () {
        function GraphBuilder() {
            this.nodes = {};
            this.links = [];
            this.linkTypes = {};
        }
        /**
        * Adds a node to this graph
        * @method addNode
        * @param {Object} node
        */
        GraphBuilder.prototype.addNode = function (node) {
            if (!this.nodes[node.id]) {
                this.nodes[node.id] = node;
            }
        };

        GraphBuilder.prototype.getNode = function (id) {
            return this.nodes[id];
        };

        GraphBuilder.prototype.hasLinks = function (id) {
            var _this = this;
            var result = false;

            this.links.forEach(function (link) {
                if (link.source.id == id || link.target.id == id) {
                    result = result || (_this.nodes[link.source.id] != null && _this.nodes[link.target.id] != null);
                }
            });
            return result;
        };

        GraphBuilder.prototype.addLink = function (srcId, targetId, linkType) {
            if ((this.nodes[srcId] != null) && (this.nodes[targetId] != null)) {
                this.links.push({
                    source: this.nodes[srcId],
                    target: this.nodes[targetId],
                    type: linkType
                });

                if (!this.linkTypes[linkType]) {
                    this.linkTypes[linkType] = {
                        used: true
                    };
                }
                ;
            }
        };

        GraphBuilder.prototype.nodeIndex = function (id, nodes) {
            var result = -1;
            var index = 0;

            for (index = 0; index < nodes.length; index++) {
                var node = nodes[index];
                if (node.id == id) {
                    result = index;
                    break;
                }
            }

            return result;
        };

        GraphBuilder.prototype.filterNodes = function (filter) {
            var filteredNodes = {};
            var newLinks = [];

            d3.values(this.nodes).forEach(function (node) {
                if (filter(node)) {
                    filteredNodes[node.id] = node;
                }
            });

            this.links.forEach(function (link) {
                if (filteredNodes[link.source.id] && filteredNodes[link.target.id]) {
                    newLinks.push(link);
                }
            });

            this.nodes = filteredNodes;
            this.links = newLinks;
        };

        GraphBuilder.prototype.buildGraph = function () {
            var _this = this;
            var graphNodes = [];
            var linktypes = d3.keys(this.linkTypes);
            var graphLinks = [];

            d3.values(this.nodes).forEach(function (node) {
                if (node.includeInGraph == null || node.includeInGraph) {
                    node.includeInGraph = true;
                    graphNodes.push(node);
                }
            });

            this.links.forEach(function (link) {
                if (_this.nodes[link.source.id] != null && _this.nodes[link.target.id] != null && _this.nodes[link.source.id].includeInGraph && _this.nodes[link.target.id].includeInGraph) {
                    graphLinks.push({
                        source: _this.nodeIndex(link.source.id, graphNodes),
                        target: _this.nodeIndex(link.target.id, graphNodes),
                        type: link.type
                    });
                }
            });

            return {
                nodes: graphNodes,
                links: graphLinks,
                linktypes: linktypes
            };
        };
        return GraphBuilder;
    })();
    ForceGraph.GraphBuilder = GraphBuilder;
})(ForceGraph || (ForceGraph = {}));
/**
* Force Graph plugin & directive
*
* @module ForceGraph
*/
var ForceGraph;
(function (ForceGraph) {
    var pluginName = 'forceGraph';

    angular.module(pluginName, ['bootstrap', 'ngResource']).directive('hawtioForceGraph', function () {
        return new ForceGraph.ForceGraphDirective();
    });

    hawtioPluginLoader.addModule(pluginName);
})(ForceGraph || (ForceGraph = {}));
var ForceGraph;
(function (ForceGraph) {
    var log = Logger.get("ForceGraph");

    var ForceGraphDirective = (function () {
        function ForceGraphDirective() {
            this.restrict = 'A';
            this.replace = true;
            this.transclude = false;
            this.scope = {
                graph: '=graph',
                nodesize: '@',
                selectedModel: '@',
                linkDistance: '@',
                markerKind: '@',
                charge: '@'
            };
            this.link = function ($scope, $element, $attrs) {
                $scope.trans = [0, 0];
                $scope.scale = 1;

                $scope.$watch('graph', function (oldVal, newVal) {
                    updateGraph();
                });

                $scope.redraw = function () {
                    $scope.trans = d3.event.translate;
                    $scope.scale = d3.event.scale;

                    $scope.viewport.attr("transform", "translate(" + $scope.trans + ")" + " scale(" + $scope.scale + ")");
                };

                // This is a callback for the animation
                $scope.tick = function () {
                    // provide curvy lines as curves are kind of hawt
                    $scope.graphEdges.attr("d", function (d) {
                        var dx = d.target.x - d.source.x, dy = d.target.y - d.source.y, dr = Math.sqrt(dx * dx + dy * dy);
                        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
                    });

                    // apply the translates coming from the layouter
                    $scope.graphNodes.attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });

                    $scope.graphLabels.attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });
                };

                $scope.mover = function (d) {
                    if (d.popup != null) {
                        $("#pop-up").fadeOut(100, function () {
                            // Popup content
                            if (d.popup.title != null) {
                                $("#pop-up-title").html(d.popup.title);
                            } else {
                                $("#pop-up-title").html("");
                            }

                            if (d.popup.content != null) {
                                $("#pop-up-content").html(d.popup.content);
                            } else {
                                $("#pop-up-content").html("");
                            }

                            // Popup position
                            var popLeft = (d.x * $scope.scale) + $scope.trans[0] + 20;
                            var popTop = (d.y * $scope.scale) + $scope.trans[1] + 20;

                            $("#pop-up").css({ "left": popLeft, "top": popTop });
                            $("#pop-up").fadeIn(100);
                        });
                    }
                };

                $scope.mout = function (d) {
                    $("#pop-up").fadeOut(50);
                    //d3.select(this).attr("fill","url(#ten1)");
                };

                var updateGraph = function () {
                    var canvas = $($element);

                    // TODO: determine the canvas size dynamically
                    var h = $($element).parent().height();
                    var w = $($element).parent().width();
                    var i = 0;

                    canvas.children("svg").remove();

                    // First we create the top level SVG object
                    // TODO maybe pass in the width/height
                    $scope.svg = d3.select(canvas[0]).append("svg").attr("width", w).attr("height", h);

                    // The we add the markers for the arrow tips
                    var linkTypes = null;
                    if ($scope.graph) {
                        linkTypes = $scope.graph.linktypes;
                    }
                    if (!linkTypes) {
                        return;
                    }
                    $scope.svg.append("svg:defs").selectAll("marker").data(linkTypes).enter().append("svg:marker").attr("id", String).attr("viewBox", "0 -5 10 10").attr("refX", 15).attr("refY", -1.5).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto").append("svg:path").attr("d", "M0,-5L10,0L0,5");

                    // The bounding box can't be zoomed or scaled at all
                    $scope.svg.append("svg:g").append("svg:rect").attr("class", "graphbox.frame").attr('width', w).attr('height', h);

                    $scope.viewport = $scope.svg.append("svg:g").call(d3.behavior.zoom().on("zoom", $scope.redraw)).append("svg:g");

                    $scope.viewport.append("svg:rect").attr("width", 1000000).attr("height", 1000000).attr("class", "graphbox").attr("transform", "translate(-50000, -500000)");

                    // Only do this if we have a graph object
                    if ($scope.graph) {
                        var ownerScope = $scope.$parent || $scope;
                        var selectedModel = $scope.selectedModel || "selectedNode";

                        // kick off the d3 forced graph layout
                        $scope.force = d3.layout.force().nodes($scope.graph.nodes).links($scope.graph.links).size([w, h]).on("tick", $scope.tick);

                        if (angular.isDefined($scope.linkDistance)) {
                            $scope.force.linkDistance($scope.linkDistance);
                        }
                        if (angular.isDefined($scope.charge)) {
                            $scope.force.charge($scope.charge);
                        }
                        var markerTypeName = $scope.markerKind || "marker-end";

                        // Add all edges to the viewport
                        $scope.graphEdges = $scope.viewport.append("svg:g").selectAll("path").data($scope.force.links()).enter().append("svg:path").attr("class", function (d) {
                            return "link " + d.type;
                        }).attr(markerTypeName, function (d) {
                            return "url(#" + d.type + ")";
                        });

                        // add all nodes to the viewport
                        $scope.graphNodes = $scope.viewport.append("svg:g").selectAll("circle").data($scope.force.nodes()).enter().append("a").attr("xlink:href", function (d) {
                            return d.navUrl;
                        }).on("mouseover.onLink", function (d, i) {
                            var sel = d3.select(d3.event.target);
                            sel.classed('selected', true);
                            ownerScope[selectedModel] = d;
                            Core.pathSet(ownerScope, selectedModel, d);
                            Core.$apply(ownerScope);
                        }).on("mouseout.onLink", function (d, i) {
                            var sel = d3.select(d3.event.target);
                            sel.classed('selected', false);
                        });

                        function hasImage(d) {
                            return d.image && d.image.url;
                        }

                        // Add the images if they are set
                        $scope.graphNodes.filter(function (d) {
                            return d.image != null;
                        }).append("image").attr("xlink:href", function (d) {
                            return d.image.url;
                        }).attr("x", function (d) {
                            return -(d.image.width / 2);
                        }).attr("y", function (d) {
                            return -(d.image.height / 2);
                        }).attr("width", function (d) {
                            return d.image.width;
                        }).attr("height", function (d) {
                            return d.image.height;
                        });

                        // if we don't have an image add a circle
                        $scope.graphNodes.filter(function (d) {
                            return !hasImage(d);
                        }).append("circle").attr("class", function (d) {
                            return d.type;
                        }).attr("r", function (d) {
                            return d.size || $scope.nodesize;
                        });

                        // Add the labels to the viewport
                        $scope.graphLabels = $scope.viewport.append("svg:g").selectAll("g").data($scope.force.nodes()).enter().append("svg:g");

                        // A copy of the text with a thick white stroke for legibility.
                        $scope.graphLabels.append("svg:text").attr("x", 8).attr("y", ".31em").attr("class", "shadow").text(function (d) {
                            return d.name;
                        });

                        $scope.graphLabels.append("svg:text").attr("x", 8).attr("y", ".31em").text(function (d) {
                            return d.name;
                        });

                        // animate, then stop
                        $scope.force.start();

                        $scope.graphNodes.call($scope.force.drag).on("mouseover", $scope.mover).on("mouseout", $scope.mout);
                    }
                };
            };
        }
        return ForceGraphDirective;
    })();
    ForceGraph.ForceGraphDirective = ForceGraphDirective;
    ;
})(ForceGraph || (ForceGraph = {}));
/**
* @module DataTable
*/
var DataTable;
(function (DataTable) {
    var SimpleDataTable = (function () {
        function SimpleDataTable($compile) {
            var _this = this;
            this.$compile = $compile;
            this.restrict = 'A';
            this.scope = {
                config: '=hawtioSimpleTable',
                target: '@',
                showFiles: '@'
            };
            // necessary to ensure 'this' is this object <sigh>
            this.link = function ($scope, $element, $attrs) {
                return _this.doLink($scope, $element, $attrs);
            };
        }
        SimpleDataTable.prototype.doLink = function ($scope, $element, $attrs) {
            var defaultPrimaryKeyFn = function (entity, idx) {
                // default function to use id/_id/name as primary key, and fallback to use index
                return entity["id"] || entity["_id"] || entity["name"] || idx;
            };

            var config = $scope.config;

            var dataName = config.data || "data";

            // need to remember which rows has been selected as the config.data / config.selectedItems
            // so we can re-select them when data is changed/updated, and entity may be new instances
            // so we need a primary key function to generate a 'primary key' of the entity
            var primaryKeyFn = config.primaryKeyFn || defaultPrimaryKeyFn;
            $scope.rows = [];

            var scope = $scope.$parent || $scope;

            var listener = function (otherValue) {
                var value = Core.pathGet(scope, dataName);
                if (value && !angular.isArray(value)) {
                    value = [value];
                    Core.pathSet(scope, dataName, value);
                }

                if (!('sortInfo' in config)) {
                    // an optional defaultSort can be used to indicate a column
                    // should not automatic be the default sort
                    var ds = config.columnDefs.first()['defaultSort'];
                    var sortField;
                    if (angular.isUndefined(ds) || ds === true) {
                        sortField = config.columnDefs.first()['field'];
                    } else {
                        sortField = config.columnDefs.slice(1).first()['field'];
                    }
                    config['sortInfo'] = {
                        sortBy: sortField,
                        ascending: true
                    };
                }

                var sortInfo = $scope.config.sortInfo;

                // enrich the rows with information about their index
                var idx = -1;
                $scope.rows = (value || []).sortBy(sortInfo.sortBy, !sortInfo.ascending).map(function (entity) {
                    idx++;
                    return {
                        entity: entity,
                        index: idx,
                        getProperty: function (name) {
                            return entity[name];
                        }
                    };
                });

                Core.pathSet(scope, ['hawtioSimpleTable', dataName, 'rows'], $scope.rows);

                // okay the data was changed/updated so we need to re-select previously selected items
                // and for that we need to evaluate the primary key function so we can match new data with old data.
                var reSelectedItems = [];
                $scope.rows.forEach(function (row, idx) {
                    var rpk = primaryKeyFn(row.entity, row.index);
                    var selected = config.selectedItems.some(function (s) {
                        var spk = primaryKeyFn(s, s.index);
                        return angular.equals(rpk, spk);
                    });
                    if (selected) {
                        // need to enrich entity with index, as we push row.entity to the re-selected items
                        row.entity.index = row.index;
                        reSelectedItems.push(row.entity);
                        DataTable.log.debug("Data changed so keep selecting row at index " + row.index);
                    }
                });
                config.selectedItems = reSelectedItems;
            };

            scope.$watch(dataName, listener);

            // lets add a separate event so we can force updates
            // if we find cases where the delta logic doesn't work
            // (such as for nested hawtioinput-input-table)
            scope.$on("hawtio.datatable." + dataName, listener);

            function getSelectionArray() {
                var selectionArray = config.selectedItems;
                if (!selectionArray) {
                    selectionArray = [];
                    config.selectedItems = selectionArray;
                }
                if (angular.isString(selectionArray)) {
                    var name = selectionArray;
                    selectionArray = Core.pathGet(scope, name);
                    if (!selectionArray) {
                        selectionArray = [];
                        scope[name] = selectionArray;
                    }
                }
                return selectionArray;
            }

            function isMultiSelect() {
                var multiSelect = $scope.config.multiSelect;
                if (angular.isUndefined(multiSelect)) {
                    multiSelect = true;
                }
                return multiSelect;
            }

            $scope.toggleAllSelections = function () {
                var allRowsSelected = $scope.config.allRowsSelected;
                var newFlag = allRowsSelected;
                var selectionArray = getSelectionArray();
                selectionArray.splice(0, selectionArray.length);
                angular.forEach($scope.rows, function (row) {
                    row.selected = newFlag;
                    if (allRowsSelected) {
                        selectionArray.push(row.entity);
                    }
                });
            };

            $scope.toggleRowSelection = function (row) {
                if (row) {
                    var selectionArray = getSelectionArray();
                    if (!isMultiSelect()) {
                        // lets clear all other selections
                        selectionArray.splice(0, selectionArray.length);
                        angular.forEach($scope.rows, function (r) {
                            if (r !== row) {
                                r.selected = false;
                            }
                        });
                    }
                    var entity = row.entity;
                    if (entity) {
                        var idx = selectionArray.indexOf(entity);
                        if (row.selected) {
                            if (idx < 0) {
                                selectionArray.push(entity);
                            }
                        } else {
                            // clear the all selected checkbox
                            $scope.config.allRowsSelected = false;
                            if (idx >= 0) {
                                selectionArray.splice(idx, 1);
                            }
                        }
                    }
                }
            };

            $scope.sortBy = function (field) {
                if ($scope.config.sortInfo.sortBy === field) {
                    $scope.config.sortInfo.ascending = !$scope.config.sortInfo.ascending;
                } else {
                    $scope.config.sortInfo.sortBy = field;
                    $scope.config.sortInfo.ascending = true;
                }
                $scope.$emit("hawtio.datatable." + dataName);
            };

            $scope.getClass = function (field) {
                if ('sortInfo' in $scope.config) {
                    if ($scope.config.sortInfo.sortBy === field) {
                        if ($scope.config.sortInfo.ascending) {
                            return 'asc';
                        } else {
                            return 'desc';
                        }
                    }
                }

                return '';
            };

            $scope.showRow = function (row) {
                var filter = Core.pathGet($scope, ['config', 'filterOptions', 'filterText']);
                if (Core.isBlank(filter)) {
                    return true;
                }
                var rowJson = angular.toJson(row);
                return rowJson.toLowerCase().has(filter.toLowerCase());
            };

            $scope.isSelected = function (row) {
                return config.selectedItems.some(row.entity);
            };

            $scope.onRowSelected = function (row) {
                var idx = config.selectedItems.indexOf(row.entity);
                if (idx >= 0) {
                    DataTable.log.debug("De-selecting row at index " + row.index);
                    config.selectedItems.splice(idx, 1);
                } else {
                    if (!config.multiSelect) {
                        config.selectedItems = [];
                    }
                    DataTable.log.debug("Selecting row at index " + row.index);

                    // need to enrich entity with index, as we push row.entity to the selected items
                    row.entity.index = row.index;
                    config.selectedItems.push(row.entity);
                }
            };

            // lets add the header and row cells
            var rootElement = $element;
            rootElement.empty();

            var showCheckBox = firstValueDefined(config, ["showSelectionCheckbox", "displaySelectionCheckbox"], true);
            var enableRowClickSelection = firstValueDefined(config, ["enableRowClickSelection"], false);

            var onMouseDown;
            if (enableRowClickSelection) {
                onMouseDown = "ng-mousedown='onRowSelected(row)' ";
            } else {
                onMouseDown = "";
            }
            var headHtml = "<thead><tr>";

            // use a function to check if a row is selected so the UI can be kept up to date asap
            var bodyHtml = "<tbody><tr ng-repeat='row in rows track by $index' ng-show='showRow(row)' " + onMouseDown + "ng-class=\"{'selected': isSelected(row)}\" >";
            var idx = 0;
            if (showCheckBox) {
                var toggleAllHtml = isMultiSelect() ? "<input type='checkbox' ng-show='rows.length' ng-model='config.allRowsSelected' ng-change='toggleAllSelections()'>" : "";

                headHtml += "\n<th>" + toggleAllHtml + "</th>";
                bodyHtml += "\n<td><input type='checkbox' ng-model='row.selected' ng-change='toggleRowSelection(row)'></td>";
            }
            angular.forEach(config.columnDefs, function (colDef) {
                var field = colDef.field;
                var cellTemplate = colDef.cellTemplate || '<div class="ngCellText" title="{{row.entity.' + field + '}}">{{row.entity.' + field + '}}</div>';

                headHtml += "\n<th class='clickable no-fade table-header' ng-click=\"sortBy('" + field + "')\" ng-class=\"getClass('" + field + "')\">{{config.columnDefs[" + idx + "].displayName}}<span class='indicator'></span></th>";

                bodyHtml += "\n<td>" + cellTemplate + "</td>";
                idx += 1;
            });
            var html = headHtml + "\n</tr></thead>\n" + bodyHtml + "\n</tr></tbody>";

            var newContent = this.$compile(html)($scope);
            rootElement.html(newContent);
        };
        return SimpleDataTable;
    })();
    DataTable.SimpleDataTable = SimpleDataTable;

    /**
    * Returns the first property value defined in the given object or the default value if none are defined
    *
    * @param object the object to look for properties
    * @param names the array of property names to look for
    * @param defaultValue the value if no property values are defined
    * @return {*} the first defined property value or the defaultValue if none are defined
    */
    function firstValueDefined(object, names, defaultValue) {
        var answer = defaultValue;
        var found = false;
        angular.forEach(names, function (name) {
            var value = object[name];
            if (!found && angular.isDefined(value)) {
                answer = value;
                found = true;
            }
        });
        return answer;
    }
})(DataTable || (DataTable = {}));
/**
* @module DataTable
* @main DataTable
*/
var DataTable;
(function (DataTable) {
    var pluginName = 'datatable';
    DataTable.log = Logger.get("DataTable");

    angular.module(pluginName, ['bootstrap', 'ngResource']).config(function ($routeProvider) {
        $routeProvider.when('/datatable/test', { templateUrl: 'app/datatable/html/test.html' });
    }).directive('hawtioSimpleTable', function ($compile) {
        return new DataTable.SimpleDataTable($compile);
    }).directive('hawtioDatatable', function ($templateCache, $compile, $timeout, $filter) {
        // return the directive link function. (compile function not needed)
        return function (scope, element, attrs) {
            var gridOptions = null;
            var data = null;
            var widget = null;
            var timeoutId = null;
            var initialised = false;
            var childScopes = [];
            var rowDetailTemplate = null;
            var rowDetailTemplateId = null;
            var selectedItems = null;

            // used to update the UI
            function updateGrid() {
                // console.log("updating the grid!!");
                Core.$applyNowOrLater(scope);
            }

            function convertToDataTableColumn(columnDef) {
                var data = {
                    mData: columnDef.field,
                    sDefaultContent: ""
                };
                var name = columnDef.displayName;
                if (name) {
                    data["sTitle"] = name;
                }
                var width = columnDef.width;
                if (angular.isNumber(width)) {
                    data["sWidth"] = "" + width + "px";
                } else if (angular.isString(width) && !width.startsWith("*")) {
                    data["sWidth"] = width;
                }
                var template = columnDef.cellTemplate;
                if (template) {
                    data["fnCreatedCell"] = function (nTd, sData, oData, iRow, iCol) {
                        var childScope = childScopes[iRow];
                        if (!childScope) {
                            childScope = scope.$new(false);
                            childScopes[iRow] = childScope;
                        }
                        var entity = oData;
                        childScope["row"] = {
                            entity: entity,
                            getProperty: function (name) {
                                return entity[name];
                            }
                        };

                        var elem = $(nTd);
                        elem.html(template);
                        var contents = elem.contents();
                        contents.removeClass("ngCellText");
                        $compile(contents)(childScope);
                    };
                } else {
                    var cellFilter = columnDef.cellFilter;
                    var render = columnDef.render;
                    if (cellFilter && !render) {
                        var filter = $filter(cellFilter);
                        if (filter) {
                            render = function (data, type, full) {
                                return filter(data);
                            };
                        }
                    }
                    if (render) {
                        data["mRender"] = render;
                    }
                }
                return data;
            }

            function destroyChildScopes() {
                angular.forEach(childScopes, function (childScope) {
                    childScope.$destroy();
                });
                childScopes = [];
            }

            function selectHandler(selection) {
                if (selection && selectedItems) {
                    selectedItems.splice(0, selectedItems.length);
                    selectedItems.push(selection);
                    Core.$apply(scope);
                }
            }

            function onTableDataChange(value) {
                gridOptions = value;
                if (gridOptions) {
                    selectedItems = gridOptions.selectedItems;
                    rowDetailTemplate = gridOptions.rowDetailTemplate;
                    rowDetailTemplateId = gridOptions.rowDetailTemplateId;

                    // TODO deal with updating the gridOptions on the fly?
                    if (widget === null) {
                        var widgetOptions = {
                            selectHandler: selectHandler,
                            disableAddColumns: true,
                            rowDetailTemplateId: rowDetailTemplateId,
                            ignoreColumns: gridOptions.ignoreColumns,
                            flattenColumns: gridOptions.flattenColumns
                        };

                        // lets find a child table element
                        // or lets add one if there's not one already
                        var rootElement = $(element);
                        var tableElement = rootElement.children("table");
                        if (!tableElement.length) {
                            $("<table class='table table-bordered table-condensed'></table>").appendTo(rootElement);
                            tableElement = rootElement.children("table");
                        }
                        tableElement.removeClass('table-striped');
                        tableElement.addClass('dataTable');
                        var trElement = Core.getOrCreateElements(tableElement, ["thead", "tr"]);

                        destroyChildScopes();

                        // convert the column configurations
                        var columns = [];
                        var columnCounter = 1;
                        var extraLeftColumn = rowDetailTemplate || rowDetailTemplateId;
                        if (extraLeftColumn) {
                            columns.push({
                                "mDataProp": null,
                                "sClass": "control center",
                                "sWidth": "30px",
                                "sDefaultContent": '<i class="icon-plus"></i>'
                            });

                            var th = trElement.children("th");
                            if (th.length < columnCounter++) {
                                $("<th></th>").appendTo(trElement);
                            }
                        }

                        var columnDefs = gridOptions.columnDefs;
                        if (angular.isString(columnDefs)) {
                            // TODO watch this value?
                            columnDefs = scope[columnDefs];
                        }

                        angular.forEach(columnDefs, function (columnDef) {
                            // if there's not another <tr> then lets add one
                            th = trElement.children("th");
                            if (th.length < columnCounter++) {
                                var name = columnDef.displayName || "";
                                $("<th>" + name + "</th>").appendTo(trElement);
                            }
                            columns.push(convertToDataTableColumn(columnDef));
                        });
                        widget = new DataTable.TableWidget(scope, $templateCache, $compile, columns, widgetOptions);
                        widget.tableElement = tableElement;

                        var sortInfo = gridOptions.sortInfo;
                        if (sortInfo && columnDefs) {
                            var sortColumns = [];
                            var field = sortInfo.field;
                            if (field) {
                                var idx = columnDefs.findIndex({ field: field });
                                if (idx >= 0) {
                                    if (extraLeftColumn) {
                                        idx += 1;
                                    }
                                    var asc = sortInfo.direction || "asc";
                                    asc = asc.toLowerCase();
                                    sortColumns.push([idx, asc]);
                                }
                            }
                            if (sortColumns.length) {
                                widget.sortColumns = sortColumns;
                            }
                        }

                        // if all the column definitions have an sWidth then lets turn off
                        // the auto-width calculations
                        if (columns.every(function (col) {
                            return col.sWidth;
                        })) {
                            widget.dataTableConfig.bAutoWidth = false;
                        }

                        /*
                        // lets avoid word wrap
                        widget.dataTableConfig["fnCreatedRow"] = function( nRow, aData, iDataIndex ) {
                        var cells = $(nRow).children("td");
                        cells.css("overflow", "hidden");
                        cells.css("white-space", "nowrap");
                        cells.css("text-overflow", "ellipsis");
                        };
                        */
                        var filterText = null;
                        var filterOptions = gridOptions.filterOptions;
                        if (filterOptions) {
                            filterText = filterOptions.filterText;
                        }
                        if (filterText || (angular.isDefined(gridOptions.showFilter) && !gridOptions.showFilter)) {
                            // disable the text filter box
                            widget.dataTableConfig.sDom = 'Rlrtip';
                        }
                        if (filterText) {
                            scope.$watch(filterText, function (value) {
                                var dataTable = widget.dataTable;
                                if (dataTable) {
                                    dataTable.fnFilter(value);
                                }
                            });
                        }
                        if (angular.isDefined(gridOptions.displayFooter) && !gridOptions.displayFooter && widget.dataTableConfig.sDom) {
                            // remove the footer
                            widget.dataTableConfig.sDom = widget.dataTableConfig.sDom.replace('i', '');
                        }
                        // TODO....
                        // lets make sure there is enough th headers for the columns!
                    }
                    if (!data) {
                        // TODO deal with the data name changing one day?
                        data = gridOptions.data;
                        if (data) {
                            var listener = function (value) {
                                if (initialised || (value && (!angular.isArray(value) || value.length))) {
                                    initialised = true;
                                    destroyChildScopes();
                                    widget.populateTable(value);
                                    updateLater();
                                }
                            };
                            scope.$watch(data, listener);

                            // lets add a separate event so we can force updates
                            // if we find cases where the delta logic doesn't work
                            // (such as for nested hawtioinput-input-table)
                            scope.$on("hawtio.datatable." + data, function (args) {
                                var value = Core.pathGet(scope, data);
                                listener(value);
                            });
                        }
                    }
                }
                updateGrid();
            }

            // watch the expression, and update the UI on change.
            scope.$watch(attrs.hawtioDatatable, onTableDataChange);

            // schedule update in one second
            function updateLater() {
                // save the timeoutId for canceling
                timeoutId = $timeout(function () {
                    updateGrid(); // update DOM
                }, 300);
            }

            // listen on DOM destroy (removal) event, and cancel the next UI update
            // to prevent updating ofter the DOM element was removed.
            element.bind('$destroy', function () {
                destroyChildScopes();
                $timeout.cancel(timeoutId);
            });

            updateLater(); // kick off the UI update process.
        };
    });

    hawtioPluginLoader.addModule(pluginName);
})(DataTable || (DataTable = {}));
/**
* @module DataTable
*/
var DataTable;
(function (DataTable) {
    /**
    * @class TableWidget
    */
    // TODO would make sense to move this to UI
    var TableWidget = (function () {
        function TableWidget(scope, $templateCache, $compile, dataTableColumns, config) {
            if (typeof config === "undefined") { config = {}; }
            var _this = this;
            this.scope = scope;
            this.$templateCache = $templateCache;
            this.$compile = $compile;
            this.dataTableColumns = dataTableColumns;
            this.config = config;
            this.ignoreColumnHash = {};
            this.flattenColumnHash = {};
            this.detailTemplate = null;
            this.openMessages = [];
            this.addedExpandNodes = false;
            this.tableElement = null;
            this.sortColumns = null;
            this.dataTableConfig = {
                bPaginate: false,
                sDom: 'Rlfrtip',
                bDestroy: true,
                bAutoWidth: true
            };
            // the jQuery DataTable widget
            this.dataTable = null;
            // TODO is there an easier way of turning an array into a hash to true so it acts as a hash?
            angular.forEach(config.ignoreColumns, function (name) {
                _this.ignoreColumnHash[name] = true;
            });
            angular.forEach(config.flattenColumns, function (name) {
                _this.flattenColumnHash[name] = true;
            });

            var templateId = config.rowDetailTemplateId;
            if (templateId) {
                this.detailTemplate = this.$templateCache.get(templateId);
            }
        }
        /**
        * Adds new data to the table
        * @method addData
        * @for TableWidget
        * @param {Object} newData
        */
        TableWidget.prototype.addData = function (newData) {
            var dataTable = this.dataTable;
            dataTable.fnAddData(newData);
        };

        /**
        * Populates the table with the given data
        * @method populateTable
        * @for TableWidget
        * @param {Object} data
        */
        TableWidget.prototype.populateTable = function (data) {
            var _this = this;
            var $scope = this.scope;

            if (!data) {
                $scope.messages = [];
            } else {
                $scope.messages = data;

                var formatMessageDetails = function (dataTable, parentRow) {
                    var oData = dataTable.fnGetData(parentRow);
                    var div = $('<div>');
                    div.addClass('innerDetails');
                    _this.populateDetailDiv(oData, div);
                    return div;
                };

                var array = data;
                if (angular.isArray(data)) {
                } else if (angular.isObject(data)) {
                    array = [];
                    angular.forEach(data, function (object) {
                        return array.push(object);
                    });
                }

                var tableElement = this.tableElement;
                if (!tableElement) {
                    tableElement = $('#grid');
                }
                var tableTr = Core.getOrCreateElements(tableElement, ["thead", "tr"]);
                var tableBody = Core.getOrCreateElements(tableElement, ["tbody"]);
                var ths = $(tableTr).find("th");

                // lets add new columns based on the data...
                // TODO wont compile in TypeScript!
                //var columns = this.dataTableColumns.slice();
                var columns = [];
                angular.forEach(this.dataTableColumns, function (value) {
                    return columns.push(value);
                });

                //var columns = this.dataTableColumns.slice();
                var addColumn = function (key, title) {
                    columns.push({
                        "sDefaultContent": "",
                        "mData": null,
                        mDataProp: key
                    });

                    // lets see if we need to add another <th>
                    if (tableTr) {
                        $("<th>" + title + "</th>").appendTo(tableTr);
                    }
                };

                var checkForNewColumn = function (value, key, prefix) {
                    // lets check if we have a column data for it (if its not ignored)
                    //var keyName: string = key.toString();
                    //var config: Object = {mDataProp: key};
                    var found = _this.ignoreColumnHash[key] || columns.any(function (k, v) {
                        return "mDataProp" === k && v === key;
                    });

                    //var found = this.ignoreColumnHash[key] || columns.any(config);
                    if (!found) {
                        // lets check if its a flatten column
                        if (_this.flattenColumnHash[key]) {
                            // TODO so this only works on the first row - sucks! :)
                            if (angular.isObject(value)) {
                                var childPrefix = prefix + key + ".";
                                angular.forEach(value, function (value, key) {
                                    return checkForNewColumn(value, key, childPrefix);
                                });
                            }
                        } else {
                            addColumn(prefix + key, humanizeValue(key));
                        }
                    }
                };

                if (!this.config.disableAddColumns && angular.isArray(array) && array.length > 0) {
                    var first = array[0];
                    if (angular.isObject(first)) {
                        angular.forEach(first, function (value, key) {
                            return checkForNewColumn(value, key, "");
                        });
                    }
                }

                // lets default to column 1 sorting if there's no property on column 1 for expansion
                if (columns.length > 1) {
                    var col0 = columns[0];
                    if (!this.sortColumns && !col0["mDataProp"] && !col0["mData"]) {
                        var sortOrder = [[1, "asc"]];
                        this.sortColumns = sortOrder;
                    }
                }
                if (array.length && !angular.isArray(array[0])) {
                    //this.dataTableConfig["aoData"] = array;
                    this.dataTableConfig["aaData"] = array;
                } else {
                    this.dataTableConfig["aaData"] = array;
                }
                this.dataTableConfig["aoColumns"] = columns;
                if (this.sortColumns) {
                    this.dataTableConfig["aaSorting"] = this.sortColumns;
                }

                if (this.dataTable) {
                    this.dataTable.fnClearTable(false);
                    this.dataTable.fnAddData(array);
                    this.dataTable.fnDraw();
                    // lets try update it...
                } else {
                    this.dataTable = tableElement.dataTable(this.dataTableConfig);
                }

                var widget = this;

                if (this.dataTable) {
                    var keys = new KeyTable({
                        "table": tableElement[0],
                        "datatable": this.dataTable
                    });
                    keys.fnSetPosition(0, 0);

                    if (angular.isArray(data) && data.length) {
                        var selected = data[0];
                        var selectHandler = widget.config.selectHandler;
                        if (selected && selectHandler) {
                            selectHandler(selected);
                        }
                    }
                }

                // lets try focus on the table
                $(tableElement).focus();

                var widget = this;

                // add a handler for the expand/collapse column for all rows (and future rows)
                var expandCollapseNode = function () {
                    var dataTable = widget.dataTable;
                    var parentRow = this.parentNode;
                    var openMessages = widget.openMessages;
                    var i = $.inArray(parentRow, openMessages);

                    var element = $('i', this);
                    if (i === -1) {
                        element.removeClass('icon-plus');
                        element.addClass('icon-minus');
                        var dataDiv = formatMessageDetails(dataTable, parentRow);
                        var detailsRow = $(dataTable.fnOpen(parentRow, dataDiv, 'details'));
                        detailsRow.css("padding", "0");

                        setTimeout(function () {
                            detailsRow.find(".innerDetails").slideDown(400, function () {
                                $(parentRow).addClass('opened');
                                openMessages.push(parentRow);
                            });
                        }, 20);
                    } else {
                        $(parentRow.nextSibling).find(".innerDetails").slideUp(400, function () {
                            $(parentRow).removeClass('opened');
                            element.removeClass('icon-minus');
                            element.addClass('icon-plus');
                            dataTable.fnClose(parentRow);
                            openMessages.splice(i, 1);
                        });
                    }

                    // lets let angular render any new detail templates
                    Core.$apply($scope);
                };

                if (!this.addedExpandNodes) {
                    this.addedExpandNodes = true;

                    $(tableElement).on("click", "td.control", expandCollapseNode);

                    //$(document).on("click", "#grid td.control", expandCollapseNode);
                    keys.event.action(0, null, function (node) {
                        expandCollapseNode.call(node);
                    });
                }

                keys.event.focus(null, null, function (node) {
                    var dataTable = widget.dataTable;
                    var row = node;
                    if (node) {
                        var nodeName = node.nodeName;
                        if (nodeName) {
                            if (nodeName.toLowerCase() === "td") {
                                row = $(node).parents("tr")[0];
                            }
                            var selected = dataTable.fnGetData(row);
                            var selectHandler = widget.config.selectHandler;
                            if (selected && selectHandler) {
                                selectHandler(selected);
                            }
                        }
                    }
                });

                // $(document).on("click", "#grid td", function () {
                $(tableElement).find("td.control").on("click", function (event) {
                    var dataTable = widget.dataTable;
                    if ($(this).hasClass('selected')) {
                        $(this).removeClass('focus selected');
                    } else {
                        if (!widget.config.multiSelect) {
                            dataTable.$('td.selected').removeClass('focus selected');
                        }
                        $(this).addClass('focus selected');

                        var row = $(this).parents("tr")[0];
                        var selected = dataTable.fnGetData(row);
                        var selectHandler = widget.config.selectHandler;
                        if (selected && selectHandler) {
                            selectHandler(selected);
                        }
                    }
                });
            }
            Core.$apply($scope);
        };

        TableWidget.prototype.populateDetailDiv = function (row, div) {
            // lets remove the silly "0" property that gets shoved in there due to the expand/collapse row
            delete row["0"];
            var scope = this.scope.$new();
            scope.row = row;
            scope.templateDiv = div;
            var template = this.detailTemplate;
            if (!template) {
                var templateId = this.config.rowDetailTemplateId;
                if (templateId) {
                    this.detailTemplate = this.$templateCache.get(templateId);
                    template = this.detailTemplate;
                }
            }
            if (template) {
                div.html(template);
                this.$compile(div.contents())(scope);
            }
        };
        return TableWidget;
    })();
    DataTable.TableWidget = TableWidget;
})(DataTable || (DataTable = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    var JSPlumb = (function () {
        function JSPlumb() {
            this.restrict = 'A';
            this.link = function ($scope, $element, $attrs) {
                // Whether or not each node in the graph can be dragged around
                var enableDragging = true;
                if (angular.isDefined($attrs['draggable'])) {
                    enableDragging = Core.parseBooleanValue($attrs['draggable']);
                }

                var useLayout = true;
                if (angular.isDefined($attrs['layout'])) {
                    useLayout = Core.parseBooleanValue($attrs['layout']);
                }

                var timeout = 100;
                if (angular.isDefined($attrs['timeout'])) {
                    timeout = Core.parseIntValue($attrs['timeout'], "timeout");
                }

                var endpointStyle = ["Dot", { radius: 10, cssClass: 'jsplumb-circle', hoverClass: 'jsplumb-circle-hover' }];
                var labelStyles = ["Label"];
                var arrowStyles = [
                    "Arrow", {
                        location: 1,
                        id: "arrow",
                        length: 8,
                        width: 8,
                        foldback: 0.8
                    }];

                var connectorStyle = ["Flowchart", { cornerRadius: 4, gap: 8 }];

                if (angular.isDefined($scope.connectorStyle)) {
                    connectorStyle = $scope.connectorStyle;
                }

                // Given an element, create a node data structure
                var createNode = function (nodeEl) {
                    var el = $(nodeEl);
                    var id = el.attr('id');
                    var anchors = el.attr('anchors');
                    if (anchors.has("{{") || anchors.has("}}")) {
                        // we don't want to add this yet...
                        return null;
                    }
                    if (anchors) {
                        anchors = anchors.split(',').map(function (anchor) {
                            return anchor.trim();
                        });
                    } else {
                        anchors = ["Top"];
                    }

                    var node = {
                        id: id,
                        label: 'node ' + id,
                        el: el,
                        width: el.outerWidth(),
                        height: el.outerHeight(),
                        edges: [],
                        connections: [],
                        endpoints: [],
                        anchors: anchors
                    };

                    return node;
                };

                var createEndpoint = function (jsPlumb, node) {
                    var endpoint = jsPlumb.addEndpoint(node.el, {
                        isSource: true,
                        isTarget: true,
                        anchor: node.anchors,
                        connector: connectorStyle,
                        maxConnections: -1
                    });
                    node.endpoints.push(endpoint);

                    //$scope.jsPlumbEndpoints[node.id] = endpoint
                    if (enableDragging) {
                        jsPlumb.draggable(node.el, {
                            containment: $element
                        });
                    }
                };

                var nodes = [];
                var transitions = [];
                var nodesById = {};

                var gatherElements = function () {
                    var nodeEls = $element.find('.jsplumb-node');

                    angular.forEach(nodeEls, function (nodeEl) {
                        if (!nodesById[nodeEl.id]) {
                            var node = createNode(nodeEl);
                            if (node) {
                                nodes.push(node);
                                nodesById[node.id] = node;
                            }
                        }
                    });

                    angular.forEach(nodes, function (sourceNode) {
                        var targets = sourceNode.el.attr('connect-to');
                        if (targets) {
                            targets = targets.split(',');
                            angular.forEach(targets, function (target) {
                                var targetNode = nodesById[target.trim()];
                                if (targetNode) {
                                    var edge = {
                                        source: sourceNode,
                                        target: targetNode
                                    };
                                    transitions.push(edge);
                                    sourceNode.edges.push(edge);
                                    targetNode.edges.push(edge);
                                }
                            });
                        }
                    });
                };

                /*
                $element.bind('DOMNodeInserted', (event) => {
                if ($scope.jsPlumb) {
                if (angular.isString(event.target.className)
                && !event.target.className.has("_jsPlumb_endpoint_anchor_")
                && event.target.className.has("jsplumb-node")) {
                // TODO - handle added nodes here, like from ng-repeat for example
                //console.log("DOMNodeInserted: ", event);
                gatherElements();
                var newNodes = nodes.filter((node) => { return node.endpoints.isEmpty(); });
                if (newNodes && newNodes.length) {
                angular.forEach(newNodes, (node) => {
                //console.log("Adding node: ", node.id);
                createEndpoint($scope.jsPlumb, node);
                });
                $scope.jsPlumb.repaintEverything();
                Core.$applyLater($scope);
                }
                }
                }
                });
                */
                // Kick off the initial layout of elements in the container
                setTimeout(function () {
                    $scope.jsPlumb = jsPlumb.getInstance({
                        Container: $element
                    });

                    $scope.jsPlumb.importDefaults({
                        Anchor: "AutoDefault",
                        Connector: "Flowchart",
                        ConnectorStyle: connectorStyle,
                        DragOptions: { cursor: "pointer", zIndex: 2000 },
                        Endpoint: endpointStyle,
                        PaintStyle: { strokeStyle: "#42a62c", lineWidth: 4 },
                        HoverPaintStyle: { strokeStyle: "#42a62c", lineWidth: 4 },
                        ConnectionOverlays: [
                            arrowStyles,
                            labelStyles
                        ]
                    });

                    gatherElements();

                    $scope.jsPlumbNodes = nodes;
                    $scope.jsPlumbNodesById = nodesById;
                    $scope.jsPlumbTransitions = transitions;

                    //$scope.jsPlumbEndpoints = {};
                    //$scope.jsPlumbConnections = [];
                    // First we'll lay out the graph and then later apply jsplumb to all
                    // of the nodes and connections
                    if (useLayout) {
                        $scope.layout = dagre.layout().nodeSep(50).edgeSep(10).rankSep(50).nodes(nodes).edges(transitions).debugLevel(1).run();
                    }

                    angular.forEach($scope.jsPlumbNodes, function (node) {
                        if (useLayout) {
                            node.el.css({ top: node.dagre.y, left: node.dagre.x });
                        }
                        createEndpoint($scope.jsPlumb, node);
                    });

                    angular.forEach($scope.jsPlumbTransitions, function (edge) {
                        var connection = $scope.jsPlumb.connect({
                            source: edge.source.el,
                            target: edge.target.el
                        }, {
                            connector: connectorStyle,
                            maxConnections: -1
                        });
                        edge.source.connections.push(connection);
                        edge.target.connections.push(connection);
                        //$scope.jsPlumbConnections.push(connection);
                    });

                    $scope.jsPlumb.recalculateOffsets($element);
                    $scope.jsPlumb.repaintEverything();

                    if (angular.isDefined($scope.jsPlumbCallback) && angular.isFunction($scope.jsPlumbCallback)) {
                        $scope.jsPlumbCallback($scope.jsPlumb, $scope.jsPlumbNodes, $scope.jsPlumbNodesById, $scope.jsPlumbTransitions);
                    }

                    Core.$apply($scope);
                }, timeout);
            };
        }
        return JSPlumb;
    })();
    UI.JSPlumb = JSPlumb;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    var TablePager = (function () {
        function TablePager() {
            var _this = this;
            this.restrict = 'A';
            this.scope = true;
            this.templateUrl = UI.templatePath + 'tablePager.html';
            this.$scope = null;
            this.element = null;
            this.attrs = null;
            this.tableName = null;
            this.setRowIndexName = null;
            this.rowIndexName = null;
            // necessary to ensure 'this' is this object <sigh>
            this.link = function (scope, element, attrs) {
                return _this.doLink(scope, element, attrs);
            };
        }
        TablePager.prototype.doLink = function (scope, element, attrs) {
            var _this = this;
            this.$scope = scope;
            this.element = element;
            this.attrs = attrs;
            this.tableName = attrs["hawtioPager"] || attrs["array"] || "data";
            this.setRowIndexName = attrs["onIndexChange"] || "onIndexChange";
            this.rowIndexName = attrs["rowIndex"] || "rowIndex";

            scope.first = function () {
                _this.goToIndex(0);
            };

            scope.last = function () {
                _this.goToIndex(scope.tableLength() - 1);
            };

            scope.previous = function () {
                _this.goToIndex(scope.rowIndex() - 1);
            };

            scope.next = function () {
                _this.goToIndex(scope.rowIndex() + 1);
            };

            scope.isEmptyOrFirst = function () {
                var idx = scope.rowIndex();
                var length = scope.tableLength();
                return length <= 0 || idx <= 0;
            };

            scope.isEmptyOrLast = function () {
                var idx = scope.rowIndex();
                var length = scope.tableLength();
                return length < 1 || idx + 1 >= length;
            };

            scope.rowIndex = function () {
                return Core.pathGet(scope.$parent, _this.rowIndexName.split('.'));
            };

            scope.tableLength = function () {
                var data = _this.tableData();
                return data ? data.length : 0;
            };
        };

        TablePager.prototype.tableData = function () {
            return Core.pathGet(this.$scope.$parent, this.tableName.split('.')) || [];
        };

        TablePager.prototype.goToIndex = function (idx) {
            var name = this.setRowIndexName;
            var fn = this.$scope[name];
            if (angular.isFunction(fn)) {
                fn(idx);
            } else {
                console.log("No function defined in scope for " + name + " but was " + fn);
                this.$scope[this.rowIndexName] = idx;
            }
        };
        return TablePager;
    })();
    UI.TablePager = TablePager;
})(UI || (UI = {}));
var UI;
(function (UI) {
    function groupBy() {
        return function (list, group) {
            if (list.length === 0) {
                return list;
            }

            if (Core.isBlank(group)) {
                return list;
            }

            var newGroup = 'newGroup';

            var currentGroup = list.first()[group];
            list.first()[newGroup] = true;

            list.forEach(function (item) {
                if (item[group] !== currentGroup) {
                    item[newGroup] = true;
                    currentGroup = item[group];
                }
            });

            return list;
        };
    }
    UI.groupBy = groupBy;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    /**
    * TODO turn this into a normal directive function
    *
    * @property AutoDropDown
    * @type IAutoDropDown
    */
    UI.AutoDropDown = {
        restrict: 'A',
        link: function ($scope, $element, $attrs) {
            function locateElements(event) {
                var el = $element.get(0);
                if (event && event.relatedNode !== el && event.type) {
                    if (event && event.type !== 'resize') {
                        return;
                    }
                }

                var overflowEl = $($element.find('.overflow'));
                var overflowMenu = $(overflowEl.find('ul.dropdown-menu'));

                /*
                Logger.info("element inner width: ", $element.innerWidth());
                Logger.info("element position: ", $element.position());
                Logger.info("element offset: ", $element.offset());
                Logger.info("overflowEl offset: ", overflowEl.offset());
                Logger.info("overflowEl position: ", overflowEl.position());
                */
                var margin = 0;
                var availableWidth = 0;

                try  {
                    margin = overflowEl.outerWidth() - overflowEl.innerWidth();
                    availableWidth = overflowEl.position().left - $element.position().left - 50;
                } catch (e) {
                    UI.log.debug("caught " + e);
                }

                $element.children('li:not(.overflow):not(.pull-right):not(:hidden)').each(function () {
                    var self = $(this);
                    availableWidth = availableWidth - self.outerWidth(true);
                    if (availableWidth < 0) {
                        self.detach();
                        self.prependTo(overflowMenu);
                    }
                });

                if (overflowMenu.children().length > 0) {
                    overflowEl.css({ visibility: "visible" });
                }

                if (availableWidth > 130) {
                    var noSpace = false;

                    overflowMenu.children('li:not(.overflow):not(.pull-right)').filter(function () {
                        return $(this).css('display') !== 'none';
                    }).each(function () {
                        if (noSpace) {
                            return;
                        }
                        var self = $(this);

                        if (availableWidth > self.outerWidth()) {
                            availableWidth = availableWidth - self.outerWidth();
                            self.detach();
                            self.insertBefore(overflowEl);
                        } else {
                            noSpace = true;
                        }
                    });
                }

                if (overflowMenu.children().length === 0) {
                    overflowEl.css({ visibility: "hidden" });
                }
            }

            $(window).resize(locateElements);
            $element.get(0).addEventListener("DOMNodeInserted", locateElements);
            $scope.$watch(setTimeout(locateElements, 500));
        }
    };
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    function Editor($parse) {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: UI.templatePath + "editor.html",
            scope: {
                text: '=hawtioEditor',
                mode: '=',
                outputEditor: '@',
                name: '@'
            },
            controller: function ($scope, $element, $attrs) {
                $scope.codeMirror = null;
                $scope.doc = null;
                $scope.options = [];

                UI.observe($scope, $attrs, 'name', 'editor');

                $scope.applyOptions = function () {
                    if ($scope.codeMirror) {
                        $scope.options.each(function (option) {
                            $scope.codeMirror.setOption(option.key, option['value']);
                        });
                        $scope.options = [];
                    }
                };

                $scope.$watch('doc', function () {
                    if ($scope.doc) {
                        $scope.codeMirror.on('change', function (changeObj) {
                            $scope.text = $scope.doc.getValue();
                            $scope.dirty = !$scope.doc.isClean();
                            Core.$apply($scope);
                        });
                    }
                });

                $scope.$watch('codeMirror', function () {
                    if ($scope.codeMirror) {
                        $scope.doc = $scope.codeMirror.getDoc();
                    }
                });

                $scope.$watch('text', function (oldValue, newValue) {
                    if ($scope.codeMirror && $scope.doc) {
                        if (!$scope.codeMirror.hasFocus()) {
                            $scope.doc.setValue($scope.text || "");
                        }
                    }
                });
            },
            link: function ($scope, $element, $attrs) {
                if ('dirty' in $attrs) {
                    $scope.dirtyTarget = $attrs['dirty'];
                    $scope.$watch("$parent['" + $scope.dirtyTarget + "']", function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            $scope.dirty = newValue;
                        }
                    });
                }

                var config = Object.extended($attrs).clone();

                delete config['$$element'];
                delete config['$attr'];
                delete config['class'];
                delete config['hawtioEditor'];
                delete config['mode'];
                delete config['dirty'];
                delete config['outputEditor'];

                if ('onChange' in $attrs) {
                    var onChange = $attrs['onChange'];
                    delete config['onChange'];
                    $scope.options.push({
                        onChange: function (codeMirror) {
                            var func = $parse(onChange);
                            if (func) {
                                func($scope.$parent, { codeMirror: codeMirror });
                            }
                        }
                    });
                }

                angular.forEach(config, function (value, key) {
                    $scope.options.push({
                        key: key,
                        'value': value
                    });
                });

                $scope.$watch('mode', function () {
                    if ($scope.mode) {
                        if (!$scope.codeMirror) {
                            $scope.options.push({
                                key: 'mode',
                                'value': $scope.mode
                            });
                        } else {
                            $scope.codeMirror.setOption('mode', $scope.mode);
                        }
                    }
                });

                $scope.$watch('dirty', function (newValue, oldValue) {
                    if ($scope.dirty && !$scope.doc.isClean()) {
                        $scope.doc.markClean();
                    }
                    if (newValue !== oldValue && 'dirtyTarget' in $scope) {
                        $scope.$parent[$scope.dirtyTarget] = $scope.dirty;
                    }
                });

                $scope.$watch(function () {
                    return $element.is(':visible');
                }, function (newValue, oldValue) {
                    if (newValue !== oldValue && $scope.codeMirror) {
                        $scope.codeMirror.refresh();
                    }
                });

                $scope.$watch('text', function () {
                    if (!$scope.codeMirror) {
                        var options = {
                            value: $scope.text
                        };

                        options = CodeEditor.createEditorSettings(options);
                        $scope.codeMirror = CodeMirror.fromTextArea($element.find('textarea').get(0), options);
                        var outputEditor = $scope.outputEditor;
                        if (outputEditor) {
                            var outputScope = $scope.$parent || $scope;
                            Core.pathSet(outputScope, outputEditor, $scope.codeMirror);
                        }
                        $scope.applyOptions();
                    }
                });
            }
        };
    }
    UI.Editor = Editor;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    var ViewportHeight = (function () {
        function ViewportHeight() {
            this.restrict = 'A';
            this.link = function ($scope, $element, $attrs) {
                var lastHeight = 0;

                var resizeFunc = function () {
                    var neighbor = angular.element($attrs['hawtioViewport']);
                    var container = angular.element($attrs['containingDiv']);

                    var start = neighbor.position().top + neighbor.height();

                    var myHeight = container.height() - start;
                    if (angular.isDefined($attrs['heightAdjust'])) {
                        var heightAdjust = $attrs['heightAdjust'].toNumber();
                    }
                    myHeight = myHeight + heightAdjust;

                    $element.css({
                        height: myHeight,
                        'min-height': myHeight
                    });

                    if (lastHeight !== myHeight) {
                        lastHeight = myHeight;
                        $element.trigger('resize');
                    }
                };

                resizeFunc();
                $scope.$watch(resizeFunc);

                $().resize(function () {
                    resizeFunc();
                    Core.$apply($scope);
                    return false;
                });
            };
        }
        return ViewportHeight;
    })();
    UI.ViewportHeight = ViewportHeight;

    var HorizontalViewport = (function () {
        function HorizontalViewport() {
            this.restrict = 'A';
            this.link = function ($scope, $element, $attrs) {
                var adjustParent = angular.isDefined($attrs['adjustParent']) && Core.parseBooleanValue($attrs['adjustParent']);

                $element.get(0).addEventListener("DOMNodeInserted", function () {
                    var canvas = $element.children();
                    $element.height(canvas.outerHeight(true));
                    if (adjustParent) {
                        $element.parent().height($element.outerHeight(true) + UI.getScrollbarWidth());
                    }
                });
            };
        }
        return HorizontalViewport;
    })();
    UI.HorizontalViewport = HorizontalViewport;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    // expand the element to accomodate a group of elements to prevent them from wrapping
    var DivRow = (function () {
        function DivRow() {
            this.restrict = 'A';
            this.link = function ($scope, $element, $attrs) {
                $element.get(0).addEventListener("DOMNodeInserted", function () {
                    var targets = $element.children();
                    var width = 0;
                    angular.forEach(targets, function (target) {
                        var el = angular.element(target);
                        switch (el.css('display')) {
                            case 'none':
                                break;
                            default:
                                width = width + el.outerWidth(true) + 5;
                        }
                    });
                    $element.width(width);
                });
            };
        }
        return DivRow;
    })();
    UI.DivRow = DivRow;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    function hawtioBreadcrumbs() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: UI.templatePath + 'breadcrumbs.html',
            require: 'hawtioDropDown',
            scope: {
                config: '='
            },
            controller: function ($scope, $element, $attrs) {
                $scope.action = "itemClicked(config, $event)";

                $scope.levels = {};

                $scope.itemClicked = function (config, $event) {
                    //log.debug("Item clicked: ", config);
                    if (config.level && angular.isNumber(config.level)) {
                        $scope.levels[config.level] = config;

                        var keys = Object.extended($scope.levels).keys().sortBy("");
                        var toRemove = keys.from(config.level + 1);

                        toRemove.forEach(function (i) {
                            if (i in $scope.levels) {
                                $scope.levels[i] = {};
                                delete $scope.levels[i];
                            }
                        });

                        // reset any previously deleted action
                        angular.forEach($scope.levels, function (value, key) {
                            if (value.items && value.items.length > 0) {
                                value.items.forEach(function (i) {
                                    //log.debug("Resetting action: ", i);
                                    i['action'] = $scope.action;
                                });
                            }
                        });
                        if (config.items) {
                            config.open = true;
                            config.items.forEach(function (i) {
                                i['action'] = $scope.action;
                            });
                            delete config.action;
                        } else {
                            //ooh we picked a thing!
                            var keys = Object.extended($scope.levels).keys().sortBy("");
                            var path = [];
                            keys.forEach(function (key) {
                                path.push($scope.levels[key]['title']);
                            });
                            var pathString = '/' + path.join("/");
                            $scope.config.path = pathString;
                        }

                        // for some reason levels > 1 get two click events :-S
                        if (config.level > 1) {
                            $event.preventDefault();
                            $event.stopPropagation();
                        }
                    }
                };

                function addAction(config, level) {
                    config.level = level;
                    if (level > 0) {
                        config.breadcrumbAction = config.action;
                        config.action = $scope.action;
                    }
                    if (config.items) {
                        config.items.forEach(function (item) {
                            addAction(item, level + 1);
                        });
                    }
                }

                function setLevels(config, pathParts, level) {
                    if (pathParts.length === 0) {
                        return;
                    }
                    var part = pathParts.removeAt(0)[0];

                    //log.debug("config: ", config, " checking part: ", part, " pathParts: ", pathParts);
                    if (config && config.items) {
                        var matched = false;
                        config.items.forEach(function (item) {
                            //log.debug("checking item: ", item, " against part: ", part);
                            if (!matched && item['title'] === part) {
                                //log.debug("Found match");
                                matched = true;
                                $scope.levels[level] = item;
                                setLevels(item, pathParts, level + 1);
                            }
                        });
                    }
                }

                // watch to see if the parent scope changes the path
                $scope.$watch('config.path', function (newValue, oldValue) {
                    if (!Core.isBlank(newValue)) {
                        var pathParts = newValue.split('/').exclude(function (p) {
                            return Core.isBlank(p);
                        });

                        //log.debug("path: ", newValue);
                        //log.debug("pathParts: ", pathParts);
                        var matches = true;
                        pathParts.forEach(function (part, index) {
                            //log.debug("Checking part: ", part, " index: ", index)
                            if (!matches) {
                                return;
                            }
                            if (!$scope.levels[index] || Core.isBlank($scope.levels[index]['title']) || $scope.levels[index]['title'] !== part) {
                                matches = false;
                            }
                        });

                        //log.debug("matches: ", matches);
                        if (matches) {
                            return;
                        }

                        // adjust $scope.levels to match the path
                        $scope.levels = [];
                        $scope.levels['0'] = $scope.config;
                        setLevels($scope.config, pathParts.from(0), 1);
                    }
                });

                $scope.$watch('config', function (newValue, oldValue) {
                    addAction($scope.config, 0);
                    $scope.levels['0'] = $scope.config;
                });
            }
        };
    }
    UI.hawtioBreadcrumbs = hawtioBreadcrumbs;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    UI.log = Logger.get("UI");

    UI.scrollBarWidth = null;

    function getIfSet(attribute, $attr, def) {
        if (attribute in $attr) {
            var wantedAnswer = $attr[attribute];
            if (wantedAnswer && !wantedAnswer.isBlank()) {
                return wantedAnswer;
            }
        }
        return def;
    }
    UI.getIfSet = getIfSet;

    /*
    * Helper function to ensure a directive attribute has some default value
    */
    function observe($scope, $attrs, key, defValue, callbackFunc) {
        if (typeof callbackFunc === "undefined") { callbackFunc = null; }
        $attrs.$observe(key, function (value) {
            if (!angular.isDefined(value)) {
                $scope[key] = defValue;
            } else {
                $scope[key] = value;
            }
            if (angular.isDefined(callbackFunc) && callbackFunc) {
                callbackFunc($scope[key]);
            }
        });
    }
    UI.observe = observe;

    function getScrollbarWidth() {
        if (!angular.isDefined(UI.scrollBarWidth)) {
            var div = document.createElement('div');
            div.innerHTML = '<div style="width:50px;height:50px;position:absolute;left:-50px;top:-50px;overflow:auto;"><div style="width:1px;height:100px;"></div></div>';
            div = div.firstChild;
            document.body.appendChild(div);
            UI.scrollBarWidth = div.offsetWidth - div.clientWidth;
            document.body.removeChild(div);
        }
        return UI.scrollBarWidth;
    }
    UI.getScrollbarWidth = getScrollbarWidth;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    var MessagePanel = (function () {
        function MessagePanel() {
            this.restrict = 'A';
            this.link = function ($scope, $element, $attrs) {
                var height = "100%";
                if ('hawtioMessagePanel' in $attrs) {
                    var wantedHeight = $attrs['hawtioMessagePanel'];
                    if (wantedHeight && !wantedHeight.isBlank()) {
                        height = wantedHeight;
                    }
                }

                var speed = "1s";
                if ('speed' in $attrs) {
                    var wantedSpeed = $attrs['speed'];
                    if (speed && !speed.isBlank()) {
                        speed = wantedSpeed;
                    }
                }

                $element.css({
                    position: 'absolute',
                    bottom: 0,
                    height: 0,
                    'min-height': 0,
                    transition: 'all ' + speed + ' ease-in-out'
                });

                $element.parent().mouseover(function () {
                    $element.css({
                        height: height,
                        'min-height': 'auto'
                    });
                });

                $element.parent().mouseout(function () {
                    $element.css({
                        height: 0,
                        'min-height': 0
                    });
                });
            };
        }
        return MessagePanel;
    })();
    UI.MessagePanel = MessagePanel;

    var InfoPanel = (function () {
        function InfoPanel() {
            this.restrict = 'A';
            this.link = function ($scope, $element, $attrs) {
                var validDirections = {
                    'left': {
                        side: 'right',
                        out: 'width'
                    },
                    'right': {
                        side: 'left',
                        out: 'width'
                    },
                    'up': {
                        side: 'bottom',
                        out: 'height'
                    },
                    'down': {
                        side: 'top',
                        out: 'height'
                    }
                };

                var direction = "right";
                if ('hawtioInfoPanel' in $attrs) {
                    var wantedDirection = $attrs['hawtioInfoPanel'];
                    if (wantedDirection && !wantedDirection.isBlank()) {
                        if (Object.extended(validDirections).keys().any(wantedDirection)) {
                            direction = wantedDirection;
                        }
                    }
                }

                var speed = "1s";
                if ('speed' in $attrs) {
                    var wantedSpeed = $attrs['speed'];
                    if (speed && !speed.isBlank()) {
                        speed = wantedSpeed;
                    }
                }

                var toggle = "open";
                if ('toggle' in $attrs) {
                    var wantedToggle = $attrs['toggle'];
                    if (toggle && !toggle.isBlank()) {
                        toggle = wantedToggle;
                    }
                }

                var initialCss = {
                    position: 'absolute',
                    transition: 'all ' + speed + ' ease-in-out'
                };

                var openCss = {};
                openCss[validDirections[direction]['out']] = '100%';
                var closedCss = {};
                closedCss[validDirections[direction]['out']] = 0;

                initialCss[validDirections[direction]['side']] = 0;
                initialCss[validDirections[direction]['out']] = 0;

                $element.css(initialCss);

                $scope.$watch(toggle, function (newValue, oldValue) {
                    if (Core.parseBooleanValue(newValue)) {
                        $element.css(openCss);
                    } else {
                        $element.css(closedCss);
                    }
                });

                $element.click(function () {
                    $scope[toggle] = false;
                    Core.$apply($scope);
                });
            };
        }
        return InfoPanel;
    })();
    UI.InfoPanel = InfoPanel;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    /**
    * Directive class that organizes child elements into columns automatically
    *
    * @class AutoColumns
    */
    var AutoColumns = (function () {
        function AutoColumns() {
            this.restrict = 'A';
            this.link = function ($scope, $element, $attr) {
                var selector = UI.getIfSet('hawtioAutoColumns', $attr, 'div');
                var minMargin = UI.getIfSet('minMargin', $attr, '3').toNumber();

                var go = function () {
                    var containerWidth = $element.innerWidth();
                    var childWidth = 0;

                    var children = $element.children(selector);

                    if (children.length === 0) {
                        UI.log.debug("No children, skipping calculating column margins");
                        return;
                    }

                    // find the biggest child, though really they should all be the same size...
                    children.each(function (child) {
                        var self = $(this);
                        if (!self.is(':visible')) {
                            return;
                        }
                        if (self.outerWidth() > childWidth) {
                            childWidth = self.outerWidth();
                        }
                    });

                    if (childWidth === 0) {
                        return;
                    }

                    childWidth = childWidth + (minMargin * 2);

                    var columns = Math.floor(containerWidth / childWidth);
                    if (children.length < columns) {
                        columns = children.length;
                    }
                    var margin = (containerWidth - (columns * childWidth)) / columns / 2;

                    //log.debug("child width: ", childWidth);
                    //log.debug("Inner width: ", containerWidth);
                    //log.debug("columns: ", columns);
                    //log.debug("margin: ", margin);
                    children.each(function (child) {
                        $(this).css({
                            'margin-left': margin,
                            'margin-right': margin
                        });
                    });
                };

                setTimeout(go, 300);
                $scope.$watch(go);
                $(window).resize(go);
            };
        }
        return AutoColumns;
    })();
    UI.AutoColumns = AutoColumns;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    /**
    * Simple helper class for creating <a href="http://angular-ui.github.io/bootstrap/#/modal">angular ui bootstrap modal dialogs</a>
    * @class Dialog
    */
    var Dialog = (function () {
        function Dialog() {
            this.show = false;
            this.options = {
                backdropFade: true,
                dialogFade: true
            };
        }
        /**
        * Opens the dialog
        * @method open
        */
        Dialog.prototype.open = function () {
            this.show = true;
        };

        /**
        * Closes the dialog
        * @method close
        */
        Dialog.prototype.close = function () {
            this.show = false;

            // lets make sure and remove any backgroup fades
            this.removeBackdropFadeDiv();
            setTimeout(this.removeBackdropFadeDiv, 100);
        };

        Dialog.prototype.removeBackdropFadeDiv = function () {
            $("div.modal-backdrop").remove();
        };
        return Dialog;
    })();
    UI.Dialog = Dialog;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    function UITestController2($scope, $templateCache) {
        $scope.fileUploadExMode = 'text/html';

        $scope.menuItems = [];
        $scope.divs = [];

        for (var i = 0; i < 20; i++) {
            $scope.menuItems.push("Some Item " + i);
        }

        for (var i = 0; i < 20; i++) {
            $scope.divs.push(i + 1);
        }

        $scope.things = [
            {
                'name': 'stuff1',
                'foo1': 'bar1',
                'foo2': 'bar2'
            },
            {
                'name': 'stuff2',
                'foo3': 'bar3',
                'foo4': 'bar4'
            }
        ];

        $scope.someVal = 1;

        $scope.dropDownConfig = {
            icon: 'icon-cogs',
            title: 'My Awesome Menu',
            items: [
                {
                    title: 'Some Item',
                    action: 'someVal=2'
                }, {
                    title: 'Some other stuff',
                    icon: 'icon-twitter',
                    action: 'someVal=3'
                }, {
                    title: "I've got children",
                    icon: 'icon-file-text',
                    items: [
                        {
                            title: 'Hi!',
                            action: 'someVal=4'
                        }, {
                            title: 'Yo!',
                            items: [
                                {
                                    title: 'More!',
                                    action: 'someVal=5'
                                }, {
                                    title: 'Child',
                                    action: 'someVal=6'
                                }, {
                                    title: 'Menus!',
                                    action: 'someVal=7'
                                }]
                        }]
                }, {
                    title: "Call a function!",
                    action: function () {
                        notification("info", "Function called!");
                    }
                }]
        };
        $scope.dropDownConfigTxt = angular.toJson($scope.dropDownConfig, true);

        $scope.$watch('dropDownConfigTxt', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.dropDownConfig = angular.fromJson($scope.dropDownConfigTxt);
            }
        });

        $scope.breadcrumbSelection = 1;

        $scope.breadcrumbConfig = {
            path: '/root/first child',
            icon: 'icon-cogs',
            title: 'root',
            items: [
                {
                    title: 'first child',
                    icon: 'icon-folder-close-alt',
                    items: [{
                            title: "first child's first child",
                            icon: 'icon-file-text'
                        }]
                }, {
                    title: 'second child',
                    icon: 'icon-file'
                }, {
                    title: "third child",
                    icon: 'icon-folder-close-alt',
                    items: [
                        {
                            title: "third child's first child",
                            icon: 'icon-file-text'
                        }, {
                            title: "third child's second child",
                            icon: 'icon-file-text'
                        }, {
                            title: "third child's third child",
                            icon: 'icon-folder-close-alt',
                            items: [
                                {
                                    title: 'More!',
                                    icon: 'icon-file-text'
                                }, {
                                    title: 'Child',
                                    icon: 'icon-file-text'
                                }, {
                                    title: 'Menus!',
                                    icon: 'icon-file-text'
                                }]
                        }]
                }]
        };

        $scope.breadcrumbConfigTxt = angular.toJson($scope.breadcrumbConfig, true);

        $scope.$watch('breadcrumbConfigTxt', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.breadcrumbconfig = angular.toJson($scope.breadcrumbConfigTxt);
            }
        });

        $scope.breadcrumbEx = $templateCache.get("breadcrumbTemplate");

        $scope.dropDownEx = $templateCache.get("dropDownTemplate");

        $scope.autoDropDown = $templateCache.get("autoDropDownTemplate");
        $scope.zeroClipboard = $templateCache.get("zeroClipboardTemplate");

        $scope.popoverEx = $templateCache.get("myTemplate");
        $scope.popoverUsageEx = $templateCache.get("popoverExTemplate");

        $scope.autoColumnEx = $templateCache.get("autoColumnTemplate");
    }
    UI.UITestController2 = UITestController2;

    function UITestController1($scope, $templateCache) {
        $scope.jsplumbEx = $templateCache.get("jsplumbTemplate");

        $scope.nodes = ["node1", "node2"];
        $scope.otherNodes = ["node4", "node5", "node6"];

        $scope.anchors = ["Top", "Right", "Bottom", "Left"];

        $scope.createEndpoint = function (nodeId) {
            var node = $scope.jsPlumbNodesById[nodeId];
            if (node) {
                var anchors = $scope.anchors.subtract(node.anchors);
                console.log("anchors: ", anchors);
                if (anchors && anchors.length > 0) {
                    var anchor = anchors.first();
                    node.anchors.push(anchor);
                    node.endpoints.push($scope.jsPlumb.addEndpoint(node.el, {
                        anchor: anchor,
                        isSource: true,
                        isTarget: true,
                        maxConnections: -1
                    }));
                }
            }
        };

        $scope.expandableEx = '' + '<div class="expandable closed">\n' + '   <div title="The title" class="title">\n' + '     <i class="expandable-indicator"></i> Expandable title\n' + '   </div>\n' + '   <div class="expandable-body well">\n' + '     This is the expandable content...  Note that adding the "well" class isn\'t necessary but makes for a nice inset look\n' + '   </div>\n' + '</div>';

        $scope.editablePropertyEx1 = '<editable-property ng-model="editablePropertyModelEx1" property="property"></editable-property>';

        $scope.editablePropertyModelEx1 = {
            property: "This is editable (hover to edit)"
        };

        $scope.showDeleteOne = new UI.Dialog();
        $scope.showDeleteTwo = new UI.Dialog();

        $scope.fileUploadEx1 = '<div hawtio-file-upload="files" target="test1"></div>';
        $scope.fileUploadEx2 = '<div hawtio-file-upload="files" target="test2" show-files="false"></div>';
        $scope.fileUploadExMode = 'text/html';

        $scope.colorPickerEx = 'My Color ({{myColor}}): <div hawtio-color-picker="myColor"></div>';

        $scope.confirmationEx1 = '' + '<button class="btn" ng-click="showDeleteOne.open()">Delete stuff</button>\n' + '\n' + '<div hawtio-confirm-dialog="showDeleteOne.show"\n' + 'title="Delete stuff?"\n' + 'ok-button-text="Yes, Delete the Stuff"\n' + 'cancel-button-text="No, Keep the Stuff"\n' + 'on-cancel="onCancelled(\'One\')"\n' + 'on-ok="onOk(\'One\')">\n' + '  <div class="dialog-body">\n' + '    <p>\n' + '        Are you sure you want to delete all the stuff?\n' + '    </p>\n' + '  </div>\n' + '</div>\n';

        $scope.confirmationEx2 = '' + '<button class="btn" ng-click="showDeleteTwo.open()">Delete other stuff</button>\n' + '\n' + '<!-- Use more defaults -->\n' + '<div hawtio-confirm-dialog="showDeleteTwo.show\n"' + '  on-cancel="onCancelled(\'Two\')"\n' + '  on-ok="onOk(\'Two\')">\n' + '  <div class="dialog-body">\n' + '    <p>\n' + '      Are you sure you want to delete all the other stuff?\n' + '    </p>\n' + '  </div>\n' + '</div>';

        $scope.sliderEx1 = '' + '<button class="btn" ng-click="showSlideoutRight = !showSlideoutRight">Show slideout right</button>\n' + '<div hawtio-slideout="showSlideoutRight" title="Hey look a slider!">\n' + '   <div class="dialog-body">\n' + '     <div>\n' + '       Here is some content or whatever {{transcludedValue}}\n' + '     </div>\n' + '   </div>\n' + '</div>';

        $scope.sliderEx2 = '' + '<button class="btn" ng-click="showSlideoutLeft = !showSlideoutLeft">Show slideout left</button>\n' + '<div hawtio-slideout="showSlideoutLeft" direction="left" title="Hey, another slider!">\n' + '   <div class="dialog-body">\n' + '     <div hawtio-editor="someText" mode="javascript"></div>\n' + '   </div>\n' + '</div>\n';

        $scope.editorEx1 = '' + 'Instance 1\n' + '<div class="row-fluid">\n' + '   <div hawtio-editor="someText" mode="mode" dirty="dirty"></div>\n' + '   <div>Text : {{someText}}</div>\n' + '</div>\n' + '\n' + 'Instance 2 (readonly)\n' + '<div class="row-fluid">\n' + '   <div hawtio-editor="someText" read-only="true" mode="mode" dirty="dirty"></div>\n' + '   <div>Text : {{someText}}</div>\n' + '</div>';

        $scope.transcludedValue = "and this is transcluded";

        $scope.onCancelled = function (number) {
            notification('info', 'cancelled ' + number);
        };

        $scope.onOk = function (number) {
            notification('info', number + ' ok!');
        };

        $scope.showSlideoutRight = false;
        $scope.showSlideoutLeft = false;

        $scope.dirty = false;
        $scope.mode = 'javascript';

        $scope.someText = "var someValue = 0;\n" + "var someFunc = function() {\n" + "  return \"Hello World!\";\n" + "}\n";

        $scope.myColor = "#FF887C";
        $scope.showColorDialog = false;

        $scope.files = [];

        $scope.$watch('files', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                console.log("Files: ", $scope.files);
            }
        }, true);
    }
    UI.UITestController1 = UITestController1;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    function HawtioTocDisplay(marked, $location, $anchorScroll, $compile) {
        var log = Logger.get("UI");

        return {
            restrict: 'A',
            scope: {
                getContents: '&'
            },
            controller: function ($scope, $element, $attrs) {
                $scope.remaining = -1;
                $scope.render = false;
                $scope.chapters = [];

                $scope.addChapter = function (item) {
                    console.log("Adding: ", item);
                    $scope.chapters.push(item);
                    if (!angular.isDefined(item['text'])) {
                        $scope.fetchItemContent(item);
                    }
                };

                $scope.getTarget = function (id) {
                    if (!id) {
                        return '';
                    }
                    return id.replace(".", "_");
                };

                $scope.getFilename = function (href, ext) {
                    var filename = href.split('/').last();
                    if (ext && !filename.endsWith(ext)) {
                        filename = filename + '.' + ext;
                    }
                    return filename;
                };

                $scope.$watch('remaining', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        var renderIfPageLoadFails = false;
                        if (newValue === 0 || renderIfPageLoadFails) {
                            $scope.render = true;
                        }
                    }
                });

                $scope.fetchItemContent = function (item) {
                    var me = $scope;
                    $scope.$eval(function (parent) {
                        parent.getContents({
                            filename: item['filename'],
                            cb: function (data) {
                                if (data) {
                                    if (item['filename'].endsWith(".md")) {
                                        item['text'] = marked(data);
                                    } else {
                                        item['text'] = data;
                                    }
                                    $scope.remaining--;
                                    Core.$apply(me);
                                }
                            }
                        });
                    });
                };
            },
            link: function ($scope, $element, $attrs) {
                var offsetTop = 0;
                var logbar = $('.logbar');
                var contentDiv = $("#toc-content");
                if (logbar.length) {
                    offsetTop = logbar.height() + logbar.offset().top;
                } else if (contentDiv.length) {
                    var offsetContentDiv = contentDiv.offset();
                    if (offsetContentDiv) {
                        offsetTop = offsetContentDiv.top;
                    }
                }
                if (!offsetTop) {
                    // set to a decent guestimate
                    offsetTop = 90;
                }
                var previousHtml = null;
                var html = $element;
                if (!contentDiv || !contentDiv.length) {
                    contentDiv = $element;
                }
                var ownerScope = $scope.$parent || $scope;
                var scrollDuration = 1000;

                var linkFilter = $attrs["linkFilter"];
                var htmlName = $attrs["html"];
                if (htmlName) {
                    ownerScope.$watch(htmlName, function () {
                        var htmlText = ownerScope[htmlName];
                        if (htmlText && htmlText !== previousHtml) {
                            previousHtml = htmlText;
                            var markup = $compile(htmlText)(ownerScope);
                            $element.children().remove();
                            $element.append(markup);
                            loadChapters();
                        }
                    });
                } else {
                    loadChapters();
                }

                // make the link active for the first panel on the view
                $(window).scroll(setFirstChapterActive);

                function setFirstChapterActive() {
                    // lets find the first panel which is visible...
                    var cutoff = $(window).scrollTop();
                    $element.find("li a").removeClass("active");
                    $('.panel-body').each(function () {
                        var offset = $(this).offset();
                        if (offset && offset.top >= cutoff) {
                            // lets make the related TOC link active
                            var id = $(this).attr("id");
                            if (id) {
                                var link = html.find("a[chapter-id='" + id + "']");
                                link.addClass("active");

                                // stop iterating and just make first one active
                                return false;
                            }
                        }
                    });
                }

                function findLinks() {
                    var answer = html.find('a');
                    if (linkFilter) {
                        answer = answer.filter(linkFilter);
                    }
                    return answer;
                }

                function loadChapters() {
                    if (!html.get(0).id) {
                        html.get(0).id = 'toc';
                    }
                    $scope.tocId = '#' + html.get(0).id;
                    $scope.remaining = findLinks().length;
                    findLinks().each(function (index, a) {
                        log.debug("Found: ", a);
                        var filename = $scope.getFilename(a.href, a.getAttribute('file-extension'));
                        var item = {
                            filename: filename,
                            title: a.textContent,
                            link: a
                        };
                        $scope.addChapter(item);
                    });

                    // TODO this doesn't seem to have any effect ;)
                    setTimeout(function () {
                        setFirstChapterActive();
                    }, 100);
                }

                $scope.$watch('render', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        if (newValue) {
                            if (!contentDiv.next('.hawtio-toc').length) {
                                var div = $('<div class="hawtio-toc"></div>');
                                div.appendTo(contentDiv);

                                var selectedChapter = $location.search()["chapter"];

                                // lets load the chapter panels
                                $scope.chapters.forEach(function (chapter, index) {
                                    log.debug("index:", index);
                                    var panel = $('<div></div>');
                                    var panelHeader = null;

                                    var chapterId = $scope.getTarget(chapter['filename']);
                                    var link = chapter["link"];
                                    if (link) {
                                        link.setAttribute("chapter-id", chapterId);
                                    }
                                    if (index > 0) {
                                        panelHeader = $('<div class="panel-title"><a class="toc-back" href="">Back to Top</a></div>');
                                    }
                                    var panelBody = $('<div class="panel-body" id="' + chapterId + '">' + chapter['text'] + '</div>');
                                    if (panelHeader) {
                                        panel.append(panelHeader).append($compile(panelBody)($scope));
                                    } else {
                                        panel.append($compile(panelBody)($scope));
                                    }
                                    panel.hide().appendTo(div).fadeIn(1000);

                                    if (chapterId === selectedChapter) {
                                        // lets scroll on startup to allow for bookmarking
                                        scrollToChapter(chapterId);
                                    }
                                });

                                var pageTop = contentDiv.offset().top - offsetTop;

                                div.find('a.toc-back').each(function (index, a) {
                                    $(a).click(function (e) {
                                        e.preventDefault();
                                        $('body,html').animate({
                                            scrollTop: pageTop
                                        }, 2000);
                                    });
                                });

                                // handle clicking links in the TOC
                                findLinks().each(function (index, a) {
                                    var href = a.href;
                                    var filename = $scope.getFilename(href, a.getAttribute('file-extension'));
                                    $(a).click(function (e) {
                                        log.debug("Clicked: ", e);
                                        e.preventDefault();
                                        var chapterId = $scope.getTarget(filename);
                                        $location.search("chapter", chapterId);
                                        Core.$apply(ownerScope);
                                        scrollToChapter(chapterId);
                                        return true;
                                    });
                                });
                            }
                        }
                    }
                });

                // watch for back / forward / url changes
                ownerScope.$on("$locationChangeSuccess", function (event, current, previous) {
                    // lets do this asynchronously to avoid Error: $digest already in progress
                    setTimeout(function () {
                        // lets check if the chapter selection has changed
                        var currentChapter = $location.search()["chapter"];
                        scrollToChapter(currentChapter);
                    }, 50);
                });

                /**
                * Lets scroll to the given chapter ID
                *
                * @param chapterId
                */
                function scrollToChapter(chapterId) {
                    log.debug("selected chapter changed: " + chapterId);
                    if (chapterId) {
                        var target = '#' + chapterId;
                        var top = 0;
                        var targetElements = $(target);
                        if (targetElements.length) {
                            var offset = targetElements.offset();
                            if (offset) {
                                top = offset.top - offsetTop;
                            }
                            $('body,html').animate({
                                scrollTop: top
                            }, scrollDuration);
                        }
                    }
                }
            }
        };
    }
    UI.HawtioTocDisplay = HawtioTocDisplay;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    function hawtioPane() {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            templateUrl: UI.templatePath + 'pane.html',
            scope: {
                position: '@',
                width: '@',
                header: '@'
            },
            controller: function ($scope, $element, $attrs, $transclude, $document, $timeout, $compile, $templateCache) {
                $scope.moving = false;

                $transclude(function (clone) {
                    $element.find(".pane-content").append(clone);

                    if (Core.isBlank($scope.header)) {
                        return;
                    }

                    var headerTemplate = $templateCache.get($scope.header);

                    var wrapper = $element.find(".pane-header-wrapper");
                    wrapper.html($compile(headerTemplate)($scope));
                    $timeout(function () {
                        $element.find(".pane-viewport").css("top", wrapper.height());
                    }, 500);
                });

                $scope.setWidth = function (width) {
                    if (width < 6) {
                        return;
                    }
                    $element.width(width);
                    $element.parent().css($scope.padding, $element.width() + "px");
                };

                $scope.open = function () {
                    $scope.setWidth($scope.width);
                };

                $scope.close = function () {
                    $scope.width = $element.width();
                    $scope.setWidth(6);
                };

                $scope.$on('pane.close', $scope.close);
                $scope.$on('pane.open', $scope.open);

                $scope.toggle = function () {
                    if ($scope.moving) {
                        return;
                    }
                    if ($element.width() > 6) {
                        $scope.close();
                    } else {
                        $scope.open();
                    }
                };

                $scope.startMoving = function ($event) {
                    $event.stopPropagation();
                    $event.preventDefault();
                    $event.stopImmediatePropagation();

                    $document.on("mouseup.hawtio-pane", function ($event) {
                        $timeout(function () {
                            $scope.moving = false;
                        }, 250);
                        $event.stopPropagation();
                        $event.preventDefault();
                        $event.stopImmediatePropagation();
                        $document.off(".hawtio-pane");
                        Core.$apply($scope);
                    });

                    $document.on("mousemove.hawtio-pane", function ($event) {
                        $scope.moving = true;
                        $event.stopPropagation();
                        $event.preventDefault();
                        $event.stopImmediatePropagation();
                        $scope.setWidth($event.pageX + 2);
                        Core.$apply($scope);
                    });
                };
            },
            link: function ($scope, $element, $attr) {
                var parent = $element.parent();

                var position = "left";
                if ($scope.position) {
                    position = $scope.position;
                }
                $element.addClass(position);
                var width = $element.width();

                var padding = "padding-" + position;
                $scope.padding = padding;
                var original = parent.css(padding);
                parent.css(padding, width + "px");

                $scope.$on('$destroy', function () {
                    parent.css(padding, original);
                });
            }
        };
    }
    UI.hawtioPane = hawtioPane;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    function ZeroClipboardDirective($parse) {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attr) {
                var clip = new window.ZeroClipboard($element.get(0), {
                    moviePath: "img/ZeroClipboard.swf"
                });

                clip.on('complete', function (client, args) {
                    if (args.text && angular.isString(args.text)) {
                        notification('info', "Copied text to clipboard: " + args.text.truncate(20));
                    }
                    Core.$apply($scope);
                });

                if ('useCallback' in $attr) {
                    var func = $parse($attr['useCallback']);
                    if (func) {
                        func($scope, { clip: clip });
                    }
                }
            }
        };
    }
    UI.ZeroClipboardDirective = ZeroClipboardDirective;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    var Expandable = (function () {
        function Expandable() {
            var _this = this;
            this.log = Logger.get("Expandable");
            this.restrict = 'C';
            this.replace = false;
            this.link = null;
            this.link = function (scope, element, attrs) {
                var self = _this;
                var expandable = element;
                var modelName = null;
                var model = null;

                if (angular.isDefined(attrs['model'])) {
                    modelName = attrs['model'];
                    model = scope[modelName];

                    if (!angular.isDefined(scope[modelName]['expanded'])) {
                        model['expanded'] = expandable.hasClass('opened');
                    } else {
                        if (model['expanded']) {
                            self.forceOpen(model, expandable, scope);
                        } else {
                            self.forceClose(model, expandable, scope);
                        }
                    }

                    if (modelName) {
                        scope.$watch(modelName + '.expanded', function (newValue, oldValue) {
                            if (asBoolean(newValue) !== asBoolean(oldValue)) {
                                if (newValue) {
                                    self.open(model, expandable, scope);
                                } else {
                                    self.close(model, expandable, scope);
                                }
                            }
                        });
                    }
                }

                var title = expandable.find('.title');
                var button = expandable.find('.cancel');

                button.bind('click', function () {
                    model = scope[modelName];
                    self.forceClose(model, expandable, scope);
                    return false;
                });

                title.bind('click', function () {
                    model = scope[modelName];
                    if (isOpen(expandable)) {
                        self.close(model, expandable, scope);
                    } else {
                        self.open(model, expandable, scope);
                    }
                    return false;
                });
            };
        }
        Expandable.prototype.open = function (model, expandable, scope) {
            expandable.find('.expandable-body').slideDown(400, function () {
                if (!expandable.hasClass('opened')) {
                    expandable.addClass('opened');
                }
                expandable.removeClass('closed');
                if (model) {
                    model['expanded'] = true;
                }
                Core.$apply(scope);
            });
        };

        Expandable.prototype.close = function (model, expandable, scope) {
            expandable.find('.expandable-body').slideUp(400, function () {
                expandable.removeClass('opened');
                if (!expandable.hasClass('closed')) {
                    expandable.addClass('closed');
                }
                if (model) {
                    model['expanded'] = false;
                }
                Core.$apply(scope);
            });
        };

        Expandable.prototype.forceClose = function (model, expandable, scope) {
            expandable.find('.expandable-body').slideUp(0, function () {
                if (!expandable.hasClass('closed')) {
                    expandable.addClass('closed');
                }
                expandable.removeClass('opened');
                if (model) {
                    model['expanded'] = false;
                }
                Core.$apply(scope);
            });
        };

        Expandable.prototype.forceOpen = function (model, expandable, scope) {
            expandable.find('.expandable-body').slideDown(0, function () {
                if (!expandable.hasClass('opened')) {
                    expandable.addClass('opened');
                }
                expandable.removeClass('closed');
                if (model) {
                    model['expanded'] = true;
                }
                Core.$apply(scope);
            });
        };
        return Expandable;
    })();
    UI.Expandable = Expandable;

    function isOpen(expandable) {
        return expandable.hasClass('opened') || !expandable.hasClass("closed");
    }

    function asBoolean(value) {
        return value ? true : false;
    }
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    var EditableProperty = (function () {
        function EditableProperty($parse) {
            this.$parse = $parse;
            this.restrict = 'E';
            this.scope = true;
            this.templateUrl = UI.templatePath + 'editableProperty.html';
            this.require = 'ngModel';
            this.link = null;
            this.link = function (scope, element, attrs, ngModel) {
                scope.editing = false;
                $(element.find(".icon-pencil")[0]).hide();

                scope.getPropertyName = function () {
                    var propertyName = $parse(attrs['property'])(scope);
                    if (!propertyName && propertyName !== 0) {
                        propertyName = attrs['property'];
                    }
                    return propertyName;
                };

                scope.propertyName = scope.getPropertyName();

                ngModel.$render = function () {
                    if (!ngModel.$viewValue) {
                        return;
                    }
                    scope.text = ngModel.$viewValue[scope.propertyName];
                };

                scope.getInputStyle = function () {
                    if (!scope.text) {
                        return {};
                    }
                    return {
                        width: (scope.text + "").length / 1.5 + 'em'
                    };
                };

                scope.showEdit = function () {
                    $(element.find(".icon-pencil")[0]).show();
                };

                scope.hideEdit = function () {
                    $(element.find(".icon-pencil")[0]).hide();
                };

                scope.$watch('editing', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        if (newValue) {
                            $(element.find('input[type=text]')).focus();
                        }
                    }
                });

                scope.doEdit = function () {
                    scope.editing = true;
                };

                scope.stopEdit = function () {
                    $(element.find(":input[type=text]")[0]).val(ngModel.$viewValue[scope.propertyName]);
                    scope.editing = false;
                };

                scope.saveEdit = function () {
                    var value = $(element.find(":input[type=text]")[0]).val();
                    var obj = ngModel.$viewValue;

                    obj[scope.propertyName] = value;

                    ngModel.$setViewValue(obj);
                    ngModel.$render();
                    scope.editing = false;
                    scope.$parent.$eval(attrs['onSave']);
                };
            };
        }
        return EditableProperty;
    })();
    UI.EditableProperty = EditableProperty;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    function TemplatePopover($templateCache, $compile, $document) {
        return {
            restrict: 'A',
            link: function ($scope, $element, $attr) {
                var title = UI.getIfSet('title', $attr, undefined);
                var trigger = UI.getIfSet('trigger', $attr, 'hover');
                var html = true;
                var contentTemplate = UI.getIfSet('content', $attr, 'popoverTemplate');
                var placement = UI.getIfSet('placement', $attr, 'auto');
                var delay = UI.getIfSet('delay', $attr, '100');
                var container = UI.getIfSet('container', $attr, 'body');
                var selector = UI.getIfSet('selector', $attr, 'false');

                if (container === 'false') {
                    container = false;
                }

                if (selector === 'false') {
                    selector = false;
                }

                var template = $templateCache.get(contentTemplate);

                if (!template) {
                    return;
                }

                $element.on('$destroy', function () {
                    $element.popover('destroy');
                });

                $element.popover({
                    title: title,
                    trigger: trigger,
                    html: html,
                    content: function () {
                        var res = $compile(template)($scope);
                        Core.$digest($scope);
                        return res;
                    },
                    delay: delay,
                    container: container,
                    selector: selector,
                    placement: function (tip, element) {
                        if (placement !== 'auto') {
                            return placement;
                        }

                        var el = $element;
                        var offset = el.offset();

                        /* not sure on auto bottom/top
                        
                        var elVerticalCenter = offset['top'] + (el.outerHeight() / 2);
                        if (elVerticalCenter < 300) {
                        return 'bottom';
                        }
                        
                        var height = window.innerHeight;
                        if (elVerticalCenter > window.innerHeight - 300) {
                        return 'top';
                        }
                        */
                        var width = $document.innerWidth();
                        var elHorizontalCenter = offset['left'] + (el.outerWidth() / 2);
                        var midpoint = width / 2;
                        if (elHorizontalCenter < midpoint) {
                            return 'right';
                        } else {
                            return 'left';
                        }
                    }
                });
            }
        };
    }
    UI.TemplatePopover = TemplatePopover;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    

    /**
    * Directive that opens a simple standard confirmation dialog.  See ConfigDialogConfig
    * for configuration properties
    *
    * @class ConfirmDialog
    */
    var ConfirmDialog = (function () {
        function ConfirmDialog() {
            this.restrict = 'A';
            this.replace = true;
            this.transclude = true;
            this.templateUrl = UI.templatePath + 'confirmDialog.html';
            /**
            * @property scope
            * @type ConfirmDialogConfig
            */
            this.scope = {
                show: '=hawtioConfirmDialog',
                title: '@',
                okButtonText: '@',
                showOkButton: '@',
                cancelButtonText: '@',
                onCancel: '&',
                onOk: '&',
                onClose: '&'
            };
            this.controller = function ($scope, $element, $attrs, $transclude, $compile) {
                $scope.clone = null;

                $transclude(function (clone) {
                    $scope.clone = $(clone).filter('.dialog-body');
                });

                $scope.$watch('show', function () {
                    if ($scope.show) {
                        setTimeout(function () {
                            $scope.body = $('.modal-body');
                            $scope.body.html($compile($scope.clone.html())($scope.$parent));
                            Core.$apply($scope);
                        }, 50);
                    }
                });

                $attrs.$observe('okButtonText', function (value) {
                    if (!angular.isDefined(value)) {
                        $scope.okButtonText = "OK";
                    }
                });
                $attrs.$observe('cancelButtonText', function (value) {
                    if (!angular.isDefined(value)) {
                        $scope.cancelButtonText = "Cancel";
                    }
                });
                $attrs.$observe('title', function (value) {
                    if (!angular.isDefined(value)) {
                        $scope.title = "Are you sure?";
                    }
                });

                function checkClosed() {
                    setTimeout(function () {
                        // lets make sure we don't have a modal-backdrop hanging around!
                        var backdrop = $("div.modal-backdrop");
                        if (backdrop && backdrop.length) {
                            Logger.get("ConfirmDialog").debug("Removing the backdrop div! " + backdrop);
                            backdrop.remove();
                        }
                    }, 200);
                }

                $scope.cancel = function () {
                    $scope.show = false;
                    $scope.$parent.$eval($scope.onCancel);
                    checkClosed();
                };

                $scope.submit = function () {
                    $scope.show = false;
                    $scope.$parent.$eval($scope.onOk);
                    checkClosed();
                };

                $scope.close = function () {
                    $scope.$parent.$eval($scope.onClose);
                    checkClosed();
                };
            };
        }
        return ConfirmDialog;
    })();
    UI.ConfirmDialog = ConfirmDialog;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    /**
    * Test controller for the icon help page
    * @param $scope
    * @param $templateCache
    * @constructor
    */
    function IconTestController($scope, $templateCache) {
        $scope.exampleHtml = $templateCache.get('example-html');
        $scope.exampleConfigJson = $templateCache.get('example-config-json');

        $scope.$watch('exampleConfigJson', function (newValue, oldValue) {
            $scope.icons = angular.fromJson($scope.exampleConfigJson);
            //log.debug("Icons: ", $scope.icons);
        });
    }
    UI.IconTestController = IconTestController;

    /**
    * The hawtio-icon directive
    * @returns {{}}
    */
    function hawtioIcon() {
        UI.log.debug("Creating icon directive");
        return {
            restrict: 'E',
            replace: true,
            templateUrl: UI.templatePath + 'icon.html',
            scope: {
                icon: '=config'
            },
            link: function ($scope, $element, $attrs) {
                if (!$scope.icon) {
                    return;
                }
                if (!('type' in $scope.icon) && !Core.isBlank($scope.icon.src)) {
                    if ($scope.icon.src.startsWith("icon-")) {
                        $scope.icon.type = "icon";
                    } else {
                        $scope.icon.type = "img";
                    }
                }
                //log.debug("Created icon: ", $scope.icon);
            }
        };
    }
    UI.hawtioIcon = hawtioIcon;
})(UI || (UI = {}));
/**
* Module that contains several helper functions related to hawtio's code editor
*
* @module CodeEditor
* @main CodeEditor
*/
var CodeEditor;
(function (CodeEditor) {
    

    /**
    * @property GlobalCodeMirrorOptions
    * @for CodeEditor
    * @type CodeMirrorOptions
    */
    CodeEditor.GlobalCodeMirrorOptions = {
        theme: "default",
        tabSize: 4,
        lineNumbers: true,
        indentWithTabs: true,
        lineWrapping: true,
        autoCloseTags: true
    };

    /**
    * Controller used on the preferences page to configure the editor
    *
    * @method PreferencesController
    * @for CodeEditor
    * @static
    * @param $scope
    * @param localStorage
    * @param $templateCache
    */
    function PreferencesController($scope, localStorage, $templateCache) {
        $scope.exampleText = $templateCache.get("exampleText");
        $scope.codeMirrorEx = $templateCache.get("codeMirrorExTemplate");
        $scope.javascript = "javascript";

        $scope.preferences = CodeEditor.GlobalCodeMirrorOptions;

        // If any of the preferences change, make sure to save them automatically
        $scope.$watch("preferences", function (newValue, oldValue) {
            if (newValue !== oldValue) {
                // such a cheap and easy way to update the example view :-)
                $scope.codeMirrorEx += " ";
                localStorage['CodeMirrorOptions'] = angular.toJson(angular.extend(CodeEditor.GlobalCodeMirrorOptions, $scope.preferences));
            }
        }, true);
    }
    CodeEditor.PreferencesController = PreferencesController;

    /**
    * Tries to figure out what kind of text we're going to render in the editor, either
    * text, javascript or XML.
    *
    * @method detectTextFormat
    * @for CodeEditor
    * @static
    * @param value
    * @returns {string}
    */
    function detectTextFormat(value) {
        var answer = "text";
        if (value) {
            answer = "javascript";
            var trimmed = value.toString().trimLeft().trimRight();
            if (trimmed && trimmed.first() === '<' && trimmed.last() === '>') {
                answer = "xml";
            }
        }
        return answer;
    }
    CodeEditor.detectTextFormat = detectTextFormat;

    /**
    * Auto formats the CodeMirror editor content to pretty print
    *
    * @method autoFormatEditor
    * @for CodeEditor
    * @static
    * @param {CodeMirrorEditor} editor
    * @return {void}
    */
    function autoFormatEditor(editor) {
        if (editor) {
            var totalLines = editor.lineCount();

            //var totalChars = editor.getValue().length;
            var start = { line: 0, ch: 0 };
            var end = { line: totalLines - 1, ch: editor.getLine(totalLines - 1).length };
            editor.autoFormatRange(start, end);
            editor.setSelection(start, start);
        }
    }
    CodeEditor.autoFormatEditor = autoFormatEditor;

    /**
    * Used to configures the default editor settings (per Editor Instance)
    *
    * @method createEditorSettings
    * @for CodeEditor
    * @static
    * @param {Object} options
    * @return {Object}
    */
    function createEditorSettings(options) {
        if (typeof options === "undefined") { options = {}; }
        options.extraKeys = options.extraKeys || {};

        // Handle Mode
        (function (mode) {
            mode = mode || { name: "text" };

            if (typeof mode !== "object") {
                mode = { name: mode };
            }

            var modeName = mode.name;
            if (modeName === "javascript") {
                angular.extend(mode, {
                    "json": true
                });
            }
        })(options.mode);

        // Handle Code folding folding
        (function (options) {
            var javascriptFolding = CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
            var xmlFolding = CodeMirror.newFoldFunction(CodeMirror.tagRangeFinder);

            // Mode logic inside foldFunction to allow for dynamic changing of the mode.
            // So don't have to listen to the options model and deal with re-attaching events etc...
            var foldFunction = function (codeMirror, line) {
                var mode = codeMirror.getOption("mode");
                var modeName = mode["name"];
                if (!mode || !modeName)
                    return;
                if (modeName === 'javascript') {
                    javascriptFolding(codeMirror, line);
                } else if (modeName === "xml" || modeName.startsWith("html")) {
                    xmlFolding(codeMirror, line);
                }
                ;
            };

            options.onGutterClick = foldFunction;
            options.extraKeys = angular.extend(options.extraKeys, {
                "Ctrl-Q": function (codeMirror) {
                    foldFunction(codeMirror, codeMirror.getCursor().line);
                }
            });
        })(options);

        var readOnly = options.readOnly;
        if (!readOnly) {
            /*
            options.extraKeys = angular.extend(options.extraKeys, {
            "'>'": function (codeMirror) {
            codeMirror.closeTag(codeMirror, '>');
            },
            "'/'": function (codeMirror) {
            codeMirror.closeTag(codeMirror, '/');
            }
            });
            */
            options.matchBrackets = true;
        }

        // Merge the global config in to this instance of CodeMirror
        angular.extend(options, CodeEditor.GlobalCodeMirrorOptions);

        return options;
    }
    CodeEditor.createEditorSettings = createEditorSettings;
})(CodeEditor || (CodeEditor = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    function findParentWith($scope, attribute) {
        if (attribute in $scope) {
            return $scope;
        }
        if (!$scope.$parent) {
            return null;
        }

        // let's go up the scope tree
        return findParentWith($scope.$parent, attribute);
    }
    UI.findParentWith = findParentWith;

    function hawtioList($templateCache, $compile) {
        return {
            restrict: '',
            replace: true,
            templateUrl: UI.templatePath + 'list.html',
            scope: {
                'config': '=hawtioList'
            },
            link: function ($scope, $element, $attr) {
                $scope.rows = [];
                $scope.name = "hawtioListScope";

                if (!$scope.config.selectedItems) {
                    $scope.config.selectedItems = [];
                }

                $scope.$watch('rows', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        $scope.config.selectedItems.length = 0;
                        var selected = $scope.rows.findAll(function (row) {
                            return row.selected;
                        });
                        selected.forEach(function (row) {
                            $scope.config.selectedItems.push(row.entity);
                        });
                    }
                }, true);

                $scope.cellTemplate = $templateCache.get('cellTemplate.html');
                $scope.rowTemplate = $templateCache.get('rowTemplate.html');

                var columnDefs = $scope.config['columnDefs'];
                if (columnDefs && columnDefs.length > 0) {
                    var def = columnDefs.first();
                    if (def['cellTemplate']) {
                        $scope.cellTemplate = def['cellTemplate'];
                    }
                }

                var configName = $attr['hawtioList'];
                var dataName = $scope.config['data'];

                if (Core.isBlank(configName) || Core.isBlank(dataName)) {
                    return;
                }

                $scope.listRoot = function () {
                    return $element.find('.list-root');
                };

                $scope.getContents = function (row) {
                    //first make our row
                    var innerScope = $scope.$new();
                    innerScope.row = row;
                    var rowEl = $compile($scope.rowTemplate)(innerScope);

                    //now compile the cell but use the parent scope
                    var innerParentScope = $scope.parentScope.$new();
                    innerParentScope.row = row;
                    var cellEl = $compile($scope.cellTemplate)(innerParentScope);
                    $(rowEl).find('.list-row-contents').append(cellEl);
                    return rowEl;
                };

                $scope.setRows = function (data) {
                    $scope.rows = [];
                    var list = $scope.listRoot();
                    list.empty();
                    if (data) {
                        data.forEach(function (row) {
                            var newRow = {
                                entity: row
                            };
                            list.append($scope.getContents(newRow));
                            $scope.rows.push(newRow);
                        });
                    }
                };

                // find the parent scope that has our configuration
                var parentScope = findParentWith($scope, configName);
                if (parentScope) {
                    $scope.parentScope = parentScope;
                    parentScope.$watch(dataName, $scope.setRows, true);
                }
            }
        };
    }
    UI.hawtioList = hawtioList;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    var SlideOut = (function () {
        function SlideOut() {
            this.restrict = 'A';
            this.replace = true;
            this.transclude = true;
            this.templateUrl = UI.templatePath + 'slideout.html';
            this.scope = {
                show: '=hawtioSlideout',
                direction: '@',
                top: '@',
                height: '@',
                title: '@'
            };
            this.controller = function ($scope, $element, $attrs, $transclude, $compile) {
                $scope.clone = null;

                $transclude(function (clone) {
                    $scope.clone = $(clone).filter('.dialog-body');
                });

                UI.observe($scope, $attrs, 'direction', 'right');
                UI.observe($scope, $attrs, 'top', '10%', function (value) {
                    $element.css('top', value);
                });
                UI.observe($scope, $attrs, 'height', '80%', function (value) {
                    $element.css('height', value);
                });
                UI.observe($scope, $attrs, 'title', '');

                $scope.$watch('show', function () {
                    if ($scope.show) {
                        $scope.body = $element.find('.slideout-body');
                        $scope.body.html($compile($scope.clone.html())($scope.$parent));
                    }
                });
            };
            this.link = function ($scope, $element, $attrs) {
                $scope.element = $($element);

                $scope.element.blur(function () {
                    $scope.show = false;
                    Core.$apply($scope);
                    return false;
                });

                $scope.$watch('show', function () {
                    if ($scope.show) {
                        $scope.element.addClass('out');
                        $scope.element.focus();
                    } else {
                        $scope.element.removeClass('out');
                    }
                });
            };
        }
        return SlideOut;
    })();
    UI.SlideOut = SlideOut;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    UI.selected = "selected";
    UI.unselected = "unselected";

    /**
    * Pre defined colors used in the color picker
    * @property colors
    * @for UI
    * @type Array
    */
    UI.colors = [
        "#5484ED", "#A4BDFC", "#46D6DB", "#7AE7BF",
        "#51B749", "#FBD75B", "#FFB878", "#FF887C", "#DC2127",
        "#DBADFF", "#E1E1E1"];

    /**
    Directive that allows the user to pick a color from a pre-defined pallete of colors.
    
    Use it like:
    
    ```html
    <div hawtio-color-picker="myModel"></div>
    ```
    
    'myModel' will be bound to the color the user clicks on
    
    @class ColorPicker
    */
    var ColorPicker = (function () {
        function ColorPicker() {
            this.restrict = 'A';
            this.replace = true;
            this.scope = {
                property: '=hawtioColorPicker'
            };
            this.templateUrl = UI.templatePath + "colorPicker.html";
            this.compile = function (tElement, tAttrs, transclude) {
                return {
                    post: function postLink(scope, iElement, iAttrs, controller) {
                        scope.colorList = [];

                        angular.forEach(UI.colors, function (color) {
                            var select = UI.unselected;

                            if (scope.property === color) {
                                select = UI.selected;
                            }

                            scope.colorList.push({
                                color: color,
                                select: select
                            });
                        });
                    }
                };
            };
            this.controller = function ($scope, $element, $timeout) {
                $scope.popout = false;

                $scope.$watch('popout', function () {
                    $element.find('.color-picker-popout').toggleClass('popout-open', $scope.popout);
                });

                $scope.selectColor = function (color) {
                    for (var i = 0; i < $scope.colorList.length; i++) {
                        $scope.colorList[i].select = UI.unselected;
                        if ($scope.colorList[i] === color) {
                            $scope.property = color.color;
                            $scope.colorList[i].select = UI.selected;
                        }
                    }
                };
            };
        }
        return ColorPicker;
    })();
    UI.ColorPicker = ColorPicker;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    function hawtioDropDown($templateCache) {
        return {
            restrict: 'A',
            replace: true,
            templateUrl: UI.templatePath + 'dropDown.html',
            scope: {
                config: '=hawtioDropDown'
            },
            controller: function ($scope, $element, $attrs) {
                if (!$scope.config) {
                    $scope.config = {};
                }

                if (!('open' in $scope.config)) {
                    $scope.config['open'] = false;
                }

                $scope.action = function (config, $event) {
                    //log.debug("doAction on : ", config, "event: ", $event);
                    if ('items' in config && !('action' in config)) {
                        config.open = !config.open;
                        $event.preventDefault();
                        $event.stopPropagation();
                    } else if ('action' in config) {
                        //log.debug("executing action: ", config.action);
                        var action = config['action'];
                        if (angular.isFunction(action)) {
                            action.apply();
                        } else if (angular.isString(action)) {
                            $scope.$parent.$eval(action, {
                                config: config,
                                '$event': $event
                            });
                        }
                    }
                };

                $scope.$watch('config.items', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        // just add some space to force a redraw
                        $scope.menuStyle = $scope.menuStyle + " ";
                    }
                }, true);

                $scope.submenu = function (config) {
                    if (config && config.submenu) {
                        return "sub-menu";
                    }
                    return "";
                };

                $scope.icon = function (config) {
                    if (config && !Core.isBlank(config.icon)) {
                        return config.icon;
                    } else {
                        return 'icon-spacer';
                    }
                };

                $scope.open = function (config) {
                    if (config && !config.open) {
                        return '';
                    }
                    return 'open';
                };
            },
            link: function ($scope, $element, $attrs) {
                $scope.menuStyle = $templateCache.get("withsubmenus.html");

                if ('processSubmenus' in $attrs) {
                    if (!Core.parseBooleanValue($attrs['processSubmenus'])) {
                        $scope.menuStyle = $templateCache.get("withoutsubmenus.html");
                    }
                }
            }
        };
    }
    UI.hawtioDropDown = hawtioDropDown;
})(UI || (UI = {}));
/**
* Module that contains a bunch of re-usable directives to assemble into pages in hawtio
*
* @module UI
* @main UI
*/
var UI;
(function (UI) {
    UI.pluginName = 'hawtio-ui';

    UI.templatePath = 'app/ui/html/';

    angular.module(UI.pluginName, ['bootstrap', 'ngResource', 'ui', 'ui.bootstrap']).config(function ($routeProvider) {
        $routeProvider.when('/ui/developerPage', { templateUrl: UI.templatePath + 'developerPage.html', reloadOnSearch: false });
    }).factory('UI', function () {
        return UI;
    }).factory('marked', function () {
        marked.setOptions({
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: true,
            sanitize: false,
            smartLists: true,
            langPrefix: 'language-'
        });
        return marked;
    }).directive('hawtioConfirmDialog', function () {
        return new UI.ConfirmDialog();
    }).directive('hawtioSlideout', function () {
        return new UI.SlideOut();
    }).directive('hawtioPager', function () {
        return new UI.TablePager();
    }).directive('hawtioEditor', function ($parse) {
        return UI.Editor($parse);
    }).directive('hawtioColorPicker', function () {
        return new UI.ColorPicker();
    }).directive('expandable', function () {
        return new UI.Expandable();
    }).directive('gridster', function () {
        return new UI.GridsterDirective();
    }).directive('editableProperty', function ($parse) {
        return new UI.EditableProperty($parse);
    }).directive('hawtioViewport', function () {
        return new UI.ViewportHeight();
    }).directive('hawtioHorizontalViewport', function () {
        return new UI.HorizontalViewport();
    }).directive('hawtioRow', function () {
        return new UI.DivRow();
    }).directive('hawtioJsplumb', function () {
        return new UI.JSPlumb();
    }).directive('zeroClipboard', function ($parse) {
        return UI.ZeroClipboardDirective($parse);
    }).directive('hawtioAutoDropdown', function () {
        return UI.AutoDropDown;
    }).directive('hawtioMessagePanel', function () {
        return new UI.MessagePanel();
    }).directive('hawtioInfoPanel', function () {
        return new UI.InfoPanel();
    }).directive('hawtioAutoColumns', function () {
        return new UI.AutoColumns();
    }).directive('hawtioTemplatePopover', function ($templateCache, $compile, $document) {
        return UI.TemplatePopover($templateCache, $compile, $document);
    }).directive('hawtioTocDisplay', function (marked, $location, $anchorScroll, $compile) {
        return UI.HawtioTocDisplay(marked, $location, $anchorScroll, $compile);
    }).directive('hawtioDropDown', function ($templateCache) {
        return UI.hawtioDropDown($templateCache);
    }).directive('hawtioBreadcrumbs', function () {
        return UI.hawtioBreadcrumbs();
    }).directive('hawtioIcon', function () {
        return UI.hawtioIcon();
    }).directive('hawtioPane', function () {
        return UI.hawtioPane();
    }).directive('hawtioList', function ($templateCache, $compile) {
        return UI.hawtioList($templateCache, $compile);
    }).filter('hawtioGroupBy', function () {
        return UI.groupBy();
    }).directive('compile', [
        '$compile', function ($compile) {
            return function (scope, element, attrs) {
                scope.$watch(function (scope) {
                    // watch the 'compile' expression for changes
                    return scope.$eval(attrs.compile);
                }, function (value) {
                    // when the 'compile' expression changes
                    // assign it into the current DOM
                    element.html(value);

                    // compile the new DOM and link it to the current
                    // scope.
                    // NOTE: we only compile .childNodes so that
                    // we don't get into infinite loop compiling ourselves
                    $compile(element.contents())(scope);
                });
            };
        }]);

    hawtioPluginLoader.addModule(UI.pluginName);
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    function DeveloperPageController($scope, $http) {
        $scope.getContents = function (filename, cb) {
            var fullUrl = "app/ui/html/test/" + filename;
            $http({ method: 'GET', url: fullUrl }).success(function (data, status, headers, config) {
                cb(data);
            }).error(function (data, status, headers, config) {
                cb("Failed to fetch " + filename + ": " + data);
            });
        };
    }
    UI.DeveloperPageController = DeveloperPageController;
})(UI || (UI = {}));
/**
* @module UI
*/
var UI;
(function (UI) {
    var GridsterDirective = (function () {
        function GridsterDirective() {
            this.restrict = 'A';
            this.replace = true;
            this.controller = function ($scope, $element, $attrs) {
            };
            this.link = function ($scope, $element, $attrs) {
                var widgetMargins = [6, 6];
                var widgetBaseDimensions = [150, 150];
                var gridSize = [150, 150];
                var extraRows = 10;
                var extraCols = 6;

                /*
                if (angular.isDefined($attrs['dimensions'])) {
                var dimension = $attrs['dimensions'].toNumber();
                widgetBaseDimensions = [dimension, dimension];
                }
                
                
                if (angular.isDefined($attrs['margins'])) {
                var margins = $attrs['margins'].toNumber();
                widgetMargins = [margins, margins];
                }
                
                if (angular.isDefined($attrs['gridSize'])) {
                var size = $attrs['gridSize'].toNumber();
                gridSize = [size, size];
                }
                */
                if (angular.isDefined($attrs['extraRows'])) {
                    extraRows = $attrs['extraRows'].toNumber();
                }

                if (angular.isDefined($attrs['extraCols'])) {
                    extraCols = $attrs['extraCols'].toNumber();
                }

                var grid = $('<ul style="margin: 0"></ul>');

                var styleStr = '<style type="text/css">';

                var styleStr = styleStr + '</style>';

                $element.append($(styleStr));
                $element.append(grid);

                $scope.gridster = grid.gridster({
                    widget_margins: widgetMargins,
                    grid_size: gridSize,
                    extra_rows: extraRows,
                    extra_cols: extraCols
                }).data('gridster');
            };
        }
        return GridsterDirective;
    })();
    UI.GridsterDirective = GridsterDirective;
})(UI || (UI = {}));
