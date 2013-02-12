module Dashboard {
  /**
   * Returns the cleaned up version of the dashboard data without any UI selection state
   */
  export function cleanDashboardData(item) {
    var cleanItem = {};
    angular.forEach(item, (value, key) => {
      if (!angular.isString(key) || (!key.startsWith("$") && !key.startsWith("_"))) {
        cleanItem[key] = value;
      }
    });
    return cleanItem;
  }

  export function getGitUserName() {
    // TODO configure...
    return "anonymous";
  }

  export function getGitUserEmail() {
    // TODO configure...
    return "anonymous@gmail.com";
  }

  export function getUUID() {
    var d = new Date();
    var ms = (d.getTime() * 1000) + d.getUTCMilliseconds();
    var random = Math.floor((1 + Math.random()) * 0x10000);
    return ms.toString(16) + random.toString(16);
  }

  export function getUserDashboardDirectory() {
    return "/dashboards/user/" + Dashboard.getGitUserName();
  }

  export function getUserDashboardPath(id: String) {
    return getUserDashboardDirectory() + "/" + id + ".json";
  }

  export function onAddDashboard(result) {
    console.log("Completed adding the dashboard with response " + JSON.stringify(result));
  }
}