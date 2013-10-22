module Core {

  export class HelpRegistry {

    private discoverableDocTypes = {
      user: 'help.md'
    };

    private topicNameMappings = {
      activemq: 'ActiveMQ',
      camel: 'Camel',
      jboss: 'JBoss',
      jclouds: 'jclouds',
      jmx: 'JMX',
      jvm: 'JVM',
      log: 'Logs',
      openejb: 'OpenEJB'
    };

    private subTopicNameMappings = {
      user: 'For Users',
      developer: 'For Developers',
      faq: 'FAQ'
    };

    // map plugin names to their path in the app
    private pluginNameMappings = {
      hawtioCore: 'core',
      'hawtio-branding': 'branding',
      forceGraph: 'forcegraph',
      'hawtio-ui': 'ui',
      'hawtio-forms': 'forms',
      elasticjs: 'elasticsearch'
    };

    // let's not auto-discover help files in these plugins
    private ignoredPlugins = [
      'core',
      'branding',
      'datatable',
      'forcegraph',
      'forms',
      'perspective',
      'tree',
      'ui'
    ];

    private topics = {};

    constructor(public $rootScope) {

    }

    public addUserDoc(topic, path) {
      this.addSubTopic(topic, 'user', path);
    }

    public addDevDoc(topic, path) {
      this.addSubTopic(topic, 'developer', path);
    }

    public addSubTopic(topic, subtopic, path) {
      this.getOrCreateTopic(topic)[subtopic] = path;
    }

    public getOrCreateTopic(topic) {
      if (!angular.isDefined(this.topics[topic])) {
        this.topics[topic] = {};
        this.$rootScope.$broadcast('hawtioNewHelpTopic');
      }
      return this.topics[topic];
    }

    public mapTopicName(name) {
      if (angular.isDefined(this.topicNameMappings[name])) {
        return this.topicNameMappings[name];
      }
      return name.capitalize();
    }

    public mapSubTopicName(name) {
      if (angular.isDefined(this.subTopicNameMappings[name])) {
        return this.subTopicNameMappings[name];
      }
      return name.capitalize();
    }

    public getTopics() {
      return this.topics;
    }

    public disableAutodiscover(name) {
      this.ignoredPlugins.push(name);
    }

    public discoverHelpFiles(plugins) {
      var self:HelpRegistry = this;

      console.log("Ignored plugins: ", self.ignoredPlugins);

      plugins.forEach(function(plugin) {

        var pluginName = self.pluginNameMappings[plugin];
        if (!angular.isDefined(pluginName)) {
          pluginName = plugin;
        }

        if (!self.ignoredPlugins.any((p) => { return p === pluginName; })) {

          angular.forEach(self.discoverableDocTypes, (value, key) => {
            // avoid trying to discover these if plugins register them
            if (!angular.isDefined(self[pluginName]) ||
                !angular.isDefined(self[pluginName][key])) {

              var target = 'app/' + pluginName + '/doc/' + value;
              console.log("checking: ", target);

              $.ajax(target, {
                type: 'HEAD',
                statusCode: {
                  200: function() {
                    self.getOrCreateTopic(plugin)[key] = target
                  }
                }
              });
            }
          });

        }

      });
    }

  }

}
