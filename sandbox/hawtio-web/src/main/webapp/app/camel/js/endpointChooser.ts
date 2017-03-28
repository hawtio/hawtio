/**
 * @module Camel
 */
module Camel {

  /**
   * Define the default categories for endpoints and map them to endpoint names
   * @property
   * @for Camel
   * @type {ObjecT}
   */
  export var endpointCategories = {
    bigdata: {
      label: "Big Data",
      endpoints: ["hdfs", "hbase", "lucene", "solr"],
      endpointIcon: "/img/icons/camel/endpointRepository24.png"
    },
    database: {
      label: "Database",
      endpoints: ["couchdb", "elasticsearch", "hbase", "jdbc", "jpa", "hibernate", "mongodb", "mybatis", "sql"],
      endpointIcon: "/img/icons/camel/endpointRepository24.png"
    },
    cloud: {
      label: "Cloud",
      endpoints: [
        "aws-cw", "aws-ddb", "aws-sdb", "aws-ses", "aws-sns", "aws-sqs", "aws-s3",
        "gauth", "ghhtp", "glogin", "gtask",
        "jclouds"]
    },
    core: {
      label: "Core",
      endpoints: ["bean", "direct", "seda"]
    },
    messaging: {
      label: "Messaging",
      endpoints: ["jms", "activemq", "amqp", "cometd", "cometds", "mqtt", "netty", "vertx", "websocket"],
      endpointIcon: "/img/icons/camel/endpointQueue24.png"
    },
    mobile: {
      label: "Mobile",
      endpoints: ["apns"]
    },
    sass: {
      label: "SaaS",
      endpoints: ["salesforce", "sap-netweaver"]
    },
    social: {
      label: "Social",
      endpoints: ["atom", "facebook", "irc", "ircs", "rss", "smpp", "twitter", "weather"]
    },
    storage: {
      label: "Storage",
      endpointIcon: "/img/icons/camel/endpointFolder24.png",
      endpoints: ["file", "ftp", "sftp", "scp", "jsch"]
    },
    template: {
      label: "Templating",
      endpoints: ["freemarker", "velocity", "xquery", "xslt", "scalate", "string-template"]
    }
  };

  /**
   * Maps endpoint names to a category object
   * @property
   * @for Camel
   * @type {ObjecT}
   */
  export var endpointToCategory = {};

  export var endpointIcon = "/img/icons/camel/endpoint24.png";

  /**
   *  specify custom label & icon properties for endpoint names
   * @property
   * @for Camel
   * @type {ObjecT}
   */
  export var endpointConfigurations = {
    activemq: {
      icon: "/img/icons/camel/endpoints/activemq24.png"
    },
    atom: {
      icon: "/img/icons/camel/endpoints/atom24.png"
    },
    bean: {
      icon: "/img/icons/camel/endpoints/bean24.png"
    },
    cxf: {
      icon: "/img/icons/camel/endpoints/cxf24.png"
    },
    cxfrs: {
      icon: "/img/icons/camel/endpoints/cxfrs24.png"
    },
    ejb: {
      icon: "/img/icons/camel/endpoints/ejb24.png"
    },
    facebook: {
      icon: "/img/icons/camel/endpoints/facebook24.jpg"
    },
    file: {
      icon: "/img/icons/camel/endpoints/file24.png"
    },
    ftp: {
      icon: "/img/icons/camel/endpoints/ftp24.png"
    },
    ftps: {
      icon: "/img/icons/camel/endpoints/ftps24.png"
    },
    imap: {
      icon: "/img/icons/camel/endpoints/imap24.png"
    },
    imaps: {
      icon: "/img/icons/camel/endpoints/imaps24.png"
    },
    jdbc: {
      icon: "/img/icons/camel/endpoints/jdbc24.png"
    },
    jms: {
      icon: "/img/icons/camel/endpoints/jms24.png"
    },
    language: {
      icon: "/img/icons/camel/endpoints/language24.png"
    },
    linkedin: {
      icon: "/img/icons/camel/endpoints/linkedin24.png"
    },
    log: {
      icon: "/img/icons/camel/endpoints/log24.png"
    },
    mqtt: {
      icon: "/img/icons/camel/endpoints/mqtt24.png"
    },
    pop3: {
      icon: "/img/icons/camel/endpoints/pop324.png"
    },
    pop3s: {
      icon: "/img/icons/camel/endpoints/pop3s24.png"
    },
    quartz: {
      icon: "/img/icons/camel/endpoints/quartz24.png"
    },
    quartz2: {
      icon: "/img/icons/camel/endpoints/quartz224.png"
    },
    rss: {
      icon: "/img/icons/camel/endpoints/rss24.png"
    },
    salesforce: {
      icon: "/img/icons/camel/endpoints/salesForce24.png"
    },
    sap: {
      icon: "/img/icons/camel/endpoints/SAP24.png"
    },
    "sap-netweaver": {
      icon: "/img/icons/camel/endpoints/SAPNetweaver24.jpg"
    },
    servlet: {
      icon: "/img/icons/camel/endpoints/servlet24.png"
    },
    sftp: {
      icon: "/img/icons/camel/endpoints/sftp24.png"
    },
    smtp: {
      icon: "/img/icons/camel/endpoints/smtp24.png"
    },
    smtps: {
      icon: "/img/icons/camel/endpoints/smtps24.png"
    },
    snmp: {
      icon: "/img/icons/camel/endpoints/snmp24.png"
    },
    sql: {
      icon: "/img/icons/camel/endpoints/sql24.png"
    },
    timer: {
      icon: "/img/icons/camel/endpoints/timer24.png"
    },
    twitter: {
      icon: "/img/icons/camel/endpoints/twitter24.png"
    },
    weather: {
      icon: "/img/icons/camel/endpoints/weather24.jpg"
    },
    xslt: {
      icon: "/img/icons/camel/endpoints/xslt24.jpg"
    }
  };

