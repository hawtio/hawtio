describe("Camel", function () {

  angular.forEach(["endpoint", "from", "to", "bean", "filter", "when", "otherwise"], function (value) {
    it("the camel EIP pattern type '" + value + "' should be a valid camel pattern", function () {
      expect(Camel.isCamelPattern(value)).toEqual(true);
    });
  });

  angular.forEach([
    "",
    "unknownThing",
    "org.apache.camel.model.language.ExpressionDefinition",
    "org.apache.camel.model.dataformat.SyslogDataFormat",
    "org.apache.camel.model.language.Expression"
  ], function (value) {
    it("the non camel EIP pattern type '" + value + "' should not be a valid camel pattern", function () {
      expect(Camel.isCamelPattern(value)).toEqual(false);
    });
  });
});