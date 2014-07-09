/// <reference path="../d.ts/jasmine.d.ts" />
/// <reference path="./testHelpers.ts" />
describe("Test", function () {

  it("Shows used Jasmine version", function() {
    console.info("Jasmine version used by karma-jasmine: " + jasmine.getEnv().versionString());
  });

  it("Joins two strings into one", function() {
    expect(Test.cat("s1", "s2")).toBe("s1s2");
  });

});
