module Dashboard {

  var defaultDashboards = [

    {
      "title": "Monitor",
      "group": "Personal",
      "widgets": [
        {
          "id": "w1",
          "title": "",
          "row": 1,
          "col": 1,
          "size_x": 3,
          "size_y": 4,
          "path": "jmx/attributes",
          "include": "app/jmx/html/attributes.html",
          "search": {
            "nid": "root-java.lang-OperatingSystem"
          },
          "hash": ""
        },
        {
          "id": "w3",
          "title": "Java Heap Memory",
          "row": 1,
          "col": 6,
          "size_x": 2,
          "size_y": 2,
          "path": "jmx/widget/donut",
          "include": "app/jmx/html/donutChart.html",
          "search": {},
          "hash": "",
          "routeParams": "{\"type\":\"donut\",\"title\":\"Java Heap Memory\",\"mbean\":\"java.lang:type=Memory\",\"attribute\":\"HeapMemoryUsage\",\"total\":\"Max\",\"terms\":\"Used\",\"remaining\":\"Free\"}"
        },
        {
          "id": "w4",
          "title": "Java Non Heap Memory",
          "row": 1,
          "col": 8,
          "size_x": 2,
          "size_y": 2,
          "path": "jmx/widget/donut",
          "include": "app/jmx/html/donutChart.html",
          "search": {},
          "hash": "",
          "routeParams": "{\"type\":\"donut\",\"title\":\"Java Non Heap Memory\",\"mbean\":\"java.lang:type=Memory\",\"attribute\":\"NonHeapMemoryUsage\",\"total\":\"Max\",\"terms\":\"Used\",\"remaining\":\"Free\"}"
        },
        {
          "id": "w5",
          "title": "",
          "row": 3,
          "col": 4,
          "size_x": 6,
          "size_y": 2,
          "path": "jmx/charts",
          "include": "app/jmx/html/charts.html",
          "search": {
            "size": "%7B%22size_x%22%3A2%2C%22size_y%22%3A2%7D",
            "title": "Java%20Non%20Heap%20Memory",
            "routeParams": "%7B%22type%22%3A%22donut%22%2C%22title%22%3A%22Java%20Non%20Heap%20Memory%22%2C%22mbean%22%3A%22java.lang%3Atype",
            "nid": "root-java.lang-Threading"
          },
          "hash": ""
        },
        {
          "id": "w6",
          "title": "System CPU Load",
          "row": 1,
          "col": 4,
          "size_x": 2,
          "size_y": 2,
          "path": "jmx/widget/area",
          "include": "app/jmx/html/areaChart.html",
          "search": {},
          "hash": "",
          "routeParams": "{\"type\":\"area\",\"title\":\"System CPU Load\",\"mbean\":\"java.lang:type=OperatingSystem\",\"attribute\":\"SystemCpuLoad\"}"
        }
      ],
      "id": "4e9d116173ca41767e"
    }

  ];


  export interface DashboardRepository {
    putDashboards: (array:any[], commitMessage:string, fn) => any;

    deleteDashboards: (array:any[], fn) => any;

    //getDashboards: (fn: (dashboards: Dashboard[]) => any) => any;
    getDashboards: (fn) => any;

    getDashboard: (id:string, fn) => any;

    createDashboard: (options:any) => any;

    cloneDashboard:(dashboard:any) => any;

    getType:() => string;

    isValid: () => boolean;

  }

  /**
   * API to deal with the dashboards
   */
  export class DefaultDashboardRepository implements DashboardRepository {
    constructor(public workspace:Workspace, public jolokia, public localStorage) {
    }

    public repository:DashboardRepository = null;

    public putDashboards(array:any[], commitMessage:string, fn) {
      this.getRepository().putDashboards(array, commitMessage, fn);
    }

    public deleteDashboards(array:any[], fn) {
      this.getRepository().deleteDashboards(array, fn);
    }

    /**
     * Loads the dashboards then asynchronously calls the function with the data
     */
    public getDashboards(fn) {
      this.getRepository().getDashboards((values) => {
        fn(values);
      });
    }

    /**
     * Loads the given dashboard and invokes the given function with the result
     */
    public getDashboard(id:string, onLoad) {
      this.getRepository().getDashboard(id, onLoad);
    }


    public createDashboard(options:any) {
      return this.getRepository().createDashboard(options);
    }

    public cloneDashboard(dashboard:any) {
      return this.getRepository().cloneDashboard(dashboard);
    }

    public getType() {
      return this.getRepository().getType();
    }

    public isValid() {
      return this.getRepository().isValid();
    }

    /**
     * Looks up the MBean in the JMX tree
     */
    public getRepository():DashboardRepository {
      if (this.repository && this.repository.isValid()) {
        return this.repository;
      }
      if (Fabric.hasFabric(this.workspace)) {
        this.repository =  new FabricDashboardRepository(this.workspace, this.jolokia, this.localStorage);
        return this.repository;
      }
      var git = Git.createGitRepository(this.workspace, this.jolokia, this.localStorage);
      if (git) {
        this.repository =   new GitDashboardRepository(this.workspace, git);
        return this.repository;
      }
      this.repository =  new LocalDashboardRepository(this.workspace);
      return this.repository;
    }
  }

  export class LocalDashboardRepository implements DashboardRepository {

    private localStorage:WindowLocalStorage = null;

    constructor(public workspace:Workspace) {
      this.localStorage = workspace.localStorage;

      if ('userDashboards' in this.localStorage) {
        // log.info("Found previously saved dashboards");
      } else {
        this.storeDashboards(defaultDashboards);
      }
    }

    private loadDashboards() {
      var answer = angular.fromJson(localStorage['userDashboards']);
      log.debug("returning dashboards: ", answer);
      return answer;
    }

