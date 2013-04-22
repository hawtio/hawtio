module Fabric {
  
  export var managerMBean = "org.fusesource.fabric:type=Fabric";

  export function setSelect(selection, group) {
    if (!angular.isDefined(selection)) {
      return group[0];
    }
    var answer = group.findIndex( function(item) { return item.id === selection.id } );
    if (answer !== -1) {
      return group[answer];
    } else {
      return group[0];
    }
  }

  export function containerAction(action, jolokia, id, success, error) {
    jolokia.request(
        {
          type: 'exec', mbean: managerMBean,
          operation: action,
          arguments: [id]
        },
        {
          method: 'POST',
          success: success,
          error: error
        });
  }
  
  export function stopContainer(jolokia, id, success, error) {
    containerAction('stopContainer(java.lang.String)', jolokia, id, success, error);
  }

  export function destroyContainer(jolokia, id, success, error) {
    containerAction('destroyContainer(java.lang.String)', jolokia, id, success, error);
  }

  export function startContainer(jolokia, id, success, error) {
    containerAction('startContainer(java.lang.String)', jolokia, id, success, error);
  }
  
  
  export function getServiceList(container) {
    var answer = [];
    if (angular.isDefined(container) && angular.isDefined(container.jmxDomains) && angular.isArray(container.jmxDomains)) {

      container.jmxDomains.forEach((domain) => {
        if (domain === "org.apache.activemq") {
          answer.push({
            title: "Apache ActiveMQ",
            type: "img",
            src: "app/fabric/img/message_broker.png"
          });
        }
        if (domain === "org.apache.camel") {
          answer.push({
            title: "Apache Camel",
            type: "img",
            src: "app/fabric/img/camel.png"
          });
        }
        if (domain === "org.fusesource.fabric") {
          answer.push({
            title: "Fuse Fabric",
            type: "img",
            src: "app/fabric/img/fabric.png"
          });
        }
        if (domain === "hawtio") {
          answer.push({
            title: "hawtio",
            type: "img",
            src: "app/fabric/img/hawtio.png"
          });
        }
        if (domain === "org.apache.karaf") {
          answer.push({
            title: "Apache Karaf",
            type: "icon",
            src: "icon-beaker"
          })
        }
        if (domain === "org.apache.zookeeper") {
          answer.push({
            title: "Apache Zookeeper",
            type: "icon",
            src: "icon-group"
          })
        }
      });
    }
    return answer;
  }
  
  /**
   * Default the values that are missing in the returned JSON
   */
  export function defaultContainerValues(workspace:Workspace, $scope, values) {
    var map = {};
    angular.forEach(values, (row) => {
      var profileIds = row["profileIds"];
      if (profileIds) {
        angular.forEach(profileIds, (profileId) => {
          var containers = map[profileId];
          if (!containers) {
            containers = [];
            map[profileId] = containers;
          }
          containers.push(row);
        });
      }
      $scope.profileMap = map;
      row["link"] = containerLinks(workspace, row["id"]);
      row["profileLinks"] = profileLinks(workspace, row["versionId"], profileIds);


      var versionId = row["versionId"];
      var versionHref = url("#/fabric/profiles?v=" + versionId);
      var versionLink =  "<a href='" + versionHref + "'>" + versionId + "</a>"
      row["versionHref"] = versionHref;
      row["versionLink"] = versionLink;

      var id = row['id'] || "";
      var title = "container " + id + " ";
      var img = "red-dot.png";
      if (row['managed'] === false) {
        img = "spacer.gif";
      } else if (!row['alive']) {
        img = "gray-dot.png";
      } else if (row['provisionPending']) {
        img = "pending.gif";
      } else if (row['provisionStatus'] === 'success') {
        img = "green-dot.png";
      }
      img = "img/dots/" + img;
      row["statusImageHref"] = img;
      row["link"] = "<img src='" + img + "' title='" + title + "'/> " + (row["link"] || id);
    });
    return values;
  }

  // TODO move to core?
  export function toCollection(values) {
    var collection = values;
    if (!angular.isArray(values)) {
      collection = [values];
    }
    return collection;
  }

  export function containerLinks(workspace, values) {
    var answer = "";
    angular.forEach(toCollection(values), function (value, key) {
      var prefix = "";
      if (answer.length > 0) {
        prefix = " ";
      }
      answer += prefix + "<a href='" + url("#/fabric/container/" + value + workspace.hash()) + "'>" + value + "</a>";
    });
    return answer;
  }

  export function profileLinks(workspace, versionId, values) {
    var answer = "";
    angular.forEach(toCollection(values), function (value, key) {
      var prefix = "";
      if (answer.length > 0) {
        prefix = " ";
      }
      answer += prefix + "<a href='" + url("#/fabric/profile/" + versionId + "/" + value + workspace.hash()) + "'>" + value + "</a>";
    });
    return answer;
  }

  /**
   * Default the values that are missing in the returned JSON
   */
  export function defaultProfileValues(workspace, versionId, values) {
    angular.forEach(values, (row) => {
      var id = row["id"];
      row["link"] = profileLinks(workspace, versionId, id);
      row["parentLinks"] = profileLinks(workspace, versionId, row["parentIds"]);
      var containersHref = url("#/fabric/containers?p=" + id);
      var containerCount = row["containerCount"];
      var containersLink = "";
      if (containerCount) {
        containersLink = "<a href='" + containersHref + "'>" + containerCount + "</a>"
      }
      row["containersCountLink"] = containersLink;
      row["containersHref"] = containersHref;
    });
    return values;
  }

  export function getZooKeeperFacadeMBean(workspace: Workspace) {
    var folder = workspace.findMBeanWithProperties(jmxDomain, {type: "ZooKeeper"});
    return Core.pathGet(folder, "objectName");
  }
}
