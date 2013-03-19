module Core {

  export class HelpRegistry {

    public docTypes = {
      user: 'help.md',
      developer: 'developer.md'
    }

    constructor(public $rootScope) {

    }

    public addUserDoc(topic, path) {
      this.getOrCreateTopic(topic)['user'] = path;
    }

    public addDevDoc(topic, path) {
      this.getOrCreateTopic(topic)['developer'] = path;
    }

    public getOrCreateTopic(topic) {
      if (!angular.isDefined(this[topic])) {
        this[topic] = {};
        this.$rootScope.$broadcast('hawtioNewHelpTopic');
      }
      return this[topic];
    }

    public getTopics() {
      var rc = {}
      angular.forEach(this, (value, key) => {
        if (key === "$rootScope") {
          return;
        }
        if (key === "docTypes") {
          return;
        }
        rc[key] = value;
      });
      return rc;
    }

  }

}
