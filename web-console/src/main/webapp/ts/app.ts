function humanizeValue(value) {
  if (value) {
    var text = value.toString();
    return trimQuotes(text.underscore().humanize());
  }
  return value;
}

function trimQuotes(text:string) {
  if ((text.startsWith('"') || text.startsWith("'")) && (text.endsWith('"') || text.endsWith("'"))) {
    return text.substring(1, text.length - 1);
  }
  return text;
}

angular.module('FuseIDE', ['ngResource']).
        config(($routeProvider) => {
          $routeProvider.
                  when('/preferences', {templateUrl: 'partials/preferences.html'}).
                  when('/attributes', {templateUrl: 'partials/attributes.html', controller: DetailController}).
                  when('/charts', {templateUrl: 'partials/charts.html', controller: ChartController}).
                  when('/logs', {templateUrl: 'partials/logs.html', controller: LogController}).
                  when('/browseQueue', {templateUrl: 'partials/browseQueue.html', controller: QueueController}).
                  when('/sendMessage', {templateUrl: 'partials/sendMessage.html', controller: QueueController}).
                  when('/routes', {templateUrl: 'partials/routes.html', controller: CamelController}).
                  when('/subscribers', {templateUrl: 'partials/subscribers.html', controller: SubscriberGraphController}).
                  when('/debug', {templateUrl: 'partials/debug.html', controller: DetailController}).
                  when('/about', {templateUrl: 'partials/about.html', controller: DetailController}).
                  otherwise({redirectTo: '/attributes'});
        }).
        factory('workspace',($rootScope, $location) => {
          var url = $location.search()['url'] || "/jolokia";
          return new Workspace(url);
        }).
        filter('humanize', () => humanizeValue);

var logQueryMBean = 'org.fusesource.insight:type=LogQuery';

// the paths into the mbean tree which we should ignore doing a folder view
// due to the huge size involved!
var ignoreDetailsOnBigFolders = [
  [
    ['java.lang'],
    ['MemoryPool', 'GarbageCollector']
  ]
];

function ignoreFolderDetails(node) {
  return folderMatchesPatterns(node, ignoreDetailsOnBigFolders);
}

