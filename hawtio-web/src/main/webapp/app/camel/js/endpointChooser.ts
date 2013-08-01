module Camel {

  /**
   * Define the default categories for endpoints and map them to endpoint names
   */
  export var endpointCategories = {
    bigdata: {
      label: "Big Data",
      endpoints: ["hdfs", "hbase", "lucene", "solr"],
      endpointIcon: "/app/camel/img/endpointRepository24.png"
    },
    database: {
      label: "Database",
      endpoints: ["couchdb", "elasticsearch", "hbase", "jdbc", "jpa", "hibernate", "mongodb", "mybatis", "sql"],
      endpointIcon: "/app/camel/img/endpointRepository24.png"
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
      endpoints: ["jms", "activemq", "amqp", "cometd", "mqtt"],
      endpointIcon: "/app/camel/img/endpointQueue24.png"
    },
    mobile: {
      label: "Mobile",
      endpoints: ["apns"]
    },
    sass: {
      label: "SaaS",
      endpoints: ["salesforce", "sap-netweaver", "weather"]
    },
    social: {
      label: "Social",
      endpoints: ["atom", "irc", "rss", "smpp", "twitter"]
    },
    storage: {
      label: "Storage",
      endpointIcon: "/app/camel/img/endpointFolder24.png",
      endpoints: ["file", "ftp", "sftp", "scp", "jsch"]
    },
    template: {
      label: "Templating",
      endpoints: ["freemarker", "velocity", "xquery", "xslt", "scalate", "string-template"]
    }
  };

  /**
   * Maps endpoint names to a category object
   */
  export var endpointToCategory = {};

  export var endpointIcon = "/app/camel/img/endpoint24.png";
  /**
   *  specify custom label & icon properties for endpoint names
   */
  export var endpointConfigurations = {
    drools: {
      icon: "/app/camel/img/endpointQueue24.png"
    },
    quartz: {
      icon: "/app/camel/img/endpointTimer24.png"
    },
    facebook: {
      icon: "/app/camel/img/endpoints/facebook24.jpg"
    },
    salesforce: {
      icon: "/app/camel/img/endpoints/salesForce24.png"
    },
    sap: {
      icon: "/app/camel/img/endpoints/SAPe24.png"
    },
    "sap-netweaver": {
      icon: "/app/camel/img/endpoints/SAPNetweaver24.jpg"
    },
    timer: {
      icon: "/app/camel/img/endpointTimer24.png"
    },
    twitter: {
      icon: "/app/camel/img/endpoints/twitter24.png"
    },
    weather: {
      icon: "/app/camel/img/endpoints/weather24.jpg"
    }
  };

  /**
   * Define the default form configurations
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


  export function initEndpointChooserScope($scope, workspace:Workspace, jolokia) {
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
    var profileId = $scope.pageId;
    if (profileId && versionId) {
      var idx = profileId.lastIndexOf("/");
      if (idx) {
        profileId = profileId.substring(0, idx);
      }
      console.log("finding jolokia " + profileId +  " " + versionId);
      Fabric.profileWebAppURL(jolokia, "org.jolokia", profileId, versionId, onJolokiaUrl, onJolokiaUrl);
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
        //$scope.jolokia.execute(mbean, 'findComponentNames', onSuccess(onComponents, silentOptions));
        $scope.jolokia.execute(mbean, 'findComponentNames', onSuccess(onComponents, {silent: true}));
/*
        $scope.jolokia.execute(mbean, 'findComponentNames', onSuccess(onComponents, {error: function (response) {
          console.log("FAILED: " + response);
        }}));
*/
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
      console.log("===== onComponents: " + response);
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
      // we could be remote to lets query jolokia
      var results = $scope.jolokia.search("org.apache.camel:*,type=context", onSuccess(null));
      //var results = $scope.jolokia.search("org.apache.camel:*", onSuccess(null));
      if (results && results.length) {
        console.log("===== Got results: " + results);
        return results[0];
      }

      var mbean = Camel.getSelectionCamelContextMBean(workspace);
      if (!mbean && $scope.findProfileCamelContext) {
        // TODO as a hack for now lets just find any camel context we can
        var folder = Core.getMBeanTypeFolder(workspace, Camel.jmxDomain, "context");
        mbean = Core.pathGet(folder, ["objectName"]);
      }
      return mbean;
    }

    function onJolokiaUrl(response) {
      if (response) {
        var url = response.value;
        console.log("========== onJolokiaURL: " + url);
        if (url) {
          var jolokiaParams = {url: url, canonicalNaming: false, ignoreErrors: true, mimeType: 'application/json'};
          // TODO dirty hack!!!
          jolokiaParams["username"] = "admin";
          jolokiaParams["password"] = "admin";
          $scope.jolokia = new Jolokia(jolokiaParams);
          $scope.loadEndpointNames();
        }
      }
    }
  }
}
