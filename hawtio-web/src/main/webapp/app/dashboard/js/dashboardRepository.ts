module Dashboard {

  export interface DashboardRepository {
    putDashboards: (array:any[], commitMessage:string, fn) => any;

    deleteDashboards: (array:any[], fn) => any;

    //getDashboards: (fn: (dashboards: Dashboard[]) => any) => any;
    getDashboards: (fn) => any;

    getDashboard: (id:string, fn) => any;

    createDashboard: (options:any) => any;

    cloneDashboard:(dashboard:any) => any;

    getType:() => string;

  }

  /**
   * API to deal with the dashboards
   */
  export class DefaultDashboardRepository implements DashboardRepository {
    constructor(public workspace:Workspace, public jolokia, public localStorage) {
    }

    public dashboards = [];
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
        this.dashboards = values;
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

    /**
     * Looks up the MBean in the JMX tree
     */
    public getRepository():DashboardRepository {
      if (this.repository) {
        return this.repository;
      }
      if (Fabric.hasFabric(this.workspace)) {
        this.repository =  new FabricDashboardRepository(this.workspace, this.jolokia, this.localStorage);
        return this.repository;
      }
      var git = Git.createGitRepository(this.workspace, this.jolokia, this.localStorage);
      if (git) {
        this.repository =   new GitDashboardRepository(git);
        return this.repository;
      }
      this.repository =  new LocalDashboardRepository();
      return this.repository;
    }
  }

  export class LocalDashboardRepository implements DashboardRepository {
    dashboards = [
      {
        id: "m1", title: "Monitor", group: "Personal",
        widgets: [
          { id: "w1", title: "Operating System", row: 1, col: 1,
            size_x: 3,
            size_y: 4,
            path: "jmx/attributes",
            include: "app/jmx/html/attributes.html",
            search: {nid: "root-java.lang-OperatingSystem"},
            hash: ""
          }
        ]
      },
      {
        id: "t1", title: "Threading", group: "Admin",
        widgets: [
          { id: "w1", title: "Operating System", row: 1, col: 1,
            size_x: 3,
            size_y: 4,
            path: "jmx/attributes",
            include: "app/jmx/html/attributes.html",
            search: {nid: "root-java.lang-OperatingSystem"},
            hash: ""
          }
        ]
      }
    ];

    public putDashboards(array:any[], commitMessage:string, fn) {
      this.dashboards = this.dashboards.concat(array);
      fn(null);
    }

    public deleteDashboards(array:any[], fn) {
      angular.forEach(array, (item) => {
        this.dashboards.remove(item);
      });
      fn(null);
    }

    /**
     * Loads the dashboards then asynchronously calls the function with the data
     */
    public getDashboards(fn) {
      // TODO lets load the table of dashboards from some storage
      fn(this.dashboards);
    }

    /**
     * Loads the given dashboard and invokes the given function with the result
     */
    public getDashboard(id:string, onLoad) {
      var dashboard = this.dashboards.find({id: id});
      onLoad(dashboard);
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
  }

  export class GitDashboardRepository implements DashboardRepository {
    constructor(public git:Git.GitRepository) {
    }

    public branch: string = null;

    public putDashboards(array:Dashboard[], commitMessage:string, fn) {
      angular.forEach(array, (dash) => {
        var path = this.getDashboardPath(dash);
        var contents = JSON.stringify(dash, null, "  ");
        this.git.write(this.branch, path, commitMessage, contents, fn);
      });
    }

    public deleteDashboards(array:Dashboard[], fn) {
      angular.forEach(array, (dash) => {
        var path = this.getDashboardPath(dash);
        var commitMessage = "Removing dashboard " + path;
        this.git.remove(this.branch, path, commitMessage, fn);
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
              if (idx + 1 === files.length) {
                // we have now completed the list of files
                fn(dashboards);
              }
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
