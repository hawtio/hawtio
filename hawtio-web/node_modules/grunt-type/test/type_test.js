var grunt = require('grunt');
var fs = require('fs');

module.exports.type = {
  compile: function (test) {
    'use strict';

    test.expect(4);

    var actual = grunt.file.read('tmp/simple.js');
    var expected = grunt.file.read('test/expected/simple.js');
    test.equal(expected, actual, 'should compile TypeScript to JavaScript');

    actual = grunt.file.read('tmp/concat.js');
    expected = grunt.file.read('test/expected/concat.js');
    test.equal(expected, actual, 'should compile and concat TypeScript to JavaScript');

    actual = fs.readdirSync('tmp/many/').sort();
    expected = fs.readdirSync('test/expected/many/').sort();
    test.deepEqual(expected, actual, 'should compile to directories');

    actual = grunt.file.read('test/fixtures/compile/type1.js');
    expected = grunt.file.read('test/expected/original.js');
    test.equal(expected, actual, 'should backup conflicting files');

    test.done();
  },

  flatten: function (test) {
    'use strict';

    test.expect(1);

    var actual = fs.readdirSync('tmp/flatten/').sort();
    var expected = fs.readdirSync('test/expected/flatten/').sort();
    test.deepEqual(expected, actual, 'should compile to flatten directories');

    test.done();
  },

  es5: function (test) {
    'use strict';

    test.expect(1);

    var actual = grunt.file.read('tmp/es5.js');
    var expected = grunt.file.read('test/expected/es5.js');
    test.deepEqual(expected, actual, 'should compile ES5 targets');

    test.done();
  },

  amd: function (test) {
    'use strict';

    test.expect(1);

    var actual = grunt.file.read('tmp/amd.js');
    var expected = grunt.file.read('test/expected/amd.js');
    test.deepEqual(expected, actual, 'should compile to AMD modules');

    test.done();
  },

  refs: function (test) {
    'use strict';

    test.expect(1);

    var actual = grunt.file.read('tmp/ref.js');
    var expected = grunt.file.read('test/expected/ref.js');
    test.deepEqual(expected, actual, 'should compile with implicit references');

    test.done();
  }
};
