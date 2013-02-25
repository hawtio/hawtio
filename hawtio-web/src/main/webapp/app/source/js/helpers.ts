module Source {

  export function getInsightMBean(workspace) {
    var mavenStuff = workspace.mbeanTypesToDomain["LogQuery"] || {};
    var insight = mavenStuff["org.fusesource.insight"] || {};
    var mbean = insight.objectName;
    return mbean;
  }
}