module JBoss {

  export function DmrController($scope, $location, workspace:Workspace) {
    var search = $location.search();
    var url = "/hawtio/proxy/localhost/9990/management";
    var user = search["_user"] || "";
    var pwd = search["_pwd"] || "";

    // create an operation
    var op = new dmr.ModelNode();
    op.get("operation").set("read-attribute");
    op.get("address").setEmptyList();
    op.get("name").set("release-version");

    var data = op.toBase64String();

    $.ajax({
      url: url,
      data: data,
/*
      dataType: "text",
      dataType: "application/dmr-encoded",
*/
      processData: false,
      contentType: "application/dmr-encoded",
      accepts: "application/dmr-encoded",
      //type: "POST",
      headers: {
        "Content-type": "application/dmr-encoded",
        "Accept": "application/dmr-encoded"
      },
      username: user,
      password: pwd
    }).done(onData);

    function onData(data) {
      var response = dmr.ModelNode.fromBase64(data);

      var jsonText = response.toJSONString();
      var json = JSON.parse(jsonText);
      $scope.row = json;
      Core.$apply($scope);
      console.log("Response: " + JSON.stringify(json, null, "  "));
    }
  }
}