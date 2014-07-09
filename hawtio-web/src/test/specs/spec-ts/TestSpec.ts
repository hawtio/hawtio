/// <reference path="../d.ts/jasmine.d.ts" />
/// <reference path="./testHelpers.ts" />
describe("Test", function () {

  it("Shows used Jasmine version", function() {
    console.info("Jasmine version used by karma-jasmine: " + jasmine.getEnv().versionString());
  });

  it("Joins two strings into one", function() {
    expect(Test.cat("s1", "s2")).toBe("s1s2");
  });


  it("Joins two strings into one. One of the strings is null", function() {
    expect(Test.cat("s1", null)).toBe("s1");
  });

  it("Use module-level class", function () {
    expect(new Test.C1("World").hello()).toBe("Hello World!");
  });

});
