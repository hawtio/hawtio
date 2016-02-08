/// <reference path="../lib/utils/testHelpers.ts"/>
/// <reference path="../../../main/webapp/app/core/js/coreHelpers.ts"/>
describe("HawtioPluginLoader", () => {

  angular.forEach([
    "something?bar=something",
    "?bar=something",
    "?bar=something#/help/overview/",
    "?bar=something&another",
    "?foo=abc&bar=something&another",
    "foo=abc&bar=something&another",
    ["?foo=abc&bar=something&another"]
  ], function (value) {
    var map = hawtioPluginLoader.parseQueryString(value);
    it("value " + JSON.stringify(value)
        + " when parsed as query string should have bar value: " + JSON.stringify(map), function () {
      expect(map["bar"]).toEqual(["something"]);
    });
  });


  it("extracts credentials from URLs", function () {
    var creds = hawtioPluginLoader.getCredentials("http://foo:bar@whatnot");
    expect(creds[0]).toEqual("foo");
    expect(creds[1]).toEqual("bar");
  });

});
