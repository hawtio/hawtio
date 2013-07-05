module Core {

  export class HelpRegistry {

    private discoverableDocTypes = {
      user: 'help.md'
    }

    private topicNameMappings = {
      activemq: 'ActiveMQ',
      camel: 'Camel',
      jboss: 'JBoss',
      jclouds: 'jclouds',
      jmx: 'JMX',
      jvm: 'JVM',
      log: 'Logs',
      openejb: 'OpenEJB'
    }

    private subTopicNameMappings = {
      user: 'For Users',
      developer: 'For Developers',
      faq: 'FAQ'
    }

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

    public discoverHelpFiles(plugins) {
      var self = this;
      plugins.forEach(function(plugin) {
        angular.forEach(self.discoverableDocTypes, (value, key) => {
          var target = 'app/' + plugin + '/doc/' + value;
          // avoid trying to discover these if plugins register them
          if (!angular.isDefined(self['plugin'])
              || !angular.isDefined(self['plugin'][key])) {
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
      });
    }

  }

}
