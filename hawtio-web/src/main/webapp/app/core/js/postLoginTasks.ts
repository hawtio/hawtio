module Core {

  export interface PostLoginTasks {
    addTask: (name:string, task:() => void) => void;
    execute: () => void;
    reset: () => void;
  }

  export class PostLoginTasksImpl implements PostLoginTasks {

    private tasks:any = {};
    private tasksExecuted = false;

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

    public execute() {
      if (this.tasksExecuted) {
        return;
      }
      angular.forEach(this.tasks, (task:() => void, name) => {
        this.executeTask(name, task);
      });
      this.tasksExecuted = true;
    }

    public reset() {
      this.tasksExecuted = false;
    }
  }

  export var postLoginTasks:PostLoginTasks = new Core.PostLoginTasksImpl();

}
