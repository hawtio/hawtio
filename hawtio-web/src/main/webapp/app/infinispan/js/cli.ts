/**
 * @module Infinispan
 */
module Infinispan {

  /**
   * Returns the name of the cache from the mbean results
   * @class CLI
   */
  export class CLI {
    constructor(public workspace:Workspace, public jolokia) {
    }

    public cacheName:string = null;
    public sessionId:string = null;

    public useSessionIds = true;

    public setCacheName(name:string) {
      if (name) {
        name = Core.trimQuotes(name);
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
      if (this.useSessionIds) {
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
    }

    public execute(sql:string, handler) {
      if (sql) {
        sql = sql.trim();
        if (!sql.endsWith(";")) {
          sql += ";";
        }
        var sessionId = (this.useSessionIds) ? this.sessionId : null;
        if (!this.useSessionIds) {
          sql = "cache " + this.cacheName + "; " + sql;
        }
        if (sessionId || !this.useSessionIds) {
          var mbean = Infinispan.getInterpreterMBean(this.workspace);
          if (mbean) {
            this.jolokia.execute(mbean, "execute", sessionId, sql, onSuccess(handler));
          } else {
            this.warnMissingMBean();
          }
        } else {
          Core.notification("warning", "Cannot evaluate SQL as we don't have a sessionId yet!");
        }
      }
    }

    public deleteSession(sessionId:string) {
      // there is no delete API so far
    }

    warnMissingMBean() {
      Core.notification("error", "No Interpreter MBean available");
    }
  }
}
