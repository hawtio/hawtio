module Dashboard {


  export class FabricDashboardRepository implements DashboardRepository {
    public git = null;

    public branch: string = null;
    public profilePaths = [];

    constructor(public workspace, public jolokia, public localStorage) {
      this.git = Git.createGitRepository(this.workspace, this.jolokia, this.localStorage);

      var container = Fabric.getCurrentContainer(this.jolokia, ['id', 'versionId', 'profileIds']);
      this.branch = container.versionId;
      var profileIds = "default";
      if (container.profileIds) {
        profileIds = container.profileIds.unique().sortBy('');
      }
      profileIds.each((profileId) => {
        this.profilePaths.push({
          profileId: profileId,
          path: "/fabric/profiles/" + profileId.split("-").join("/") + ".profile"
        });
      });

      // pre-create empty dashboard files
      this.profilePaths.forEach((path) => {
        this.git.read(this.branch, path.path, (details) => {
          var files = details.children;
          var dashboardExists = false;
          files.forEach((file) => {
            var path = file.path;
            if (!file.directory && path.endsWith("dashboard.json")) {
              dashboardExists = true;
            }
          });
          if (!dashboardExists) {
            this.putDashboards([{
              id: Core.getUUID(),
              title: path.profileId,
              group: "Fabric",
              widgets: []
            }], "Adding new dashboard for profile " + path.profileId, () => {
              notification('info', "Created dashboard for " + path.profileId);
            });
          }
        });
      });

    }

    public putDashboards(array:Dashboard[], commitMessage:string, fn) {
      angular.forEach(array, (dash) => {
        var path = this.getDashboardPath(dash);
        var contents = angular.toJson(dash);
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

    public getDashboardPath(dash) {
      var path = this.profilePaths.find((path) => { return path.profileId === dash.title });
      path = path.path + "/dashboard.json";
      return path;
    }

    public getDashboards(fn) {

      var index = this.profilePaths.length;
      var dashboards = [];

      this.profilePaths.forEach((path) => {

        var dashboard = path.path + '/dashboard.json';
        this.git.read(this.branch, dashboard, (details) => {
          index = index - 1;
          var content = details.text;
          if (content) {
            var json = angular.fromJson(content);
            json.uri = dashboard;
            dashboards.push(json);
          }
          if (index === 0) {
            fn(dashboards.sortBy((dash) => { return dash.title; }));
          }
        });
      });
    }

    public getDashboard(id:string, fn) {
      this.getDashboards((dashboards) => {
        dashboards.find((dashboard) => {
          if (dashboard.id === id) {
            fn(dashboard);
          }
        });
      });
    }
  }

}
