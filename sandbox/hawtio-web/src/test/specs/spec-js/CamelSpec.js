describe("Camel", function () {

  angular.forEach(["from", "to", "bean", "filter", "when", "otherwise"], function (value) {
    it("the type '" + value + "' should be a valid camel pattern type name", function () {
      expect(Camel.isCamelPattern(value)).toEqual(true);
    });
  });

  angular.forEach([
    "",
    "unknownThing",
    "get",
    "syslog",
    "org.apache.camel.model.language.Expression"
  ], function (value) {
    it("the type name '" + value + "' should not be a valid camel pattern type name", function () {
      expect(Camel.isCamelPattern(value)).toEqual(false);
    });
  });

  angular.forEach(["simple", "xpath", "expression"], function (value) {
    it("'" + value + "' is a camel language", function () {
      expect(Camel.isCamelLanguage(value)).toEqual(true);
    });
  });

  angular.forEach(["filter", "choice", "when"], function (value) {
    it("'" + value + "' is not camel language ", function () {
      expect(Camel.isCamelLanguage(value)).toEqual(false);
    });
  });
});