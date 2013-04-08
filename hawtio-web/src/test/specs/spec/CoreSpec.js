describe("Core", function() {
  beforeEach(function() {
  });

  it("pathGet and pathSet work in nested structures with paths or arrays of paths", function() {
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


  it("parse version numbers", function() {
    expect(Core.parseVersionNumbers("camel-2.1")).toEqual([2, 1]);
    expect(Core.parseVersionNumbers("camel-2.3.jar")).toEqual([2, 3]);
    expect(Core.parseVersionNumbers("camel-2.45.jar")).toEqual([2, 45]);
    expect(Core.parseVersionNumbers("camel-12.45.jar")).toEqual([12, 45]);
    expect(Core.parseVersionNumbers("camel-2.3.45.jar")).toEqual([2, 3, 45]);
    expect(Core.parseVersionNumbers("camel-55.3.45.jar")).toEqual([55, 3, 45]);
  });
});