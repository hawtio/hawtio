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

exports.queries = {
  setUp: function (done) {
    done();
  },
  exists: function (test) {
    test.expect(39);
    
    test.ok(ejs.CommonTermsQuery, 'CommonTermsQuery');
    test.ok(ejs.RegexpQuery, 'RegexpQuery');
    test.ok(ejs.GeoShapeQuery, 'GeoShapeQuery');
    test.ok(ejs.IndicesQuery, 'IndicesQuery');
    test.ok(ejs.CustomFiltersScoreQuery, 'CustomFiltersScoreQuery');
    test.ok(ejs.WildcardQuery, 'WildcardQuery');
    test.ok(ejs.TopChildrenQuery, 'TopChildrenQuery');
    test.ok(ejs.TermsQuery, 'TermsQuery');
    test.ok(ejs.RangeQuery, 'RangeQuery');
    test.ok(ejs.PrefixQuery, 'PrefixQuery');
    test.ok(ejs.MoreLikeThisFieldQuery, 'MoreLikeThisFieldQuery');
    test.ok(ejs.MoreLikeThisQuery, 'MoreLikeThisQuery');
    test.ok(ejs.HasParentQuery, 'HasParentQuery');
    test.ok(ejs.HasChildQuery, 'HasChildQuery');
    test.ok(ejs.FuzzyQuery, 'FuzzyQuery');
    test.ok(ejs.FuzzyLikeThisFieldQuery, 'FuzzyLikeThisFieldQuery');
    test.ok(ejs.FuzzyLikeThisQuery, 'FuzzyLikeThisQuery');
    test.ok(ejs.CustomBoostFactorQuery, 'CustomBoostFactorQuery');
    test.ok(ejs.CustomScoreQuery, 'CustomScoreQuery');
    test.ok(ejs.IdsQuery, 'IdsQuery');
    test.ok(ejs.BoostingQuery, 'BoostingQuery');
    test.ok(ejs.MatchQuery, 'MatchQuery');
    test.ok(ejs.MultiMatchQuery, 'MultiMatchQuery');
    test.ok(ejs.TermQuery, 'TermQuery');
    test.ok(ejs.BoolQuery, 'BoolQuery');
    test.ok(ejs.FieldQuery, 'FieldQuery');
    test.ok(ejs.DisMaxQuery, 'DisMaxQuery');
    test.ok(ejs.QueryStringQuery, 'QueryStringQuery');
    test.ok(ejs.FilteredQuery, 'FilteredQuery');
    test.ok(ejs.NestedQuery, 'NestedQuery');
    test.ok(ejs.ConstantScoreQuery, 'ConstantScoreQuery');
    test.ok(ejs.MatchAllQuery, 'MatchAllQuery');
    test.ok(ejs.SpanTermQuery, 'SpanTermQuery');
    test.ok(ejs.SpanNearQuery, 'SpanNearQuery');
    test.ok(ejs.SpanNotQuery, 'SpanNotQuery');
    test.ok(ejs.SpanOrQuery, 'SpanOrQuery');
    test.ok(ejs.SpanFirstQuery, 'SpanFirstQuery');
    test.ok(ejs.SpanMultiTermQuery, 'SpanMultiTermQuery');
    test.ok(ejs.FieldMaskingSpanQuery, 'FieldMaskingSpanQuery');

    test.done();
  },
  CommonTermsQuery: function (test) {
    test.expect(20);

    var commonQuery = ejs.CommonTermsQuery(),
      expected,
      doTest = function () {
        test.deepEqual(commonQuery._self(), expected);
      };

    expected = {
      common: {
        no_field_set: {}
      }
    };

    test.ok(commonQuery, 'CommonTermsQuery exists');
    test.ok(commonQuery._self(), '_self() works');
    doTest();

    commonQuery = ejs.CommonTermsQuery('field');
    expected = {
      common: {
        field: {}
      }
    };
    doTest();
    
    commonQuery = ejs.CommonTermsQuery('field', 'qstr');
    expected = {
      common: {
        field: {
          query: 'qstr'
        }
      }
    };
    doTest();
    
    commonQuery.field('field2');
    expected = {
      common: {
        field2: {
          query: 'qstr'
        }
      }
    };
    doTest();
    
    commonQuery.query('qstr2');
    expected.common.field2.query = 'qstr2';
    doTest();
    
    commonQuery.boost(1.5);
    expected.common.field2.boost = 1.5;
    doTest();

    commonQuery.disableCoords(true);
    expected.common.field2.disable_coords = true;
    doTest();
    
    commonQuery.cutoffFrequency(0.65);
    expected.common.field2.cutoff_frequency = 0.65;
    doTest();
    
    commonQuery.highFreqOperator('and');
    expected.common.field2.high_freq_operator = 'and';
    doTest();

    commonQuery.highFreqOperator('junk');
    doTest();

    commonQuery.highFreqOperator('or');
    expected.common.field2.high_freq_operator = 'or';
    doTest();

    commonQuery.lowFreqOperator('and');
    expected.common.field2.low_freq_operator = 'and';
    doTest();

    commonQuery.lowFreqOperator('junk');
    doTest();

    commonQuery.lowFreqOperator('or');
    expected.common.field2.low_freq_operator = 'or';
    doTest();
    
    commonQuery.analyzer('the analyzer');
    expected.common.field2.analyzer = 'the analyzer';
    doTest();

    commonQuery.minimumShouldMatch(10);
    expected.common.field2.minimum_should_match = 10;
    doTest();
    
    test.strictEqual(commonQuery._type(), 'query');
    test.strictEqual(commonQuery.toString(), JSON.stringify(expected));
    
    test.done();
  },
  RegexpQuery: function (test) {
    test.expect(17);

    var regexQuery = ejs.RegexpQuery('f1', 'regex'),
      expected,
      doTest = function () {
        test.deepEqual(regexQuery._self(), expected);
      };

    expected = {
      regexp: {
        f1: {
          value: 'regex'
        }
      }
    };

    test.ok(regexQuery, 'RegexpQuery exists');
    test.ok(regexQuery._self(), '_self() works');
    doTest();
    
    regexQuery.value('regex2');
    expected.regexp.f1.value = 'regex2';
    doTest();
    
    regexQuery.field('f2');
    expected = {
      regexp: {
        f2: {
          value: 'regex2'
        }
      }
    };
    doTest();
    
    regexQuery.boost(1.2);
    expected.regexp.f2.boost = 1.2;
    doTest();
    
    regexQuery.rewrite('constant_score_auto');
    expected.regexp.f2.rewrite = 'constant_score_auto';
    doTest();
    
    regexQuery.rewrite('invalid');
    doTest();
    
    regexQuery.rewrite('scoring_boolean');
    expected.regexp.f2.rewrite = 'scoring_boolean';
    doTest();
    
    regexQuery.rewrite('constant_score_boolean');
    expected.regexp.f2.rewrite = 'constant_score_boolean';
    doTest();
    
    regexQuery.rewrite('constant_score_filter');
    expected.regexp.f2.rewrite = 'constant_score_filter';
    doTest();
    
    regexQuery.rewrite('top_terms_boost_5');
    expected.regexp.f2.rewrite = 'top_terms_boost_5';
    doTest();
    
    regexQuery.rewrite('top_terms_9');
    expected.regexp.f2.rewrite = 'top_terms_9';
    doTest();
    
    regexQuery.flags('INTERSECTION|EMPTY');
    expected.regexp.f2.flags = 'INTERSECTION|EMPTY';
    doTest();
    
    regexQuery.flagsValue(-1);
    expected.regexp.f2.flags_value = -1;
    doTest();
    
    test.strictEqual(regexQuery._type(), 'query');
    test.strictEqual(regexQuery.toString(), JSON.stringify(expected));

    test.done();
  },
  GeoShapeQuery: function (test) {
    test.expect(18);

    var geoShapeQuery = ejs.GeoShapeQuery('f1'),
      shape1 = ejs.Shape('envelope', [[-45.0, 45.0], [45.0, -45.0]]),
      shape2 = ejs.Shape('polygon', [[-180.0, 10.0], [20.0, 90.0], 
        [180.0, -5.0], [-30.0, -90.0]]),
      iShape1 = ejs.IndexedShape('countries', 'New Zealand'),
      iShape2 = ejs.IndexedShape('state', 'CA')
        .index('states')
        .shapeFieldName('stateShape'),
      expected,
      doTest = function () {
        test.deepEqual(geoShapeQuery._self(), expected);
      };

    expected = {
      geo_shape: {
        f1: {}
      }
    };

    test.ok(geoShapeQuery, 'GeoShapeQuery exists');
    test.ok(geoShapeQuery._self(), '_self() works');
    doTest();

    geoShapeQuery.shape(shape1);
    expected.geo_shape.f1.shape = shape1._self();
    doTest();
    
    geoShapeQuery.field('f2');
    expected = {
      geo_shape: {
        f2: {
          shape: shape1._self()
        }
      }
    };
    doTest();
    
    geoShapeQuery.shape(shape2);
    expected.geo_shape.f2.shape = shape2._self();
    doTest();
    
    geoShapeQuery.relation('intersects');
    expected.geo_shape.f2.relation = 'intersects';
    doTest();
    
    geoShapeQuery.relation('INVALID');
    doTest();
    
    geoShapeQuery.relation('DisJoint');
    expected.geo_shape.f2.relation = 'disjoint';
    doTest();
    
    geoShapeQuery.relation('WITHIN');
    expected.geo_shape.f2.relation = 'within';
    doTest();
    
    geoShapeQuery.indexedShape(iShape1);
    delete expected.geo_shape.f2.shape;
    expected.geo_shape.f2.indexed_shape = iShape1._self();
    doTest();
    
    geoShapeQuery.indexedShape(iShape2);
    expected.geo_shape.f2.indexed_shape = iShape2._self();
    doTest();
    
    geoShapeQuery.strategy('recursive');
    expected.geo_shape.f2.strategy = 'recursive';
    doTest();
    
    geoShapeQuery.strategy('INVALID');
    doTest();
    
    geoShapeQuery.strategy('TERM');
    expected.geo_shape.f2.strategy = 'term';
    doTest();
    
    geoShapeQuery.boost(1.5);
    expected.geo_shape.f2.boost = 1.5;
    doTest();
    
    test.strictEqual(geoShapeQuery._type(), 'query');
    test.strictEqual(geoShapeQuery.toString(), JSON.stringify(expected));
    
    test.done();
  },
  IndicesQuery: function (test) {
    test.expect(20);

    var termQuery = ejs.TermQuery('t1', 'v1'),
      termQuery2 = ejs.TermQuery('t2', 'v2'),
      termQuery3 = ejs.TermQuery('t3', 'v3'),
      indicesQuery = ejs.IndicesQuery(termQuery, 'i1'),
      expected,
      doTest = function () {
        test.deepEqual(indicesQuery._self(), expected);
      };

    expected = {
      indices: {
        query: termQuery._self(),
        indices: ['i1']
      }
    };

    test.ok(indicesQuery, 'IndicesQuery exists');
    test.ok(indicesQuery._self(), '_self() works');
    doTest();

    indicesQuery = ejs.IndicesQuery(termQuery, ['i2', 'i3']);
    expected.indices.indices = ['i2', 'i3'];
    doTest();
    
    indicesQuery.indices('i4');
    expected.indices.indices.push('i4');
    doTest();
    
    indicesQuery.indices(['i5']);
    expected.indices.indices = ['i5'];
    doTest();
    
    indicesQuery.query(termQuery2);
    expected.indices.query = termQuery2._self();
    doTest();
    
    indicesQuery.noMatchQuery('invalid');
    doTest();
    
    indicesQuery.noMatchQuery('none');
    expected.indices.no_match_query = 'none';
    doTest();
    
    indicesQuery.noMatchQuery('ALL');
    expected.indices.no_match_query = 'all';
    doTest();
    
    indicesQuery.noMatchQuery(termQuery3);
    expected.indices.no_match_query = termQuery3._self();
    doTest();
     
    indicesQuery.boost(1.5);
    expected.indices.boost = 1.5;
    doTest();
    
    indicesQuery.query(termQuery2);
    expected.indices.query = termQuery2._self();
    doTest();
    
    test.strictEqual(indicesQuery._type(), 'query');
    test.strictEqual(indicesQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.IndicesQuery('invalid', 'index1');
    }, TypeError);
    
    test.throws(function () {
      ejs.IndicesQuery(termQuery2, 3);
    }, TypeError);
    
    test.throws(function () {
      indicesQuery.query('invalid');
    }, TypeError);
    
    test.throws(function () {
      indicesQuery.noMatchQuery(2);
    }, TypeError);

    test.throws(function () {
      indicesQuery.indices(1);
    }, TypeError);

    test.done();
  },
  CustomFiltersScoreQuery: function (test) {
    test.expect(25);

    var termQuery = ejs.TermQuery('t1', 'v1'),
      termQuery2 = ejs.TermQuery('t2', 'v2'),
      termFilter = ejs.TermFilter('tf1', 'fv1'),
      termFilter2 = ejs.TermFilter('tf2', 'fv2'), 
      cfsQuery = ejs.CustomFiltersScoreQuery(termQuery, [
        {filter: termFilter, boost: 1.2}, 
        {filter: termFilter2, script: 's'}
      ]),
      expected,
      doTest = function () {
        test.deepEqual(cfsQuery._self(), expected);
      };

    expected = {
      custom_filters_score: {
        query: termQuery._self(),
        filters: [{
          filter: termFilter._self(),
          boost: 1.2
        }, {
          filter: termFilter2._self(),
          script: 's'
        }]
      }
    };

    test.ok(cfsQuery, 'CustomFiltersScoreQuery exists');
    test.ok(cfsQuery._self(), '_self() works');
    doTest();

    cfsQuery = ejs.CustomFiltersScoreQuery(termQuery, {filter: termFilter, boost: 1.2});
    expected = {
      custom_filters_score: {
        query: termQuery._self(),
        filters: [{
          filter: termFilter._self(),
          boost: 1.2
        }]
      }
    };
    doTest();
    
    cfsQuery.boost(1.5);
    expected.custom_filters_score.boost = 1.5;
    doTest();
    
    cfsQuery.query(termQuery2);
    expected.custom_filters_score.query = termQuery2._self();
    doTest();
    
    // invalid filter because no boost or script, results in empty filters.
    cfsQuery.filters([{filter: termFilter, invalid: true}]);
    expected.custom_filters_score.filters = [];
    doTest();
    
    // overwrite existing
    cfsQuery.filters([{filter: termFilter, script: 's'}]);
    expected.custom_filters_score.filters = [{filter: termFilter._self(), script: 's'}];
    doTest();
    
    cfsQuery.filters([{filter: termFilter, invalid: true}, {filter: termFilter2, boost: 2}]);
    expected.custom_filters_score.filters = [{filter: termFilter2._self(), boost: 2}];
    doTest();
    
    // append
    cfsQuery.filters({filter: termFilter2, boost: 5.5});
    expected.custom_filters_score.filters.push({filter: termFilter2._self(), boost: 5.5});
    doTest();
    
    cfsQuery.filters([{filter: termFilter, script: 's'}, {filter: termFilter2, boost: 2.2}]);
    expected.custom_filters_score.filters = [
      {filter: termFilter._self(), script: 's'}, 
      {filter: termFilter2._self(), boost: 2.2}
    ];
    doTest();
    
    cfsQuery.scoreMode('first');
    expected.custom_filters_score.score_mode = 'first';
    doTest();
    
    cfsQuery.scoreMode('INVALID');
    doTest();
    
    cfsQuery.scoreMode('MIN');
    expected.custom_filters_score.score_mode = 'min';
    doTest();
    
    cfsQuery.scoreMode('max');
    expected.custom_filters_score.score_mode = 'max';
    doTest();
    
    cfsQuery.scoreMode('TOTAL');
    expected.custom_filters_score.score_mode = 'total';
    doTest();
    
    cfsQuery.scoreMode('avg');
    expected.custom_filters_score.score_mode = 'avg';
    doTest();
    
    cfsQuery.scoreMode('Multiply');
    expected.custom_filters_score.score_mode = 'multiply';
    doTest();
    
    cfsQuery.params({param1: true, param2: false});
    expected.custom_filters_score.params = {param1: true, param2: false};
    doTest();
    
    cfsQuery.lang('mvel');
    expected.custom_filters_score.lang = 'mvel';
    doTest();
    
    cfsQuery.maxBoost(6.0);
    expected.custom_filters_score.max_boost = 6.0;
    doTest();
    
    test.strictEqual(cfsQuery._type(), 'query');
    test.strictEqual(cfsQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.CustomFiltersScoreQuery('invalid', {filter: termFilter, boost: 1.2});
    }, TypeError);
    
    test.throws(function () {
      cfsQuery.query('junk');
    }, TypeError);
    
    test.done();
  },
  WildcardQuery: function (test) {
    test.expect(15);

    var wildcardQuery = ejs.WildcardQuery('f1', 'wild*card'),
      expected,
      doTest = function () {
        test.deepEqual(wildcardQuery._self(), expected);
      };

    expected = {
      wildcard: {
        f1: {
          value: 'wild*card'
        }
      }
    };

    test.ok(wildcardQuery, 'WildcardQuery exists');
    test.ok(wildcardQuery._self(), '_self() works');
    doTest();

    wildcardQuery.boost(1.5);
    expected.wildcard.f1.boost = 1.5;
    doTest();

    wildcardQuery.rewrite('constant_score_auto');
    expected.wildcard.f1.rewrite = 'constant_score_auto';
    doTest();
    
    wildcardQuery.rewrite('invalid');
    doTest();
    
    wildcardQuery.rewrite('scoring_boolean');
    expected.wildcard.f1.rewrite = 'scoring_boolean';
    doTest();
    
    wildcardQuery.rewrite('constant_score_boolean');
    expected.wildcard.f1.rewrite = 'constant_score_boolean';
    doTest();
    
    wildcardQuery.rewrite('constant_score_filter');
    expected.wildcard.f1.rewrite = 'constant_score_filter';
    doTest();
    
    wildcardQuery.rewrite('top_terms_boost_5');
    expected.wildcard.f1.rewrite = 'top_terms_boost_5';
    doTest();
    
    wildcardQuery.rewrite('top_terms_9');
    expected.wildcard.f1.rewrite = 'top_terms_9';
    doTest();
    
    wildcardQuery.field('f2');
    expected = {
      wildcard: {
        f2: {
          value: 'wild*card',
          boost: 1.5,
          rewrite: 'top_terms_9'
        }
      }
    };
    doTest();
    
    wildcardQuery.value('wild?card');
    expected.wildcard.f2.value = 'wild?card';
    doTest();
    
    test.strictEqual(wildcardQuery._type(), 'query');
    test.strictEqual(wildcardQuery.toString(), JSON.stringify(expected));

    test.done();
  },
  TopChildrenQuery: function (test) {
    test.expect(22);

    var termQuery = ejs.TermQuery('t1', 'v1'),
      termQuery2 = ejs.TermQuery('t2', 'v2'),
      topChildren = ejs.TopChildrenQuery(termQuery, 't1'),
      expected,
      doTest = function () {
        test.deepEqual(topChildren._self(), expected);
      };

    expected = {
      top_children: {
        query: termQuery._self(),
        type: 't1'
      }
    };

    test.ok(topChildren, 'TopChildrenQuery exists');
    test.ok(topChildren._self(), '_self() works');
    doTest();
    
    topChildren.query(termQuery2);
    expected.top_children.query = termQuery2._self();
    doTest();
    
    topChildren.type('t2');
    expected.top_children.type = 't2';
    doTest();
    
    topChildren.boost(1.2);
    expected.top_children.boost = 1.2;
    doTest();
    
    topChildren.score('silently fail');
    doTest();
    
    topChildren.score('max');
    expected.top_children.score = 'max';
    doTest();
    
    topChildren.score('SUM');
    expected.top_children.score = 'sum';
    doTest();
    
    topChildren.score('avg');
    expected.top_children.score = 'avg';
    doTest();
    
    topChildren.score('total');
    expected.top_children.score = 'total';
    doTest();
    
    topChildren.scoreMode('silently fail');
    doTest();
    
    topChildren.scoreMode('max');
    expected.top_children.score_mode = 'max';
    doTest();
    
    topChildren.scoreMode('SUM');
    expected.top_children.score_mode = 'sum';
    doTest();
    
    topChildren.scoreMode('avg');
    expected.top_children.score_mode = 'avg';
    doTest();
    
    topChildren.scoreMode('total');
    expected.top_children.score_mode = 'total';
    doTest();
    
    topChildren.factor(7);
    expected.top_children.factor = 7;
    doTest();
    
    topChildren.incrementalFactor(3);
    expected.top_children.incremental_factor = 3;
    doTest();
    
    test.strictEqual(topChildren._type(), 'query');
    test.strictEqual(topChildren.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.TopChildrenQuery('invalid', 'type');
    }, TypeError);
    
    test.throws(function () {
      topChildren.query('invalid');
    }, TypeError);
    
    test.done();
  },
  TermsQuery: function (test) {
    test.expect(14);

    var termsQuery = ejs.TermsQuery('f1', ['t1', 't2']),
      expected,
      doTest = function () {
        test.deepEqual(termsQuery._self(), expected);
      };

    expected = {
      terms: {
        f1: ['t1', 't2']
      }
    };

    test.ok(termsQuery, 'TermsQuery exists');
    test.ok(termsQuery._self(), '_self() works');
    doTest();

    termsQuery = ejs.TermsQuery('f1', 't3');
    expected = {
      terms: {
        f1: ['t3']
      }
    };
    doTest();
    
    termsQuery.boost(1.5);
    expected.terms.boost = 1.5;
    doTest();

    termsQuery.minimumShouldMatch(2);
    expected.terms.minimum_should_match = 2;
    doTest();
    
    termsQuery.field('f2');
    expected = {
      terms: {
        boost: 1.5,
        minimum_should_match: 2,
        f2: ['t3']
      }
    };
    doTest();
    
    termsQuery.terms('t4');
    expected.terms.f2.push('t4');
    doTest();
    
    termsQuery.terms(['t5', 't6']);
    expected.terms.f2 = ['t5', 't6'];
    doTest();
    
    termsQuery.disableCoord(true);
    expected.terms.disable_coord = true;
    doTest();
    
    test.strictEqual(termsQuery._type(), 'query');
    test.strictEqual(termsQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.TermsQuery('f1', 3);
    }, TypeError);
    
    test.throws(function () {
      termsQuery.terms(2);
    }, TypeError);
    
    test.done();
  },
  RangeQuery: function (test) {
    test.expect(15);

    var rangeQuery = ejs.RangeQuery('f1'),
      expected,
      doTest = function () {
        test.deepEqual(rangeQuery._self(), expected);
      };

    expected = {
      range: {
        f1: {}
      }
    };

    test.ok(rangeQuery, 'RangeQuery exists');
    test.ok(rangeQuery._self(), '_self() works');
    doTest();
    
    rangeQuery.from(1);
    expected.range.f1.from = 1;
    doTest();
    
    rangeQuery.field('f2');
    expected = {
      range: {
        f2: {
          from: 1
        }
      }
    };
    doTest();
    
    rangeQuery.to(3);
    expected.range.f2.to = 3;
    doTest();
    
    rangeQuery.includeLower(false);
    expected.range.f2.include_lower = false;
    doTest();
    
    rangeQuery.includeUpper(true);
    expected.range.f2.include_upper = true;
    doTest();
    
    rangeQuery.gt(4);
    expected.range.f2.gt = 4;
    doTest();
    
    rangeQuery.gte(4);
    expected.range.f2.gte = 4;
    doTest();
    
    rangeQuery.lt(6);
    expected.range.f2.lt = 6;
    doTest();
    
    rangeQuery.lte(6);
    expected.range.f2.lte = 6;
    doTest();
    
    rangeQuery.boost(1.2);
    expected.range.f2.boost = 1.2;
    doTest();
    
    test.strictEqual(rangeQuery._type(), 'query');
    test.strictEqual(rangeQuery.toString(), JSON.stringify(expected));

    test.done();
  },
  PrefixQuery: function (test) {
    test.expect(15);

    var prefixQuery = ejs.PrefixQuery('f1', 'prefix'),
      expected,
      doTest = function () {
        test.deepEqual(prefixQuery._self(), expected);
      };

    expected = {
      prefix: {
        f1: {
          value: 'prefix'
        }
      }
    };

    test.ok(prefixQuery, 'PrefixQuery exists');
    test.ok(prefixQuery._self(), '_self() works');
    doTest();
    
    prefixQuery.value('prefix2');
    expected.prefix.f1.value = 'prefix2';
    doTest();
    
    prefixQuery.field('f2');
    expected = {
      prefix: {
        f2: {
          value: 'prefix2'
        }
      }
    };
    doTest();
    
    prefixQuery.boost(1.2);
    expected.prefix.f2.boost = 1.2;
    doTest();
    
    prefixQuery.rewrite('constant_score_auto');
    expected.prefix.f2.rewrite = 'constant_score_auto';
    doTest();
    
    prefixQuery.rewrite('invalid');
    doTest();
    
    prefixQuery.rewrite('scoring_boolean');
    expected.prefix.f2.rewrite = 'scoring_boolean';
    doTest();
    
    prefixQuery.rewrite('constant_score_boolean');
    expected.prefix.f2.rewrite = 'constant_score_boolean';
    doTest();
    
    prefixQuery.rewrite('constant_score_filter');
    expected.prefix.f2.rewrite = 'constant_score_filter';
    doTest();
    
    prefixQuery.rewrite('top_terms_boost_5');
    expected.prefix.f2.rewrite = 'top_terms_boost_5';
    doTest();
    
    prefixQuery.rewrite('top_terms_9');
    expected.prefix.f2.rewrite = 'top_terms_9';
    doTest();
    
    test.strictEqual(prefixQuery._type(), 'query');
    test.strictEqual(prefixQuery.toString(), JSON.stringify(expected));

    test.done();
  },
  MoreLikeThisFieldQuery: function (test) {
    test.expect(18);

    var mltQuery = ejs.MoreLikeThisFieldQuery('f1', 'like text'),
      expected,
      doTest = function () {
        test.deepEqual(mltQuery._self(), expected);
      };

    expected = {
      mlt_field: {
        f1: {
          like_text: 'like text'
        }
      }
    };

    test.ok(mltQuery, 'MoreLikeThisFieldQuery exists');
    test.ok(mltQuery._self(), '_self() works');
    doTest();
    
    mltQuery.likeText('like text 2');
    expected.mlt_field.f1.like_text = 'like text 2';
    doTest();
    
    mltQuery.field('f2');
    expected = {
      mlt_field: {
        f2: {
          like_text: 'like text 2'
        }
      }
    };
    doTest();
    
    mltQuery.percentTermsToMatch(0.7);
    expected.mlt_field.f2.percent_terms_to_match = 0.7;
    doTest();
    
    mltQuery.minTermFreq(3);
    expected.mlt_field.f2.min_term_freq = 3;
    doTest();
    
    mltQuery.maxQueryTerms(6);
    expected.mlt_field.f2.max_query_terms = 6;
    doTest();
    
    mltQuery.stopWords(['s1', 's2']);
    expected.mlt_field.f2.stop_words = ['s1', 's2'];
    doTest();
    
    mltQuery.minDocFreq(2);
    expected.mlt_field.f2.min_doc_freq = 2;
    doTest();
    
    mltQuery.maxDocFreq(4);
    expected.mlt_field.f2.max_doc_freq = 4;
    doTest();
    
    mltQuery.minWordLen(3);
    expected.mlt_field.f2.min_word_len = 3;
    doTest();
    
    mltQuery.maxWordLen(6);
    expected.mlt_field.f2.max_word_len = 6;
    doTest();
    
    mltQuery.boostTerms(1.3);
    expected.mlt_field.f2.boost_terms = 1.3;
    doTest();
    
    mltQuery.analyzer('some analyzer');
    expected.mlt_field.f2.analyzer = 'some analyzer';
    doTest();
    
    mltQuery.boost(1.2);
    expected.mlt_field.f2.boost = 1.2;
    doTest();
    
    test.strictEqual(mltQuery._type(), 'query');
    test.strictEqual(mltQuery.toString(), JSON.stringify(expected));

    test.done();
  },
  MoreLikeThisQuery: function (test) {
    test.expect(22);

    var mltQuery = ejs.MoreLikeThisQuery(['f', 'f2'], 'like text'),
      expected,
      doTest = function () {
        test.deepEqual(mltQuery._self(), expected);
      };

    expected = {
      mlt: {
        like_text: 'like text',
        fields: ['f', 'f2']
      }
    };

    test.ok(mltQuery, 'MoreLikeThisQuery exists');
    test.ok(mltQuery._self(), '_self() works');
    doTest();
    
    mltQuery = ejs.MoreLikeThisQuery('f', 'like text');
    expected = {
      mlt: {
        like_text: 'like text',
        fields: ['f']
      }
    };
    doTest();
    
    mltQuery.fields('f2');
    expected.mlt.fields.push('f2');
    doTest();
    
    mltQuery.fields(['f3', 'f4']);
    expected.mlt.fields = ['f3', 'f4'];
    doTest();
    
    mltQuery.likeText('like text 2');
    expected.mlt.like_text = 'like text 2';
    doTest();
    
    mltQuery.percentTermsToMatch(0.7);
    expected.mlt.percent_terms_to_match = 0.7;
    doTest();
    
    mltQuery.minTermFreq(3);
    expected.mlt.min_term_freq = 3;
    doTest();
    
    mltQuery.maxQueryTerms(6);
    expected.mlt.max_query_terms = 6;
    doTest();
    
    mltQuery.stopWords(['s1', 's2']);
    expected.mlt.stop_words = ['s1', 's2'];
    doTest();
    
    mltQuery.minDocFreq(2);
    expected.mlt.min_doc_freq = 2;
    doTest();
    
    mltQuery.maxDocFreq(4);
    expected.mlt.max_doc_freq = 4;
    doTest();
    
    mltQuery.minWordLen(3);
    expected.mlt.min_word_len = 3;
    doTest();
    
    mltQuery.maxWordLen(6);
    expected.mlt.max_word_len = 6;
    doTest();
    
    mltQuery.boostTerms(1.3);
    expected.mlt.boost_terms = 1.3;
    doTest();
    
    mltQuery.analyzer('some analyzer');
    expected.mlt.analyzer = 'some analyzer';
    doTest();
    
    mltQuery.boost(1.2);
    expected.mlt.boost = 1.2;
    doTest();
    
    test.strictEqual(mltQuery._type(), 'query');
    test.strictEqual(mltQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.MoreLikeThisQuery(9, 'like');
    }, TypeError);
    
    test.throws(function () {
      mltQuery.fields(3);
    }, TypeError);
    
    test.done();
  },
  HasParentQuery: function (test) {
    test.expect(16);

    var termQuery = ejs.TermQuery('t1', 'v1'),
      termQuery2 = ejs.TermQuery('t2', 'v2'),
      hasParentQuery = ejs.HasParentQuery(termQuery, 't1'),
      expected,
      doTest = function () {
        test.deepEqual(hasParentQuery._self(), expected);
      };

    expected = {
      has_parent: {
        query: termQuery._self(),
        parent_type: 't1'
      }
    };

    test.ok(hasParentQuery, 'HasParentQuery exists');
    test.ok(hasParentQuery._self(), '_self() works');
    doTest();
    
    hasParentQuery.query(termQuery2);
    expected.has_parent.query = termQuery2._self();
    doTest();
    
    hasParentQuery.parentType('t2');
    expected.has_parent.parent_type = 't2';
    doTest();
    
    hasParentQuery.scoreType('none');
    expected.has_parent.score_type = 'none';
    doTest();
    
    hasParentQuery.scoreType('INVALID');
    doTest();
    
    hasParentQuery.scoreType('SCORE');
    expected.has_parent.score_type = 'score';
    doTest();
    
    hasParentQuery.scoreMode('none');
    expected.has_parent.score_mode = 'none';
    doTest();
    
    hasParentQuery.scoreMode('INVALID');
    doTest();
    
    hasParentQuery.scoreMode('SCORE');
    expected.has_parent.score_mode = 'score';
    doTest();
    
    hasParentQuery.boost(1.2);
    expected.has_parent.boost = 1.2;
    doTest();
    
    test.strictEqual(hasParentQuery._type(), 'query');
    test.strictEqual(hasParentQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.HasParentQuery('invalid', 'type');
    }, TypeError);
    
    test.throws(function () {
      hasParentQuery.query('invalid');
    }, TypeError);
    
    test.done();
  },
  HasChildQuery: function (test) {
    test.expect(20);

    var termQuery = ejs.TermQuery('t1', 'v1'),
      termQuery2 = ejs.TermQuery('t2', 'v2'),
      hasChildQuery = ejs.HasChildQuery(termQuery, 't1'),
      expected,
      doTest = function () {
        test.deepEqual(hasChildQuery._self(), expected);
      };

    expected = {
      has_child: {
        query: termQuery._self(),
        type: 't1'
      }
    };

    test.ok(hasChildQuery, 'HasChildQuery exists');
    test.ok(hasChildQuery._self(), '_self() works');
    doTest();
    
    hasChildQuery.query(termQuery2);
    expected.has_child.query = termQuery2._self();
    doTest();
    
    hasChildQuery.type('t2');
    expected.has_child.type = 't2';
    doTest();
    
    hasChildQuery.scoreType('none');
    expected.has_child.score_type = 'none';
    doTest();
    
    hasChildQuery.scoreType('INVALID');
    doTest();
    
    hasChildQuery.scoreType('MAX');
    expected.has_child.score_type = 'max';
    doTest();
    
    hasChildQuery.scoreType('Avg');
    expected.has_child.score_type = 'avg';
    doTest();
    
    hasChildQuery.scoreType('sum');
    expected.has_child.score_type = 'sum';
    doTest();
    
    hasChildQuery.scoreMode('none');
    expected.has_child.score_mode = 'none';
    doTest();
    
    hasChildQuery.scoreMode('INVALID');
    doTest();
    
    hasChildQuery.scoreMode('MAX');
    expected.has_child.score_mode = 'max';
    doTest();
    
    hasChildQuery.scoreMode('Avg');
    expected.has_child.score_mode = 'avg';
    doTest();
    
    hasChildQuery.scoreMode('sum');
    expected.has_child.score_mode = 'sum';
    doTest();
    
    hasChildQuery.boost(1.2);
    expected.has_child.boost = 1.2;
    doTest();
    
    test.strictEqual(hasChildQuery._type(), 'query');
    test.strictEqual(hasChildQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.HasChildQuery('invalid', 'type');
    }, TypeError);
    
    test.throws(function () {
      hasChildQuery.query('invalid');
    }, TypeError);
    
    test.done();
  },
  FuzzyQuery: function (test) {
    test.expect(19);

    var fuzzyQuery = ejs.FuzzyQuery('f1', 'fuzz'),
      expected,
      doTest = function () {
        test.deepEqual(fuzzyQuery._self(), expected);
      };

    expected = {
      fuzzy: {
        f1: {
          value: 'fuzz'
        }
      }
    };

    test.ok(fuzzyQuery, 'FuzzyQuery exists');
    test.ok(fuzzyQuery._self(), '_self() works');
    doTest();
    
    fuzzyQuery.value('fuzz2');
    expected.fuzzy.f1.value = 'fuzz2';
    doTest();
    
    fuzzyQuery.field('f2');
    expected = {
      fuzzy: {
        f2: {
          value: 'fuzz2'
        }
      }
    };
    doTest();
    
    fuzzyQuery.transpositions(false);
    expected.fuzzy.f2.transpositions = false;
    doTest();
    
    fuzzyQuery.maxExpansions(10);
    expected.fuzzy.f2.max_expansions = 10;
    doTest();
    
    fuzzyQuery.minSimilarity(0.6);
    expected.fuzzy.f2.min_similarity = 0.6;
    doTest();
    
    fuzzyQuery.prefixLength(4);
    expected.fuzzy.f2.prefix_length = 4;
    doTest();
    
    fuzzyQuery.rewrite('constant_score_auto');
    expected.fuzzy.f2.rewrite = 'constant_score_auto';
    doTest();
    
    fuzzyQuery.rewrite('invalid');
    doTest();
    
    fuzzyQuery.rewrite('scoring_boolean');
    expected.fuzzy.f2.rewrite = 'scoring_boolean';
    doTest();
    
    fuzzyQuery.rewrite('constant_score_boolean');
    expected.fuzzy.f2.rewrite = 'constant_score_boolean';
    doTest();
    
    fuzzyQuery.rewrite('constant_score_filter');
    expected.fuzzy.f2.rewrite = 'constant_score_filter';
    doTest();
    
    fuzzyQuery.rewrite('top_terms_boost_5');
    expected.fuzzy.f2.rewrite = 'top_terms_boost_5';
    doTest();
    
    fuzzyQuery.rewrite('top_terms_9');
    expected.fuzzy.f2.rewrite = 'top_terms_9';
    doTest();
    
    fuzzyQuery.boost(1.2);
    expected.fuzzy.f2.boost = 1.2;
    doTest();
    
    test.strictEqual(fuzzyQuery._type(), 'query');
    test.strictEqual(fuzzyQuery.toString(), JSON.stringify(expected));

    test.done();
  },
  FuzzyLikeThisFieldQuery: function (test) {
    test.expect(13);

    var fltQuery = ejs.FuzzyLikeThisFieldQuery('f1', 'like text'),
      expected,
      doTest = function () {
        test.deepEqual(fltQuery._self(), expected);
      };

    expected = {
      flt_field: {
        f1: {
          like_text: 'like text'
        }
      }
    };

    test.ok(fltQuery, 'FuzzyLikeThisFieldQuery exists');
    test.ok(fltQuery._self(), '_self() works');
    doTest();
    
    fltQuery.likeText('like text 2');
    expected.flt_field.f1.like_text = 'like text 2';
    doTest();
    
    fltQuery.field('f2');
    expected = {
      flt_field: {
        f2: {
          like_text: 'like text 2'
        }
      }
    };
    doTest();
    
    fltQuery.ignoreTf(false);
    expected.flt_field.f2.ignore_tf = false;
    doTest();
    
    fltQuery.maxQueryTerms(10);
    expected.flt_field.f2.max_query_terms = 10;
    doTest();
    
    fltQuery.minSimilarity(0.6);
    expected.flt_field.f2.min_similarity = 0.6;
    doTest();
    
    fltQuery.prefixLength(4);
    expected.flt_field.f2.prefix_length = 4;
    doTest();
    
    fltQuery.analyzer('some analyzer');
    expected.flt_field.f2.analyzer = 'some analyzer';
    doTest();
    
    fltQuery.boost(1.2);
    expected.flt_field.f2.boost = 1.2;
    doTest();
    
    test.strictEqual(fltQuery._type(), 'query');
    test.strictEqual(fltQuery.toString(), JSON.stringify(expected));

    test.done();
  },
  FuzzyLikeThisQuery: function (test) {
    test.expect(16);

    var fltQuery = ejs.FuzzyLikeThisQuery('like text'),
      expected,
      doTest = function () {
        test.deepEqual(fltQuery._self(), expected);
      };

    expected = {
      flt: {
        like_text: 'like text'
      }
    };

    test.ok(fltQuery, 'FuzzyLikeThisQuery exists');
    test.ok(fltQuery._self(), '_self() works');
    doTest();
    
    fltQuery.fields('f1');
    expected.flt.fields = ['f1'];
    doTest();
    
    fltQuery.fields('f2');
    expected.flt.fields.push('f2');
    doTest();
    
    fltQuery.fields(['f3', 'f4']);
    expected.flt.fields = ['f3', 'f4'];
    doTest();
    
    fltQuery.likeText('like text 2');
    expected.flt.like_text = 'like text 2';
    doTest();
    
    fltQuery.ignoreTf(false);
    expected.flt.ignore_tf = false;
    doTest();
    
    fltQuery.maxQueryTerms(10);
    expected.flt.max_query_terms = 10;
    doTest();
    
    fltQuery.minSimilarity(0.6);
    expected.flt.min_similarity = 0.6;
    doTest();
    
    fltQuery.prefixLength(4);
    expected.flt.prefix_length = 4;
    doTest();
    
    fltQuery.analyzer('some analyzer');
    expected.flt.analyzer = 'some analyzer';
    doTest();
    
    fltQuery.boost(1.2);
    expected.flt.boost = 1.2;
    doTest();
    
    test.strictEqual(fltQuery._type(), 'query');
    test.strictEqual(fltQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      fltQuery.fields(2);
    }, TypeError);
    
    test.done();
  },
  CustomBoostFactorQuery: function (test) {
    test.expect(10);

    var termQuery = ejs.TermQuery('t1', 'v1'),
      termQuery2 = ejs.TermQuery('t2', 'v2'),
      cbfQuery = ejs.CustomBoostFactorQuery(termQuery),
      expected,
      doTest = function () {
        test.deepEqual(cbfQuery._self(), expected);
      };

    expected = {
      custom_boost_factor: {
        query: termQuery._self()
      }
    };

    test.ok(cbfQuery, 'CustomScoreQuery exists');
    test.ok(cbfQuery._self(), '_self() works');
    doTest();
    
    cbfQuery.query(termQuery2);
    expected.custom_boost_factor.query = termQuery2._self();
    doTest();
    
    cbfQuery.boostFactor(5.1);
    expected.custom_boost_factor.boost_factor = 5.1;
    doTest();
    
    cbfQuery.boost(1.2);
    expected.custom_boost_factor.boost = 1.2;
    doTest();
    
    test.strictEqual(cbfQuery._type(), 'query');
    test.strictEqual(cbfQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.CustomBoostFactorQuery('invalid');
    }, TypeError);
    
    test.throws(function () {
      cbfQuery.query('invalid');
    }, TypeError);
    
    test.done();
  },
  CustomScoreQuery: function (test) {
    test.expect(13);

    var termQuery = ejs.TermQuery('t1', 'v1'),
      termQuery2 = ejs.TermQuery('t2', 'v2'),
      customScoreQuery = ejs.CustomScoreQuery(termQuery, 's1'),
      expected,
      doTest = function () {
        test.deepEqual(customScoreQuery._self(), expected);
      };

    expected = {
      custom_score: {
        query: termQuery._self(),
        script: 's1'
      }
    };

    test.ok(customScoreQuery, 'CustomScoreQuery exists');
    test.ok(customScoreQuery._self(), '_self() works');
    doTest();
    
    customScoreQuery.query(termQuery2);
    expected.custom_score.query = termQuery2._self();
    doTest();
    
    customScoreQuery.script('s2');
    expected.custom_score.script = 's2';
    doTest();
    
    customScoreQuery.lang('native');
    expected.custom_score.lang = 'native';
    doTest();
    
    customScoreQuery.boost(1.2);
    expected.custom_score.boost = 1.2;
    doTest();
    
    customScoreQuery.params({p1: 'v1', p2: 'v2'});
    expected.custom_score.params = {p1: 'v1', p2: 'v2'};
    doTest();
    
    customScoreQuery.params({p3: 'v3'});
    expected.custom_score.params = {p3: 'v3'};
    doTest();
    
    test.strictEqual(customScoreQuery._type(), 'query');
    test.strictEqual(customScoreQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.CustomScoreQuery('invalid', 's');
    }, TypeError);
    
    test.throws(function () {
      customScoreQuery.query('invalid');
    }, TypeError);
    
    test.done();
  },
  IdsQuery: function (test) {
    test.expect(15);

    var idsQuery = ejs.IdsQuery('id1'),
      expected,
      doTest = function () {
        test.deepEqual(idsQuery._self(), expected);
      };

    expected = {
      ids: {
        values: ['id1']
      }
    };

    test.ok(idsQuery, 'IdsQuery exists');
    test.ok(idsQuery._self(), '_self() works');
    doTest();
    
    idsQuery = ejs.IdsQuery(['id2', 'id3']);
    expected.ids.values = ['id2', 'id3'];
    doTest();
    
    idsQuery.values('id4');
    expected.ids.values.push('id4');
    doTest();
    
    idsQuery.values(['id5', 'id6']);
    expected.ids.values = ['id5', 'id6'];
    doTest();
    
    idsQuery.type('type1');
    expected.ids.type = ['type1'];
    doTest();
    
    idsQuery.type('type2');
    expected.ids.type.push('type2');
    doTest();
    
    idsQuery.type(['type3', 'type4']);
    expected.ids.type = ['type3', 'type4'];
    doTest();
    
    idsQuery.boost(0.5);
    expected.ids.boost = 0.5;
    doTest();
    
    test.strictEqual(idsQuery._type(), 'query');
    test.strictEqual(idsQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.IdsQuery(2);
    }, TypeError);
    
    test.throws(function () {
      idsQuery.values(5);
    }, TypeError);
    
    test.throws(function () {
      idsQuery.type(9);
    }, TypeError);
    
    test.done();
  },
  BoostingQuery: function (test) {
    test.expect(13);

    var termQuery1 = ejs.TermQuery('t1', 'v1'),
      termQuery2 = ejs.TermQuery('t2', 'v2'),
      boostingQuery = ejs.BoostingQuery(termQuery1, termQuery2, 0.2),
      expected,
      doTest = function () {
        test.deepEqual(boostingQuery._self(), expected);
      };

    expected = {
      boosting: {
        positive: termQuery1._self(),
        negative: termQuery2._self(),
        negative_boost: 0.2
      }
    };

    test.ok(boostingQuery, 'BoostingQuery exists');
    test.ok(boostingQuery._self(), '_self() works');
    doTest();

    boostingQuery.positive(termQuery2);
    expected.boosting.positive = termQuery2._self();
    doTest();
    
    boostingQuery.negative(termQuery1);
    expected.boosting.negative = termQuery1._self();
    doTest();
    
    boostingQuery.negativeBoost(0.6);
    expected.boosting.negative_boost = 0.6;
    doTest();
    
    boostingQuery.boost(3);
    expected.boosting.boost = 3;
    doTest();
    
    test.strictEqual(boostingQuery._type(), 'query');
    test.strictEqual(boostingQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.BoostingQuery('invalid', termQuery1, 0.2);
    }, TypeError);
    
    test.throws(function () {
      ejs.BoostingQuery(termQuery1, 'invalid', 0.2);
    }, TypeError);
    
    test.throws(function () {
      boostingQuery.positive('invalid');
    }, TypeError);
    
    test.throws(function () {
      boostingQuery.negative('invalid');
    }, TypeError);
    
    test.done();
  },
  MatchQuery: function (test) {
    test.expect(40);

    var matchQuery = ejs.MatchQuery('t1', 'v1'),
      expected,
      doTest = function () {
        test.deepEqual(matchQuery._self(), expected);
      };

    expected = {
      match: {
        t1: {
          query: 'v1'
        }
      }
    };

    test.ok(matchQuery, 'MatchQuery exists');
    test.ok(matchQuery._self(), '_self() works');
    doTest();

    matchQuery.boost(1.5);
    expected.match.t1.boost = 1.5;
    doTest();

    matchQuery.query('v2');
    expected.match.t1.query = 'v2';
    doTest();

    matchQuery.type('boolean');
    expected.match.t1.type = 'boolean';
    doTest();

    matchQuery.type('junk');
    doTest();

    matchQuery.type('phrase');
    expected.match.t1.type = 'phrase';
    doTest();

    matchQuery.type('phrase_prefix');
    expected.match.t1.type = 'phrase_prefix';
    doTest();

    matchQuery.cutoffFrequency(0.6);
    expected.match.t1.cutoff_frequency = 0.6;
    doTest();
    
    matchQuery.fuzziness(0.5);
    expected.match.t1.fuzziness = 0.5;
    doTest();

    matchQuery.prefixLength(2);
    expected.match.t1.prefix_length = 2;
    doTest();

    matchQuery.maxExpansions(5);
    expected.match.t1.max_expansions = 5;
    doTest();

    matchQuery.operator('and');
    expected.match.t1.operator = 'and';
    doTest();

    matchQuery.operator('junk');
    doTest();

    matchQuery.operator('or');
    expected.match.t1.operator = 'or';
    doTest();

    matchQuery.slop(15);
    expected.match.t1.slop = 15;
    doTest();

    matchQuery.analyzer('the analyzer');
    expected.match.t1.analyzer = 'the analyzer';
    doTest();

    matchQuery.minimumShouldMatch(10);
    expected.match.t1.minimum_should_match = 10;
    doTest();
    
    matchQuery.fuzzyRewrite('constant_score_auto');
    expected.match.t1.fuzzy_rewrite = 'constant_score_auto';
    doTest();
    
    matchQuery.fuzzyRewrite('invalid');
    doTest();
    
    matchQuery.fuzzyRewrite('scoring_boolean');
    expected.match.t1.fuzzy_rewrite = 'scoring_boolean';
    doTest();
    
    matchQuery.fuzzyRewrite('constant_score_boolean');
    expected.match.t1.fuzzy_rewrite = 'constant_score_boolean';
    doTest();
    
    matchQuery.fuzzyRewrite('constant_score_filter');
    expected.match.t1.fuzzy_rewrite = 'constant_score_filter';
    doTest();
    
    matchQuery.fuzzyRewrite('top_terms_boost_5');
    expected.match.t1.fuzzy_rewrite = 'top_terms_boost_5';
    doTest();
    
    matchQuery.fuzzyRewrite('top_terms_9');
    expected.match.t1.fuzzy_rewrite = 'top_terms_9';
    doTest();
    
    matchQuery.rewrite('constant_score_auto');
    expected.match.t1.rewrite = 'constant_score_auto';
    doTest();
    
    matchQuery.rewrite('invalid');
    doTest();
    
    matchQuery.rewrite('scoring_boolean');
    expected.match.t1.rewrite = 'scoring_boolean';
    doTest();
    
    matchQuery.rewrite('constant_score_boolean');
    expected.match.t1.rewrite = 'constant_score_boolean';
    doTest();
    
    matchQuery.rewrite('constant_score_filter');
    expected.match.t1.rewrite = 'constant_score_filter';
    doTest();
    
    matchQuery.rewrite('top_terms_boost_5');
    expected.match.t1.rewrite = 'top_terms_boost_5';
    doTest();
    
    matchQuery.rewrite('top_terms_9');
    expected.match.t1.rewrite = 'top_terms_9';
    doTest();
    
    matchQuery.fuzzyTranspositions(true);
    expected.match.t1.fuzzy_transpositions = true;
    doTest();
    
    matchQuery.lenient(true);
    expected.match.t1.lenient = true;
    doTest();
    
    matchQuery.zeroTermsQuery('all');
    expected.match.t1.zero_terms_query = 'all';
    doTest();
    
    matchQuery.zeroTermsQuery('invalid');
    doTest();
    
    matchQuery.zeroTermsQuery('NONE');
    expected.match.t1.zero_terms_query = 'none';
    doTest();
    
    test.strictEqual(matchQuery._type(), 'query');
    test.strictEqual(matchQuery.toString(), JSON.stringify(expected));

    test.done();
  },
  MultiMatchQuery: function (test) {
    test.expect(46);

    var mmQuery = ejs.MultiMatchQuery('t', 'v1'),
      expected,
      doTest = function () {
        test.deepEqual(mmQuery._self(), expected);
      };

    expected = {
      multi_match: {
        query: 'v1',
        fields: ['t']
      }
    };

    mmQuery = ejs.MultiMatchQuery(['t1', 't2'], 'v1');
    expected.multi_match.fields = ['t1', 't2'];
    doTest();
    
    test.ok(mmQuery, 'MultiMatchQuery exists');
    test.ok(mmQuery._self(), '_self() works');
    doTest();

    mmQuery.boost(1.5);
    expected.multi_match.boost = 1.5;
    doTest();

    mmQuery.query('v2');
    expected.multi_match.query = 'v2';
    doTest();

    mmQuery.fields(['f3', 'f4']);
    expected.multi_match.fields = ['f3', 'f4'];
    doTest();
    
    mmQuery.fields('f5');
    expected.multi_match.fields.push('f5');
    doTest();
    
    mmQuery.useDisMax(true);
    expected.multi_match.use_dis_max = true;
    doTest();
    
    mmQuery.tieBreaker(0.6);
    expected.multi_match.tie_breaker = 0.6;
    doTest();
    
    mmQuery.type('boolean');
    expected.multi_match.type = 'boolean';
    doTest();

    mmQuery.type('junk');
    doTest();

    mmQuery.type('phrase');
    expected.multi_match.type = 'phrase';
    doTest();

    mmQuery.type('phrase_prefix');
    expected.multi_match.type = 'phrase_prefix';
    doTest();

    mmQuery.cutoffFrequency(0.6);
    expected.multi_match.cutoff_frequency = 0.6;
    doTest();
    
    mmQuery.fuzziness(0.5);
    expected.multi_match.fuzziness = 0.5;
    doTest();

    mmQuery.prefixLength(2);
    expected.multi_match.prefix_length = 2;
    doTest();

    mmQuery.maxExpansions(5);
    expected.multi_match.max_expansions = 5;
    doTest();

    mmQuery.operator('and');
    expected.multi_match.operator = 'and';
    doTest();

    mmQuery.operator('junk');
    doTest();

    mmQuery.operator('or');
    expected.multi_match.operator = 'or';
    doTest();

    mmQuery.slop(15);
    expected.multi_match.slop = 15;
    doTest();

    mmQuery.analyzer('the analyzer');
    expected.multi_match.analyzer = 'the analyzer';
    doTest();

    mmQuery.minimumShouldMatch(10);
    expected.multi_match.minimum_should_match = 10;
    doTest();
    
    mmQuery.fuzzyRewrite('constant_score_auto');
    expected.multi_match.fuzzy_rewrite = 'constant_score_auto';
    doTest();
    
    mmQuery.fuzzyRewrite('invalid');
    doTest();
    
    mmQuery.fuzzyRewrite('scoring_boolean');
    expected.multi_match.fuzzy_rewrite = 'scoring_boolean';
    doTest();
    
    mmQuery.fuzzyRewrite('constant_score_boolean');
    expected.multi_match.fuzzy_rewrite = 'constant_score_boolean';
    doTest();
    
    mmQuery.fuzzyRewrite('constant_score_filter');
    expected.multi_match.fuzzy_rewrite = 'constant_score_filter';
    doTest();
    
    mmQuery.fuzzyRewrite('top_terms_boost_5');
    expected.multi_match.fuzzy_rewrite = 'top_terms_boost_5';
    doTest();
    
    mmQuery.fuzzyRewrite('top_terms_9');
    expected.multi_match.fuzzy_rewrite = 'top_terms_9';
    doTest();
    
    mmQuery.rewrite('constant_score_auto');
    expected.multi_match.rewrite = 'constant_score_auto';
    doTest();
    
    mmQuery.rewrite('invalid');
    doTest();
    
    mmQuery.rewrite('scoring_boolean');
    expected.multi_match.rewrite = 'scoring_boolean';
    doTest();
    
    mmQuery.rewrite('constant_score_boolean');
    expected.multi_match.rewrite = 'constant_score_boolean';
    doTest();
    
    mmQuery.rewrite('constant_score_filter');
    expected.multi_match.rewrite = 'constant_score_filter';
    doTest();
    
    mmQuery.rewrite('top_terms_boost_5');
    expected.multi_match.rewrite = 'top_terms_boost_5';
    doTest();
    
    mmQuery.rewrite('top_terms_9');
    expected.multi_match.rewrite = 'top_terms_9';
    doTest();
    
    mmQuery.lenient(true);
    expected.multi_match.lenient = true;
    doTest();
    
    mmQuery.zeroTermsQuery('all');
    expected.multi_match.zero_terms_query = 'all';
    doTest();
    
    mmQuery.zeroTermsQuery('invalid');
    doTest();
    
    mmQuery.zeroTermsQuery('NONE');
    expected.multi_match.zero_terms_query = 'none';
    doTest();
    
    test.strictEqual(mmQuery._type(), 'query');
    test.strictEqual(mmQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.MultiMatchQuery(3, 'v');
    }, TypeError);
    
    test.throws(function () {
      mmQuery.fields(2);
    }, TypeError);
    
    test.done();
  },
  TermQuery: function (test) {
    test.expect(8);

    var termQuery = ejs.TermQuery('f1', 't1'),
      expected,
      doTest = function () {
        test.deepEqual(termQuery._self(), expected);
      };

    expected = {
      term: {
        f1: {
          term: 't1'
        }
      }
    };

    test.ok(termQuery, 'TermQuery exists');
    test.ok(termQuery._self(), '_self() works');
    doTest();

    termQuery.boost(1.5);
    expected.term.f1.boost = 1.5;
    doTest();

    termQuery.field('f2');
    expected = {
      term: {
        f2: {
          term: 't1',
          boost: 1.5
        }
      }
    };
    doTest();
    
    termQuery.term('t2');
    expected.term.f2.term = 't2';
    doTest();
    
    test.strictEqual(termQuery._type(), 'query');
    test.strictEqual(termQuery.toString(), JSON.stringify(expected));

    test.done();
  },
  BoolQuery: function (test) {
    test.expect(21);

    var termQuery1 = ejs.TermQuery('t1', 'v1'),
      termQuery2 = ejs.TermQuery('t2', 'v2'),
      termQuery3 = ejs.TermQuery('t3', 'v3'),
      termQuery4 = ejs.TermQuery('t4', 'v4'),
      boolQuery = ejs.BoolQuery(),
      expected,
      doTest = function () {
        test.deepEqual(boolQuery._self(), expected);
      };

    expected = {
      bool: {}
    };

    test.ok(boolQuery, 'BoolQuery exists');
    test.ok(boolQuery._self(), '_self() works');
    doTest();

    boolQuery.must(termQuery1);
    expected.bool.must = [termQuery1._self()];
    doTest();

    boolQuery.must([termQuery2, termQuery3]);
    expected.bool.must = [termQuery2._self(), termQuery3._self()];
    doTest();
    
    boolQuery.mustNot(termQuery2);
    expected.bool.must_not = [termQuery2._self()];
    doTest();

    boolQuery.mustNot([termQuery3, termQuery4]);
    expected.bool.must_not = [termQuery3._self(), termQuery4._self()];
    doTest();
    
    boolQuery.should(termQuery3);
    expected.bool.should = [termQuery3._self()];
    doTest();

    boolQuery.should(termQuery4);
    expected.bool.should.push(termQuery4._self());
    doTest();

    boolQuery.should([termQuery1, termQuery3]);
    expected.bool.should = [termQuery1._self(), termQuery3._self()];
    doTest();
    
    boolQuery.boost(1.5);
    expected.bool.boost = 1.5;
    doTest();

    boolQuery.disableCoord(false);
    expected.bool.disable_coord = false;
    doTest();

    boolQuery.minimumNumberShouldMatch(2);
    expected.bool.minimum_number_should_match = 2;
    doTest();

    test.strictEqual(boolQuery._type(), 'query');
    test.strictEqual(boolQuery.toString(), JSON.stringify(expected));
    
    test.throws(function () {
      boolQuery.must('junk');
    }, TypeError);
    
    test.throws(function () {
      boolQuery.must([termQuery1, 'junk']);
    }, TypeError);
    
    test.throws(function () {
      boolQuery.mustNot('junk');
    }, TypeError);
    
    test.throws(function () {
      boolQuery.mustNot([termQuery1, 'junk']);
    }, TypeError);
    
    test.throws(function () {
      boolQuery.should('junk');
    }, TypeError);
    
    test.throws(function () {
      boolQuery.should([termQuery1, 'junk']);
    }, TypeError);
    
    test.done();
  },
  FieldQuery: function (test) {
    test.expect(39);

    var fieldQuery = ejs.FieldQuery('f', 'v1'),
      expected,
      doTest = function () {
        test.deepEqual(fieldQuery._self(), expected);
      };

    expected = {
      field: {
        f: {
          query: 'v1'
        }
      }
    };

    test.ok(fieldQuery, 'FieldQuery exists');
    test.ok(fieldQuery._self(), '_self() works');
    doTest();

    fieldQuery.field('f1');
    expected = {
      field: {
        f1: {
          query: 'v1'
        }
      }
    };
    doTest();
    
    fieldQuery.query('v2');
    expected.field.f1.query = 'v2';
    doTest();
    
    fieldQuery.defaultOperator('and');
    expected.field.f1.default_operator = 'AND';
    doTest();

    fieldQuery.defaultOperator('or');
    expected.field.f1.default_operator = 'OR';
    doTest();

    fieldQuery.defaultOperator('invalid');
    doTest();

    fieldQuery.analyzer('someAnalyzer');
    expected.field.f1.analyzer = 'someAnalyzer';
    doTest();

    fieldQuery.quoteAnalyzer('qAnalyzer');
    expected.field.f1.quote_analyzer = 'qAnalyzer';
    doTest();
    
    fieldQuery.autoGeneratePhraseQueries(false);
    expected.field.f1.auto_generate_phrase_queries = false;
    doTest();

    fieldQuery.allowLeadingWildcard(true);
    expected.field.f1.allow_leading_wildcard = true;
    doTest();

    fieldQuery.lowercaseExpandedTerms(false);
    expected.field.f1.lowercase_expanded_terms = false;
    doTest();

    fieldQuery.enablePositionIncrements(true);
    expected.field.f1.enable_position_increments = true;
    doTest();

    fieldQuery.fuzzyMinSim(0.2);
    expected.field.f1.fuzzy_min_sim = 0.2;
    doTest();

    fieldQuery.boost(1.5);
    expected.field.f1.boost = 1.5;
    doTest();

    fieldQuery.fuzzyPrefixLength(4);
    expected.field.f1.fuzzy_prefix_length = 4;
    doTest();

    fieldQuery.fuzzyMaxExpansions(6);
    expected.field.f1.fuzzy_max_expansions = 6;
    doTest();
    
    fieldQuery.fuzzyRewrite('constant_score_auto');
    expected.field.f1.fuzzy_rewrite = 'constant_score_auto';
    doTest();
    
    fieldQuery.fuzzyRewrite('invalid');
    doTest();
    
    fieldQuery.fuzzyRewrite('scoring_boolean');
    expected.field.f1.fuzzy_rewrite = 'scoring_boolean';
    doTest();
    
    fieldQuery.fuzzyRewrite('constant_score_boolean');
    expected.field.f1.fuzzy_rewrite = 'constant_score_boolean';
    doTest();
    
    fieldQuery.fuzzyRewrite('constant_score_filter');
    expected.field.f1.fuzzy_rewrite = 'constant_score_filter';
    doTest();
    
    fieldQuery.fuzzyRewrite('top_terms_boost_5');
    expected.field.f1.fuzzy_rewrite = 'top_terms_boost_5';
    doTest();
    
    fieldQuery.fuzzyRewrite('top_terms_9');
    expected.field.f1.fuzzy_rewrite = 'top_terms_9';
    doTest();
    
    fieldQuery.rewrite('constant_score_auto');
    expected.field.f1.rewrite = 'constant_score_auto';
    doTest();
    
    fieldQuery.rewrite('invalid');
    doTest();
    
    fieldQuery.rewrite('scoring_boolean');
    expected.field.f1.rewrite = 'scoring_boolean';
    doTest();
    
    fieldQuery.rewrite('constant_score_boolean');
    expected.field.f1.rewrite = 'constant_score_boolean';
    doTest();
    
    fieldQuery.rewrite('constant_score_filter');
    expected.field.f1.rewrite = 'constant_score_filter';
    doTest();
    
    fieldQuery.rewrite('top_terms_boost_5');
    expected.field.f1.rewrite = 'top_terms_boost_5';
    doTest();
    
    fieldQuery.rewrite('top_terms_9');
    expected.field.f1.rewrite = 'top_terms_9';
    doTest();
    
    fieldQuery.quoteFieldSuffix('s');
    expected.field.f1.quote_field_suffix = 's';
    doTest();
    
    fieldQuery.escape(true);
    expected.field.f1.escape = true;
    doTest();
    
    fieldQuery.phraseSlop(2);
    expected.field.f1.phrase_slop = 2;
    doTest();

    fieldQuery.analyzeWildcard(false);
    expected.field.f1.analyze_wildcard = false;
    doTest();

    fieldQuery.minimumShouldMatch(5);
    expected.field.f1.minimum_should_match = 5;
    doTest();

    test.strictEqual(fieldQuery._type(), 'query');
    test.strictEqual(fieldQuery.toString(), JSON.stringify(expected));

    test.done();
  },
  DisMaxQuery: function (test) {
    test.expect(12);

    var disMaxQuery = ejs.DisMaxQuery(),
      termQuery1 = ejs.TermQuery('t1', 'v1').boost(1.5),
      fieldQuery1 = ejs.FieldQuery('f1', 'v1'),
      boolQuery1 = ejs.BoolQuery().must(termQuery1).boost(2),
      expected,
      doTest = function () {
        test.deepEqual(disMaxQuery._self(), expected);
      };

    expected = {
      dis_max: {}
    };

    test.ok(disMaxQuery, 'DisMaxQuery exists');
    test.ok(disMaxQuery._self(), '_self() works');
    doTest();

    disMaxQuery.queries(fieldQuery1);
    expected.dis_max.queries = [fieldQuery1._self()];
    doTest();

    disMaxQuery.queries(boolQuery1);
    expected.dis_max.queries.push(boolQuery1._self());
    doTest();

    disMaxQuery.queries([termQuery1, boolQuery1]);
    expected.dis_max.queries = [termQuery1._self(), boolQuery1._self()];
    doTest();
    
    disMaxQuery.boost(3);
    expected.dis_max.boost = 3;
    doTest();

    disMaxQuery.tieBreaker(4.4);
    expected.dis_max.tie_breaker = 4.4;
    doTest();

    test.strictEqual(disMaxQuery._type(), 'query');
    test.strictEqual(disMaxQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      disMaxQuery.queries('invalid');
    }, TypeError);
    
    test.throws(function () {
      disMaxQuery.queries([termQuery1, 'invalid']);
    }, TypeError);
    
    test.done();
  },
  QueryStringQuery: function (test) {
    test.expect(45);

    var queryString = ejs.QueryStringQuery('this AND that'),
      expected,
      doTest = function () {
        test.deepEqual(queryString._self(), expected);
      };

    expected = {
      query_string: {
        query: 'this AND that'
      }
    };

    test.ok(queryString, 'QueryString exists');
    test.ok(queryString, '_self() works');
    doTest();

    queryString.query('that OR this');
    expected.query_string.query = 'that OR this';
    doTest();

    queryString.defaultField('somefield');
    expected.query_string.default_field = 'somefield';
    doTest();

    queryString.fields(['field1', 'field2']);
    expected.query_string.fields = ['field1', 'field2'];
    doTest();

    queryString.fields('field3');
    expected.query_string.fields.push('field3');
    doTest();
    
    queryString.useDisMax(true);
    expected.query_string.use_dis_max = true;
    doTest();

    queryString.defaultOperator('and');
    expected.query_string.default_operator = 'AND';
    doTest();

    queryString.defaultOperator('or');
    expected.query_string.default_operator = 'OR';
    doTest();

    queryString.defaultOperator('junkoperator');
    doTest();

    queryString.analyzer('theanalyzer');
    expected.query_string.analyzer = 'theanalyzer';
    doTest();

    queryString.allowLeadingWildcard(false);
    expected.query_string.allow_leading_wildcard = false;
    doTest();

    queryString.lowercaseExpandedTerms(true);
    expected.query_string.lowercase_expanded_terms = true;
    doTest();

    queryString.enablePositionIncrements(false);
    expected.query_string.enable_position_increments = false;
    doTest();

    queryString.fuzzyPrefixLength(2);
    expected.query_string.fuzzy_prefix_length = 2;
    doTest();

    queryString.fuzzyMinSim(0.6);
    expected.query_string.fuzzy_min_sim = 0.6;
    doTest();

    queryString.phraseSlop(6);
    expected.query_string.phrase_slop = 6;
    doTest();

    queryString.boost(2.3);
    expected.query_string.boost = 2.3;
    doTest();

    queryString.analyzeWildcard(true);
    expected.query_string.analyze_wildcard = true;
    doTest();

    queryString.autoGeneratePhraseQueries(false);
    expected.query_string.auto_generate_phrase_queries = false;
    doTest();

    queryString.minimumShouldMatch(1);
    expected.query_string.minimum_should_match = 1;
    doTest();

    queryString.tieBreaker(1.1);
    expected.query_string.tie_breaker = 1.1;
    doTest();

    queryString.fuzzyMaxExpansions(6);
    expected.query_string.fuzzy_max_expansions = 6;
    doTest();
    
    queryString.fuzzyRewrite('constant_score_auto');
    expected.query_string.fuzzy_rewrite = 'constant_score_auto';
    doTest();
    
    queryString.fuzzyRewrite('invalid');
    doTest();
    
    queryString.fuzzyRewrite('scoring_boolean');
    expected.query_string.fuzzy_rewrite = 'scoring_boolean';
    doTest();
    
    queryString.fuzzyRewrite('constant_score_boolean');
    expected.query_string.fuzzy_rewrite = 'constant_score_boolean';
    doTest();
    
    queryString.fuzzyRewrite('constant_score_filter');
    expected.query_string.fuzzy_rewrite = 'constant_score_filter';
    doTest();
    
    queryString.fuzzyRewrite('top_terms_boost_5');
    expected.query_string.fuzzy_rewrite = 'top_terms_boost_5';
    doTest();
    
    queryString.fuzzyRewrite('top_terms_9');
    expected.query_string.fuzzy_rewrite = 'top_terms_9';
    doTest();
    
    queryString.rewrite('constant_score_auto');
    expected.query_string.rewrite = 'constant_score_auto';
    doTest();
    
    queryString.rewrite('invalid');
    doTest();
    
    queryString.rewrite('scoring_boolean');
    expected.query_string.rewrite = 'scoring_boolean';
    doTest();
    
    queryString.rewrite('constant_score_boolean');
    expected.query_string.rewrite = 'constant_score_boolean';
    doTest();
    
    queryString.rewrite('constant_score_filter');
    expected.query_string.rewrite = 'constant_score_filter';
    doTest();
    
    queryString.rewrite('top_terms_boost_5');
    expected.query_string.rewrite = 'top_terms_boost_5';
    doTest();
    
    queryString.rewrite('top_terms_9');
    expected.query_string.rewrite = 'top_terms_9';
    doTest();
    
    queryString.quoteFieldSuffix('s');
    expected.query_string.quote_field_suffix = 's';
    doTest();
    
    queryString.escape(true);
    expected.query_string.escape = true;
    doTest();
    
    queryString.quoteAnalyzer('qAnalyzer');
    expected.query_string.quote_analyzer = 'qAnalyzer';
    doTest();
    
    queryString.lenient(true);
    expected.query_string.lenient = true;
    doTest();
    
    test.strictEqual(queryString._type(), 'query');
    test.strictEqual(queryString.toString(), JSON.stringify(expected));

    test.throws(function () {
      queryString.fields(2);
    }, TypeError);
    
    test.done();
  },
  FilteredQuery: function (test) {
    test.expect(21);

    var termQuery1 = ejs.TermQuery('t1', 'v1'),
      termQuery2 = ejs.TermQuery('t2', 'v2'),
      termQuery3 = ejs.TermQuery('t3', 'v3'),
      termFilter1 = ejs.TermFilter('tf1', 'fv1'),
      termFilter2 = ejs.TermFilter('tf2', 'fv2'),
      filterQuery = ejs.FilteredQuery(termQuery1, termFilter1),
      expected,
      doTest = function () {
        test.deepEqual(filterQuery._self(), expected);
      };

    expected = {
      filtered: {
        query: termQuery1._self(),
        filter: termFilter1._self()
      }
    };

    test.ok(filterQuery, 'FilteredQuery exists');
    test.ok(filterQuery._self(), '_self() works');
    doTest();

    filterQuery = ejs.FilteredQuery(termQuery2);
    expected = {
      filtered: {
        query: termQuery2._self()
      }
    };
    doTest();
    
    filterQuery.filter(termFilter2);
    expected.filtered.filter = termFilter2._self();
    doTest();
    
    filterQuery.query(termQuery3);
    expected.filtered.query = termQuery3._self();
    doTest();
    
    filterQuery.strategy('query_first');
    expected.filtered.strategy = 'query_first';
    doTest();
    
    filterQuery.strategy('INVALID');
    doTest();
    
    filterQuery.strategy('random_access_always');
    expected.filtered.strategy = 'random_access_always';
    doTest();
    
    filterQuery.strategy('LEAP_FROG');
    expected.filtered.strategy = 'leap_frog';
    doTest();
    
    filterQuery.strategy('leap_frog_filter_first');
    expected.filtered.strategy = 'leap_frog_filter_first';
    doTest();
    
    filterQuery.strategy('random_access_5');
    expected.filtered.strategy = 'random_access_5';
    doTest();
    
    filterQuery.cache(true);
    expected.filtered._cache = true;
    doTest();
    
    filterQuery.cacheKey('filter_cache_key');
    expected.filtered._cache_key = 'filter_cache_key';
    doTest();
    
    filterQuery.boost(2.6);
    expected.filtered.boost = 2.6;
    doTest();
    
    test.strictEqual(filterQuery._type(), 'query');
    test.strictEqual(filterQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.FilteredQuery('invalid', termFilter1);
    }, TypeError);
    
    test.throws(function () {
      ejs.FilteredQuery(termQuery1, 'invalid');
    }, TypeError);
    
    test.throws(function () {
      filterQuery.query('invalid');
    }, TypeError);
    
    test.throws(function () {
      filterQuery.filter('invalid');
    }, TypeError);
    
    test.done();
  },
  NestedQuery: function (test) {
    test.expect(19);

    var termQuery1 = ejs.TermQuery('t1', 'v1'),
      termQuery2 = ejs.TermQuery('t2', 'v2'),
      termFilter1 = ejs.TermFilter('tf1', 'v1'),
      termFilter2 = ejs.TermFilter('tf2', 'v2'),
      nestedQuery = ejs.NestedQuery('root'),
      expected,
      doTest = function () {
        test.deepEqual(nestedQuery._self(), expected);
      };

    expected = {
      nested: {
        path: 'root'
      }
    };

    test.ok(nestedQuery, 'NestedQuery exists');
    test.ok(nestedQuery._self(), '_self() works');
    doTest();

    nestedQuery.path('root/path');
    expected.nested.path = 'root/path';
    doTest();

    nestedQuery.query(termQuery1);
    expected.nested.query = termQuery1._self();
    doTest();
    
    nestedQuery.filter(termFilter1);
    expected.nested.filter = termFilter1._self();
    doTest();
    
    nestedQuery.query(termQuery2);
    expected.nested.query = termQuery2._self();
    doTest();
    
    nestedQuery.filter(termFilter2);
    expected.nested.filter = termFilter2._self();
    doTest();
    
    nestedQuery.scoreMode('avg');
    expected.nested.score_mode = 'avg';
    doTest();

    nestedQuery.scoreMode('INVALID');
    doTest();
    
    nestedQuery.scoreMode('TOTAL');
    expected.nested.score_mode = 'total';
    doTest();
    
    nestedQuery.scoreMode('Max');
    expected.nested.score_mode = 'max';
    doTest();
    
    nestedQuery.scoreMode('none');
    expected.nested.score_mode = 'none';
    doTest();
    
    nestedQuery.scoreMode('sum');
    expected.nested.score_mode = 'sum';
    doTest();
    
    nestedQuery.boost(3.2);
    expected.nested.boost = 3.2;
    doTest();

    test.strictEqual(nestedQuery._type(), 'query');
    test.strictEqual(nestedQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      nestedQuery.query('invalid');
    }, TypeError);
    
    test.throws(function () {
      nestedQuery.filter('invalid');
    }, TypeError);
    
    test.done();
  },
  ConstantScoreQuery: function (test) {
    test.expect(12);

    var termQuery1 = ejs.TermQuery('t1', 'v1'),
      termFilter1 = ejs.TermFilter('tf1', 'fv1'),
      constantScoreQuery = ejs.ConstantScoreQuery(),
      expected,
      doTest = function () {
        test.deepEqual(constantScoreQuery._self(), expected);
      };

    expected = {
      constant_score: {}
    };

    test.ok(constantScoreQuery, 'ConstantScoreQuery exists');
    test.ok(constantScoreQuery._self(), '_self() works');
    doTest();

    constantScoreQuery.query(termQuery1);
    expected.constant_score.query = termQuery1._self();
    doTest();

    test.strictEqual(constantScoreQuery._type(), 'query');
    test.strictEqual(constantScoreQuery.toString(), JSON.stringify(expected));

    constantScoreQuery = ejs.ConstantScoreQuery();
    constantScoreQuery.filter(termFilter1);
    expected = {
      constant_score: {
        filter: termFilter1._self()
      }
    };
    doTest();

    constantScoreQuery.cache(true);
    expected.constant_score._cache = true;
    doTest();
    
    constantScoreQuery.cacheKey('key');
    expected.constant_score._cache_key = 'key';
    doTest();
    
    test.strictEqual(constantScoreQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      constantScoreQuery.query('invalid');
    }, TypeError);
    
    test.throws(function () {
      constantScoreQuery.filter('invalid');
    }, TypeError);
    
    test.done();
  },
  MatchAllQuery: function (test) {
    test.expect(6);

    var matchAllQuery = ejs.MatchAllQuery(),
      expected,
      doTest = function () {
        test.deepEqual(matchAllQuery._self(), expected);
      };

    expected = {
      match_all: {}
    };

    test.ok(matchAllQuery, 'MatchAllQuery exists');
    test.ok(matchAllQuery._self(), '_self() works');
    doTest();

    matchAllQuery.boost(2.2);
    expected.match_all.boost = 2.2;
    doTest();
    
    test.strictEqual(matchAllQuery._type(), 'query');
    test.strictEqual(matchAllQuery.toString(), JSON.stringify(expected));

    test.done();
  },
  SpanTermQuery: function (test) {
    test.expect(8);

    var spanTermQuery = ejs.SpanTermQuery('t1', 'v1'),
      expected,
      doTest = function () {
        test.deepEqual(spanTermQuery._self(), expected);
      };

    expected = {
      span_term: {
        t1: {
          term: 'v1'
        }
      }
    };

    test.ok(spanTermQuery, 'SpanTermQuery exists');
    test.ok(spanTermQuery._self(), '_self() works');
    doTest();

    spanTermQuery.field('t2');
    expected = {
      span_term: {
        t2: {
          term: 'v1'
        }
      }
    };
    doTest();
    
    spanTermQuery.term('v2');
    expected.span_term.t2.term = 'v2';
    doTest();
    
    spanTermQuery.boost(1.5);
    expected.span_term.t2.boost = 1.5;
    doTest();

    test.strictEqual(spanTermQuery._type(), 'query');
    test.strictEqual(spanTermQuery.toString(), JSON.stringify(expected));

    test.done();
  },
  SpanNearQuery: function (test) {
    test.expect(16);

    var spanTermQuery1 = ejs.SpanTermQuery('t1', 'v1'),
      spanTermQuery2 = ejs.SpanTermQuery('t2', 'v2'),
      spanTermQuery3 = ejs.SpanTermQuery('t3', 'v3'),
      spanTermQuery4 = ejs.SpanTermQuery('t4', 'v4'),
      spanNearQuery = ejs.SpanNearQuery(spanTermQuery1, 4),
      expected,
      doTest = function () {
        test.deepEqual(spanNearQuery._self(), expected);
      };

    expected = {
      span_near: {
        clauses: [spanTermQuery1._self()],
        slop: 4
      }
    };

    test.ok(spanNearQuery, 'SpanNearQuery exists');
    test.ok(spanNearQuery._self(), '_self() works');
    doTest();

    spanNearQuery.clauses(spanTermQuery2);
    expected.span_near.clauses.push(spanTermQuery2._self());
    doTest();

    spanNearQuery.clauses([spanTermQuery1, spanTermQuery3]);
    expected.span_near.clauses = [spanTermQuery1._self(), spanTermQuery3._self()];
    doTest();

    spanNearQuery = ejs.SpanNearQuery([spanTermQuery4, spanTermQuery2], 10);
    expected = {
      span_near: {
        clauses: [spanTermQuery4._self(), spanTermQuery2._self()],
        slop: 10
      }
    };
    doTest();
    
    spanNearQuery.slop(3);
    expected.span_near.slop = 3;
    doTest();

    spanNearQuery.inOrder(true);
    expected.span_near.in_order = true;
    doTest();

    spanNearQuery.collectPayloads(false);
    expected.span_near.collect_payloads = false;
    doTest();

    spanNearQuery.boost(4.1);
    expected.span_near.boost = 4.1;
    doTest();

    test.strictEqual(spanNearQuery._type(), 'query');
    test.strictEqual(spanNearQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.SpanNearQuery('invalid', 2);
    }, TypeError);
    
    test.throws(function () {
      ejs.SpanNearQuery([spanTermQuery1, 'invalid'], 4);
    }, TypeError);
    
    test.throws(function () {
      spanNearQuery.clauses('invalid');
    }, TypeError);
    
    test.throws(function () {
      spanNearQuery.clauses([spanTermQuery2, 'invalid']);
    }, TypeError);
    
    test.done();
  },
  SpanNotQuery: function (test) {
    test.expect(12);

    var spanTermQuery1 = ejs.SpanTermQuery('t1', 'v1'),
      spanTermQuery2 = ejs.SpanTermQuery('t2', 'v2'),
      spanTermQuery3 = ejs.SpanTermQuery('t3', 'v3'),
      spanTermQuery4 = ejs.SpanTermQuery('t4', 'v4'),
      spanNotQuery = ejs.SpanNotQuery(spanTermQuery1, spanTermQuery2),
      expected,
      doTest = function () {
        test.deepEqual(spanNotQuery._self(), expected);
      };

    expected = {
      span_not: {
        include: spanTermQuery1._self(),
        exclude: spanTermQuery2._self()
      }
    };

    test.ok(spanNotQuery, 'SpanNotQuery exists');
    test.ok(spanNotQuery._self(), '_self() works');
    doTest();

    spanNotQuery.include(spanTermQuery3);
    expected.span_not.include = spanTermQuery3._self();
    doTest();

    spanNotQuery.exclude(spanTermQuery4);
    expected.span_not.exclude = spanTermQuery4._self();
    doTest();

    spanNotQuery.boost(4.1);
    expected.span_not.boost = 4.1;
    doTest();
    
    test.strictEqual(spanNotQuery._type(), 'query');
    test.strictEqual(spanNotQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.SpanNotQuery('invalid', spanTermQuery1);
    }, TypeError);
    
    test.throws(function () {
      ejs.SpanNotQuery(spanTermQuery1, 'invalid');
    }, TypeError);
    
    test.throws(function () {
      spanNotQuery.include('invalid');
    }, TypeError);
    
    test.throws(function () {
      spanNotQuery.exclude('invalid');
    }, TypeError);
    
    test.done();
  },
  SpanOrQuery: function (test) {
    test.expect(13);

    var spanTermQuery1 = ejs.SpanTermQuery('t1', 'v1'),
      spanTermQuery2 = ejs.SpanTermQuery('t2', 'v2'),
      spanTermQuery3 = ejs.SpanTermQuery('t3', 'v3'),
      spanTermQuery4 = ejs.SpanTermQuery('t4', 'v4'),
      spanTermQuery5 = ejs.SpanTermQuery('t5', 'v5'),
      spanOrQuery = ejs.SpanOrQuery(spanTermQuery1),
      expected,
      doTest = function () {
        test.deepEqual(spanOrQuery._self(), expected);
      };

    expected = {
      span_or: {
        clauses: [spanTermQuery1._self()]
      }
    };

    test.ok(spanOrQuery, 'SpanOrQuery exists');
    test.ok(spanOrQuery._self(), '_self() works');
    doTest();
    
    spanOrQuery = ejs.SpanOrQuery([spanTermQuery2, spanTermQuery3]);
    expected.span_or.clauses = [spanTermQuery2._self(), spanTermQuery3._self()];
    doTest();

    spanOrQuery.clauses(spanTermQuery4);
    expected.span_or.clauses.push(spanTermQuery4._self());
    doTest();

    spanOrQuery.clauses([spanTermQuery1, spanTermQuery5]);
    expected.span_or.clauses = [spanTermQuery1._self(), spanTermQuery5._self()];
    doTest();

    spanOrQuery.boost(1.1);
    expected.span_or.boost = 1.1;
    doTest();
    
    test.strictEqual(spanOrQuery._type(), 'query');
    test.strictEqual(spanOrQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.SpanOrQuery('invalid');
    }, TypeError);
    
    test.throws(function () {
      ejs.SpanOrQuery([spanTermQuery1, 'invalid']);
    }, TypeError);
    
    test.throws(function () {
      spanOrQuery.clauses('invalid');
    }, TypeError);
    
    test.throws(function () {
      spanOrQuery.clauses([spanTermQuery1, 'invalid']);
    }, TypeError);
    
    test.done();
  },
  SpanFirstQuery: function (test) {
    test.expect(10);

    var spanTermQuery1 = ejs.SpanTermQuery('t1', 'v1'),
      spanTermQuery2 = ejs.SpanTermQuery('t2', 'v2'),
      spanFirstQuery = ejs.SpanFirstQuery(spanTermQuery1, 10),
      expected,
      doTest = function () {
        test.deepEqual(spanFirstQuery._self(), expected);
      };

    expected = {
      span_first: {
        match: spanTermQuery1._self(),
        end: 10
      }
    };

    test.ok(spanFirstQuery, 'SpanFirstQuery exists');
    test.ok(spanFirstQuery._self(), '_self() works');
    doTest();

    spanFirstQuery.match(spanTermQuery2);
    expected.span_first.match = spanTermQuery2._self();
    doTest();

    spanFirstQuery.end(5);
    expected.span_first.end = 5;
    doTest();

    spanFirstQuery.boost(3.1);
    expected.span_first.boost = 3.1;
    doTest();
    
    test.strictEqual(spanFirstQuery._type(), 'query');
    test.strictEqual(spanFirstQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.SpanFirstQuery('invalid', 3);
    }, TypeError);
    
    test.throws(function () {
      spanFirstQuery.match('invalid');
    }, TypeError);
    
    test.done();
  },
  SpanMultiTermQuery: function (test) {
    test.expect(9);

    var mtQuery1 = ejs.FuzzyQuery('t1', 'v1'),
      mtQuery2 = ejs.WildcardQuery('t2', 'v2*'),
      spanMultiTermQuery = ejs.SpanMultiTermQuery(),
      expected,
      doTest = function () {
        test.deepEqual(spanMultiTermQuery._self(), expected);
      };

    expected = {
      span_multi: {
        match: {}
      }
    };

    test.ok(spanMultiTermQuery, 'SpanMultiTermQuery exists');
    test.ok(spanMultiTermQuery._self(), '_self() works');
    doTest();

    spanMultiTermQuery = ejs.SpanMultiTermQuery(mtQuery1);
    expected.span_multi.match = mtQuery1._self();
    doTest();
    
    spanMultiTermQuery.match(mtQuery2);
    expected.span_multi.match = mtQuery2._self();
    doTest();
    
    test.strictEqual(spanMultiTermQuery._type(), 'query');
    test.strictEqual(spanMultiTermQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.SpanMultiTermQuery('invalid');
    }, TypeError);
    
    test.throws(function () {
      spanMultiTermQuery.match('invalid');
    }, TypeError);
    
    test.done();
  },
  FieldMaskingSpanQuery: function (test) {
    test.expect(10);

    var spanTermQuery1 = ejs.SpanTermQuery('t1', 'v1'),
      spanTermQuery2 = ejs.SpanTermQuery('t2', 'v2'),
      fieldMaskingSpanQuery = ejs.FieldMaskingSpanQuery(spanTermQuery1, 'mf1'),
      expected,
      doTest = function () {
        test.deepEqual(fieldMaskingSpanQuery._self(), expected);
      };

    expected = {
      field_masking_span: {
        query: spanTermQuery1._self(),
        field: 'mf1'
      }
    };

    test.ok(fieldMaskingSpanQuery, 'FieldMaskingSpanQuery exists');
    test.ok(fieldMaskingSpanQuery._self(), '_self() works');
    doTest();

    fieldMaskingSpanQuery.query(spanTermQuery2);
    expected.field_masking_span.query = spanTermQuery2._self();
    doTest();

    fieldMaskingSpanQuery.field('mf2');
    expected.field_masking_span.field = 'mf2';
    doTest();

    fieldMaskingSpanQuery.boost(5.1);
    expected.field_masking_span.boost = 5.1;
    doTest();
    
    test.strictEqual(fieldMaskingSpanQuery._type(), 'query');
    test.strictEqual(fieldMaskingSpanQuery.toString(), JSON.stringify(expected));

    test.throws(function () {
      ejs.FieldMaskingSpanQuery('invalid', 'mf');
    }, TypeError);
    
    test.throws(function () {
      fieldMaskingSpanQuery.query('invalid');
    }, TypeError);
    
    test.done();
  }
};
