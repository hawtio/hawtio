# hawtio API docs war

This module builds a static website of API documentation from the hawtio source JSDoc comments.  It uses a tool called typedoc which generates documentation straight from our typescript source.

First you need to install typedoc:

sudo npm install -g typedoc

Then build the doc war:

mvn clean install

You can either deploy the war or just open up target/hawtio-api-docs-*/index.html in a web browser

