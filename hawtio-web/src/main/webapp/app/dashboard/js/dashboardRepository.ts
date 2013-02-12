module Dashboard {

  export interface DashboardRepository {
    putDashboards: (array:any[], commitMessage:string, fn) => any;

    deleteDashboards: (array:any[], fn) => any;

    //getDashboards: (fn: (dashboards: Dashboard[]) => any) => any;
    getDashboards: (fn) => any;

    getDashboard: (id:string, fn) => any;

  }

  /**
   * API to deal with the dashboards
   */
  export class DefaultDashboardRepository implements DashboardRepository {
    constructor(public workspace:Workspace, public jolokia, public localStorage) {
    }

    public putDashboards(array:any[], commitMessage:string, fn) {
      this.getMBean().putDashboards(array, commitMessage, fn);
    }

    public deleteDashboards(array:any[], fn) {
      this.getMBean().deleteDashboards(array, fn);
    }

    /**
     * Loads the dashboards then asynchronously calls the function with the data
     */
    public getDashboards(fn) {
      this.getMBean().getDashboards(fn);
    }

    /**
     * Loads the given dashboard and invokes the given function with the result
     */
    public getDashboard(id:string, onLoad) {
      this.getMBean().getDashboard(id, onLoad);
    }

    /**
     * Looks up the MBean in the JMX tree
     */
    public getMBean():DashboardRepository {
      if (this.workspace && this.jolokia) {
        var mbeanTypesToDomain = this.workspace.mbeanTypesToDomain || {};
        var gitFacades = mbeanTypesToDomain["GitFacade"] || {};
        var hawtioFolder = gitFacades["io.hawt.git"] || {};
        var mbean = hawtioFolder["objectName"];
        if (mbean) {
          var git = new JolokiaGit(mbean, this.jolokia, this.localStorage);
          return new GitDashboardRepository(git);
        }
      }
      return new LocalDashboardRepository();
    }
  }

  export class LocalDashboardRepository implements DashboardRepository {
    dashboards = [
      {
        id: "m1", title: "Monitor", group: "Personal",
        widgets: [
          { id: "w1", title: "Operating System", row: 1, col: 1,
            sizex: 1,
            sizey: 1,
            path: "jmx/attributes",
            include: "app/jmx/html/attributes.html",
            search: {nid: "root-java.lang-OperatingSystem"},
            hash: ""
          },
          { id: "w2", title: "Broker", row: 1, col: 2,
            sizex: 1,
            sizey: 1,
            path: "jmx/attributes",
            include: "app/jmx/html/attributes.html",
            search: {nid: "root-org.apache.activemq-broker1-Broker"},
            hash: ""
          }
        ]
      },
      {
        id: "t1", title: "Threading", group: "Admin",
        widgets: [
          { id: "w1", title: "Operating System", row: 1, col: 1,
            sizex: 1,
            sizey: 1,
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
  }

  export class GitDashboardRepository implements DashboardRepository {
    constructor(public git:Git) {
    }

    public putDashboards(array:Dashboard[], commitMessage:string, fn) {
      angular.forEach(array, (dash) => {
        var path = this.getDashboardPath(dash);
        var contents = JSON.stringify(dash, null, "  ");
        this.git.write(path, commitMessage, contents, fn);
      });
    }

    public deleteDashboards(array:Dashboard[], fn) {
      angular.forEach(array, (dash) => {
        var path = this.getDashboardPath(dash);
        var commitMessage = "Removing dashboard " + path;
        this.git.remove(path, commitMessage, fn);
      });
    }


    public getDashboardPath(dash) {
      // TODO assume a user dashboard for now
      // ideally we'd look up the teams path based on the group

      var id = dash.id || Dashboard.getUUID();
      var path = this.getUserDashboardPath(id);
      return path;
    }

    public getDashboards(fn) {
      // TODO lets look in each team directory as well and combine the results...
      var path = this.getUserDashboardDirectory();
      var dashboards = [];
      this.git.contents(path, (files) => {
        // we now have all the files we need; lets read all their contents
        angular.forEach(files, (file, idx) => {
          var path = file.path;
          if (!file.directory && path.endsWith(".json")) {
            this.git.read(path, (content) => {
              // lets parse the contents
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
      this.git.read(path, (content) => {
        var dashboard = null;
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
