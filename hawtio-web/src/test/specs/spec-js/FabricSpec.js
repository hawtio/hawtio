describe("Fabric", function () {

  angular.forEach({
    "dummy": null,
    "fabric/profiles/foo.profile": "foo",
    "fabric/profiles/example/camel/fabric.profile": "example-camel-fabric"
  }, function(expected, path) {
    it("converting wiki path " + path + " to correct profile ID", function () {
      var result = Fabric. pagePathToProfileId(path);
      expect(result).toEqual(expected);
    });
  });

});