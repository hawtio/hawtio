/**
 * @module RBAC
 */

/// <reference path="../../core/js/tasks.ts"/>
module RBAC {

  export interface RBACTasks extends Core.Tasks {
    initialize: (mbean:string) => void;
    getACLMBean: () => string;
  }

  export class RBACTasksImpl extends Core.TasksImpl implements RBACTasks {

    private ACLMBean:string = null;

    public initialize(mbean:string) {
      this.ACLMBean = mbean;
      super.execute();
    }

    public getACLMBean() {
      return this.ACLMBean;
    }
  }

  export var rbacTasks:RBACTasks = new RBAC.RBACTasksImpl();

}
