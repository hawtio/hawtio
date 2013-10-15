module Dashboard {


  export class FabricDashboardRepository implements DashboardRepository {

    private details;

    constructor(public workspace, public jolokia, public localStorage) {
      this.details = this.getBranchAndProfiles();
    }

    public getBranchAndProfiles() {

      var container = Fabric.getCurrentContainer(this.jolokia, ['id', 'versionId', 'profiles']);
      var profiles = [];
      if (container.profiles) {
        profiles = container.profiles.unique();
        profiles = Fabric.filterProfiles(this.jolokia, container.versionId, profiles);
      }

      return {
        branch: container.versionId,
        profiles: profiles
      }
    }

    public putDashboards(array:Dashboard[], commitMessage:string, fn) {
      var jolokia = this.jolokia;
      var details = this.details;
      array.forEach((dashboard) => {
        // console.log("Saving dash: ", dashboard);
        var data = angular.toJson(dashboard, true);
        var profileId = dashboard.profileId;
        if (!profileId) {
          // TODO maybe not just pick the first one :-)
          profileId = details.profiles.first();
        }
        var fileName = dashboard.fileName;
        if (!fileName) {
          fileName = Core.getUUID() + ".dashboard";
        }
        Fabric.saveConfigFile(jolokia, details.branch, profileId, fileName, data.encodeBase64(), () => {
          //notification('success', "Saved dashboard " + dashboard.title);
        }, (response) => {
          notification('error', "Failed to save dashboard " + dashboard.title + " due to " + response.error);
        });
      });
    }

    public deleteDashboards(array:Dashboard[], fn) {
      var jolokia = this.jolokia;
      var details = this.details;
      array.forEach((dashboard) => {
        var profileId = dashboard.profileId;
        var fileName = dashboard.fileName;
        if (profileId && fileName) {
          Fabric.deleteConfigFile(jolokia, details.branch, profileId, fileName, () => {
            notification('success', "Deleted dashboard " + dashboard.title);
          }, (response) => {
            notification('error', "Failed to delete dashboard " + dashboard.title + " due to " + response.error);
          })
        }
      });
    }

    public createDashboard(options:any) {
      var answer ={
        title: "New Dashboard",
        group: "Fabric",
        versionId: this.details.branch,
        profileId: this.details.profiles.first(),
        widgets: []
      };
      answer = angular.extend(answer, options);
      var uuid = Core.getUUID();
      answer['id'] = uuid;
      answer['fileName'] = uuid + ".dashboard";
      return answer;
    }

    public cloneDashboard(dashboard:any) {
      var newDashboard = Object.clone(dashboard);
      var uuid = Core.getUUID();
      newDashboard['id'] = uuid;
      newDashboard['fileName'] = uuid + ".dashboard";
      newDashboard['title'] = "Copy of " + dashboard.title;
      return newDashboard;
    }

    public getType() {
      return 'fabric';
    }

    public getDashboards(fn) {

      var jolokia = this.jolokia;
      var details = this.details;
      var dashboards = [];

      jolokia.request({
        type: 'exec',
        mbean: Fabric.managerMBean,
        operation: 'getConfigurationFiles',
        arguments: [details.branch, details.profiles, ".*\\.dashboard"]
      }, {
        method: 'POST',
        success: (response) => {

          angular.forEach(response.value, (value, profile) => {
            angular.forEach(value, (value, fileName) => {
              var dashboard = angular.fromJson(value.decodeBase64());
              dashboard['versionId'] = details.branch;
              dashboard['profileId'] = profile;
              dashboard['fileName'] = fileName;
              dashboards.push(dashboard);
            });
          });

          if (dashboards.isEmpty()) {
            dashboards.push(this.createDashboard({}));
          }

          fn(dashboards);

        },
        error: (response) => {
          notification('error', "Failed to load dashboard data due to: " + response.error);
          fn([]);
        }
      });
    }

    public getDashboard(id:string, fn) {
      this.getDashboards((dashboards) => {
        var dashboard = dashboards.find((dashboard) => { return dashboard.id === id; });
        fn(dashboard);
      });
    }
  }

}
