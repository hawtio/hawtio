/// <reference path="jbossPlugin.ts"/>
module JBoss {

  _module.controller("JBoss.DmrController", ["$scope", "$location", "workspace", ($scope, $location, workspace:Workspace) => {
    var search = $location.search();
    var connectUrl = url("/proxy/localhost/9990/management");
    var user = search["_user"] || "";
    var pwd = search["_pwd"] || "";
    if (user) {
      connectUrl += "?_user=" + user;
      if (pwd) {
        connectUrl += "&_pwd=" + pwd;
      }
    }

    var isDmr = "dmr" === search["_format"];
    var data = null;
    var format = "application/dmr-encoded";
    if (isDmr) {
      // create an operation
/*
      var op = new dmr.ModelNode();
      //op.get("operation").set("read-resource");
      op.get("operation").set("read-attribute");
      op.get("address").setEmptyList();
      op.get("name").set("release-version");
*/
      var op = new dmr.ModelNode();
      op.get("operation").set("read-attribute");
      op.get("address").setEmptyList();
      op.get("name").set("release-version");

      data = op.toBase64String();
    } else {
      format = "application/json";
      var request = {
        "operation": "read-resource"
      };
      data = JSON.stringify(request);
    }

    console.log("Using dmr: " + isDmr + " with content type: " + format + " and data " + data);

    $.ajax({
      url: connectUrl,
      data: data,
      processData: false,
      type: "POST",
      dataType: "text",
      contentType: format,
      accepts: format,
      headers: {
        "Content-type": format,
        "Accept": format
      }
    }).done(onData);

    function onData(data) {
      if (data) {
        var json = null;
        if (isDmr) {
          var response = dmr.ModelNode.fromBase64(data);
          var jsonText = response.toJSONString();
          json = JSON.parse(jsonText);
        } else {
          json = JSON.parse(data);
          json = json.result;
        }

        $scope.row = json;
        Core.$apply($scope);
        console.log("Response: " + JSON.stringify(json, null, "  "));
      }
    }
  }]);
}
