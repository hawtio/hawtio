/*global require:true */
'use strict';

var ejs = require('../dist/elastic.js');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.test.test.expect(numAssertions)
    test.done()
  Test assertions:
    test.test.test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.test.test.deepEqual(actual, expected, [message])
    test.nottest.test.deepEqual(actual, expected, [message])
    test.test.test.strictEqual(actual, expected, [message])
    test.nottest.test.strictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.index = {
  setUp: function (done) {
    done();
  },
  exists: function (test) {
    test.expect(1);

    test.ok(ejs.Document, 'Document');
    
    test.done();
  },
  Document: function (test) {
    test.expect(128);

    var doc = ejs.Document('index', 'type'),
      expected,
      testDoc,
      mockClient,
      expectedPath = '',
      expectedData = '',
      expectedMethod = '',
      doTest = function (method, path, data, cb) {
        if (expectedPath !== '') {
          test.strictEqual(path, expectedPath);
          expectedPath = '';
        }
        
        if (expectedData !== '') {
          test.deepEqual(data, expectedData);
          expectedData = '';
        }
        
        if (expectedMethod !== '') {
          test.strictEqual(method, expectedMethod);
          expectedMethod = '';
        }
        
        test.deepEqual(doc._self(), expected);
      };

    // setup fake client to call doTest
    ejs.client = mockClient = {
      get: function (path, data, cb) {
        doTest('get', path, data, cb);
      },
      post: function (path, data, cb) {
        doTest('post', path, data, cb);
      },
      put: function (path, data, cb) {
        doTest('put', path, data, cb);
      },
      del: function (path, data, cb) {
        doTest('delete', path, data, cb);
      },
      head: function (path, data, cb) {
        doTest('head', path, data, cb);
      }
    };
    
    expected = {};
    
    test.ok(doc, 'Document exists');
    test.ok(doc._self(), '_self() works');
    doTest();
    
    // test basics
    test.strictEqual(typeof(doc.id()), 'undefined');
    doc = ejs.Document('index', 'type', 'id');
    test.strictEqual(doc.index(), 'index');
    doc.index('index2');
    test.strictEqual(doc.index(), 'index2');
    test.strictEqual(doc.type(), 'type');
    doc.type('type2');
    test.strictEqual(doc.type(), 'type2');
    test.strictEqual(doc.id(), 'id');
    doc.id('id2');
    test.strictEqual(doc.id(), 'id2');
    
    doc.routing('route1');
    expected.routing = 'route1';
    test.strictEqual(doc.routing(), 'route1');
    doTest();
    
    doc.parent('parent1');
    expected.parent = 'parent1';
    test.strictEqual(doc.parent(), 'parent1');
    doTest();
    
    doc.timestamp('2009-11-15T14:12:12');
    expected.timestamp = '2009-11-15T14:12:12';
    test.strictEqual(doc.timestamp(), '2009-11-15T14:12:12');
    doTest();
    
    doc.ttl('1w');
    expected.ttl = '1w';
    test.strictEqual(doc.ttl(), '1w');
    doTest();
    
    doc.timeout(10000);
    expected.timeout = 10000;
    test.strictEqual(doc.timeout(), 10000);
    doTest();
    
    doc.refresh(true);
    expected.refresh = true;
    test.strictEqual(doc.refresh(), true);
    doTest();
    
    doc.version(2);
    expected.version = 2;
    test.strictEqual(doc.version(), 2);
    doTest();
    
    doc.versionType('internal');
    expected.version_type = 'internal';
    test.strictEqual(doc.versionType(), 'internal');
    doTest();
    
    doc.versionType('invalid');
    doTest();
    
    doc.versionType('EXTERNAL');
    expected.version_type = 'external';
    doTest();
    
    doc.percolate('*');
    expected.percolate = '*';
    test.strictEqual(doc.percolate(), '*');
    doTest();
    
    doc.opType('index');
    expected.op_type = 'index';
    test.strictEqual(doc.opType(), 'index');
    doTest();
    
    doc.opType('INVALID');
    doTest();
    
    doc.opType('CREATE');
    expected.op_type = 'create';
    doTest();
    
    doc.replication('async');
    expected.replication = 'async';
    test.strictEqual(doc.replication(), 'async');
    doTest();
    
    doc.replication('invalid');
    doTest();
    
    doc.replication('SYNC');
    expected.replication = 'sync';
    doTest();
    
    doc.replication('default');
    expected.replication = 'default';
    doTest();
    
    doc.consistency('default');
    expected.consistency = 'default';
    test.strictEqual(doc.consistency(), 'default');
    doTest();
    
    doc.consistency('invalid');
    doTest();
    
    doc.consistency('ONE');
    expected.consistency = 'one';
    doTest();
    
    doc.consistency('quorum');
    expected.consistency = 'quorum';
    doTest();
    
    doc.consistency('ALL');
    expected.consistency = 'all';
    doTest();
    
    doc.preference('_primary');
    expected.preference = '_primary';
    test.strictEqual(doc.preference(), '_primary');
    doTest();
    
    doc.realtime(false);
    expected.realtime = false;
    test.strictEqual(doc.realtime(), false);
    doTest();
    
    test.deepEqual(doc.fields(), []);
    doc.fields('f1');
    expected.fields = ['f1'];
    test.deepEqual(doc.fields(), ['f1']);
    doTest();
    
    doc.fields('f2');
    expected.fields.push('f2');
    doTest();
    
    doc.fields(['f3', 'f4']);
    expected.fields = ['f3', 'f4'];
    doTest();
    
    doc.script('script');
    expected.script = 'script';
    test.strictEqual(doc.script(), 'script');
    doTest();
    
    doc.lang('mvel');
    expected.lang = 'mvel';
    test.strictEqual(doc.lang(), 'mvel');
    doTest();
    
    doc.params({param1: true, param2: 3});
    expected.params = {param1: true, param2: 3};
    test.deepEqual(doc.params(), {param1: true, param2: 3});
    doTest();
    
    doc.retryOnConflict(2);
    expected.retry_on_conflict = 2;
    test.strictEqual(doc.retryOnConflict(), 2);
    doTest();
    
    doc.upsert({title: 'test title'});
    expected.upsert = {title: 'test title'};
    test.deepEqual(doc.upsert(), {title: 'test title'});
    doTest();
    
    doc.source({title: 'test title', body: 'test body'});
    expected.source = {title: 'test title', body: 'test body'};
    test.deepEqual(doc.source(), {title: 'test title', body: 'test body'});
    doTest();
    
    test.strictEqual(doc._type(), 'document');
    test.strictEqual(doc.toString(), JSON.stringify(expected));

    // test indexing
    expected = {};
    testDoc = {title: 'test title', body: 'test body'};
    
    doc = ejs.Document('index', 'type', 'id')
      .source(testDoc);
    expected.source = testDoc;
    expectedMethod = 'put';
    expectedPath = '/index/type/id';
    expectedData = JSON.stringify(testDoc);
    doc.doIndex();
    
    doc = ejs.Document('index', 'type')
      .source(testDoc);
    expectedMethod = 'post';
    expectedPath = '/index/type';
    expectedData = JSON.stringify(testDoc);
    doc.doIndex();
    
    doc.version(2).routing('my_route');
    expected.version = 2;
    expected.routing = 'my_route';
    expectedPath = '/index/type?version=2&routing=my_route';
    doc.doIndex();
    
    doc.id('id');
    expectedMethod = 'put';
    expectedPath = '/index/type/id?version=2&routing=my_route';
    doc.doIndex();
    
    doc.replication('sync').consistency('one');
    expected.replication = 'sync';
    expected.consistency = 'one';
    expectedPath = '/index/type/id?version=2&routing=my_route&replication=sync&consistency=one';
    doc.doIndex();
    
    doc = ejs.Document('index', 'type', 'id');
    expected = {};
    expectedMethod = 'get';
    expectedPath = '/index/type/id';
    expectedData = {};
    doc.doGet();
    
    doc.fields(['f1', 'f2']).parent('abc');
    expected.fields = ['f1', 'f2'];
    expected.parent = 'abc';
    expectedPath = '/index/type/id';
    expectedData = {fields: 'f1,f2', parent: 'abc'};
    doc.doGet();
    
    doc = ejs.Document('index', 'type', 'id');
    expected = {};
    expectedMethod = 'delete';
    expectedData = '';
    expectedPath = '/index/type/id';
    doc.doDelete();
    
    doc.version(3);
    expected.version = 3;
    expectedData = '';
    expectedPath = '/index/type/id?version=3';
    doc.doDelete();
    
    
    doc = ejs.Document('index', 'type', 'id')
      .script('script code');
    expected = {script: 'script code'};
    expectedMethod = 'post';
    expectedPath = '/index/type/id/_update';
    expectedData = JSON.stringify(expected);
    doc.doUpdate();
    
    doc.fields('f3');
    expected.fields = ['f3'];
    expectedPath = '/index/type/id/_update?fields=f3';
    expectedData = JSON.stringify({script: 'script code'});
    doc.doUpdate();
    
    doc.lang('mvel').params({p1: 'v1', p2: false});
    expected.lang = 'mvel';
    expected.params = {p1: 'v1', p2: false};
    expectedData = JSON.stringify({script: 'script code', lang: 'mvel', 
      params: {p1: 'v1', p2: false}});
    doc.doUpdate();
    
    doc.upsert(testDoc).fields('f4');
    expected.upsert = testDoc;
    expected.fields.push('f4');
    expectedPath = '/index/type/id/_update?fields=f3%2Cf4';
    expectedData = JSON.stringify({script: 'script code', lang: 'mvel',
      params: {p1: 'v1', p2: false}, upsert: testDoc});
    doc.doUpdate();
    
    doc = ejs.Document('index', 'type', 'id')
      .source(testDoc).version(4);
    expected = {source: testDoc, version: 4};
    expectedMethod = 'post';
    expectedPath = '/index/type/id/_update?version=4';
    expectedData = JSON.stringify({doc: testDoc});
    doc.doUpdate();
    
    // test exceptions
    test.throws(function () {
      doc.fields(3);
    }, TypeError);
    
    test.throws(function () {
      doc.params('invalid');
    }, TypeError);
    
    test.throws(function () {
      doc.upsert('invalid');
    }, TypeError);
    
    test.throws(function () {
      doc.source('invalid');
    }, TypeError);
    
    test.throws(function () {
      ejs.client = null;
      doc.doIndex();
    }, Error, 'No Client Set');
    
    test.throws(function () {
      doc.doGet();
    }, Error, 'No Client Set');
    
    test.throws(function () {
      doc.doUpdate();
    }, Error, 'No Client Set');
    
    test.throws(function () {
      doc.doDelete();
    }, Error, 'No Client Set');
    
    test.throws(function () {
      ejs.client = mockClient;
      doc = ejs.Document('index');
      doc.doIndex();
    }, Error, 'Index and Type must be set');
    
    test.throws(function () {
      doc.doGet();
    }, Error, 'Index, Type, and ID must be set');
    
    test.throws(function () {
      doc.doUpdate();
    }, Error, 'Index, Type, and ID must be set');
    
    test.throws(function () {
      doc.doDelete();
    }, Error, 'Index, Type, and ID must be set');
    
    test.throws(function () {
      doc = ejs.Document('index', 'type');
      doc.doGet();
    }, Error, 'Index, Type, and ID must be set');
    
    test.throws(function () {
      doc.doUpdate();
    }, Error, 'Index, Type, and ID must be set');
    
    test.throws(function () {
      doc.doDelete();
    }, Error, 'Index, Type, and ID must be set');
    
    test.throws(function () {
      doc.doIndex();
    }, Error, 'No source document found');
    
    test.throws(function () {
      doc.id('id');
      doc.doUpdate();
    }, Error, 'Update script or document required');
    
    test.done();
  }
};
