describe("Maven", function () {

  var tests = {
    "mvn:org.apache.camel/camel-core/2.12": "#/maven/artifact/org.apache.camel/camel-core/2.12",
    "wrap:wrap:mvn:org.apache.tomcat/jasper-el/6.0.20": "#/maven/artifact/org.apache.tomcat/jasper-el/6.0.20",
    "cheese": null
  };

  angular.forEach(tests, function (expected, key) {
    it("can generate a mavenLink for " + key, function () {
      var actual = Maven.mavenLink(key);
      expect(expected).toEqual(actual);
    });
  });

});