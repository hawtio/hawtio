module Dashboard {

  /**
   * API to deal with the dashboards
   */
  export class DashboardRepository {
    constructor() {
      // lets default to using local storage
    }

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

    public addDashboards(array) {
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
    public getDashboard(id: string, onLoad) {
      var dashboard = this.dashboards.find({id: id});
      onLoad(dashboard);
    }
  }
}