  /**
   * Define the default form configurations
   * @property
   * @for Camel
   * @type {ObjecT}
   */
  export var endpointForms = {
    file: {
      tabs: {
        //'Core': ['key', 'value'],
        'Options': ['*']
      }
    },
    activemq: {
      tabs: {
        'Connection': ['clientId', 'transacted', 'transactedInOut', 'transactionName', 'transactionTimeout' ],
        'Producer': ['timeToLive', 'priority', 'allowNullBody', 'pubSubNoLocal', 'preserveMessageQos'],
        'Consumer': ['concurrentConsumers', 'acknowledgementModeName', 'selector', 'receiveTimeout'],
        'Reply': ['replyToDestination', 'replyToDeliveryPersistent', 'replyToCacheLevelName', 'replyToDestinationSelectorName'],
        'Options': ['*']
      }
    }
  };

  endpointForms["jms"] = endpointForms.activemq;

  angular.forEach(endpointCategories, (category, catKey) => {
    category.id = catKey;
    angular.forEach(category.endpoints, (endpoint) => {
      endpointToCategory[endpoint] = category;
    });
  });

  /**
   * Override the EIP pattern tabs...
   * @property
   * @for Camel
   * @type {ObjecT}
   */
  var camelModelTabExtensions = {
    route: {
      'Overview': ['id', 'description'],
      'Advanced': ['*']
    }
  };

  export function getEndpointIcon(endpointName) {
    var value = Camel.getEndpointConfig(endpointName, null);
    var answer = Core.pathGet(value, ["icon"]);
    if (!answer) {
      var category = getEndpointCategory(endpointName);
      answer = Core.pathGet(category, ["endpointIcon"]);
    }
    return answer || endpointIcon;
  }

  export function getEndpointConfig(endpointName, category) {
    var answer = endpointConfigurations[endpointName];
    if (!answer) {
      answer = {
      };
      endpointConfigurations[endpointName] = answer;
    }
    if (!answer.label) {
      answer.label = endpointName;
    }
    if (!answer.icon) {
      answer.icon = Core.pathGet(category, ["endpointIcon"]) || endpointIcon;
    }
    if (!answer.category) {
      answer.category = category;
    }
    return answer;
  }

  export function getEndpointCategory(endpointName:string) {
    return endpointToCategory[endpointName] || endpointCategories.core;
  }

  export function getConfiguredCamelModel() {
    var schema = _apacheCamelModel;
    var definitions = schema["definitions"];
    if (definitions) {
      angular.forEach(camelModelTabExtensions, (tabs, name) => {
        var model = definitions[name];
        if (model) {
          if (!model["tabs"]) {
            model["tabs"] = tabs;
          }
        }
      });
    }
    return schema;
  }


