module Core {

  var log:Logging.Logger = Logger.get("Core");

  export interface Tasks {
    addTask: (name:string, task:() => void) => void;
    execute: () => void;
    reset: () => void;
    onComplete: (cb:() => void) => void;
  }

  export interface ParameterizedTasks extends Tasks {
    addTask: (name:string, task:(...params:any[]) => void) => void;
    execute: (...params:any[]) => void;
  }

  export interface TaskMap {
    [name:string]: () => void;
  }

  export interface ParameterizedTaskMap {
    [name:string]: (...params:any[]) => void;
  }

  export class TasksImpl implements Tasks {

    public tasks:TaskMap = {};
    public tasksExecuted = false;
    public _onComplete: () => void = null;

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


  export class ParameterizedTasksImpl extends TasksImpl implements ParameterizedTasks {
    public tasks:ParameterizedTaskMap = {};

    public constructor() {
      super();
      this.onComplete(() => {
        this.reset();
      });
    }

    public addTask(name:string, task:(...params:any[]) => void):void {
      this.tasks[name] = task;
    }

    public execute(...params:any[]) {
      if (this.tasksExecuted) {
        return;
      }
      var theArgs:any[] = params;
      var keys = Object.keys(this.tasks);
      keys.forEach((name:string) => {
        var task = this.tasks[name];
        if (angular.isFunction(task)) {
          log.debug("Executing task: ", name, " with parameters: ", theArgs);
          try {
            task.apply(task, theArgs);
          } catch(e) {
            log.debug("Failed to execute task: ", name, " error: ", e);
          }
        }
      });
      this.tasksExecuted = true;
      if (angular.isFunction(this._onComplete)) {
        this._onComplete();
      }
    }
  }

  export var postLoginTasks:Tasks = new Core.TasksImpl();
  export var preLogoutTasks:Tasks = new Core.TasksImpl();

}
