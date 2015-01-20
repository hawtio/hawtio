/**
 * @module RBAC
 */
/// <reference path="../../core/js/corePlugin.ts"/>
/// <reference path="../../core/js/tasks.ts"/>
module RBAC {

  export interface RBACTasks extends Core.Tasks {
    initialize: (mbean:string) => void;
    getACLMBean: () => ng.IPromise<string>;
  }

  export class RBACTasksImpl extends Core.TasksImpl implements RBACTasks {

    private ACLMBean:string = null;

    public constructor(private deferred:ng.IDeferred<string>) {
      super();
    }

    public initialize(mbean:string) {
      this.ACLMBean = mbean;
      this.deferred.resolve(this.ACLMBean);
      super.execute();
    }

    public getACLMBean() {
      if (this.deferred === null) {
      }
      return this.deferred.promise;
    }
  }

  // this is initialized once the app is bootstrapped
  export var rbacTasks:RBACTasks = null;

}
