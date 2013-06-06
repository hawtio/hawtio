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
    social: {
      label: "Social",
      endpoints: ["atom", "irc", "rss", "smpp", "twitter", "weather"]
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
    timer: {
      icon: "/app/camel/img/endpointTimer24.png"
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
      answer.icon = category.endpointIcon || endpointIcon;
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
    $scope.schema = {
      definitions: {
      }
    };

    var silentOptions = {silent: true};

    $scope.$watch('workspace.selection', function () {
      workspace.moveIfViewInvalid();
      $scope.loadEndpointNames();
    });

    $scope.$watch('selectedComponentName', () => {
      if ($scope.selectedComponentName !== $scope.loadedComponentName) {
        $scope.endpointParameters = {};
        $scope.loadEndpointSchema($scope.selectedComponentName);
        $scope.loadedComponentName = $scope.selectedComponentName;
      }
    });

    $scope.endpointCompletions = () => {
      var answer = [];
      var mbean = findCamelContextMBean();
      var componentName = $scope.selectedComponentName;
      var endpointParameters = {};
      var completionText = $scope.endpointPath || "";
      if (mbean && componentName && completionText) {
        answer = jolokia.execute(mbean, 'completeEndpointPath', componentName, endpointParameters, completionText, onSuccess(null, silentOptions));
      }
      return answer;
    };

    $scope.loadEndpointNames = () => {
      $scope.componentNames = null;
      var mbean = findCamelContextMBean();
      if (mbean) {
        jolokia.execute(mbean, 'findComponentNames', onSuccess(onComponents, silentOptions));
      } else {
        console.log("WARNING: No camel context mbean so cannot load component names");
      }
    };

    $scope.loadEndpointSchema = (componentName) => {
      var mbean = findCamelContextMBean();
      if (mbean && componentName) {
        jolokia.execute(mbean, 'componentParameterJsonSchema', componentName, onSuccess(onEndpointSchema, silentOptions));
      }
    };

    function onComponents(response) {
      $scope.componentNames = response;
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
      var mbean = Camel.getSelectionCamelContextMBean(workspace);
      if (!mbean && $scope.findProfileCamelContext) {
        // TODO as a hack for now lets just find any camel context we can
        var folder = Core.getMBeanTypeFolder(workspace, Camel.jmxDomain, "context");
        mbean = Core.pathGet(folder, ["objectName"]);
      }
      return mbean;
    }

  }
}