describe("Logs", function() {
  beforeEach(function() {
  });

  it("log stack frames without maven coordinates should be left as plain text", function() {
    var x = Log.formatStackLine("hello");
    expect(x).toEqual("hello");
  });

  it("a log stack frame with maven coordinates should turn into a nice source link", function() {
    var link = Log.formatStackLine("at org.apache.camel.util.CamelContextHelper.getMandatoryEndpoint(CamelContextHelper.java:50)[org.apache.camel:camel-core:2.10.0.redhat-60015]");

    expect(link).toEqual("at <a href='#/source/view/org.apache.camel:camel-core:2.10.0.redhat-60015/org.apache.camel.util.CamelContextHelper/CamelContextHelper.java?line=50'>org.apache.camel.util.CamelContextHelper.getMandatoryEndpoint</a>(<span class='fileName'>CamelContextHelper.java</span>:<span class='lineNumber'>50</span>)[<span class='mavenCoords'>org.apache.camel:camel-core:2.10.0.redhat-60015</span>]");
  });
});