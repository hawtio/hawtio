/*global require:true */
'use strict';

var ejs = require('../dist/elastic.js');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.test.expect(numAssertions)
    test.done()
  Test assertions:
    test.test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.test.deepEqual(actual, expected, [message])
    test.nottest.deepEqual(actual, expected, [message])
    test.test.strictEqual(actual, expected, [message])
    test.nottest.strictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.filters = {
  setUp: function (done) {
    done();
  },
  exists: function (test) {
    test.expect(27);

    test.ok(ejs.RegexpFilter, 'RegexpFilter');
    test.ok(ejs.IndicesFilter, 'IndicesFilter');
    test.ok(ejs.TermsFilter, 'TermsFilter');
    test.ok(ejs.NestedFilter, 'NestedFilter');
    test.ok(ejs.ScriptFilter, 'ScriptFilter');
    test.ok(ejs.RangeFilter, 'RangeFilter');
    test.ok(ejs.QueryFilter, 'QueryFilter');
    test.ok(ejs.MatchAllFilter, 'MatchAllFilter');
    test.ok(ejs.HasParentFilter, 'HasParentFilter');
    test.ok(ejs.HasChildFilter, 'HasChildFilter');
    test.ok(ejs.LimitFilter, 'LimitFilter');
    test.ok(ejs.IdsFilter, 'IdsFilter');
    test.ok(ejs.BoolFilter, 'BoolFilter');
    test.ok(ejs.GeoShapeFilter, 'GeoShapeFilter');
    test.ok(ejs.TermFilter, 'TermFilter');
    test.ok(ejs.TypeFilter, 'TypeFilter');
    test.ok(ejs.NotFilter, 'NotFilter');
    test.ok(ejs.AndFilter, 'AndFilter');
    test.ok(ejs.NumericRangeFilter, 'NumericRangeFilter');
    test.ok(ejs.GeoPolygonFilter, 'GeoPolygonFilter');
    test.ok(ejs.GeoBboxFilter, 'GeoBboxFilter');
    test.ok(ejs.GeoDistanceFilter, 'GeoDistanceFilter');
    test.ok(ejs.GeoDistanceRangeFilter, 'GeoDistanceRangeFilter');
    test.ok(ejs.ExistsFilter, 'ExistsFilter');
    test.ok(ejs.PrefixFilter, 'PrefixFilter');
    test.ok(ejs.MissingFilter, 'MissingFilter');
    test.ok(ejs.OrFilter, 'OrFilter');

    test.done();
  },
  RegexpFilter: function (test) {
    test.expect(12);

    var regexFilter = ejs.RegexpFilter('title', 'regex'),
      expected,
      doTest = function () {
        test.deepEqual(regexFilter._self(), expected);
      };

    expected = {
      regexp: {
        title: {
          value: 'regex'
        }
      }
    };

    test.ok(regexFilter, 'RegexpFilter exists');
    test.ok(regexFilter._self(), '_self() works');
    doTest();

    regexFilter.value('regex2');
    expected.regexp.title.value = 'regex2';
    doTest();
    
    regexFilter.field('body');
    expected = {
      regexp: {
        body: {
          value: 'regex2'
        }
      }
    };
    doTest();
    
    regexFilter.flags('INTERSECTION|EMPTY');
    expected.regexp.body.flags = 'INTERSECTION|EMPTY';
    doTest();
    
    regexFilter.flagsValue(-1);
    expected.regexp.body.flags_value = -1;
    doTest();
    
    regexFilter.name('filter_name');
    expected.regexp._name = 'filter_name';
    doTest();
    
    regexFilter.cache(true);
    expected.regexp._cache = true;
    doTest();
    
    regexFilter.cacheKey('filter_cache_key');
    expected.regexp._cache_key = 'filter_cache_key';
    doTest();
    
    test.strictEqual(regexFilter._type(), 'filter');
    test.strictEqual(regexFilter.toString(), JSON.stringify(expected));

    test.done();
  },
  IndicesFilter: function (test) {
    test.expect(19);

    var termFilter = ejs.TermFilter('t1', 'v1'),
      termFilter2 = ejs.TermFilter('t2', 'v2'),
      termFilter3 = ejs.TermFilter('t3', 'v3'),
      indicesFilter = ejs.IndicesFilter(termFilter, 'i1'),
      expected,
      doTest = function () {
        test.deepEqual(indicesFilter._self(), expected);
      };

    expected = {
      indices: {
        filter: termFilter._self(),
        indices: ['i1']
      }
    };

    test.ok(indicesFilter, 'IndicesFilter exists');
    test.ok(indicesFilter._self(), '_self() works');
    doTest();

    indicesFilter = ejs.IndicesFilter(termFilter, ['i2', 'i3']);
    expected.indices.indices = ['i2', 'i3'];
    doTest();
    
    indicesFilter.indices('i4');
    expected.indices.indices.push('i4');
    doTest();
    
    indicesFilter.indices(['i5']);
    expected.indices.indices = ['i5'];
    doTest();
    
    indicesFilter.filter(termFilter2);
    expected.indices.filter = termFilter2._self();
    doTest();
    
    indicesFilter.noMatchFilter('invalid');
    doTest();
    
    indicesFilter.noMatchFilter('none');
    expected.indices.no_match_filter = 'none';
    doTest();
    
    indicesFilter.noMatchFilter('ALL');
    expected.indices.no_match_filter = 'all';
    doTest();
    
    indicesFilter.noMatchFilter(termFilter3);
    expected.indices.no_match_filter = termFilter3._self();
    doTest();
    
    indicesFilter.filter(termFilter2);
    expected.indices.filter = termFilter2._self();
    doTest();
    
    test.strictEqual(indicesFilter._type(), 'filter');
    test.strictEqual(indicesFilter.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.IndicesFilter('invalid', 'index1');
    }, TypeError);
    
    test.throws(function () {
      ejs.IndicesFilter(termFilter2, 3);
    }, TypeError);
    
    test.throws(function () {
      indicesFilter.filter('invalid');
    }, TypeError);
    
    test.throws(function () {
      indicesFilter.noMatchFilter(2);
    }, TypeError);

    test.throws(function () {
      indicesFilter.indices(1);
    }, TypeError);

    test.done();
  },
  TermsFilter: function (test) {
    test.expect(26);

    var termsFilter = ejs.TermsFilter('f1', ['t1', 't2']),
      expected,
      doTest = function () {
        test.deepEqual(termsFilter._self(), expected);
      };

    expected = {
      terms: {
        f1: ['t1', 't2']
      }
    };

    test.ok(termsFilter, 'TermsFilter exists');
    test.ok(termsFilter._self(), '_self() works');
    doTest();

    termsFilter = ejs.TermsFilter('f1', 't3');
    expected.terms.f1 = ['t3'];
    doTest();
    
    termsFilter.field('f2');
    expected = {
      terms: {
        f2: ['t3']
      }
    };
    doTest();
    
    termsFilter.terms('t3');
    expected.terms.f2.push('t3');
    doTest();
    
    termsFilter.terms(['t4']);
    expected.terms.f2 = ['t4'];
    doTest();
    
    termsFilter.index('myidx');
    expected.terms.f2 = {index: 'myidx'};
    doTest();
    
    termsFilter.type('mytype');
    expected.terms.f2.type = 'mytype';
    doTest();
    
    termsFilter.id('id1');
    expected.terms.f2.id = 'id1';
    doTest();
    
    termsFilter.path('terms_data');
    expected.terms.f2.path = 'terms_data';
    doTest();
    
    termsFilter.field('f3');
    expected = {
      terms: {
        f3: {
          index: 'myidx',
          type: 'mytype',
          id: 'id1',
          path: 'terms_data'
        }
      }
    };
    doTest();
    
    termsFilter.terms('t5');
    expected.terms.f3 = ['t5'];
    doTest();
    
    termsFilter.execution('plain');
    expected.terms.execution = 'plain';
    doTest();
    
    termsFilter.execution('INVALID');
    doTest();
    
    termsFilter.execution('AND');
    expected.terms.execution = 'and';
    doTest();
    
    termsFilter.execution('and_NOCACHE');
    expected.terms.execution = 'and_nocache';
    doTest();
    
    termsFilter.execution('or');
    expected.terms.execution = 'or';
    doTest();
    
    termsFilter.execution('or_nocache');
    expected.terms.execution = 'or_nocache';
    doTest();
    
    termsFilter.execution('BOOL');
    expected.terms.execution = 'bool';
    doTest();
    
    termsFilter.execution('BOOL_nocache');
    expected.terms.execution = 'bool_nocache';
    doTest();
    
    termsFilter.name('filter_name');
    expected.terms._name = 'filter_name';
    doTest();
    
    termsFilter.cache(true);
    expected.terms._cache = true;
    doTest();
    
    termsFilter.cacheKey('filter_cache_key');
    expected.terms._cache_key = 'filter_cache_key';
    doTest();
    
    test.strictEqual(termsFilter._type(), 'filter');
    test.strictEqual(termsFilter.toString(), JSON.stringify(expected));

    test.done();
  },
  NestedFilter: function (test) {
    test.expect(15);

    var termQuery = ejs.TermQuery('tq1', 'v1'),
      termFilter = ejs.TermFilter('tf1', 'v1'),
      nestedFilter = ejs.NestedFilter('root'),
      expected,
      doTest = function () {
        test.deepEqual(nestedFilter._self(), expected);
      };

    expected = {
      nested: {
        path: 'root'
      }
    };

    test.ok(nestedFilter, 'NestedFilter exists');
    test.ok(nestedFilter._self(), '_self() works');
    doTest();

    nestedFilter.path('new.root');
    expected.nested.path = 'new.root';
    doTest();
    
    nestedFilter.query(termQuery);
    expected.nested.query = termQuery._self();
    doTest();
    
    nestedFilter.filter(termFilter);
    expected.nested.filter = termFilter._self();
    doTest();
    
    nestedFilter.boost(2.2);
    expected.nested.boost = 2.2;
    doTest();
    
    nestedFilter.join(true);
    expected.nested.join = true;
    doTest();
    
    nestedFilter.name('filter_name');
    expected.nested._name = 'filter_name';
    doTest();
    
    nestedFilter.cache(true);
    expected.nested._cache = true;
    doTest();
    
    nestedFilter.cacheKey('filter_cache_key');
    expected.nested._cache_key = 'filter_cache_key';
    doTest();
    
    test.strictEqual(nestedFilter._type(), 'filter');
    test.strictEqual(nestedFilter.toString(), JSON.stringify(expected));

    test.throws(function () {
      nestedFilter.query('junk');
    }, TypeError);
    
    test.throws(function () {
      nestedFilter.filter('junk');
    }, TypeError);
    
    test.done();
  },
  ScriptFilter: function (test) {
    test.expect(11);

    var scriptFilter = ejs.ScriptFilter('the script'),
      expected,
      doTest = function () {
        test.deepEqual(scriptFilter._self(), expected);
      };

    expected = {
      script: {
        script: 'the script'
      }
    };

    test.ok(scriptFilter, 'ScriptFilter exists');
    test.ok(scriptFilter._self(), '_self() works');
    doTest();

    scriptFilter.params({param1: 1});
    expected.script.params = {param1: 1};
    doTest();
    
    scriptFilter.params({param1: 2, param2: 3});
    expected.script.params = {param1: 2, param2: 3};
    doTest();
    
    scriptFilter.lang('python');
    expected.script.lang = 'python';
    doTest();
    
    scriptFilter.name('script_filter');
    expected.script._name = 'script_filter';
    doTest();
    
    scriptFilter.cache(true);
    expected.script._cache = true;
    doTest();
    
    scriptFilter.cacheKey('script_filter_key');
    expected.script._cache_key = 'script_filter_key';
    doTest();
    
    test.strictEqual(scriptFilter._type(), 'filter');
    test.strictEqual(scriptFilter.toString(), JSON.stringify(expected));

    test.done();
  },
  RangeFilter: function (test) {
    test.expect(17);

    var rangeFilter = ejs.RangeFilter('f1'),
      expected,
      doTest = function () {
        test.deepEqual(rangeFilter._self(), expected);
      };

    expected = {
      range: {
        f1: {}
      }
    };

    test.ok(rangeFilter, 'RangeFilter exists');
    test.ok(rangeFilter._self(), '_self() works');
    doTest();
    
    rangeFilter.from(1);
    expected.range.f1.from = 1;
    doTest();
    
    rangeFilter.field('f2');
    expected = {
      range: {
        f2: {
          from: 1
        }
      }
    };
    doTest();
    
    rangeFilter.to(3);
    expected.range.f2.to = 3;
    doTest();
    
    rangeFilter.includeLower(false);
    expected.range.f2.include_lower = false;
    doTest();
    
    rangeFilter.includeUpper(true);
    expected.range.f2.include_upper = true;
    doTest();
    
    rangeFilter.gt(4);
    expected.range.f2.gt = 4;
    doTest();
    
    rangeFilter.gte(4);
    expected.range.f2.gte = 4;
    doTest();
    
    rangeFilter.lt(6);
    expected.range.f2.lt = 6;
    doTest();
    
    rangeFilter.lte(6);
    expected.range.f2.lte = 6;
    doTest();
    
    rangeFilter.name('range_filter');
    expected.range._name = 'range_filter';
    doTest();
    
    rangeFilter.cache(true);
    expected.range._cache = true;
    doTest();
    
    rangeFilter.cacheKey('range_filter_key');
    expected.range._cache_key = 'range_filter_key';
    doTest();
    
    test.strictEqual(rangeFilter._type(), 'filter');
    test.strictEqual(rangeFilter.toString(), JSON.stringify(expected));

    test.done();
  },
  QueryFilter: function (test) {
    test.expect(11);

    var termQuery = ejs.TermQuery('t1', 'v1'),
      termQuery2 = ejs.TermQuery('t2', 'v2'),
      queryFilter = ejs.QueryFilter(termQuery),
      expected,
      doTest = function () {
        test.deepEqual(queryFilter._self(), expected);
      };

    expected = {
      fquery: {
        query: termQuery._self()
      }
    };

    test.ok(queryFilter, 'QueryFilter exists');
    test.ok(queryFilter._self(), '_self() works');
    doTest();
    
    queryFilter.query(termQuery2);
    expected.fquery.query = termQuery2._self();
    doTest();
    
    queryFilter.name('fquery');
    expected.fquery._name = 'fquery';
    doTest();
    
    queryFilter.cache(true);
    expected.fquery._cache = true;
    doTest();
    
    queryFilter.cacheKey('fquery_cached');
    expected.fquery._cache_key = 'fquery_cached';
    doTest();
    
    test.strictEqual(queryFilter._type(), 'filter');
    test.strictEqual(queryFilter.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.QueryFilter('invalid');
    }, TypeError);
    
    test.throws(function () {
      queryFilter.query('invalid');
    }, TypeError);
    
    test.done();
  },
  MatchAllFilter: function (test) {
    test.expect(5);

    var matchAllFilter = ejs.MatchAllFilter(),
      expected,
      doTest = function () {
        test.deepEqual(matchAllFilter._self(), expected);
      };

    expected = {
      match_all: {}
    };

    test.ok(matchAllFilter, 'MatchAllFilter exists');
    test.ok(matchAllFilter._self(), '_self() works');
    doTest();

    test.strictEqual(matchAllFilter._type(), 'filter');
    test.strictEqual(matchAllFilter.toString(), JSON.stringify(expected));

    test.done();
  },
  HasParentFilter: function (test) {
    test.expect(14);

    var termQuery = ejs.TermQuery('t1', 'v1'),
      termQuery2 = ejs.TermQuery('t2', 'v2'),
      termFilter = ejs.TermFilter('tf1', 'fv1'),
      hasParentFilter = ejs.HasParentFilter(termQuery, 't1'),
      expected,
      doTest = function () {
        test.deepEqual(hasParentFilter._self(), expected);
      };

    expected = {
      has_parent: {
        query: termQuery._self(),
        parent_type: 't1'
      }
    };

    test.ok(hasParentFilter, 'HasParentFilter exists');
    test.ok(hasParentFilter._self(), '_self() works');
    doTest();
    
    hasParentFilter.query(termQuery2);
    expected.has_parent.query = termQuery2._self();
    doTest();
    
    hasParentFilter.parentType('t2');
    expected.has_parent.parent_type = 't2';
    doTest();
    
    hasParentFilter.name('has_parent');
    expected.has_parent._name = 'has_parent';
    doTest();
    
    hasParentFilter.cache(true);
    expected.has_parent._cache = true;
    doTest();
    
    hasParentFilter.cacheKey('hasp_cached');
    expected.has_parent._cache_key = 'hasp_cached';
    doTest();
    
    hasParentFilter.filter(termFilter);
    expected.has_parent.filter = termFilter._self();
    doTest();
    
    test.strictEqual(hasParentFilter._type(), 'filter');
    test.strictEqual(hasParentFilter.toString(), JSON.stringify(expected));

    test.throws(function () {
      hasParentFilter.query('invalid');
    }, TypeError);
    
    test.throws(function () {
      ejs.HasParentFilter('invalid', 't1');
    }, TypeError);

    test.throws(function () {
      hasParentFilter.filter('invalid');
    }, TypeError);
    
    test.done();
  },
  HasChildFilter: function (test) {
    test.expect(14);

    var termQuery = ejs.TermQuery('t1', 'v1'),
      termQuery2 = ejs.TermQuery('t2', 'v2'),
      termFilter = ejs.TermFilter('tf1', 'fv1'),
      hasChildFilter = ejs.HasChildFilter(termQuery, 't1'),
      expected,
      doTest = function () {
        test.deepEqual(hasChildFilter._self(), expected);
      };

    expected = {
      has_child: {
        query: termQuery._self(),
        type: 't1'
      }
    };

    test.ok(hasChildFilter, 'HasChildFilter exists');
    test.ok(hasChildFilter._self(), '_self() works');
    doTest();
    
    hasChildFilter.query(termQuery2);
    expected.has_child.query = termQuery2._self();
    doTest();
    
    hasChildFilter.type('t2');
    expected.has_child.type = 't2';
    doTest();
    
    hasChildFilter.name('haschild');
    expected.has_child._name = 'haschild';
    doTest();
    
    hasChildFilter.cache(true);
    expected.has_child._cache = true;
    doTest();
    
    hasChildFilter.cacheKey('hasc_cached');
    expected.has_child._cache_key = 'hasc_cached';
    doTest();
    
    
    hasChildFilter.filter(termFilter);
    expected.has_child.filter = termFilter._self();
    doTest();
    
    test.strictEqual(hasChildFilter._type(), 'filter');
    test.strictEqual(hasChildFilter.toString(), JSON.stringify(expected));

    test.throws(function () {
      hasChildFilter.query('invalid');
    }, TypeError);
    
    test.throws(function () {
      ejs.HasChildFilter('invalid', 't1');
    }, TypeError);
    
    test.throws(function () {
      hasChildFilter.filter('invalid');
    }, TypeError);
    
    test.done();
  },
  LimitFilter: function (test) {
    test.expect(7);

    var limitFilter = ejs.LimitFilter(100),
      expected,
      doTest = function () {
        test.deepEqual(limitFilter._self(), expected);
      };

    expected = {
      limit: {
        value: 100
      }
    };

    test.ok(limitFilter, 'LimitFilter exists');
    test.ok(limitFilter._self(), '_self() works');
    doTest();
    
    limitFilter.value(1000);
    expected.limit.value = 1000;
    doTest();

    test.strictEqual(limitFilter._type(), 'filter');
    test.strictEqual(limitFilter.toString(), JSON.stringify(expected));

    test.throws(function () {
      limitFilter.value('invalid');
    }, TypeError);
    
    test.done();
  },
  IdsFilter: function (test) {
    test.expect(15);

    var idsFilter = ejs.IdsFilter('id1'),
      expected,
      doTest = function () {
        test.deepEqual(idsFilter._self(), expected);
      };

    expected = {
      ids: {
        values: ['id1']
      }
    };

    test.ok(idsFilter, 'IdsFilter exists');
    test.ok(idsFilter._self(), '_self() works');
    doTest();
    
    idsFilter = ejs.IdsFilter(['id2', 'id3']);
    expected.ids.values = ['id2', 'id3'];
    doTest();
    
    idsFilter.values('id4');
    expected.ids.values.push('id4');
    doTest();
    
    idsFilter.values(['id5', 'id6']);
    expected.ids.values = ['id5', 'id6'];
    doTest();
    
    idsFilter.type('type1');
    expected.ids.type = ['type1'];
    doTest();
    
    idsFilter.type('type2');
    expected.ids.type.push('type2');
    doTest();
    
    idsFilter.type(['type3', 'type4']);
    expected.ids.type = ['type3', 'type4'];
    doTest();
    
    idsFilter.name('idsfilter');
    expected.ids._name = 'idsfilter';
    doTest();
    
    test.strictEqual(idsFilter._type(), 'filter');
    test.strictEqual(idsFilter.toString(), JSON.stringify(expected));

    test.throws(function () {
      idsFilter.values(2);
    }, TypeError);
    
    test.throws(function () {
      idsFilter.type(3);
    }, TypeError);
    
    test.throws(function () {
      ejs.IdsFilter(4);
    }, TypeError);
    
    test.done();
  },
  BoolFilter: function (test) {
    test.expect(21);

    var termFilter = ejs.TermFilter('t1', 'v1'),
      termFilter2 = ejs.TermFilter('t2', 'v2'),
      termFilter3 = ejs.TermFilter('t3', 'v3'),
      termFilter4 = ejs.TermFilter('t4', 'v4'),
      boolFilter = ejs.BoolFilter(),
      expected,
      doTest = function () {
        test.deepEqual(boolFilter._self(), expected);
      };

    expected = {
      bool: {}
    };

    test.ok(boolFilter, 'BoolFilter exists');
    test.ok(boolFilter._self(), '_self() works');
    doTest();

    boolFilter.must(termFilter);
    expected.bool.must = [termFilter._self()];
    doTest();

    boolFilter.must([termFilter2, termFilter3]);
    expected.bool.must = [termFilter2._self(), termFilter3._self()];
    doTest();
    
    boolFilter.mustNot(termFilter2);
    expected.bool.must_not = [termFilter2._self()];
    doTest();

    boolFilter.mustNot([termFilter3, termFilter4]);
    expected.bool.must_not = [termFilter3._self(), termFilter4._self()];
    doTest();
    
    boolFilter.should(termFilter3);
    expected.bool.should = [termFilter3._self()];
    doTest();

    boolFilter.should(termFilter4);
    expected.bool.should.push(termFilter4._self());
    doTest();

    boolFilter.should([termFilter, termFilter2]);
    expected.bool.should = [termFilter._self(), termFilter2._self()];
    doTest();
    
    boolFilter.name('boolfilter');
    expected.bool._name = 'boolfilter';
    doTest();
    
    boolFilter.cache(true);
    expected.bool._cache = true;
    doTest();
    
    boolFilter.cacheKey('testkey');
    expected.bool._cache_key = 'testkey';
    doTest();
    
    test.strictEqual(boolFilter._type(), 'filter');
    test.strictEqual(boolFilter.toString(), JSON.stringify(expected));

    test.throws(function () {
      boolFilter.must('junk');
    }, TypeError);
    
    test.throws(function () {
      boolFilter.must([termFilter, 'junk']);
    }, TypeError);
    
    test.throws(function () {
      boolFilter.mustNot('junk');
    }, TypeError);
    
    test.throws(function () {
      boolFilter.mustNot([termFilter, 'junk']);
    }, TypeError);
    
    test.throws(function () {
      boolFilter.should('junk');
    }, TypeError);
    
    test.throws(function () {
      boolFilter.should([termFilter, 'junk']);
    }, TypeError);
    
    test.done();
  },
  GeoShapeFilter: function (test) {
    test.expect(20);

    var geoShapeFilter = ejs.GeoShapeFilter('f1'),
      shape1 = ejs.Shape('envelope', [[-45.0, 45.0], [45.0, -45.0]]),
      shape2 = ejs.Shape('polygon', [[-180.0, 10.0], [20.0, 90.0], 
        [180.0, -5.0], [-30.0, -90.0]]),
      iShape1 = ejs.IndexedShape('countries', 'New Zealand'),
      iShape2 = ejs.IndexedShape('state', 'CA')
        .index('states')
        .shapeFieldName('stateShape'),
      expected,
      doTest = function () {
        test.deepEqual(geoShapeFilter._self(), expected);
      };

    expected = {
      geo_shape: {
        f1: {}
      }
    };

    test.ok(geoShapeFilter, 'GeoShapeFilter exists');
    test.ok(geoShapeFilter._self(), '_self() works');
    doTest();

    geoShapeFilter.shape(shape1);
    expected.geo_shape.f1.shape = shape1._self();
    doTest();
    
    geoShapeFilter.field('f2');
    expected = {
      geo_shape: {
        f2: {
          shape: shape1._self()
        }
      }
    };
    doTest();
    
    geoShapeFilter.shape(shape2);
    expected.geo_shape.f2.shape = shape2._self();
    doTest();
    
    geoShapeFilter.relation('intersects');
    expected.geo_shape.f2.relation = 'intersects';
    doTest();
    
    geoShapeFilter.relation('INVALID');
    doTest();
    
    geoShapeFilter.relation('DisJoint');
    expected.geo_shape.f2.relation = 'disjoint';
    doTest();
    
    geoShapeFilter.relation('WITHIN');
    expected.geo_shape.f2.relation = 'within';
    doTest();
    
    geoShapeFilter.indexedShape(iShape1);
    delete expected.geo_shape.f2.shape;
    expected.geo_shape.f2.indexed_shape = iShape1._self();
    doTest();
    
    geoShapeFilter.indexedShape(iShape2);
    expected.geo_shape.f2.indexed_shape = iShape2._self();
    doTest();
    
    geoShapeFilter.strategy('recursive');
    expected.geo_shape.f2.strategy = 'recursive';
    doTest();
    
    geoShapeFilter.strategy('INVALID');
    doTest();
    
    geoShapeFilter.strategy('TERM');
    expected.geo_shape.f2.strategy = 'term';
    doTest();
    
    geoShapeFilter.cache(true);
    expected.geo_shape._cache = true;
    doTest();
    
    geoShapeFilter.name('geofiltername');
    expected.geo_shape._name = 'geofiltername';
    doTest();
    
    geoShapeFilter.cacheKey('test_key');
    expected.geo_shape._cache_key = 'test_key';
    doTest();
    
    test.strictEqual(geoShapeFilter._type(), 'filter');
    test.strictEqual(geoShapeFilter.toString(), JSON.stringify(expected));
    
    test.done();
  },
  TermFilter: function (test) {
    test.expect(12);

    var termFilter = ejs.TermFilter('t1', 'v1'),
      expected,
      doTest = function () {
        test.deepEqual(termFilter._self(), expected);
      };

    expected = {
      term: {
        t1: 'v1'
      }
    };

    test.ok(termFilter, 'TermFilter exists');
    test.ok(termFilter._self(), '_self() works');
    test.strictEqual(termFilter.field(), 't1');
    test.strictEqual(termFilter.term(), 'v1');
    doTest();

    termFilter.field('t2');
    expected = {
      term: {
        t2: 'v1'
      }
    };
    doTest();
    
    termFilter.term('v2');
    expected.term.t2 = 'v2';
    doTest();
    
    termFilter.name('filter_name');
    expected.term._name = 'filter_name';
    doTest();
    
    termFilter.cache(true);
    expected.term._cache = true;
    doTest();
    
    termFilter.cacheKey('filter_cache_key');
    expected.term._cache_key = 'filter_cache_key';
    doTest();
    
    test.strictEqual(termFilter._type(), 'filter');
    test.strictEqual(termFilter.toString(), JSON.stringify(expected));

    test.done();
  },
  TypeFilter: function (test) {
    test.expect(6);

    var typeFilter = ejs.TypeFilter('type1'),
      expected,
      doTest = function () {
        test.deepEqual(typeFilter._self(), expected);
      };

    expected = {
      type: {
        value: 'type1'
      }
    };

    test.ok(typeFilter, 'TypeFilter exists');
    test.ok(typeFilter._self(), '_self() works');
    doTest();

    typeFilter.type('type2');
    expected.type.value = 'type2';
    doTest();

    test.strictEqual(typeFilter._type(), 'filter');
    test.strictEqual(typeFilter.toString(), JSON.stringify(expected));

    test.done();
  },
  GeoPolygonFilter: function (test) {
    test.expect(15);

    var geoPolygonFilter = ejs.GeoPolygonFilter('location'),
      point1 = ejs.GeoPoint([37.7819288, -122.396480]),
      point2 = ejs.GeoPoint().properties({lat: 37.7817289, lon: -122.396181}),
      point3 = ejs.GeoPoint().string("37.7819288,-122.396480"),
      point4 = ejs.GeoPoint().geohash('drn5x1g8cu2y'),
      point5 = ejs.GeoPoint().array([37.7817289, -122.396181]),
      expected,
      doTest = function () {
        test.deepEqual(geoPolygonFilter._self(), expected);
      };

    expected = {
      geo_polygon: {
        location: {
          points: []
        }
      }
    };

    test.ok(geoPolygonFilter, 'GeoPolygonFilter exists');
    test.ok(geoPolygonFilter._self(), '_self() works');
    doTest();

    geoPolygonFilter.points(point1);
    expected.geo_polygon.location.points.push(point1._self());
    doTest();
    
    geoPolygonFilter.points(point2).points(point3);
    expected.geo_polygon.location.points.push(point2._self());
    expected.geo_polygon.location.points.push(point3._self());
    doTest();
    
    geoPolygonFilter.points([point4, point5]);
    expected.geo_polygon.location.points = [point4._self(), point5._self()];
    doTest();
    
    geoPolygonFilter.field('location2');
    expected = {
      geo_polygon: {
        location2: {
          points: [point4._self(), point5._self()]
        }
      }
    };
    doTest();
    
    geoPolygonFilter.normalize(true);
    expected.geo_polygon.normalize = true;
    doTest();
    
    geoPolygonFilter.name('filter_name');
    expected.geo_polygon._name = 'filter_name';
    doTest();
    
    geoPolygonFilter.cache(true);
    expected.geo_polygon._cache = true;
    doTest();
    
    geoPolygonFilter.cacheKey('filter_cache_key');
    expected.geo_polygon._cache_key = 'filter_cache_key';
    doTest();
    
    test.strictEqual(geoPolygonFilter._type(), 'filter');
    test.strictEqual(geoPolygonFilter.toString(), JSON.stringify(expected));

    test.throws(function () {
      geoPolygonFilter.points('invalid');
    }, TypeError);
    
    test.throws(function () {
      geoPolygonFilter.points([point1, 'invalid']);
    }, TypeError);
    
    test.done();
  },
  GeoBboxFilter: function (test) {
    test.expect(17);

    var geoBboxFilter = ejs.GeoBboxFilter('location'),
      point1 = ejs.GeoPoint([37.7819288, -122.396480]),
      point2 = ejs.GeoPoint([37.7817289, -122.396181]),
      expected,
      doTest = function () {
        test.deepEqual(geoBboxFilter._self(), expected);
      };

    expected = {
      geo_bounding_box: {
        'location': {
        }
      }
    };

    test.ok(geoBboxFilter, 'GeoBboxFilter exists');
    test.ok(geoBboxFilter._self(), '_self() works');
    doTest();

    geoBboxFilter.topLeft(point1);
    expected.geo_bounding_box.location.top_left = point1._self();
    doTest(); 
    
    geoBboxFilter.bottomRight(point2);
    expected.geo_bounding_box.location.bottom_right = point2._self();
    doTest();
    
    geoBboxFilter.type('memory');
    expected.geo_bounding_box.type = 'memory';
    doTest();
    
    geoBboxFilter.type('INVALID');
    doTest();
    
    geoBboxFilter.type('Indexed');
    expected.geo_bounding_box.type = 'indexed';
    doTest();
    
    geoBboxFilter.field('location2');
    expected = {
      geo_bounding_box: {
        type: 'indexed',
        location2: {
          top_left: point1._self(),
          bottom_right: point2._self()
        }
      }
    };
    doTest();
    
    geoBboxFilter.normalize(true);
    expected.geo_bounding_box.normalize = true;
    doTest();
    
    geoBboxFilter.name('filter_name');
    expected.geo_bounding_box._name = 'filter_name';
    doTest();
    
    geoBboxFilter.cache(true);
    expected.geo_bounding_box._cache = true;
    doTest();
    
    geoBboxFilter.cacheKey('filter_cache_key');
    expected.geo_bounding_box._cache_key = 'filter_cache_key';
    doTest();
    
    test.strictEqual(geoBboxFilter._type(), 'filter');
    test.strictEqual(geoBboxFilter.toString(), JSON.stringify(expected));
    
    test.throws(function () {
      geoBboxFilter.topLeft('invalid');
    }, TypeError);
    
    test.throws(function () {
      geoBboxFilter.bottomRight('invalid');
    }, TypeError);
    
    test.done();
  },
  GeoDistanceFilter: function (test) {
    test.expect(24);

    var geoDistanceFilter = ejs.GeoDistanceFilter('location'),
      point1 = ejs.GeoPoint([37.7819288, -122.396480]),
      expected,
      doTest = function () {
        test.deepEqual(geoDistanceFilter._self(), expected);
      };

    expected = {
      geo_distance: {
        location: [0, 0]
      }
    };
    
    test.ok(geoDistanceFilter, 'GeoDistanceFilter exists');
    test.ok(geoDistanceFilter._self(), '_self() works');
    doTest();

    geoDistanceFilter.distance(10);
    expected.geo_distance.distance = 10;
    doTest();
    
    geoDistanceFilter.point(point1),
    expected.geo_distance.location = point1._self();
    doTest();
    
    geoDistanceFilter.field('location2');
    expected = {
      geo_distance: {
        distance: 10,
        location2: point1._self()
      }
    };
    doTest();
    
    geoDistanceFilter.unit('mi');
    expected.geo_distance.unit = 'mi';
    doTest();
    
    geoDistanceFilter.unit('INVALID');
    doTest();
    
    geoDistanceFilter.unit('Km');
    expected.geo_distance.unit = 'km';
    doTest();
    
    geoDistanceFilter.distanceType('arc');
    expected.geo_distance.distance_type = 'arc';
    doTest();
    
    geoDistanceFilter.distanceType('INVALID');
    doTest();
    
    geoDistanceFilter.distanceType('Plane');
    expected.geo_distance.distance_type = 'plane';
    doTest();
    
    geoDistanceFilter.normalize(true);
    expected.geo_distance.normalize = true;
    doTest();
    
    geoDistanceFilter.optimizeBbox('memory');
    expected.geo_distance.optimize_bbox = 'memory';
    doTest();
    
    geoDistanceFilter.optimizeBbox('INVALID');
    doTest();
    
    geoDistanceFilter.optimizeBbox('Indexed');
    expected.geo_distance.optimize_bbox = 'indexed';
    doTest();
    
    geoDistanceFilter.optimizeBbox('none');
    expected.geo_distance.optimize_bbox = 'none';
    doTest();
    
    geoDistanceFilter.name('filter_name');
    expected.geo_distance._name = 'filter_name';
    doTest();
    
    geoDistanceFilter.cache(true);
    expected.geo_distance._cache = true;
    doTest();
    
    geoDistanceFilter.cacheKey('filter_cache_key');
    expected.geo_distance._cache_key = 'filter_cache_key';
    doTest();
    
    test.strictEqual(geoDistanceFilter._type(), 'filter');
    test.strictEqual(geoDistanceFilter.toString(), JSON.stringify(expected));

    test.throws(function () {
      geoDistanceFilter.point('invalid');
    }, TypeError);
    
    test.throws(function () {
      geoDistanceFilter.distance('invalid');
    }, TypeError);
    
    test.done();
  },
  GeoDistanceRangeFilter: function (test) {
    test.expect(36);

    var geoDistanceRangeFilter = ejs.GeoDistanceRangeFilter('location'),
      point1 = ejs.GeoPoint([37.7819288, -122.396480]),
      expected,
      doTest = function () {
        test.deepEqual(geoDistanceRangeFilter._self(), expected);
      };

    expected = {
      geo_distance_range: {
        location: [0, 0]
      }
    };
    
    test.ok(geoDistanceRangeFilter, 'GeoDistanceRangeFilter exists');
    test.ok(geoDistanceRangeFilter._self(), '_self() works');
    doTest();

    geoDistanceRangeFilter.from(10);
    expected.geo_distance_range.from = 10;
    doTest();
    
    geoDistanceRangeFilter.to(30);
    expected.geo_distance_range.to = 30;
    doTest();
    
    geoDistanceRangeFilter.point(point1),
    expected.geo_distance_range.location = point1._self();
    doTest();
    
    geoDistanceRangeFilter.field('location2');
    expected = {
      geo_distance_range: {
        from: 10,
        to: 30,
        location2: point1._self()
      }
    };
    doTest();
    
    geoDistanceRangeFilter.includeUpper(true);
    expected.geo_distance_range.include_upper = true;
    doTest();
    
    geoDistanceRangeFilter.includeLower(false);
    expected.geo_distance_range.include_lower = false;
    doTest();
    
    geoDistanceRangeFilter.gt(10);
    expected.geo_distance_range.gt = 10;
    doTest();
    
    geoDistanceRangeFilter.gte(11);
    expected.geo_distance_range.gte = 11;
    doTest();
    
    geoDistanceRangeFilter.lt(30);
    expected.geo_distance_range.lt = 30;
    doTest();
    
    geoDistanceRangeFilter.lte(31);
    expected.geo_distance_range.lte = 31;
    doTest();
    
    geoDistanceRangeFilter.unit('mi');
    expected.geo_distance_range.unit = 'mi';
    doTest();
    
    geoDistanceRangeFilter.unit('INVALID');
    doTest();
    
    geoDistanceRangeFilter.unit('Km');
    expected.geo_distance_range.unit = 'km';
    doTest();
    
    geoDistanceRangeFilter.distanceType('arc');
    expected.geo_distance_range.distance_type = 'arc';
    doTest();
    
    geoDistanceRangeFilter.distanceType('INVALID');
    doTest();
    
    geoDistanceRangeFilter.distanceType('Plane');
    expected.geo_distance_range.distance_type = 'plane';
    doTest();
    
    geoDistanceRangeFilter.normalize(true);
    expected.geo_distance_range.normalize = true;
    doTest();
    
    geoDistanceRangeFilter.optimizeBbox('memory');
    expected.geo_distance_range.optimize_bbox = 'memory';
    doTest();
    
    geoDistanceRangeFilter.optimizeBbox('INVALID');
    doTest();
    
    geoDistanceRangeFilter.optimizeBbox('Indexed');
    expected.geo_distance_range.optimize_bbox = 'indexed';
    doTest();
    
    geoDistanceRangeFilter.optimizeBbox('none');
    expected.geo_distance_range.optimize_bbox = 'none';
    doTest();
    
    geoDistanceRangeFilter.name('filter_name');
    expected.geo_distance_range._name = 'filter_name';
    doTest();
    
    geoDistanceRangeFilter.cache(true);
    expected.geo_distance_range._cache = true;
    doTest();
    
    geoDistanceRangeFilter.cacheKey('filter_cache_key');
    expected.geo_distance_range._cache_key = 'filter_cache_key';
    doTest();
    
    test.strictEqual(geoDistanceRangeFilter._type(), 'filter');
    test.strictEqual(geoDistanceRangeFilter.toString(), JSON.stringify(expected));
    
    test.throws(function () {
      geoDistanceRangeFilter.point('invalid');
    }, TypeError);
    
    test.throws(function () {
      geoDistanceRangeFilter.from('invalid');
    }, TypeError);
    
    test.throws(function () {
      geoDistanceRangeFilter.to('invalid');
    }, TypeError);
    
    test.throws(function () {
      geoDistanceRangeFilter.gt('invalid');
    }, TypeError);
    
    test.throws(function () {
      geoDistanceRangeFilter.gte('invalid');
    }, TypeError);
    
    test.throws(function () {
      geoDistanceRangeFilter.lt('invalid');
    }, TypeError);
    
    test.throws(function () {
      geoDistanceRangeFilter.lte('invalid');
    }, TypeError);
    
    test.done();
  },
  NotFilter: function (test) {
    test.expect(11);

    var termFilter1 = ejs.TermFilter('t1', 'v1'),
      termFilter2 = ejs.TermFilter('t2', 'v2'),
      notFilter = ejs.NotFilter(termFilter1),
      expected,
      doTest = function () {
        test.deepEqual(notFilter._self(), expected);
      };

    expected = {
      not: termFilter1._self()
    };

    test.ok(notFilter, 'NotFilter exists');
    test.ok(notFilter._self(), '_self() works');
    doTest();

    notFilter.filter(termFilter2);
    expected.not = termFilter2._self();
    doTest();

    notFilter.name('filter_name');
    expected.not._name = 'filter_name';
    doTest();
    
    notFilter.cache(true);
    expected.not._cache = true;
    doTest();
    
    notFilter.cacheKey('filter_cache_key');
    expected.not._cache_key = 'filter_cache_key';
    doTest();
    
    test.strictEqual(notFilter._type(), 'filter');
    test.strictEqual(notFilter.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.NotFilter('invalid');
    }, TypeError);
    
    test.throws(function () {
      notFilter.filter('invalid');
    }, TypeError);
    
    test.done();
  },
  AndFilter: function (test) {
    test.expect(14);

    var termFilter1 = ejs.TermFilter('t1', 'v1'),
      termFilter2 = ejs.TermFilter('t2', 'v2'),
      termFilter3 = ejs.TermFilter('t3', 'v3'),
      termFilter4 = ejs.TermFilter('t4', 'v4'),
      andFilter = ejs.AndFilter(termFilter1),
      expected,
      doTest = function () {
        test.deepEqual(andFilter._self(), expected);
      };

    expected = {
      and: {
        filters: [termFilter1._self()]
      }
    };

    test.ok(andFilter, 'AndFilter exists');
    test.ok(andFilter._self(), '_self() works');
    doTest();

    andFilter.filters(termFilter2);
    expected.and.filters.push(termFilter2._self());
    doTest();

    andFilter.filters([termFilter3, termFilter4]);
    expected.and.filters = [termFilter3._self(), termFilter4._self()];
    doTest();
    
    andFilter.name('filter_name');
    expected.and._name = 'filter_name';
    doTest();
    
    andFilter.cache(true);
    expected.and._cache = true;
    doTest();
    
    andFilter.cacheKey('filter_cache_key');
    expected.and._cache_key = 'filter_cache_key';
    doTest();
    
    test.strictEqual(andFilter._type(), 'filter');
    test.strictEqual(andFilter.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.AndFilter('junk');
    }, TypeError);
    
    test.throws(function () {
      ejs.AndFilter([termFilter1, 'junk']);
    }, TypeError);

    test.throws(function () {
      andFilter.filters('junk');
    }, TypeError);
    
    test.throws(function () {
      andFilter.filters([termFilter1, 'junk']);
    }, TypeError);
    
    test.done();
  },
  NumericRangeFilter: function (test) {
    test.expect(26);

    var numericRangeFilter = ejs.NumericRangeFilter('f1'),
      expected,
      start = new Date(1230768000000),
      end = new Date(start.getTime()),
      doTest = function () {
        test.deepEqual(numericRangeFilter._self(), expected);
      };

    expected = {
      numeric_range: {
        f1: {}
      }
    };
    end.setFullYear(start.getFullYear() + 1);

    test.ok(numericRangeFilter, 'NumericRangeFilter exists');
    test.ok(numericRangeFilter._self(), '_self() works');
    test.strictEqual(numericRangeFilter.field(), 'f1');
    doTest();

    numericRangeFilter.from(start.getTime());
    expected.numeric_range.f1.from = start.getTime();
    test.strictEqual(numericRangeFilter.from(), start.getTime());
    doTest();

    numericRangeFilter.to(end.getTime());
    expected.numeric_range.f1.to = end.getTime();
    test.strictEqual(numericRangeFilter.to(), end.getTime());
    doTest();

    numericRangeFilter.field('f2');
    expected = {
      numeric_range: {
        f2: {
          from: start.getTime(),
          to: end.getTime()
        }
      }
    };
    doTest();
    
    numericRangeFilter.includeUpper(true);
    expected.numeric_range.f2.include_upper = true;
    doTest();
    
    numericRangeFilter.includeLower(false);
    expected.numeric_range.f2.include_lower = false;
    doTest();
    
    numericRangeFilter.gt(start.getTime());
    expected.numeric_range.f2.gt = start.getTime();
    doTest();
    
    numericRangeFilter.gte(start.getTime());
    expected.numeric_range.f2.gte = start.getTime();
    doTest();
    
    numericRangeFilter.lt(end.getTime());
    expected.numeric_range.f2.lt = end.getTime();
    doTest();
    
    numericRangeFilter.lte(end.getTime());
    expected.numeric_range.f2.lte = end.getTime();
    doTest();
    
    numericRangeFilter.name('filter_name');
    expected.numeric_range._name = 'filter_name';
    doTest();
    
    numericRangeFilter.cache(true);
    expected.numeric_range._cache = true;
    doTest();
    
    numericRangeFilter.cacheKey('filter_cache_key');
    expected.numeric_range._cache_key = 'filter_cache_key';
    doTest();
    
    test.strictEqual(numericRangeFilter._type(), 'filter');
    test.strictEqual(numericRangeFilter.toString(), JSON.stringify(expected));

    test.throws(function () {
      numericRangeFilter.from('invalid');
    }, TypeError);
    
    test.throws(function () {
      numericRangeFilter.to('invalid');
    }, TypeError);
    
    test.throws(function () {
      numericRangeFilter.gt('invalid');
    }, TypeError);
    
    test.throws(function () {
      numericRangeFilter.gte('invalid');
    }, TypeError);
    
    test.throws(function () {
      numericRangeFilter.lt('invalid');
    }, TypeError);
    
    test.throws(function () {
      numericRangeFilter.lte('invalid');
    }, TypeError);
    
    test.done();
  },
  ExistsFilter: function (test) {
    test.expect(7);

    var existsFilter = ejs.ExistsFilter('title'),
      expected,
      doTest = function () {
        test.deepEqual(existsFilter._self(), expected);
      };

    expected = {
      exists: {
        field: 'title'
      }
    };

    test.ok(existsFilter, 'ExistsFilter exists');
    test.ok(existsFilter._self(), '_self() works');
    doTest();

    existsFilter.field('body');
    expected.exists.field = 'body';
    doTest();
    
    existsFilter.name('filter_name');
    expected.exists._name = 'filter_name';
    doTest();
    
    test.strictEqual(existsFilter._type(), 'filter');
    test.strictEqual(existsFilter.toString(), JSON.stringify(expected));

    test.done();
  },
  PrefixFilter: function (test) {
    test.expect(10);

    var prefixFilter = ejs.PrefixFilter('title', 't'),
      expected,
      doTest = function () {
        test.deepEqual(prefixFilter._self(), expected);
      };

    expected = {
      prefix: {
        title: 't'
      }
    };

    test.ok(prefixFilter, 'PrefixFilter exists');
    test.ok(prefixFilter._self(), '_self() works');
    doTest();

    prefixFilter.prefix('th');
    expected.prefix.title = 'th';
    doTest();
    
    prefixFilter.field('body');
    expected = {
      prefix: {
        body: 'th'
      }
    };
    doTest();
    
    prefixFilter.name('filter_name');
    expected.prefix._name = 'filter_name';
    doTest();
    
    prefixFilter.cache(true);
    expected.prefix._cache = true;
    doTest();
    
    prefixFilter.cacheKey('filter_cache_key');
    expected.prefix._cache_key = 'filter_cache_key';
    doTest();
    
    test.strictEqual(prefixFilter._type(), 'filter');
    test.strictEqual(prefixFilter.toString(), JSON.stringify(expected));

    test.done();
  },
  MissingFilter: function (test) {
    test.expect(9);

    var missingFilter = ejs.MissingFilter('title'),
      expected,
      doTest = function () {
        test.deepEqual(missingFilter._self(), expected);
      };

    expected = {
      missing: {
        field: 'title'
      }
    };

    test.ok(missingFilter, 'MissingFilter exists');
    test.ok(missingFilter._self(), '_self() works');
    doTest();

    missingFilter.field('body');
    expected.missing.field = 'body';
    doTest();
    
    missingFilter.existence(true);
    expected.missing.existence = true;
    doTest();
    
    missingFilter.nullValue(true);
    expected.missing.null_value = true;
    doTest();
    
    missingFilter.name('missing_filter');
    expected.missing._name = 'missing_filter';
    doTest();
    
    test.strictEqual(missingFilter._type(), 'filter');
    test.strictEqual(missingFilter.toString(), JSON.stringify(expected));

    test.done();
  },
  OrFilter: function (test) {
    test.expect(15);

    var termFilter1 = ejs.TermFilter('t1', 'v1'),
      termFilter2 = ejs.TermFilter('t2', 'v2'),
      termFilter3 = ejs.TermFilter('t3', 'v3'),
      orFilter = ejs.OrFilter(termFilter1),
      expected,
      doTest = function () {
        test.deepEqual(orFilter._self(), expected);
      };

    expected = {
      or: {
        filters: [termFilter1._self()]
      }
    };

    test.ok(orFilter, 'OrFilter exists');
    test.ok(orFilter._self(), '_self() works');
    doTest();

    orFilter.filters(termFilter2);
    expected.or.filters.push(termFilter2._self());
    doTest();

    orFilter.filters([termFilter1, termFilter3]);
    expected.or.filters = [termFilter1._self(), termFilter3._self()];
    doTest();
    
    orFilter = ejs.OrFilter([termFilter2, termFilter3]);
    expected.or.filters = [termFilter2._self(), termFilter3._self()];
    doTest();
    
    orFilter.name('filter_name');
    expected.or._name = 'filter_name';
    doTest();
    
    orFilter.cache(true);
    expected.or._cache = true;
    doTest();
    
    orFilter.cacheKey('filter_cache_key');
    expected.or._cache_key = 'filter_cache_key';
    doTest();
    
    test.strictEqual(orFilter._type(), 'filter');
    test.strictEqual(orFilter.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.OrFilter('invalid');
    }, TypeError);
    
    test.throws(function () {
      ejs.OrFilter([termFilter1, 'invalid']);
    }, TypeError);
    
    test.throws(function () {
      orFilter.filters('invalid');
    }, TypeError);
    
    test.throws(function () {
      orFilter.filters([termFilter1, 'invalid']);
    }, TypeError);
    
    test.done();
  }
};
