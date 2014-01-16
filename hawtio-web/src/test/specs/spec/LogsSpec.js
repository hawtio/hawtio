describe("Logs", function() {
  beforeEach(function() {
  });

  it("log stack frames without maven coordinates should be left as plain text with pre tags", function() {
    var x = Log.formatStackLine("hello");
    expect(x).toEqual('<pre class="stack-line bold">hello</pre>');
  });

  it("a log stack frame with maven coordinates should turn into a nice source link", function() {
    var link = Log.formatStackLine("at org.apache.camel.util.CamelContextHelper.getMandatoryEndpoint(CamelContextHelper.java:50)[org.apache.camel:camel-core:2.10.0.redhat-60015]");

    expect(link).toEqual("<div class='stack-line'>  at <a href='#/source/view/org.apache.camel:camel-core:2.10.0.redhat-60015/class/org.apache.camel.util.CamelContextHelper/CamelContextHelper.java?line=50'>org.apache.camel.util.CamelContextHelper.getMandatoryEndpoint</a>(<span class='fileName'>CamelContextHelper.java</span>:<span class='lineNumber'>50</span>)[<span class='mavenCoords'>org.apache.camel:camel-core:2.10.0.redhat-60015</span>]</div>");
  });

  it("a log stack frame with logging version and maven coordinates should turn into a nice source link", function() {
    var link = Log.formatStackLine("at org.apache.karaf.shell.console.jline.DelayedStarted.run(DelayedStarted.java:61)[14:org.apache.karaf.shell.console:2.3.0.redhat-60015][org.apache.karaf.shell:org.apache.karaf.shell.console:2.3.0.redhat-60015]");

    expect(link).toEqual("<div class='stack-line'>  at <a href='#/source/view/org.apache.karaf.shell:org.apache.karaf.shell.console:2.3.0.redhat-60015/class/org.apache.karaf.shell.console.jline.DelayedStarted/DelayedStarted.java?line=61'>org.apache.karaf.shell.console.jline.DelayedStarted.run</a>(<span class='fileName'>DelayedStarted.java</span>:<span class='lineNumber'>61</span>)[<span class='mavenCoords'>org.apache.karaf.shell:org.apache.karaf.shell.console:2.3.0.redhat-60015</span>]</div>");
  });
});
