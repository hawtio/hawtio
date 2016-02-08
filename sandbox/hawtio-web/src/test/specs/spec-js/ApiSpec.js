describe("API", function () {

  function onXml(response) {
    var apidocs = API.onWadlXmlLoaded(response);

    console.log("Found JSON: " + JSON.stringify(apidocs, null, "  "));

    //expect(Camel.isCamelPattern(value)).toEqual(true);
  }

  var wadlId = "#wadlDoc";

  it("Shows used Jasmine version", function() {
    console.info("Jasmine version used by karma-jasmine: " + jasmine.getEnv().versionString());
  });

  it("the embedded '" + wadlId + "' element loaded and parsed to valid WADL", function () {
    var doc = window.__html__['src/test/fixtures/div-with-wadl.html'];
    $(doc).appendTo('body');
    var div = $(wadlId);
    var object = null;
    var resources, resource1;
    if (div && div.length) {
      var root = div[0], children, firstChild;
      expect(root).not.toBeNull();
      children = root.children;
      expect(children).not.toBeNull();
      firstChild = children[0];
      expect(firstChild).not.toBeNull();
      object = API.convertWadlToJson(firstChild);
    }
    expect(object).not.toBe(null);
    resources = object.resources;
    expect(resources.length).toBe(1);
    resource1 = resources[0];
    expect(resource1.base).toBe("http://localhost:8181/cxf/crm");
    expect(resource1.resource[0].path).toBe("/customerservice/");
  });

/*
  var url = "sample.wadl";

  it("the file '" + url + "' is loaded and parsed to valid WADL", function () {
    API.loadXml(url, onXml);
  });
*/

});
