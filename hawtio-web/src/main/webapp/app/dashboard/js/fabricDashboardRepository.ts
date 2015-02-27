/**
 * @module Dashboard
 */
module Dashboard {


  export class FabricDashboardRepository implements DashboardRepository {

    private details;

    constructor(public workspace, public jolokia, public localStorage) {
      this.details = this.getBranchAndProfiles();
    }

    public getBranchAndProfiles() {
      if (Fabric.fabricCreated(this.workspace)) {
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
      } else {
        return  {
          branch: "1.0",
          profiles: []
        };
      }

    }

    public putDashboards(array:any[], commitMessage:string, fn) {
      var jolokia = this.jolokia;
      var details = this.details;

      var toPut = array.length;

      var maybeCallback = () => {
        toPut = toPut - 1;
        if (toPut === 0) {
          this.getDashboards(fn);
        }
      };

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
          maybeCallback();
          //notification('success', "Saved dashboard " + dashboard.title);
        }, (response) => {

          log.error("Failed to store dashboard: ", dashboard.title, " due to: ", response.error, " stack trace: ", response.stacktrace);
          maybeCallback();
        });
      });


    }

    public deleteDashboards(array:any[], fn) {
      var jolokia = this.jolokia;
      var details = this.details;

      var profileIds = [];
      var fileNames = [];
      array.forEach((dashboard) => {
        profileIds.push(dashboard.profileId);
        fileNames.push(dashboard.fileName);
      });
      Fabric.deleteConfigFiles(jolokia, details.branch, profileIds, fileNames, () => {
        this.getDashboards(fn);
      }, (response) => {
        log.error("Failed to delete selected dashboards due to: ", response.error, " stack trace: ", response.stacktrace);
        this.getDashboards(fn);
      })
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

    public isValid() {
      return Fabric.hasFabric(this.workspace);
    }

    public getDashboards(fn) {

      var jolokia = this.jolokia;
      var details = this.details;
      var dashboards = [];

      jolokia.request({
        type: 'exec',
        mbean: Fabric.managerMBean,
        operation: 'getConfigurationFiles',
        arguments: [details.branch, details.profiles, ".*dashboard"]
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

          // sort dash boards by title, so they dont appear in random order
          dashboards = dashboards.sort((d1, d2) => {
            var title1 = d1.title;
            var title2 = d2.title;
            return title1.localeCompare(title2);
          });

          fn(dashboards);

        },
        error: (response) => {
          log.error("Failed to load dashboard data: error: ", response.error, " stack trace: ", response.stacktrace);
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
