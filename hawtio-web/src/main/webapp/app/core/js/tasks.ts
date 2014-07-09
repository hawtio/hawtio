module Core {

  var log:Logging.Logger = Logger.get("Core");

  export interface Tasks {
    addTask: (name:string, task:() => void) => void;
    execute: () => void;
    reset: () => void;
    onComplete: (cb:() => void) => void;
  }

  export class TasksImpl implements Tasks {

    private tasks:any = {};
    private tasksExecuted = false;
    private _onComplete: () => void = null;

    public addTask(name:string, task:() => void):void {
      this.tasks[name] = task;
      if (this.tasksExecuted) {
        this.executeTask(name, task);
      }
    }

    private executeTask(name:string, task: () => void) {
      if (angular.isFunction(task)) {
        log.debug("Executing task : ", name);
        try {
          task();
        } catch (error) {
          log.debug("Failed to execute task: ", name, " error: ", error);
        }
      }
    }

    public onComplete(cb: () => void) {
      this._onComplete = cb;
    }

    public execute() {
      if (this.tasksExecuted) {
        return;
      }
      angular.forEach(this.tasks, (task:() => void, name) => {
        this.executeTask(name, task);
      });
      this.tasksExecuted = true;
      if (angular.isFunction(this._onComplete)) {
        this._onComplete();
      }
    }

    public reset() {
      this.tasksExecuted = false;
    }
  }

  export var postLoginTasks:Tasks = new Core.TasksImpl();
  export var preLogoutTasks:Tasks = new Core.TasksImpl();

}
