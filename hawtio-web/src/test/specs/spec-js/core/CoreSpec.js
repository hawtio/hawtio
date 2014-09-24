describe("Core", function () {
  beforeEach(function () {
  });

  it("pathGet and pathSet work in nested structures with paths or arrays of paths", function () {
    var data = {
      "foo": {
        "a": {
          "name": "James",
          "id": 1
        }
      }
    };

    expect(Core.pathGet(data, ["foo", "a", "name"])).toEqual("James");
    expect(Core.pathGet(data, "foo.a.name")).toEqual("James");
    expect(Core.pathGet(data, "foo.a.id")).toEqual(1);

    expect(Core.pathGet(data, "foo.b.id")).toEqual(null);

    // now lets update things
    Core.pathSet(data, "foo.b.id", 2);
    expect(Core.pathGet(data, "foo.b.id")).toEqual(2);
    Core.pathSet(data, ["foo", "c", "name"], "Stan");
    expect(Core.pathGet(data, "foo.c.name")).toEqual("Stan");
  });


  it("parse version numbers", function () {
    expect(Core.parseVersionNumbers("camel-2.1")).toEqual([2, 1]);
    expect(Core.parseVersionNumbers("camel-2.3.jar")).toEqual([2, 3]);
    expect(Core.parseVersionNumbers("camel-2.45.jar")).toEqual([2, 45]);
    expect(Core.parseVersionNumbers("camel-12.45.jar")).toEqual([12, 45]);
    expect(Core.parseVersionNumbers("camel-2.3.45.jar")).toEqual([2, 3, 45]);
    expect(Core.parseVersionNumbers("camel-55.3.45.jar")).toEqual([55, 3, 45]);

    expect(Core.parseVersionNumbers("2.45.jar")).toEqual([2, 45]);
    expect(Core.parseVersionNumbers("55.3.45.jar")).toEqual([55, 3, 45]);

  });

  it("compare version numbers", function () {
    function compareVersion(text, version, expectedValue) {
      var actualVersion = Core.parseVersionNumbers(text);
      var compared = Core.compareVersionNumberArrays(actualVersion, version);
      expect(compared).toEqual(expectedValue);
    }

    expect(compareVersion("camel-2.1.jar", [2, 1], 0));
    expect(compareVersion("camel-2.11.jar", [2, 10], 1));
    expect(compareVersion("camel-2.11.0.jar", [2, 10], 1));
    expect(compareVersion("camel-2.11.jar", [2, 12], -1));
    expect(compareVersion("camel-2.11.2.jar", [2, 12], -1));
    expect(compareVersion("camel-2.11.2.jar", [2, 11, 3], -1));
  });

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


  assertObjectNameKeyValue("org.apache.activemq", { "dummy": null });

  assertObjectNameKeyValue("org.apache.activemq:brokerName=foo", { "dummy": null });

  assertObjectNameKeyValue("org.apache.activemq:brokerName=broker1,clientId=dejan,type=Broker", {
    "brokerName": "broker1",
    "clientId": "dejan",
    "type": "Broker"
  });

  function assertObjectNameKeyValue(objectName, values) {
    var entries = Core.objectNameProperties(objectName);
    angular.forEach(values, function (value, key) {
      it("objectName " + objectName + " should have key " + key, function () {
        expect(entries[key]).toEqual(value);
      });
    });
  }
});