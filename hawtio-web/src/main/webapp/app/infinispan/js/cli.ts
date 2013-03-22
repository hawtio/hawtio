module Infinispan {

  /**
   * Returns the name of the cache from the mbean results
   */
  export class CLI {
    constructor(public workspace:Workspace, public jolokia) {
    }

    public cacheName:string = null;
    public sessionId:string = null;

    public setCacheName(name:string) {
      if (name) {
        name = trimQuotes(name);
        var postfix = "(local)";
        if (name.endsWith(postfix)) {
          name = name.substring(0, name.length - postfix.length);
        }
      }
      if (!this.cacheName || this.cacheName !== name) {
        if (this.sessionId) {
          this.deleteSession(this.sessionId);
        }
        this.cacheName = name;
        this.createSession();
      }
    }

    public createSession() {
      var mbean = Infinispan.getInterpreterMBean(this.workspace);
      if (mbean) {
        var cli = this;
        this.jolokia.execute(mbean, "createSessionId", this.cacheName, onSuccess((value) => {
          console.log("Has session ID: " + value);
          this.sessionId = value;
        }));
      } else {
        this.warnMissingMBean();
      }
    }

    public execute(sql:string, handler) {
      if (this.sessionId) {
        var mbean = Infinispan.getInterpreterMBean(this.workspace);
        if (mbean) {
          this.jolokia.execute(mbean, "execute", this.sessionId, sql, onSuccess(handler));
        } else {
          this.warnMissingMBean();
        }
      } else {
        notification("warning", "Cannot evaluate SQL as we don't have a sessionId yet!");
      }
    }

    public deleteSession(sessionId:string) {
      // there is no delete API so far
    }

    warnMissingMBean() {
      notification("error", "No Interpreter MBean available");
    }
  }
}