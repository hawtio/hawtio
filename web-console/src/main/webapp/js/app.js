function QueueController($scope, $location, workspace) {
    $scope.workspace = workspace;
    $scope.messages = [];
    var populateTable = function (response) {
        var data = response.value;
        $scope.messages = data;
        $scope.$apply();
        $('#grid').dataTable({
            bPaginate: false,
            sDom: 'Rlfrtip',
            bDestroy: true,
            aaData: data,
            aoColumns: [
                {
                    "mDataProp": "JMSMessageID"
                }, 
                {
                    "sDefaultContent": "",
                    "mData": null,
                    "mDataProp": "Text"
                }, 
                {
                    "mDataProp": "JMSCorrelationID"
                }, 
                {
                    "mDataProp": "JMSTimestamp"
                }, 
                {
                    "mDataProp": "JMSDeliveryMode"
                }, 
                {
                    "mDataProp": "JMSReplyTo"
                }, 
                {
                    "mDataProp": "JMSRedelivered"
                }, 
                {
                    "mDataProp": "JMSPriority"
                }, 
                {
                    "mDataProp": "JMSXGroupSeq"
                }, 
                {
                    "mDataProp": "JMSExpiration"
                }, 
                {
                    "mDataProp": "JMSType"
                }, 
                {
                    "mDataProp": "JMSDestination"
                }
            ]
        });
    };
    $scope.$watch('workspace.selection', function () {
        if(workspace.moveIfViewInvalid($location)) {
            return;
        }
        var selection = workspace.selection;
        if(selection) {
            var mbean = selection.objectName;
            if(mbean) {
                var jolokia = workspace.jolokia;
                jolokia.request({
                    type: 'exec',
                    mbean: mbean,
                    operation: 'browse()'
                }, onSuccess(populateTable));
            }
        }
    });
}
function DestinationController($scope, $location, workspace) {
    $scope.workspace = workspace;
    $scope.$watch('workspace.selection', function () {
        workspace.moveIfViewInvalid($location);
    });
    function operationSuccess() {
        $scope.destinationName = "";
        $scope.workspace.operationCounter += 1;
        $scope.$apply();
    }
    function deleteSuccess() {
        if(workspace.selection) {
            var parent = workspace.selection.parent;
            if(parent) {
                $scope.workspace.selection = parent;
                updateSelectionNode($location, parent);
            }
        }
        $scope.workspace.operationCounter += 1;
        $scope.$apply();
    }
    $scope.createDestination = function (name, isQueue) {
        var jolokia = workspace.jolokia;
        var selection = workspace.selection;
        var folderNames = selection.folderNames;
        if(selection && jolokia && folderNames && folderNames.length > 1) {
            var mbean = "" + folderNames[0] + ":BrokerName=" + folderNames[1] + ",Type=Broker";
            console.log("Creating queue " + isQueue + " of name: " + name + " on mbean");
            var operation;
            if(isQueue) {
                operation = "addQueue(java.lang.String)";
            } else {
                operation = "addTopic(java.lang.String)";
            }
            jolokia.execute(mbean, operation, name, onSuccess(operationSuccess));
        }
    };
    $scope.deleteDestination = function () {
        var jolokia = workspace.jolokia;
        var selection = workspace.selection;
        var entries = selection.entries;
        if(selection && jolokia && entries) {
            var domain = selection.domain;
            var brokerName = entries["BrokerName"];
            var name = entries["Destination"];
            var isQueue = "Topic" !== entries["Type"];
            if(domain && brokerName) {
                var mbean = "" + domain + ":BrokerName=" + brokerName + ",Type=Broker";
                console.log("Deleting queue " + isQueue + " of name: " + name + " on mbean");
                var operation;
                if(isQueue) {
                    operation = "removeQueue(java.lang.String)";
                } else {
                    operation = "removeTopic(java.lang.String)";
                }
                jolokia.execute(mbean, operation, name, onSuccess(deleteSuccess));
            }
        }
    };
    $scope.name = function () {
        var selection = workspace.selection;
        if(selection) {
            return selection.title;
        }
        return null;
    };
}
function SubscriberGraphController($scope, $location, workspace) {
    $scope.workspace = workspace;
    $scope.nodes = [];
    $scope.links = [];
    $scope.queues = {
    };
    $scope.topics = {
    };
    $scope.subscriptions = {
    };
    $scope.producers = {
    };
    function matchesSelection(destinationName) {
        var selectionDetinationName = $scope.selectionDetinationName;
        return !selectionDetinationName || destinationName === selectionDetinationName;
    }
    function getOrCreate(container, key, defaultObject) {
        var value = container[key];
        var id;
        if(!value) {
            container[key] = defaultObject;
            id = $scope.nodes.length;
            defaultObject["id"] = id;
            $scope.nodes.push(defaultObject);
        } else {
            id = value["id"];
        }
        return id;
    }
    var populateSubscribers = function (response) {
        var data = response.value;
        for(var key in data) {
            var subscription = data[key];
            var destinationNameText = subscription["DestinationName"];
            if(destinationNameText) {
                var subscriptionId = null;
                var destinationNames = destinationNameText.split(",");
                destinationNames.forEach(function (destinationName) {
                    var id = null;
                    var isQueue = !subscription["DestinationTopic"];
                    if(isQueue === $scope.isQueue && matchesSelection(destinationName)) {
                        if(isQueue) {
                            id = getOrCreate($scope.queues, destinationName, {
                                label: destinationName,
                                imageUrl: "/img/activemq/queue.png"
                            });
                        } else {
                            id = getOrCreate($scope.topics, destinationName, {
                                label: destinationName,
                                imageUrl: "/img/activemq/topic.png"
                            });
                        }
                        if(!subscriptionId) {
                            var subscriptionKey = subscription["ConnectionId"] + ":" + subscription["SubcriptionId"];
                            subscription["label"] = subscriptionKey;
                            subscription["imageUrl"] = "/img/activemq/listener.gif";
                            subscriptionId = getOrCreate($scope.subscriptions, subscriptionKey, subscription);
                        }
                        $scope.links.push({
                            source: id,
                            target: subscriptionId
                        });
                    }
                });
            }
        }
    };
    var populateProducers = function (response) {
        var data = response.value;
        for(var key in data) {
            var producer = data[key];
            var destinationNameText = producer["DestinationName"];
            if(destinationNameText) {
                var producerId = null;
                var destinationNames = destinationNameText.split(",");
                destinationNames.forEach(function (destinationName) {
                    var id = null;
                    var isQueue = producer["DestinationQueue"];
                    if(isQueue === $scope.isQueue && matchesSelection(destinationName)) {
                        if(isQueue) {
                            id = getOrCreate($scope.queues, destinationName, {
                                label: destinationName,
                                imageUrl: "/img/activemq/queue.png"
                            });
                        } else {
                            id = getOrCreate($scope.topics, destinationName, {
                                label: destinationName,
                                imageUrl: "/img/activemq/topic.png"
                            });
                        }
                        if(!producerId) {
                            var producerKey = producer["ProducerId"];
                            producer["label"] = producerKey;
                            producer["imageUrl"] = "/img/activemq/sender.gif";
                            producerId = getOrCreate($scope.producers, producerKey, producer);
                        }
                        $scope.links.push({
                            source: producerId,
                            target: id
                        });
                    }
                });
            }
        }
        d3ForceGraph($scope, $scope.nodes, $scope.links);
        $scope.$apply();
    };
    $scope.$watch('workspace.selection', function () {
        if(workspace.moveIfViewInvalid($location)) {
            return;
        }
        var isQueue = true;
        var jolokia = $scope.workspace.jolokia;
        if(jolokia) {
            var selection = $scope.workspace.selection;
            $scope.selectionDetinationName = null;
            if(selection) {
                if(selection.entries) {
                    $scope.selectionDetinationName = selection.entries["Destination"];
                    isQueue = selection.entries["Type"] !== "Topic";
                } else {
                    if(selection.folderNames) {
                        isQueue = selection.folderNames.last() !== "Topic";
                    }
                }
            }
            $scope.isQueue = isQueue;
            var typeName;
            if(isQueue) {
                typeName = "Queue";
            } else {
                typeName = "Topic";
            }
            jolokia.request([
                {
                    type: 'read',
                    mbean: "org.apache.activemq:Type=Subscription,destinationType=" + typeName + ",*"
                }, 
                {
                    type: 'read',
                    mbean: "org.apache.activemq:Type=Producer,*"
                }
            ], onSuccess([
                populateSubscribers, 
                populateProducers
            ]));
        }
    });
}
angular.module('FuseIDE', [
    'bootstrap', 
    'ngResource'
]).config(function ($routeProvider) {
    $routeProvider.when('/preferences', {
        templateUrl: 'partials/preferences.html'
    }).when('/attributes', {
        templateUrl: 'partials/attributes.html',
        controller: DetailController
    }).when('/charts', {
        templateUrl: 'partials/charts.html',
        controller: ChartController
    }).when('/logs', {
        templateUrl: 'partials/logs.html',
        controller: LogController
    }).when('/browseQueue', {
        templateUrl: 'partials/browseQueue.html',
        controller: QueueController
    }).when('/sendMessage', {
        templateUrl: 'partials/sendMessage.html',
        controller: SendMessageController
    }).when('/routes', {
        templateUrl: 'partials/routes.html',
        controller: CamelController
    }).when('/subscribers', {
        templateUrl: 'partials/subscribers.html',
        controller: SubscriberGraphController
    }).when('/createEndpoint', {
        templateUrl: 'partials/createEndpoint.html',
        controller: EndpointController
    }).when('/createQueue', {
        templateUrl: 'partials/createQueue.html',
        controller: DestinationController
    }).when('/createTopic', {
        templateUrl: 'partials/createTopic.html',
        controller: DestinationController
    }).when('/deleteQueue', {
        templateUrl: 'partials/deleteQueue.html',
        controller: DestinationController
    }).when('/deleteTopic', {
        templateUrl: 'partials/deleteTopic.html',
        controller: DestinationController
    }).when('/debug', {
        templateUrl: 'partials/debug.html',
        controller: DetailController
    }).when('/about', {
        templateUrl: 'partials/about.html',
        controller: DetailController
    }).when('/help', {
        redirectTo: '/help/overview'
    }).when('/help/:tabName', {
        templateUrl: 'partials/help.html',
        controller: NavBarController
    }).otherwise({
        redirectTo: '/attributes'
    });
}).factory('workspace', function ($rootScope, $location) {
    var url = $location.search()['url'] || "/jolokia";
    return new Workspace(url);
}).filter('humanize', function () {
    return humanizeValue;
});
function NavBarController($scope, $location, workspace) {
    $scope.workspace = workspace;
    $scope.validSelection = function (uri) {
        return workspace.validSelection(uri);
    };
    $scope.$on('$routeChangeSuccess', function () {
        var hash = $location.search();
        var text = "";
        if(hash) {
            for(var key in hash) {
                var value = hash[key];
                if(key && value) {
                    if(text.length === 0) {
                        text = "?";
                    } else {
                        text += "&";
                    }
                    text += key + "=" + value;
                }
            }
        }
        $scope.hash = encodeURI(text);
    });
    $scope.navClass = function (page) {
        var currentRoute = $location.path().substring(1) || 'home';
        return page === currentRoute ? 'active' : '';
    };
}
function HelpController($scope, $routeParams, $location) {
    $scope.currentTab = $routeParams.tabName;
    $scope.$watch('currentTab', function (name, oldName) {
        if(name !== oldName) {
            $location.path('help/' + name);
        }
    });
}
function PreferencesController($scope, $location, workspace) {
    $scope.workspace = workspace;
    $scope.updateRate = workspace.getUpdateRate();
    $scope.$watch('updateRate', function () {
        $scope.workspace.setUpdateRate($scope.updateRate);
    });
    $scope.gotoServer = function (url) {
        console.log("going to server: " + url);
        window.open("#/attributes?url=" + encodeURIComponent(url));
    };
}
function updateSelectionNode($location, node) {
    var key = null;
    if(node) {
        key = node['key'];
    }
    var q = {
    };
    if(key) {
        q['nid'] = key;
    }
    $location.search(q);
}
function MBeansController($scope, $location, workspace) {
    $scope.workspace = workspace;
    $scope.tree = new Folder('MBeans');
    $scope.counter = 0;
    $scope.$on("$routeChangeSuccess", function (event, current, previous) {
        setTimeout(updateSelectionFromURL, 50);
    });
    $scope.$watch('workspace.operationCounter', function () {
        $scope.counter += 1;
        loadTree();
    });
    $scope.select = function (node) {
        $scope.workspace.selection = node;
        updateSelectionNode($location, node);
        $scope.$apply();
    };
    function updateSelectionFromURL() {
        var key = $location.search()['nid'];
        if(key) {
            var node = $("#jmxtree").dynatree("getTree").activateKey(key);
            if(node) {
                node.expand(true);
            }
        }
    }
    function populateTree(response) {
        var rootId = 'root';
        var separator = '_';
        var tree = new Folder('MBeans');
        tree.key = rootId;
        var domains = response.value;
        for(var domain in domains) {
            var mbeans = domains[domain];
            for(var path in mbeans) {
                var entries = {
                };
                var folder = tree.getOrElse(domain);
                folder.domain = domain;
                if(!folder.key) {
                    folder.key = rootId + separator + domain;
                }
                var folderNames = [
                    domain
                ];
                folder.folderNames = folderNames;
                folderNames = folderNames.clone();
                var items = path.split(',');
                var paths = [];
                items.forEach(function (item) {
                    var kv = item.split('=');
                    var key = kv[0];
                    var value = kv[1] || key;
                    entries[key] = value;
                    paths.push(value);
                });
                var lastPath = paths.pop();
                paths.forEach(function (value) {
                    folder = folder.getOrElse(value);
                    folder.domain = domain;
                    folderNames.push(value);
                    folder.folderNames = folderNames;
                    folder.key = rootId + separator + folderNames.join(separator);
                    folderNames = folderNames.clone();
                });
                var mbeanInfo = {
                    key: rootId + separator + folderNames.join(separator) + separator + lastPath,
                    title: trimQuotes(lastPath),
                    domain: domain,
                    path: path,
                    paths: paths,
                    objectName: domain + ":" + path,
                    parent: folder,
                    entries: entries
                };
                folder.getOrElse(lastPath, mbeanInfo);
            }
        }
        $scope.tree = tree;
        if($scope.workspace) {
            $scope.workspace.tree = tree;
        }
        $scope.$apply();
        var treeElement = $("#jmxtree");
        treeElement.dynatree({
            onActivate: function (node) {
                var data = node.data;
                $scope.select(data);
            },
            persist: false,
            debugLevel: 0,
            children: $scope.workspace.tree.children
        });
        if($scope.counter > 1) {
            treeElement.dynatree("getTree").reload();
        }
        updateSelectionFromURL();
    }
    function loadTree() {
        var jolokia = workspace.jolokia;
        jolokia.request({
            type: 'list'
        }, onSuccess(populateTree, {
            canonicalNaming: false,
            maxDepth: 2
        }));
    }
}
var Table = (function () {
    function Table() {
        this.columns = {
        };
        this.rows = {
        };
    }
    Table.prototype.values = function (row, columns) {
        var answer = [];
        if(columns) {
            for(name in columns) {
                answer.push(row[name]);
            }
        }
        return answer;
    };
    Table.prototype.setRow = function (key, data) {
        var _this = this;
        this.rows[key] = data;
        Object.keys(data).forEach(function (key) {
            var columns = _this.columns;
            if(!columns[key]) {
                columns[key] = {
                    name: key
                };
            }
        });
    };
    return Table;
})();
function DetailController($scope, $routeParams, workspace, $rootScope) {
    $scope.routeParams = $routeParams;
    $scope.workspace = workspace;
    $scope.isTable = function (value) {
        return value instanceof Table;
    };
    $scope.getAttributes = function (value) {
        if(angular.isArray(value) && angular.isObject(value[0])) {
            return value;
        }
        if(angular.isObject(value) && !angular.isArray(value)) {
            return [
                value
            ];
        }
        return null;
    };
    $scope.rowValues = function (row, col) {
        return [
            row[col]
        ];
    };
    var asQuery = function (mbeanName) {
        return {
            type: "READ",
            mbean: mbeanName,
            ignoreErrors: true
        };
    };
    var tidyAttributes = function (attributes) {
        var objectName = attributes['ObjectName'];
        if(objectName) {
            var name = objectName['objectName'];
            if(name) {
                attributes['ObjectName'] = name;
            }
        }
    };
    $scope.$watch('workspace.selection', function () {
        var node = $scope.workspace.selection;
        closeHandle($scope, $scope.workspace.jolokia);
        var mbean = null;
        if(node) {
            mbean = node.objectName;
        }
        var query = null;
        var jolokia = workspace.jolokia;
        var updateValues = function (response) {
            var attributes = response.value;
            if(attributes) {
                tidyAttributes(attributes);
                $scope.attributes = attributes;
                $scope.$apply();
            } else {
                console.log("Failed to get a response! " + response);
            }
        };
        if(mbean) {
            query = asQuery(mbean);
        } else {
            if(node) {
                var children = node.children;
                if(children) {
                    var childNodes = children.map(function (child) {
                        return child.objectName;
                    });
                    var mbeans = childNodes.filter(function (mbean) {
                        return mbean;
                    });
                    if(mbeans && childNodes.length === mbeans.length && !ignoreFolderDetails(node)) {
                        query = mbeans.map(function (mbean) {
                            return asQuery(mbean);
                        });
                        if(query.length === 1) {
                            query = query[0];
                        } else {
                            if(query.length === 0) {
                                query = null;
                            } else {
                                $scope.attributes = new Table();
                                updateValues = function (response) {
                                    var attributes = response.value;
                                    if(attributes) {
                                        tidyAttributes(attributes);
                                        var mbean = attributes['ObjectName'];
                                        var request = response.request;
                                        if(!mbean && request) {
                                            mbean = request['mbean'];
                                        }
                                        if(mbean) {
                                            var table = $scope.attributes;
                                            if(!(table instanceof Table)) {
                                                table = new Table();
                                                $scope.attributes = table;
                                            }
                                            table.setRow(mbean, attributes);
                                            $scope.$apply();
                                        } else {
                                            console.log("no ObjectName in attributes " + Object.keys(attributes));
                                        }
                                    } else {
                                        console.log("Failed to get a response! " + JSON.stringify(response));
                                    }
                                };
                            }
                        }
                    }
                }
            }
        }
        if(query) {
            jolokia.request(query, onSuccess(updateValues));
            var callback = onSuccess(updateValues, {
                error: function (response) {
                    updateValues(response);
                }
            });
            if(angular.isArray(query)) {
                if(query.length >= 1) {
                    var args = [
                        callback
                    ].concat(query);
                    var fn = jolokia.register;
                    scopeStoreJolokiaHandle($scope, jolokia, fn.apply(jolokia, args));
                }
            } else {
                scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(callback, query));
            }
        }
    });
}
function LogController($scope, $location, workspace) {
    $scope.workspace = workspace;
    $scope.logs = [];
    $scope.toTime = 0;
    $scope.queryJSON = {
        type: "EXEC",
        mbean: logQueryMBean,
        operation: "logResultsSince",
        arguments: [
            $scope.toTime
        ],
        ignoreErrors: true
    };
    $scope.filterLogs = function (logs, query) {
        var filtered = [];
        var queryRegExp = null;
        if(query) {
            queryRegExp = RegExp(query.escapeRegExp(), 'i');
        }
        angular.forEach(logs, function (log) {
            if(!query || Object.values(log).any(function (value) {
                return value && value.toString().has(queryRegExp);
            })) {
                filtered.push(log);
            }
        });
        return filtered;
    };
    $scope.logClass = function (log) {
        var level = log['level'];
        if(level) {
            var lower = level.toLowerCase();
            if(lower.startsWith("warn")) {
                return "warning";
            } else {
                if(lower.startsWith("err")) {
                    return "error";
                } else {
                    if(lower.startsWith("debug")) {
                        return "info";
                    }
                }
            }
        }
        return "";
    };
    var updateValues = function (response) {
        var logs = response.events;
        var toTime = response.toTimestamp;
        if(toTime) {
            $scope.toTime = toTime;
            $scope.queryJSON.arguments = [
                toTime
            ];
        }
        if(logs) {
            var seq = 0;
            for(var idx in logs) {
                var log = logs[idx];
                if(log) {
                    if(!$scope.logs.any(function (item) {
                        return item.message === log.message && item.seq === log.message && item.timestamp === log.timestamp;
                    })) {
                        $scope.logs.push(log);
                    }
                }
            }
            $scope.$apply();
        } else {
            console.log("Failed to get a response! " + response);
        }
    };
    var jolokia = workspace.jolokia;
    jolokia.execute(logQueryMBean, "allLogResults", onSuccess(updateValues));
    var asyncUpdateValues = function (response) {
        var value = response.value;
        if(value) {
            updateValues(value);
        } else {
            console.log("Failed to get a response! " + response);
        }
    };
    var callback = onSuccess(asyncUpdateValues, {
        error: function (response) {
            asyncUpdateValues(response);
        }
    });
    scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(callback, $scope.queryJSON));
}
function ChartController($scope, $location, workspace) {
    $scope.workspace = workspace;
    $scope.metrics = [];
    $scope.$watch('workspace.selection', function () {
        var width = 594;
        var charts = $("#charts");
        if(charts) {
            width = charts.width();
        }
        if($scope.context) {
            $scope.context.stop();
            $scope.context = null;
        }
        charts.children().remove();
        var node = $scope.workspace.selection;
        var mbean = node.objectName;
        $scope.metrics = [];
        if(mbean) {
            var jolokia = $scope.workspace.jolokia;
            var context = cubism.context().serverDelay(0).clientDelay(0).step(1000).size(width);
            $scope.context = context;
            $scope.jolokiaContext = context.jolokia($scope.workspace.jolokia);
            var listKey = encodeMBeanPath(mbean);
            var meta = jolokia.list(listKey);
            if(meta) {
                var attributes = meta.attr;
                if(attributes) {
                    for(var key in attributes) {
                        var value = attributes[key];
                        if(value) {
                            var typeName = value['type'];
                            if(isNumberTypeName(typeName)) {
                                var metric = $scope.jolokiaContext.metric({
                                    type: 'read',
                                    mbean: mbean,
                                    attribute: key
                                }, humanizeValue(key));
                                if(metric) {
                                    $scope.metrics.push(metric);
                                }
                            }
                        }
                    }
                }
            }
        }
        if($scope.metrics.length > 0) {
            d3.select("#charts").selectAll(".axis").data([
                "top", 
                "bottom"
            ]).enter().append("div").attr("class", function (d) {
                return d + " axis";
            }).each(function (d) {
                d3.select(this).call(context.axis().ticks(12).orient(d));
            });
            d3.select("#charts").append("div").attr("class", "rule").call(context.rule());
            context.on("focus", function (i) {
                d3.selectAll(".value").style("right", i === null ? null : context.size() - i + "px");
            });
            $scope.metrics.forEach(function (metric) {
                d3.select("#charts").call(function (div) {
                    div.append("div").data([
                        metric
                    ]).attr("class", "horizon").call(context.horizon());
                });
            });
        }
    });
}
function CamelController($scope, $location, workspace) {
    $scope.workspace = workspace;
    $scope.routes = [];
    $scope.$watch('workspace.selection', function () {
        if(workspace.moveIfViewInvalid($location)) {
            return;
        }
        var mbean = getSelectionCamelContextMBean(workspace);
        if(mbean) {
            var jolokia = workspace.jolokia;
            jolokia.request({
                type: 'exec',
                mbean: mbean,
                operation: 'dumpRoutesAsXml()'
            }, onSuccess(populateTable));
        }
    });
    var populateTable = function (response) {
        var data = response.value;
        $scope.routes = data;
        var nodes = [];
        var links = [];
        var selectedRouteId = null;
        var selection = workspace.selection;
        if(selection) {
            if(selection && selection.entries) {
                var typeName = selection.entries["type"];
                var name = selection.entries["name"];
                if(typeName && name) {
                    selectedRouteId = trimQuotes(name);
                }
            }
        }
        if(data) {
            var doc = $.parseXML(data);
            var allRoutes = $(doc).find("route");
            var canvasDiv = $('#canvas');
            var width = canvasDiv.width();
            var height = canvasDiv.height();
            if(height < 300) {
                console.log("browse thinks the height is only " + height + " so calculating offset from doc height");
                height = $(document).height() - canvasDiv.offset()['top'] - 5;
            }
            console.log("Using width " + width + " and height " + height);
            var delta = 150;
            function addChildren(parent, parentId, parentX, parentY) {
                var x = parentX;
                var y = parentY + delta;
                $(parent).children().each(function (idx, route) {
                    var id = nodes.length;
                    if(route.nodeName === "from" && !parentId) {
                        parentId = id;
                    }
                    var name = route.nodeName;
                    var uri = route.getAttribute("uri");
                    if(uri) {
                        name += " " + uri;
                    }
                    var imageName = route.nodeName;
                    var endpointNames = [
                        "from", 
                        "to", 
                        "route"
                    ];
                    var genericNames = [
                        "xpath", 
                        "when", 
                        "otherwise"
                    ];
                    if(endpointNames.indexOf(imageName) >= 0) {
                        imageName = "endpoint";
                    } else {
                        if(genericNames.indexOf(imageName) >= 0) {
                            imageName = "generic";
                        }
                    }
                    var imageUrl = "/img/camel/" + imageName + "24.png";
                    nodes.push({
                        "name": name,
                        "label": name,
                        "group": 1,
                        "id": id,
                        "x": x,
                        "y:": y,
                        "imageUrl": imageUrl
                    });
                    if(parentId !== null && parentId !== id) {
                        console.log(parent.nodeName + "(" + parentId + " @" + parentX + "," + parentY + ")" + " -> " + route.nodeName + "(" + id + " @" + x + "," + y + ")");
                        links.push({
                            "source": parentId,
                            "target": id,
                            "value": 1
                        });
                    }
                    addChildren(route, id, x, y);
                    x += delta;
                });
            }
            var routeDelta = width / allRoutes.length;
            var rowX = 0;
            allRoutes.each(function (idx, route) {
                var routeId = route.getAttribute("id");
                if(!selectedRouteId || !routeId || selectedRouteId === routeId) {
                    addChildren(route, null, rowX, 0);
                    rowX += routeDelta;
                }
            });
            dagreLayoutGraph(nodes, links, width, height);
        }
        $scope.$apply();
    };
}
function getSelectionCamelContextMBean(workspace) {
    if(workspace) {
        var selection = workspace.selection;
        var tree = workspace.tree;
        var folderNames = selection.folderNames;
        var entries = selection.entries;
        var domain;
        var contextId;
        if(tree && selection) {
            if(folderNames && folderNames.length > 1) {
                domain = folderNames[0];
                contextId = folderNames[1];
            } else {
                if(entries) {
                    domain = selection.domain;
                    contextId = entries["context"];
                }
            }
        }
        if(domain && contextId) {
            var result = tree.navigate(domain, contextId, "context");
            if(result && result.children) {
                var contextBean = result.children.first();
                if(contextBean.title) {
                    var contextName = contextBean.title;
                    return "" + domain + ":context=" + contextId + ',type=context,name="' + contextName + '"';
                }
            }
        }
    }
    return null;
}
function EndpointController($scope, $location, workspace) {
    $scope.workspace = workspace;
    $scope.$watch('workspace.selection', function () {
        workspace.moveIfViewInvalid($location);
    });
    function operationSuccess() {
        $scope.endpointName = "";
        $scope.workspace.operationCounter += 1;
        $scope.$apply();
    }
    $scope.createEndpoint = function (name) {
        var jolokia = workspace.jolokia;
        if(jolokia) {
            var mbean = getSelectionCamelContextMBean(workspace);
            if(mbean) {
                console.log("Creating endpoint: " + name + " on mbean " + mbean);
                var operation = "createEndpoint(java.lang.String)";
                jolokia.execute(mbean, operation, name, onSuccess(operationSuccess));
            } else {
                console.log("Can't find the CamelContext MBean!");
            }
        }
    };
    $scope.deleteEndpoint = function () {
        var jolokia = workspace.jolokia;
        var selection = workspace.selection;
        var entries = selection.entries;
        if(selection && jolokia && entries) {
            var domain = selection.domain;
            var brokerName = entries["BrokerName"];
            var name = entries["Destination"];
            var isQueue = "Topic" !== entries["Type"];
            if(domain && brokerName) {
                var mbean = "" + domain + ":BrokerName=" + brokerName + ",Type=Broker";
                console.log("Deleting queue " + isQueue + " of name: " + name + " on mbean");
                var operation = "removeEndpoint(java.lang.String)";
                jolokia.execute(mbean, operation, name, onSuccess(operationSuccess));
            }
        }
    };
}
function SendMessageController($scope, $location, workspace) {
    $scope.workspace = workspace;
    $scope.$watch('workspace.selection', function () {
        workspace.moveIfViewInvalid($location);
    });
    var sendWorked = function () {
        console.log("Sent message!");
    };
    $scope.sendMessage = function (body) {
        var selection = workspace.selection;
        if(selection) {
            var mbean = selection.objectName;
            if(mbean) {
                var jolokia = workspace.jolokia;
                if(selection.domain === "org.apache.camel") {
                    var uri = selection.title;
                    mbean = getSelectionCamelContextMBean(workspace);
                    if(mbean) {
                        jolokia.execute(mbean, "sendStringBody(java.lang.String,java.lang.String)", uri, body, onSuccess(sendWorked));
                    } else {
                        console.log("Could not find CamelContext MBean!");
                    }
                } else {
                    jolokia.execute(mbean, "sendTextMessage(java.lang.String)", body, onSuccess(sendWorked));
                }
            }
        }
    };
}
function d3ForceGraph(scope, nodes, links, canvasSelector) {
    if (typeof canvasSelector === "undefined") { canvasSelector = "#canvas"; }
    if(scope.graphForce) {
        scope.graphForce.stop();
    }
    var canvasDiv = $(canvasSelector);
    canvasDiv.children("svg").remove();
    var width = canvasDiv.width();
    var height = canvasDiv.height();
    if(height < 300) {
        height = $(document).height() - canvasDiv.offset()['top'] - 5;
    }
    var svg = d3.select(canvasSelector).append("svg").attr("width", width).attr("height", height);
    var force = d3.layout.force().distance(100).charge(-120 * 10).linkDistance(50).size([
        width, 
        height
    ]);
    scope.graphForce = force;
    svg.append("svg:defs").selectAll("marker").data([
        "from"
    ]).enter().append("svg:marker").attr("id", String).attr("viewBox", "0 -5 10 10").attr("refX", 25).attr("refY", -1.5).attr("markerWidth", 6).attr("markerHeight", 6).attr("orient", "auto").append("svg:path").attr("d", "M0,-5L10,0L0,5");
    force.nodes(nodes).links(links).start();
    var link = svg.selectAll(".link").data(links).enter().append("line").attr("class", "link");
    link.attr("class", "link from");
    link.attr("marker-end", "url(#from)");
    var node = svg.selectAll(".node").data(nodes).enter().append("g").attr("class", "node").call(force.drag);
    node.append("image").attr("xlink:href", function (d) {
        return d.imageUrl;
    }).attr("x", -15).attr("y", -15).attr("width", 30).attr("height", 30);
    node.append("text").attr("dx", 20).attr("dy", ".35em").text(function (d) {
        return d.label;
    });
    force.on("tick", function () {
        link.attr("x1", function (d) {
            return d.source.x;
        }).attr("y1", function (d) {
            return d.source.y;
        }).attr("x2", function (d) {
            return d.target.x;
        }).attr("y2", function (d) {
            return d.target.y;
        });
        node.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    });
}
function dagreLayoutGraph(nodes, links, width, height) {
    var nodePadding = 10;
    var stateKeys = {
    };
    var transitions = [];
    nodes.forEach(function (node) {
        var idx = node.id;
        if(idx === undefined) {
            console.log("No node found for node " + JSON.stringify(node));
        } else {
            if(node.edges === undefined) {
                node.edges = [];
            }
            if(!node.label) {
                node.label = "node " + idx;
            }
            stateKeys[idx] = node;
        }
    });
    var states = d3.values(stateKeys);
    links.forEach(function (d) {
        var source = stateKeys[d.source];
        var target = stateKeys[d.target];
        if(source === undefined || target === undefined) {
            console.log("Bad link!  " + source + " target " + target + " for " + d);
        } else {
            var edge = {
                source: source,
                target: target
            };
            transitions.push(edge);
            source.edges.push(edge);
            target.edges.push(edge);
        }
    });
    function spline(e) {
        var points = e.dagre.points.slice(0);
        var source = dagre.util.intersectRect(e.source.dagre, points.length > 0 ? points[0] : e.source.dagre);
        var target = dagre.util.intersectRect(e.target.dagre, points.length > 0 ? points[points.length - 1] : e.source.dagre);
        points.unshift(source);
        points.push(target);
        return d3.svg.line().x(function (d) {
            return d.x;
        }).y(function (d) {
            return d.y;
        }).interpolate("linear")(points);
    }
    function translateEdge(e, dx, dy) {
        e.dagre.points.forEach(function (p) {
            p.x = Math.max(0, Math.min(svgBBox.width, p.x + dx));
            p.y = Math.max(0, Math.min(svgBBox.height, p.y + dy));
        });
    }
    var svg = d3.select("svg");
    $("svg").children("g").remove();
    var svgGroup = svg.append("g").attr("transform", "translate(5, 5)");
    var nodes = svgGroup.selectAll("g .node").data(states).enter().append("g").attr("class", "node").attr("id", function (d) {
        return "node-" + d.label;
    });
    var edges = svgGroup.selectAll("path .edge").data(transitions).enter().append("path").attr("class", "edge").attr("marker-end", "url(#arrowhead)");
    var rects = nodes.append("rect").attr("rx", "5").attr("ry", "5").attr("filter", "url(#drop-shadow)");
    nodes.append("image").attr("xlink:href", function (d) {
        return d.imageUrl;
    }).attr("x", -12).attr("y", -20).attr("height", 24).attr("width", 24);
    var labels = nodes.append("text").attr("text-anchor", "middle").attr("x", 0);
    labels.append("tspan").attr("x", 0).attr("dy", 28).text(function (d) {
        return d.label;
    });
    var labelPadding = 12;
    labels.each(function (d) {
        var bbox = this.getBBox();
        d.bbox = bbox;
        d.width = bbox.width + 2 * nodePadding;
        d.height = bbox.height + 2 * nodePadding + labelPadding;
    });
    rects.attr("x", function (d) {
        return -(d.bbox.width / 2 + nodePadding);
    }).attr("y", function (d) {
        return -(d.bbox.height / 2 + nodePadding + (labelPadding / 2));
    }).attr("width", function (d) {
        return d.width;
    }).attr("height", function (d) {
        return d.height;
    });
    labels.attr("x", function (d) {
        return -d.bbox.width / 2;
    }).attr("y", function (d) {
        return -d.bbox.height / 2;
    });
    dagre.layout().nodeSep(50).edgeSep(10).rankSep(50).nodes(states).edges(transitions).debugLevel(1).run();
    nodes.attr("transform", function (d) {
        return 'translate(' + d.dagre.x + ',' + d.dagre.y + ')';
    });
    edges.attr('id', function (e) {
        return e.dagre.id;
    }).attr("d", function (e) {
        return spline(e);
    });
    var svgBBox = svg.node().getBBox();
    svg.attr("width", svgBBox.width + 10);
    svg.attr("height", svgBBox.height + 10);
    var nodeDrag = d3.behavior.drag().origin(function (d) {
        return d.pos ? {
            x: d.pos.x,
            y: d.pos.y
        } : {
            x: d.dagre.x,
            y: d.dagre.y
        };
    }).on('drag', function (d, i) {
        var prevX = d.dagre.x;
        var prevY = d.dagre.y;

        d.dagre.x = Math.max(d.width / 2, Math.min(svgBBox.width - d.width / 2, d3.event.x));
        d.dagre.y = Math.max(d.height / 2, Math.min(svgBBox.height - d.height / 2, d3.event.y));
        d3.select(this).attr('transform', 'translate(' + d.dagre.x + ',' + d.dagre.y + ')');
        var dx = d.dagre.x - prevX;
        var dy = d.dagre.y - prevY;

        d.edges.forEach(function (e) {
            translateEdge(e, dx, dy);
            d3.select('#' + e.dagre.id).attr('d', spline(e));
        });
    });
    var edgeDrag = d3.behavior.drag().on('drag', function (d, i) {
        translateEdge(d, d3.event.dx, d3.event.dy);
        d3.select(this).attr('d', spline(d));
    });
    nodes.call(nodeDrag);
    edges.call(edgeDrag);
}
var logQueryMBean = 'org.fusesource.insight:type=LogQuery';
var ignoreDetailsOnBigFolders = [
    [
        [
            'java.lang'
        ], 
        [
            'MemoryPool', 
            'GarbageCollector'
        ]
    ]
];
var numberTypeNames = {
    'byte': true,
    'short': true,
    'integer': true,
    'long': true,
    'float': true,
    'double': true,
    'java.lang.Byte': true,
    'java.lang.Short': true,
    'java.lang.Integer': true,
    'java.lang.Long': true,
    'java.lang.Float': true,
    'java.lang.Double': true
};
function humanizeValue(value) {
    if(value) {
        var text = value.toString();
        return trimQuotes(text.underscore().humanize());
    }
    return value;
}
function trimQuotes(text) {
    while(text.endsWith('"') || text.endsWith("'")) {
        text = text.substring(0, text.length - 1);
    }
    while(text.startsWith('"') || text.startsWith("'")) {
        text = text.substring(1, text.length);
    }
    return text;
}
function ignoreFolderDetails(node) {
    return folderMatchesPatterns(node, ignoreDetailsOnBigFolders);
}
function folderMatchesPatterns(node, patterns) {
    if(node) {
        var folderNames = node.folderNames;
        if(folderNames) {
            return patterns.any(function (ignorePaths) {
                for(var i = 0; i < ignorePaths.length; i++) {
                    var folderName = folderNames[i];
                    var ignorePath = ignorePaths[i];
                    if(!folderName) {
                        return false;
                    }
                    var idx = ignorePath.indexOf(folderName);
                    if(idx < 0) {
                        return false;
                    }
                }
                return true;
            });
        }
    }
    return false;
}
function scopeStoreJolokiaHandle($scope, jolokia, jolokiaHandle) {
    if(jolokiaHandle) {
        $scope.$on('$destroy', function () {
            closeHandle($scope, jolokia);
        });
        $scope.jolokiaHandle = jolokiaHandle;
    }
}
function closeHandle($scope, jolokia) {
    var jolokiaHandle = $scope.jolokiaHandle;
    if(jolokiaHandle) {
        jolokia.unregister(jolokiaHandle);
        $scope.jolokiaHandle = null;
    }
}
function onSuccess(fn, options) {
    if (typeof options === "undefined") { options = {
    }; }
    options['ignoreErrors'] = true;
    options['mimeType'] = 'application/json';
    options['success'] = fn;
    if(!options['error']) {
        options['error'] = function (response) {
            console.log("Jolokia request failed: " + response.error);
        };
    }
    return options;
}
function supportsLocalStorage() {
    try  {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}
function isNumberTypeName(typeName) {
    if(typeName) {
        var text = typeName.toString().toLowerCase();
        var flag = numberTypeNames[text];
        return flag;
    }
    return false;
}
function encodeMBeanPath(mbean) {
    return mbean.replace(/\//g, '!/').replace(':', '/').escapeURL();
}
function encodeMBean(mbean) {
    return mbean.replace(/\//g, '!/').escapeURL();
}
var Workspace = (function () {
    function Workspace(url) {
        this.url = url;
        var _this = this;
        this.jolokia = null;
        this.updateRate = 0;
        this.operationCounter = 0;
        this.selection = null;
        this.tree = null;
        this.dummyStorage = {
        };
        this.uriValidations = null;
        var rate = this.getUpdateRate();
        this.jolokia = new Jolokia(url);
        console.log("Jolokia URL is " + url);
        this.setUpdateRate(rate);
        this.uriValidations = {
            'browseQueue': function () {
                return _this.isQueue();
            },
            'sendMessage': function () {
                return _this.isQueue() || _this.isTopic() || _this.isEndpoint();
            },
            'subscribers': function () {
                return _this.isActiveMQFolder();
            },
            'createQueue': function () {
                return _this.isQueuesFolder();
            },
            'createTopic': function () {
                return _this.isTopicsFolder();
            },
            'deleteQueue': function () {
                return _this.isQueue();
            },
            'deleteTopic': function () {
                return _this.isTopic();
            },
            'routes': function () {
                return _this.isCamelFolder();
            },
            'createEndpoint': function () {
                return _this.isEndpointsFolder();
            }
        };
    }
    Workspace.prototype.getLocalStorage = function (key) {
        if(supportsLocalStorage()) {
            return localStorage[key];
        }
        return this.dummyStorage[key];
    };
    Workspace.prototype.setLocalStorage = function (key, value) {
        if(supportsLocalStorage()) {
            localStorage[key] = value;
        } else {
            this.dummyStorage[key] = value;
        }
    };
    Workspace.prototype.getUpdateRate = function () {
        return this.getLocalStorage('updateRate') || 5000;
    };
    Workspace.prototype.setUpdateRate = function (value) {
        this.jolokia.stop();
        this.setLocalStorage('updateRate', value);
        if(value > 0) {
            this.jolokia.start(value);
        }
        console.log("Set update rate to: " + value);
    };
    Workspace.prototype.validSelection = function (uri) {
        var value = this.uriValidations[uri];
        if(value) {
            if(angular.isFunction(value)) {
                return value();
            }
        }
        return true;
    };
    Workspace.prototype.moveIfViewInvalid = function ($location) {
        var uri = $location.path().substring(1);
        console.log("URI is now " + uri);
        if(!this.validSelection(uri)) {
            console.log("tab no longer valid so changing!");
            $location.path("attributes");
        }
        return false;
    };
    Workspace.prototype.hasDomainAndProperties = function (objectName, properties) {
        if (typeof properties === "undefined") { properties = null; }
        var workspace = this;
        var tree = workspace.tree;
        var node = workspace.selection;
        if(tree && node) {
            var folder = tree.get(objectName);
            if(folder) {
                if(objectName !== node.domain) {
                    return false;
                }
                if(properties) {
                    var entries = node.entries;
                    if(!entries) {
                        return false;
                    }
                    for(var key in properties) {
                        var value = properties[key];
                        if(!value || entries[key] !== value) {
                            return false;
                        }
                    }
                }
                return true;
            } else {
            }
        } else {
        }
        return false;
    };
    Workspace.prototype.hasDomainAndLastPath = function (objectName, lastName) {
        var workspace = this;
        var node = workspace.selection;
        if(node) {
            if(objectName === node.domain) {
                var folders = node.folderNames;
                if(folders) {
                    var last = folders.last();
                    return last === lastName;
                }
            }
        }
        return false;
    };
    Workspace.prototype.isQueue = function () {
        return this.hasDomainAndProperties('org.apache.activemq', {
            Type: 'Queue'
        });
    };
    Workspace.prototype.isTopic = function () {
        return this.hasDomainAndProperties('org.apache.activemq', {
            Type: 'Topic'
        });
    };
    Workspace.prototype.isQueuesFolder = function () {
        return this.hasDomainAndLastPath('org.apache.activemq', 'Queue');
    };
    Workspace.prototype.isTopicsFolder = function () {
        return this.hasDomainAndLastPath('org.apache.activemq', 'Topic');
    };
    Workspace.prototype.isActiveMQFolder = function () {
        return this.hasDomainAndProperties('org.apache.activemq');
    };
    Workspace.prototype.isCamelContext = function () {
        return this.hasDomainAndProperties('org.apache.camel', {
            type: 'context'
        });
    };
    Workspace.prototype.isCamelFolder = function () {
        return this.hasDomainAndProperties('org.apache.camel');
    };
    Workspace.prototype.isEndpointsFolder = function () {
        return this.hasDomainAndLastPath('org.apache.camel', 'endpoints');
    };
    Workspace.prototype.isEndpoint = function () {
        return this.hasDomainAndProperties('org.apache.camel', {
            type: 'endpoints'
        });
    };
    Workspace.prototype.isRoutesFolder = function () {
        return this.hasDomainAndLastPath('org.apache.camel', 'routes');
    };
    return Workspace;
})();
var Folder = (function () {
    function Folder(title) {
        this.title = title;
        this.isFolder = true;
        this.key = null;
        this.children = [];
        this.folderNames = [];
        this.domain = null;
        this.map = {
        };
    }
    Folder.prototype.get = function (key) {
        return this.map[key];
    };
    Folder.prototype.navigate = function () {
        var paths = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            paths[_i] = arguments[_i + 0];
        }
        var node = this;
        paths.forEach(function (path) {
            if(node) {
                node = node.get(path);
            }
        });
        return node;
    };
    Folder.prototype.getOrElse = function (key, defaultValue) {
        if (typeof defaultValue === "undefined") { defaultValue = new Folder(key); }
        var answer = this.map[key];
        if(!answer) {
            answer = defaultValue;
            this.map[key] = answer;
            this.children.push(answer);
            this.children = this.children.sortBy("title");
        }
        return answer;
    };
    return Folder;
})();
