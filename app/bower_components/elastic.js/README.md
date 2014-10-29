# elastic.js

A JavaScript implementation of the [ElasticSearch](http://www.elasticsearch.org/) Query [DSL](http://www.elasticsearch.org/guide/reference/query-dsl/) and Core API.

## Documentation
You can find the official documentation at the following locations:

- [User Guide](http://www.fullscale.co/elasticjs)
- [API Documentation](http://docs.fullscale.co/elasticjs/)

You will also be able to find unofficial documentation and examples on on our
[blog](http://www.fullscale.co/blog/) and GitHub Gist pages [here](https://gist.github.com/mattweber)
and [here](https://gist.github.com/egaumer).

## Examples
You can find some basic examples in the `examples` directory.  To run the examples you need to
have node.js installed and have built elastic.js from source.  Start an instance of ElasticSearch
using the default settings so it is available at [localhost:9200](http://localhost:9200/).

### Angular and jQuery Examples
These examples need to served from a web server.  We have provided a very basic web server written
in Node.js for this purpose.

1. Navigate to the `examples` directory.
2. Run server.js: `node server.js`.
3. Open [Angular Example](http://localhost:8125/angular/) or [jQuery Example](http://localhost:8125/jquery/).

### Node.js Example
The Node.js example is a basic command line tool that accepts a set of query terms, executes the query,
and prints the results.

1. Install required modules with `npm install`.
2. Run _findtweets.js_ with your query terms:  `node findtweets.js elas*`

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](http://gruntjs.com/).

_Also, please don't edit elastic.js and elastic.min.js files as they are generated via grunt. You'll find source code in the "src" subdirectory!_

## License
Copyright (c) 2012 FullScale Labs, LLC
Licensed under the MIT license.
