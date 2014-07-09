/// <reference path="../lib/utils/testHelpers.ts"/>
/// <reference path="../../../main/webapp/app/baseHelpers.ts" />
describe("BaseHelpers", function () {
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

});
