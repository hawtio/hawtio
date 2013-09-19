module Camin {

    export class Gantt {
        resources : Resource[] = [ ];
        tasks     : Task[] = [ ];
        links     : Link[] = [ ];
        start     : number;
        stop      : number;

        resource(data) : Resource {
            var resource = new Resource(data, this.resources.length);
            this.resources.push( resource );
            return resource;
        }

   		task(resource, start, stop, data) : Task {
            var task = resource.task(start, stop, data);
            this.tasks.push( task );
            return task;
   		}

        link(start, taskA, stop, taskB, data) : Link {
            var link = new Link(start, taskA, stop, taskB, data);
            this.links.push( link );
            return link;
        }

        layout() {
            for (var i = 0; i < this.resources.length; i++) {
                this.resources[i].layout();
                this.start = this.start ? Math.min(this.start, this.resources[i].start) : this.resources[i].start;
                this.stop  = this.stop  ? Math.max(this.stop,  this.resources[i].stop)  : this.resources[i].stop;
            }
            for (var i = 0; i < this.links.length; i++) {
                this.start = this.start ? Math.min(this.start, this.links[i].start) : this.links[i].start;
                this.stop  = this.stop  ? Math.max(this.stop,  this.links[i].stop)  : this.links[i].stop;
            }
        }

        taskByData(data: any) : Task {
            for (var i = 0; i < this.tasks.length; i++) {
                if (this.tasks[i].data === data) {
                    return this.tasks[i];
                }
            }
            return undefined;
        }
    }

    export class Resource {
		data  : any;
		index : number;
		tasks : Task[] = [ ];
		start : number;
		stop  : number;

		constructor(data, index) {
		    this.index = index;
		    this.data = data;
		}

		task(start, stop, data) : Task {
             var task = new Task(start, stop, data, this);
             this.tasks.push( task );
             return task;
		}

		layout() {
            this.tasks.sort(function(ta, tb) {
                return ta.start - tb.start;
            });
            var bands = [ ];
            for (var i = 0; i < this.tasks.length; i++) {
                this.start = this.start ? Math.min(this.start, this.tasks[i].start) : this.tasks[i].start;
                this.stop  = this.stop  ? Math.max(this.stop,  this.tasks[i].stop)  : this.tasks[i].stop;
                for (var j = 0; j < bands.length; j++) {
                    if (bands[j] < this.tasks[i].start) {
                        bands[j] = this.tasks[i].stop;
                        this.tasks[i].index = j;
                        break;
                    }
                }
                if (!this.tasks[i].index) {
                    var index = bands.length;
                    this.tasks[i].index = index;
                    bands[index] = this.tasks[i].stop;
                }
            }
            for (var i = 0; i < this.tasks.length; i++) {
                this.tasks[i].max = bands.length;
            }
        }
    }

    export class Task {
		start    : number;
		stop     : number;
		data     : any;
		resource : Resource;
		index    : number;
		max      : number;

        constructor(start, stop, data, resource) {
            this.start = start;
            this.stop = stop;
            this.data = data;
            this.resource = resource;
        }
    }

    export class Link {
        start : number;
        taskA : Task;
        stop  : number;
        taskB : Task;
        data  : any;

        constructor(start, taskA, stop, taskB, data) {
            this.start = start;
            this.stop  = stop;
            this.taskA = taskA;
            this.taskB = taskB;
            this.data  = data;
        }
    }

}