    private storeDashboards(dashboards:any[]) {
      log.debug("storing dashboards: ", dashboards);
      localStorage['userDashboards'] = angular.toJson(dashboards);
      return this.loadDashboards();
    }

    public putDashboards(array:any[], commitMessage:string, fn) {

      var dashboards = this.loadDashboards();

      array.forEach((dash) => {
        var existing = dashboards.findIndex((d) => { return d.id === dash.id; });
        if (existing >= 0) {
          dashboards[existing] = dash;
        } else {
          dashboards.push(dash);
        }
      });
      fn(this.storeDashboards(dashboards));
    }

    public deleteDashboards(array:any[], fn) {
      var dashboards = this.loadDashboards();
      angular.forEach(array, (item) => {
        dashboards.remove((i) => { return i.id === item.id; });
      });
      fn(this.storeDashboards(dashboards));
    }

    /**
     * Loads the dashboards then asynchronously calls the function with the data
     */
    public getDashboards(fn) {
      fn(this.loadDashboards());
    }

    /**
     * Loads the given dashboard and invokes the given function with the result
     */
    public getDashboard(id:string, fn) {
      var dashboards = this.loadDashboards();
      var dashboard = dashboards.find({id: id});
      fn(dashboard);
    }

    public createDashboard(options:any) {
      var answer ={
        title: "New Dashboard",
        group: "Personal",
        widgets: []
      };
      answer = angular.extend(answer, options);
      answer['id'] = Core.getUUID();
      return answer;
    }

    public cloneDashboard(dashboard:any) {
      var newDashboard = Object.clone(dashboard);
      newDashboard['id'] = Core.getUUID();
      newDashboard['title'] = "Copy of " + dashboard.title;
      return newDashboard;
    }

    public getType() {
      return 'container';
    }

    public isValid() {
      return !Fabric.hasFabric(this.workspace) && !Git.hasGit(this.workspace);
    }
  }

  export class GitDashboardRepository implements DashboardRepository {
    constructor(public workspace:Workspace, public git:Git.GitRepository) {
    }

    public branch: string = null;

    public putDashboards(array:Dashboard[], commitMessage:string, fn) {
      var toPut = array.length;
      var maybeCallback = () => {
        toPut = toPut - 1;
        if (toPut === 0) {
          this.getDashboards(fn);
        }
      };

      angular.forEach(array, (dash) => {
        var path = this.getDashboardPath(dash);
        var contents = JSON.stringify(dash, null, "  ");
        this.git.write(this.branch, path, commitMessage, contents, () => {
          maybeCallback();
        });
      });
    }

    public deleteDashboards(array:Dashboard[], fn) {
      var toDelete = array.length;
      var maybeCallback = () => {
        toDelete = toDelete - 1;
        if (toDelete === 0) {
          this.getDashboards(fn);
        }
      };
      angular.forEach(array, (dash) => {
        var path = this.getDashboardPath(dash);
        var commitMessage = "Removing dashboard " + path;
        this.git.remove(this.branch, path, commitMessage, () => {
          maybeCallback();
        });
      });
    }

    public createDashboard(options:any) {
      var answer ={
        title: "New Dashboard",
        group: "Personal",
        widgets: []
      };
      answer = angular.extend(answer, options);
      answer['id'] = Core.getUUID();
      return answer;
    }

    public cloneDashboard(dashboard:any) {
      var newDashboard = Object.clone(dashboard);
      newDashboard['id'] = Core.getUUID();
      newDashboard['title'] = "Copy of " + dashboard.title;
      return newDashboard;
    }

    public getType() {
      return 'git';
    }

    public isValid() {
      return Git.hasGit(this.workspace);
    }

    public getDashboardPath(dash) {
      // TODO assume a user dashboard for now
      // ideally we'd look up the teams path based on the group

      var id = dash.id || Core.getUUID();
      var path = this.getUserDashboardPath(id);
      return path;
    }

    public getDashboards(fn) {
      // TODO lets look in each team directory as well and combine the results...
      var path = this.getUserDashboardDirectory();
      var dashboards = [];
      this.git.read(this.branch, path, (details) => {
        var files = details.children;

        var toRead = files.length;

        var maybeCallback = () => {
          toRead = toRead - 1;
          if (toRead === 0) {
            fn(dashboards);
          }
        };

        // we now have all the files we need; lets read all their contents
        angular.forEach(files, (file, idx) => {
          var path = file.path;
          if (!file.directory && path.endsWith(".json")) {
            this.git.read(this.branch, path, (details) => {
              // lets parse the contents
              var content = details.text;
              if (content) {
                try {
                  var json = JSON.parse(content);
                  json.uri = path;
                  dashboards.push(json);
                } catch (e) {
                  console.log("Failed to parse: " + content + " due to: " + e);
                }
              }
              log.debug("git - read ", idx, " files, total: ", files.length);
              maybeCallback();
            });
          }
        });
      });
    }

    public getDashboard(id:string, fn) {
      var path = this.getUserDashboardPath(id);
      this.git.read(this.branch, path, (details) => {
        var dashboard = null;
        var content = details.text;
        if (content) {
          try {
            dashboard = JSON.parse(content);
          } catch (e) {
            console.log("Failed to parse: " + content + " due to: " + e);
          }
        }
        fn(dashboard);
      });
    }

    public getUserDashboardDirectory() {
      // TODO until we fix #96 lets default to a common user name so
      // all the dashboards are shared for all users for now
      //return "/dashboards/user/" + this.git.getUserName();
      return "/dashboards/team/all";
    }

    public getUserDashboardPath(id:String) {
      return this.getUserDashboardDirectory() + "/" + id + ".json";
    }
  }
}
