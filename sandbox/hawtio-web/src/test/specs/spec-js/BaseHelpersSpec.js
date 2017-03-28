
describe("BaseHelpers", function() {
  beforeEach(function() {
    Core._resetUrlPrefix();
    Core._resetJolokiaUrls();
  });

  it("returns unchanged url for relative path", function() {
    expect(Core.url("#")).toBe("#");
    expect(Core.url("a/b/c")).toBe("a/b/c");
  });

  it("returns prefixed url for absolute path", function() {
    spyOn(Core, 'windowLocation').andReturn({ pathname: "/a/b" });
    spyOn($.fn, "attr").andReturn("/a");
    expect(Core.url("/#")).toBe("/a/#");
    expect(Core.url("/a/b/c")).toBe("/a/b/c");
  });

  it("returns absolute url for absolute path when there's no context path", function() {
    expect(Core.url("/#")).toBe("/#");
    expect(Core.url("/a/b/c")).toBe("/a/b/c");
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

  it("unescapes HTML correctly", function() {
    expect("a".unescapeHTML()).toBe("a");
    expect("&lt;".unescapeHTML()).toBe("<");
    expect("&lt;&amp;&quot&apos;&gt;".unescapeHTML()).toBe("<&\"'>");
  });

  it("find correct object keys (actually it should use sugar.js version)", function() {
    expect(Object.keys(Object).length).toBe(0);
    try {
      Object.keys("");
      expect(false).toBeTruthy();
    } catch (e) {
      expect(e.message).not.toBeNull();
    }
    expect(Object.keys({}).length).toBe(0);
    expect(Object.keys({ a: "value" }).length).toBe(1);
    expect(Object.keys({ a: "value", b: { c: "value" } }).length).toBe(2);
  });

  it("Should get null jolokia url for localMode", function() {
    spyOn(hawtioPluginLoader, 'parseQueryString').andReturn({ localMode: true });
    spyOn(Core, 'windowLocation').andReturn({ pathname: "/a/b" });
    expect(Core.getJolokiaUrl()).toBeNull();
  });

  it("Should get correct, relative jolokia url for non-localMode", function() {
    spyOn(hawtioPluginLoader, 'parseQueryString').andReturn({ localMode: false });
    spyOn(Core, 'windowLocation').andReturn({ pathname: "/a/b" });
    spyOn($, 'ajax').andReturn({ status: 200 });
    expect(Core.getJolokiaUrl()).toBe("jolokia");
  });

  it("Should get correct, absolute jolokia url for non-localMode", function() {
    spyOn(hawtioPluginLoader, 'parseQueryString').andReturn({ localMode: false });
    spyOn(Core, 'windowLocation').andReturn({ pathname: "/a/b" });
    spyOn($, 'ajax').andCallFake(function(url, params) {
      if ("jolokia" == url) {
        return {};
      } else {
        return { status: 200 };
      }
    });
    expect(Core.getJolokiaUrl()).toBe("/jolokia");
//    expect(Core.getJolokiaUrl()).toBe("/a/jolokia"); // shouldn't we use Core.url("/jolokia")?
  });

  it("Correctly checks if we're using Chrome app/extension", function() {
    window.chrome = { app: true, extension: true };
    expect(Core.isChromeApp()).toBeTruthy();
    window.chrome = { app: true, extension: false };
    expect(Core.isChromeApp()).toBeFalsy();// shouldn't we use app || extension instead of app && extension?
  });

  it("Checks whether we have array or not", function() {
    expect(Core.asArray("a").length).toBe(1);
    expect(Core.asArray(["a"]).length).toBe(1);
    expect(Core.asArray(["a", "b"]).length).toBe(2);
    expect(Core.asArray({ tab: ["a", "b"]}).length).toBe(1);
  });

  it("parses boolean values", function() {
    expect(Core.parseBooleanValue("TrUe")).toBeTruthy();
    expect(Core.parseBooleanValue("1")).toBeTruthy();
    expect(Core.parseBooleanValue("YES")).toBeTruthy();
    expect(Core.parseBooleanValue("YES!")).toBeFalsy();
    expect(Core.parseBooleanValue()).toBeFalsy();
    expect(Core.parseBooleanValue(false)).toBeFalsy();
    expect(Core.parseBooleanValue(undefined)).toBeFalsy();
    expect(Core.parseBooleanValue(null)).toBeFalsy();
    var x;
    expect(Core.parseBooleanValue(x)).toBeFalsy();
    expect(Core.parseBooleanValue(0)).toBeFalsy();
    expect(Core.parseBooleanValue(1)).toBeTruthy();
    try {
      Core.parseBooleanValue({});
      expect(false).toBeTruthy();
    } catch (e) {
      expect(e.message).not.toBeNull();
    }
  });

  it("converts boolean values to strings", function() {
    expect(Core.booleanToString(true)).toBe("true");
    expect(Core.booleanToString(false)).toBe("false");
  });

  it("converts values to integers", function() {
    expect(Core.parseIntValue("13")).toBe(13);
    expect(Core.parseIntValue("13a")).toBe(13);
    expect(Core.parseIntValue("a13a")).toBeNaN();
    expect(Core.parseIntValue({})).toBeNull();
    expect(Core.parseIntValue(1)).toBe(1);
  });

  it("converts integer values to strings", function() {
    expect(Core.numberToString(1)).toBe("1");
    expect(Core.numberToString({})).toBe("[object Object]"); // TODO check this
  });

  it("converts values to floats", function() {
    expect(Core.parseFloatValue("13")).toBe(13);
    expect(Core.parseFloatValue("1.3a")).toBe(1.3);
    expect(Core.parseFloatValue("a13a")).toBeNaN();
    expect(Core.parseFloatValue({})).toBeNull();
    expect(Core.parseFloatValue(1)).toBe(1);
  });

  it("tests Core.getOrCreateElements", function() {
    $("<div id='getOrCreateElements'></div>").appendTo("body");
    var div = $("#getOrCreateElements");
    Core.getOrCreateElements(div[0], [ "span", "b" ]);
    expect($("span", div).length).toBe(1);
    expect($("b", div).length).toBe(1);
    expect($(">b", div).length).toBe(0);
    expect($("span>b", div).length).toBe(1);
  });

  it("escapes different htmls", function() {
    expect(Core.escapeHtml("<&\"'>")).toBe("&lt;&&quot;&#39;&gt;")
  });

  it("checks the emptiness of strings", function() {
    expect(Core.isBlank(null)).toBeTruthy();
    expect(Core.isBlank(undefined)).toBeTruthy();
    expect(Core.isBlank(" ")).toBeTruthy();
    expect(Core.isBlank("")).toBeTruthy();
    expect(Core.isBlank("\n\t")).toBeTruthy();
    expect(Core.isBlank("a")).toBeFalsy();
    expect(Core.isBlank(1)).toBeFalsy();
  });

  it("leaves a string without leading and trailing quites/apos", function() {
    expect(Core.trimQuotes("\"'''\"aaa")).toBe("aaa");
    expect(Core.trimQuotes("\"'''\"aaa''''\"''")).toBe("aaa");
    expect(Core.trimQuotes("a\"'''\"aaa''''\"''")).toBe("a\"'''\"aaa");
  });

  it("Converts camel-case and dash-separated strings into Human readable forms", function() {
    expect(Core.humanizeValue("\"aa-b-c\"")).toBe("Aa b c");
    expect(Core.humanizeValue("aB-c")).toBe("A b c");
  });

});