function folderMatchesPatterns(node, patterns) {
  if (node) {
    var folderNames = node.folderNames;
    if (folderNames) {
      return patterns.any((ignorePaths) => {
        for (var i = 0; i < ignorePaths.length; i++) {
          var folderName = folderNames[i];
          var ignorePath = ignorePaths[i];
          if (!folderName) return false;
          var idx = ignorePath.indexOf(folderName);
          if (idx < 0) {
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
  // TODO do we even need to store the jolokiaHandle in the scope?
  if (jolokiaHandle) {
    $scope.$on('$destroy', function () {
      closeHandle($scope, jolokia)
    });
    $scope.jolokiaHandle = jolokiaHandle;
  }
}

function closeHandle($scope, jolokia) {
  var jolokiaHandle = $scope.jolokiaHandle
  if (jolokiaHandle) {
    //console.log('Closing the handle ' + jolokiaHandle);
    jolokia.unregister(jolokiaHandle);
    $scope.jolokiaHandle = null;
  }
}

function onSuccess(fn, options = {}) {
  options['ignoreErrors'] = true;
  options['mimeType'] = 'application/json';
  options['success'] = fn;
  if (!options['error']) {
    options['error'] = function (response) {
      //alert("Jolokia request failed: " + response.error);
      console.log("Jolokia request failed: " + response.error);
    };
  }
  return options;
}

function supportsLocalStorage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

class Workspace {
  public jolokia = null;
  public updateRate = 0;
  public selection = [];
  dummyStorage = {};

  constructor(url: string) {
    var rate = this.getUpdateRate();
    this.jolokia = new Jolokia(url);
    console.log("Jolokia URL is " + url);
    this.setUpdateRate(rate);
  }


  getLocalStorage(key:string) {
    if (supportsLocalStorage()) {
      return localStorage[key];
    }
    return this.dummyStorage[key];
  }

  setLocalStorage(key:string, value:any) {
    if (supportsLocalStorage()) {
      localStorage[key] = value;
    } else {
      this.dummyStorage[key] = value;
    }
  }

  getUpdateRate() {
    return this.getLocalStorage('updateRate') || 5000;
  }

  /**
   * sets the update rate
   */
          setUpdateRate(value) {
    this.jolokia.stop();
    this.setLocalStorage('updateRate', value)
    if (value > 0) {
      this.jolokia.start(value);
    }
    console.log("Set update rate to: " + value);
  }
}

class Folder {
  constructor(public title:string) {
  }

  isFolder = true;
  key: string = null;
  children = [];
  folderNames = [];
  domain: string = null;
  map = {};

  get(key:string):Folder {
    return this.map[key];
  }

  getOrElse(key:string, defaultValue:any = new Folder(key)):Folder {
    var answer = this.map[key];
    if (!answer) {
      answer = defaultValue;
      this.map[key] = answer;
      this.children.push(answer)
    }
    return answer;
  }
}

function NavBarController($scope, $location, workspace) {
  $scope.workspace = workspace;

  // when we change the view/selection lets update the hash so links have the latest stuff
  $scope.$on('$routeChangeSuccess', function(){
    var hash = $location.search();
    // TODO there must be a nice function somewhere to do this in a nicer way!
    // NOTE we are not encoding anything
    var text = "";
    if (hash) {
      for (var key in hash) {
        var value = hash[key];
        if (key && value) {
          if (text.length === 0) {
            text = "?";
          } else {
            text += "&"
          }
          text += key + "=" + value;
        }
      }
    }
    $scope.hash = encodeURI(text);
  });

  $scope.navClass = (page) => {
    var currentRoute = $location.path().substring(1) || 'home';
    return page === currentRoute ? 'active' : '';
  };

  // only display stuff if we have an mbean with the given properties
  $scope.hasDomainAndProperties = (objectName, properties) => {
    var workspace = $scope.workspace;
    if (workspace) {
      var tree = workspace.tree;
      var node = workspace.selection;
      if (tree && node) {
        var folder = tree.get(objectName);
        if (folder) {
          if (objectName !== node.domain) return false;
          if (properties) {
            var entries = node.entries;
            if (!entries) return false;
            for (var key in properties) {
              var value = properties[key];
              if (!value || entries[key] !== value) {
                return false;
              }
            }
          }
          return true
        } else {
          // console.log("no hasMBean for " + objectName + " in tree " + tree);
        }
      } else {
        // console.log("workspace has no tree! returning false for hasMBean " + objectName);
      }
    } else {
      // console.log("no workspace for hasMBean " + objectName);
    }
    return false
  }
}

function PreferencesController($scope, workspace) {
  $scope.workspace = workspace;
  $scope.updateRate = workspace.getUpdateRate();

  $scope.$watch('updateRate', () => {
    $scope.workspace.setUpdateRate($scope.updateRate);
  });
}

function MBeansController($scope, $location, workspace) {
  $scope.workspace = workspace;
  $scope.tree = new Folder('MBeans');

  $scope.$on("$routeChangeSuccess", function (event, current, previous) {
    // lets do this asynchronously to avoid Error: $digest already in progress
    setTimeout(updateSelectionFromURL, 50);
  });

  $scope.select = (node) => {
    $scope.workspace.selection = node;
    var key = null;
    if (node) {
      key = node['key'];
    }
    var q = {};
    if (key) {
      q['nid'] = key
    }
    $location.search(q);
    $scope.$apply();
  };

  function updateSelectionFromURL() {
    var key = $location.search()['nid'];
    if (key) {
      $("#jmxtree").dynatree("getTree").activateKey(key);
    }
  }

  function populateTree(response) {
    var rootId = 'root';
    var separator = '_';
    var tree = new Folder('MBeans');
    tree.key = rootId;
    var domains = response.value;
    for (var domain in domains) {
      var mbeans = domains[domain];
      for (var path in mbeans) {
        var entries = {};
        var folder = tree.getOrElse(domain);
        folder.domain = domain;
        if (!folder.key) {
          folder.key = rootId + separator + domain;
        }
        var folderNames = [domain];
        folder.folderNames = folderNames;
        folderNames = folderNames.clone();
        var items = path.split(',');
        var paths = [];
        items.forEach(item => {
          var kv = item.split('=');
          var key = kv[0];
          var value = kv[1] || key;
          entries[key] = value;
          paths.push(value);
        });

        var lastPath = paths.pop();
        paths.forEach(value => {
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
          entries: entries
        };
        folder.getOrElse(lastPath, mbeanInfo);
      }
    }
    // TODO we should do a merge across...
    // so we only insert or delete things!
    $scope.tree = tree;
    if ($scope.workspace) {
      $scope.workspace.tree = tree;
    }
    $scope.$apply();

    $("#jmxtree").dynatree({
      onActivate: function (node) {
        var data = node.data;
        $scope.select(data);
      },
      persist: false,
      debugLevel: 0,
      children: tree.children
    });
    updateSelectionFromURL();
  }

  var jolokia = workspace.jolokia;
  jolokia.request(
          {type: 'list'},
          onSuccess(populateTree, {canonicalNaming: false, maxDepth: 2}));

  // TODO auto-refresh the tree...
}

class Table {
  public columns = {};
  public rows = {};

  public values(row, columns) {
    var answer = [];
    if (columns) {
      for (name in columns) {
        //console.log("Looking up: " + name + " on row ");
        answer.push(row[name]);
      }
    }
    return answer;
  }

  public setRow(key, data) {
    this.rows[key] = data;
    Object.keys(data).forEach((key) => {
      // could store type info...
      var columns = this.columns;
      if (!columns[key]) {
        columns[key] = {name: key};
      }
    });
  }
}

function DetailController($scope, $routeParams, workspace, $rootScope) {
  $scope.routeParams = $routeParams;
  $scope.workspace = workspace;

  $scope.isTable = (value) => {
    return value instanceof Table;
  };

  $scope.getAttributes = (value) => {
    if (angular.isArray(value) && angular.isObject(value[0])) return value;
    if (angular.isObject(value) && !angular.isArray(value)) return [value];
    return null;
  };

  $scope.rowValues = (row, col) => {
    return [row[col]];
  };

  var asQuery = (mbeanName) => {
    return { type: "READ", mbean: mbeanName, ignoreErrors: true};
  };

  var tidyAttributes = (attributes) => {
    var objectName = attributes['ObjectName'];
    if (objectName) {
      var name = objectName['objectName'];
      if (name) {
        attributes['ObjectName'] = name;
      }
    }
  };

  $scope.$watch('workspace.selection', function () {
    var node = $scope.workspace.selection;
    closeHandle($scope, $scope.workspace.jolokia);
    var mbean = node.objectName;
    var query = null;
    var jolokia = workspace.jolokia;
    var updateValues:any = function (response) {
      var attributes = response.value;
      if (attributes) {
        tidyAttributes(attributes);
        $scope.attributes = attributes;
        $scope.$apply();
      } else {
        console.log("Failed to get a response! " + response);
      }
    };
    if (mbean) {
      query = asQuery(mbean)
    } else {
      // lets query each child's details
      var children = node.children;
      if (children) {
        var childNodes = children.map((child) => child.objectName);
        var mbeans = childNodes.filter((mbean) => mbean);
        //console.log("Found mbeans: " + mbeans + " child nodes " + childNodes.length + " child mbeans " + mbeans.length);

        // lets filter out the collections of collections; so only have collections of mbeans
        if (mbeans && childNodes.length === mbeans.length && !ignoreFolderDetails(node)) {
          query = mbeans.map((mbean) => asQuery(mbean));
          if (query.length === 1) {
            query = query[0];
          } else if (query.length === 0) {
            query = null;
          } else {
            // now lets create an update function for each row which are all invoked async
            $scope.attributes = new Table();
            updateValues = function (response) {
              var attributes = response.value;
              if (attributes) {
                tidyAttributes(attributes);
                var mbean = attributes['ObjectName'];
                var request = response.request;
                if (!mbean && request) {
                  mbean = request['mbean'];
                }
                if (mbean) {
                  var table = $scope.attributes;
                  if (!(table instanceof Table)) {
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
    if (query) {
      // lets get the values immediately
      jolokia.request(query, onSuccess(updateValues));
      var callback = onSuccess(updateValues,
              {
                error: (response) => {
                  updateValues(response);
                }
              });

      // listen for updates
      if (angular.isArray(query)) {
        if (query.length >= 1) {
          var args = [callback].concat(query);
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
  //$scope.logs = {};
  $scope.logs = [];
  $scope.toTime = 0;
  $scope.queryJSON = { type: "EXEC", mbean: logQueryMBean, operation: "logResultsSince", arguments: [$scope.toTime], ignoreErrors: true};

  $scope.filterLogs = function (logs, query) {
    var filtered = [];
    var queryRegExp = null;
    if (query) {
      queryRegExp = RegExp(query.escapeRegExp(), 'i'); //'i' -> case insensitive
    }
    angular.forEach(logs, function (log) {
      if (!query || Object.values(log).any((value) => value && value.toString().has(queryRegExp))) {
        filtered.push(log);
      }
    });
    return filtered;
  };

  $scope.logClass = (log) => {
    var level = log['level'];
    if (level) {
      var lower = level.toLowerCase();
      if (lower.startsWith("warn")) {
        return "warning"
      } else if (lower.startsWith("err")) {
        return "error";
      } else if (lower.startsWith("debug")) {
        return "info";
      }
    }
    return "";
  };

  var updateValues = function (response) {
    var logs = response.events;
    var toTime = response.toTimestamp;
    if (toTime) {
      $scope.toTime = toTime;
      $scope.queryJSON.arguments = [toTime];
    }
    if (logs) {
      var seq = 0;
      for (var idx in logs) {
        var log = logs[idx];
        if (log) {
          if (!$scope.logs.any((item) => item.message === log.message && item.seq === log.message && item.timestamp === log.timestamp)) {
            $scope.logs.push(log);
          }
        }
      }
      //console.log("Got results " + logs.length + " last seq: " + seq);
      $scope.$apply();
    } else {
      console.log("Failed to get a response! " + response);
    }
  };

  var jolokia = workspace.jolokia;
  jolokia.execute(logQueryMBean, "allLogResults", onSuccess(updateValues));

  // listen for updates adding the since
  var asyncUpdateValues = function (response) {
    var value = response.value;
    if (value) {
      updateValues(value);
    } else {
      console.log("Failed to get a response! " + response);
    }
  };

  var callback = onSuccess(asyncUpdateValues,
          {
            error: (response) => {
              asyncUpdateValues(response);
            }
          });

  scopeStoreJolokiaHandle($scope, jolokia, jolokia.register(callback, $scope.queryJSON));
}

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
}
function isNumberTypeName(typeName):bool {
  if (typeName) {
    var text = typeName.toString().toLowerCase();
    var flag = numberTypeNames[text];
    return flag;
  }
  return false;
}

function ChartController($scope, $location, workspace) {
  $scope.workspace = workspace;
  $scope.metrics = [];

  $scope.$watch('workspace.selection', function () {
    var width = 594;
    var charts = $("#charts");
    if (charts) {
      width = charts.width();
    }
    // lets stop any old context and remove its charts first
    if ($scope.context) {
      $scope.context.stop();
      $scope.context = null;
    }
    charts.children().remove();

    // some sample metrics
    /*  var metricMem = jolokia.metric({
     type: 'read',
     mbean: 'java.lang:type=Memory',
     attribute: 'HeapMemoryUsage',
     path: 'used'
     }, "HeapMemory Usage");

     var metricLoad = jolokia.metric({
     type: 'read',
     mbean: 'java.lang:type=OperatingSystem',
     attribute: 'ProcessCpuTime'
     }, "CPU Load");

     var memory = jolokia.metric(
     function (resp1, resp2) {
     return Number(resp1.value) / Number(resp2.value);
     },
     {type: "read", mbean: "java.lang:type=Memory", attribute: "HeapMemoryUsage", path: "used"},
     {type: "read", mbean: "java.lang:type=Memory", attribute: "HeapMemoryUsage", path: "max"}, "Heap-Memory"
     );
     var gcCount = jolokia.metric(
     {type: "read", mbean: "java.lang:name=PS MarkSweep,type=GarbageCollector", attribute: "CollectionCount"},
     {delta: 1000, name: "GC Old"}
     );
     var gcCount2 = jolokia.metric(
     {type: "read", mbean: "java.lang:name=PS Scavenge,type=GarbageCollector", attribute: "CollectionCount"},
     {delta: 1000, name: "GC Young"}
     );
     */

    var node = $scope.workspace.selection;
    var mbean = node.objectName;
    $scope.metrics = [];
    if (mbean) {
      var jolokia = $scope.workspace.jolokia;
      var context = cubism.context()
              .serverDelay(0)
              .clientDelay(0)
              .step(1000)
              .size(width);

      $scope.context = context;
      $scope.jolokiaContext = context.jolokia($scope.workspace.jolokia);

      // TODO make generic as we can cache them; they rarely ever change
      // lets get the attributes for this mbean

      // we need to escape the mbean path for list
      var listKey = mbean.replace(/\//g, '!/').replace(':', '/').escapeURL();
      //console.log("Looking up mbeankey: " + listKey);
      var meta = jolokia.list(listKey);
      if (meta) {
        var attributes = meta.attr;
        if (attributes) {
          for (var key in attributes) {
            var value = attributes[key];
            if (value) {
              var typeName = value['type'];
              if (isNumberTypeName(typeName)) {
                var metric = $scope.jolokiaContext.metric({
                  type: 'read',
                  mbean: mbean,
                  attribute: key
                }, humanizeValue(key));
                if (metric) {
                  $scope.metrics.push(metric);
                }
              }
            }
          }
        }
      }
    }

    if ($scope.metrics.length > 0) {
      d3.select("#charts").selectAll(".axis")
              .data(["top", "bottom"])
              .enter().append("div")
              .attr("class", function (d) {
                return d + " axis";
              })
              .each(function (d) {
                d3.select(this).call(context.axis().ticks(12).orient(d));
              });

      d3.select("#charts").append("div")
              .attr("class", "rule")
              .call(context.rule());

      context.on("focus", function (i) {
        d3.selectAll(".value").style("right", i === null ? null : context.size() - i + "px");
      });

      $scope.metrics.forEach((metric) => {
        d3.select("#charts").call(function (div) {
          div.append("div")
                  .data([metric])
                  .attr("class", "horizon")
                  .call(context.horizon());
          //.call(context.horizon().extent([-10, 10]));
        });
      });
    }
  });
}