  export function initEndpointChooserScope($scope, $location, localStorage:WindowLocalStorage, workspace:Workspace, jolokia) {
    $scope.selectedComponentName = null;
    $scope.endpointParameters = {};
    $scope.endpointPath = "";

    $scope.schema = {
      definitions: {
      }
    };

    $scope.jolokia = jolokia;

    // lets see if we need to use a remote jolokia container
    var versionId = $scope.branch;
    var profileId = Fabric.pagePathToProfileId($scope.pageId);
    if (profileId && versionId) {
      Fabric.profileJolokia(jolokia, profileId, versionId, (profileJolokia) => {
        if (!profileJolokia) {
          // TODO we should expose this to the user somewhere nicely!
          log.info("No container is running for profile " + profileId + " and version " + versionId + " so using current container for endpoint completion");
          profileJolokia = jolokia;
        }
        $scope.jolokia = profileJolokia;
        // force a reload
        $scope.profileWorkspace = null;
        $scope.loadEndpointNames();
      });
    }

    var silentOptions = {silent: true};

    $scope.$watch('workspace.selection', function () {
      $scope.loadEndpointNames();
    });

    $scope.$watch('selectedComponentName', () => {
      if ($scope.selectedComponentName !== $scope.loadedComponentName) {
        $scope.endpointParameters = {};
        $scope.loadEndpointSchema($scope.selectedComponentName);
        $scope.loadedComponentName = $scope.selectedComponentName;
      }
    });

    $scope.endpointCompletions = (completionText) => {
      var answer = null;
      var mbean = findCamelContextMBean();
      var componentName = $scope.selectedComponentName;
      var endpointParameters = {};
      if (mbean && componentName && completionText) {
        answer = $scope.jolokia.execute(mbean, 'completeEndpointPath', componentName, endpointParameters, completionText, onSuccess(null, silentOptions));
      }
      return answer || [];
    };

    $scope.loadEndpointNames = () => {
      $scope.componentNames = null;
      var mbean = findCamelContextMBean();
      if (mbean) {
        $scope.jolokia.execute(mbean, 'findComponentNames', onSuccess(onComponents, {silent: true}));
      } else {
        console.log("WARNING: No camel context mbean so cannot load component names");
      }
    };

    $scope.loadEndpointSchema = (componentName) => {
      var mbean = findCamelContextMBean();
      if (mbean && componentName && componentName !== $scope.loadedEndpointSchema) {
        $scope.selectedComponentName = componentName;
        $scope.jolokia.execute(mbean, 'componentParameterJsonSchema', componentName, onSuccess(onEndpointSchema, silentOptions));
      }
    };

    function onComponents(response) {
      $scope.componentNames = response;
      log.info("onComponents: " + response);
      $scope.hasComponentNames = $scope.componentNames ? true : false;
      Core.$apply($scope);
    }

    function onEndpointSchema(response) {
      if (response) {
        try {
          //console.log("got JSON: " + response);
          var json = JSON.parse(response);
          var endpointName = $scope.selectedComponentName;
          configureEndpointSchema(endpointName, json);
          $scope.endpointSchema = json;
          $scope.schema.definitions[endpointName] = json;
          $scope.loadedEndpointSchema = endpointName;
          Core.$apply($scope);
        } catch (e) {
          console.log("Failed to parse JSON " + e);
          console.log("JSON: " + response);
        }
      }
    }

    function configureEndpointSchema(endpointName, json) {
      console.log("======== configuring schema for " + endpointName);
      var config = Camel.endpointForms[endpointName];
      if (config && json) {
        if (config.tabs) {
          json.tabs = config.tabs;
        }
      }
    }

    function findCamelContextMBean() {
      var profileWorkspace = $scope.profileWorkspace;
      if (!profileWorkspace) {
        var remoteJolokia = $scope.jolokia;
        if (remoteJolokia) {
          profileWorkspace = Core.createRemoteWorkspace(remoteJolokia, workspace.jolokiaStatus, $location, localStorage);
          $scope.profileWorkspace = profileWorkspace;
        }
      }

      var camelJmxDomain = localStorage['camelJmxDomain'] || "org.apache.camel";
      if (!profileWorkspace) {
        log.info("No profileWorkspace found so defaulting it to workspace for now");
        profileWorkspace = workspace;
      }

      // TODO we need to find the MBean for the CamelContext / Route we are editing!
      var componentName = $scope.selectedComponentName;
      var selectedCamelContextId;
      var selectedRouteId
      if (angular.isDefined($scope.camelSelectionDetails)) {
        selectedCamelContextId = $scope.camelSelectionDetails.selectedCamelContextId;
        selectedRouteId = $scope.camelSelectionDetails.selectedRouteId;
      }

      console.log("==== componentName " + componentName +
              " selectedCamelContextId: " + selectedCamelContextId +
              " selectedRouteId: " + selectedRouteId);

      var contextsById = Camel.camelContextMBeansById(profileWorkspace, camelJmxDomain);
      if (selectedCamelContextId) {
        var mbean = Core.pathGet(contextsById, [selectedCamelContextId, "mbean"]);
        if (mbean) {
          return mbean;
        }
      }
      if (selectedRouteId) {
        var map = Camel.camelContextMBeansByRouteId(profileWorkspace, camelJmxDomain);
        var mbean = Core.pathGet(map, [selectedRouteId, "mbean"]);
        if (mbean) {
          return mbean;
        }
      }
      if (componentName) {
        var map = Camel.camelContextMBeansByComponentName(profileWorkspace, camelJmxDomain);
        var mbean = Core.pathGet(map, [componentName, "mbean"]);
        if (mbean) {
          return mbean;
        }
      }

      // NOTE we don't really know which camel context to pick, so lets just find the first one?
      var answer = null;
      angular.forEach(contextsById, (details, id) => {
        var mbean = details.mbean;
        if (!answer && mbean) answer = mbean;
      });
      return answer;
/*
      // we could be remote to lets query jolokia
      var results = $scope.jolokia.search("org.apache.camel:*,type=context", onSuccess(null));
      //var results = $scope.jolokia.search("org.apache.camel:*", onSuccess(null));
      if (results && results.length) {
        console.log("===== Got results: " + results);
        return results[0];
      }

      var mbean = Camel.getSelectionCamelContextMBean(profileWorkspace);
      if (!mbean && $scope.findProfileCamelContext) {
        // TODO as a hack for now lets just find any camel context we can
        var folder = Core.getMBeanTypeFolder(profileWorkspace, Camel.jmxDomain, "context");
        mbean = Core.pathGet(folder, ["objectName"]);
      }
      return mbean;
*/
    }
  }
}
