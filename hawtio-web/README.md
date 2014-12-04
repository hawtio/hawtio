
# Building

hawt.io is still Java/Maven based project, but under the covers, lot of work is done using node.js/npm/grunt JavaScript tools.

## Building using Java tools

If you're not keen on learning new toolset, you can use plain old Maven to build hawt.io. Just run `mvn` in well known manner
and the resulting `hawtio-<version>.war` is ready to be deployed.

## Building using JavaScript tools

If, however, you'd like to use what's de facto standard in JS land or you'd like to see what's under the covers of Maven, feel
free to use `grunt` as your tool.

## Tips for developing JavaScript/node.js/Grunt using IntelliJ IDEA

* If IDEA keeps highlighting "require('load-grunt-tasks')(grunt)" with "Unresolved function or method require()" in your Gruntfile.js,
please ensure that "Node.js Globals" is checked under "Language & Frameworks → JavaScript → Libraries"
