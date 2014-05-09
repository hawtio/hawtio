module Core {

  export class PostLoginTasks {

    private tasks:any = {};
    private tasksExecuted = false;

    private addTask(name, task) {
      if (this.tasksExecuted) {
        this.executeTask(name, task);
      } else {
        this.tasks[name] = task;
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
      if (this.tasks[name]) {
        delete this.tasks[name];
      }
    }

    public execute() {
      angular.forEach(this.tasks, (task:() => void, name) => {
        this.executeTask(name, task);
      });
      this.tasksExecuted = true;
    }

  }

  export var postLoginTasks = new Core.PostLoginTasks();

}
