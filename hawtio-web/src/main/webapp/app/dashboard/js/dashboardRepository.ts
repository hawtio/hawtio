module Dashboard {

  export interface DashboardRepository {
    addDashboards: (array:any[], fn) => any;

    //getDashboards: (fn: (dashboards: Dashboard[]) => any) => any;
    getDashboards: (fn) => any;

    getDashboard: (id:string, fn) => any;

  }

  /**
   * API to deal with the dashboards
   */
  export class DefaultDashboardRepository implements DashboardRepository {
    constructor(public workspace:Workspace, public jolokia) {
      // lets default to using local storage
    }

    public addDashboards(array:any[], fn) {
      this.getMBean().addDashboards(array, fn);
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
          var git = new JolokiaGit(mbean, this.jolokia);
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

    public addDashboards(array:any[]) {
      this.dashboards = this.dashboards.concat(array);
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

    public addDashboards(array:Dashboard[], fn) {
      angular.forEach(array, (dash) => {

        // TODO assume a user dashboard for now
        // ideally we'd look up the teams path based on the group

        var id = dash.id || Dashboard.getUUID();
        var path = Dashboard.getUserDashboardPath(id);
        var contents = JSON.stringify(dash, null, "  ");
        var commitMessage = "Adding dashboard " + id;
        this.git.write(path, commitMessage, contents, fn);
      });
    }

    public getDashboards(fn) {
      // TODO lets look in each team directory as well and combine the results...
      var path = getUserDashboardDirectory();
      var dashboards = {};
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
                  dashboards[path] = json;
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
      var path = Dashboard.getUserDashboardPath(id);
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
  }
}
