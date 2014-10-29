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

exports.search = {
  setUp: function (done) {
    done();
  },
  exists: function (test) {
    test.expect(13);

    test.ok(ejs.Request, 'Request');
    test.ok(ejs.ScriptField, 'ScriptField');
    test.ok(ejs.GeoPoint, 'GeoPoint');
    test.ok(ejs.IndexedShape, 'IndexedShape');
    test.ok(ejs.Shape, 'Shape');
    test.ok(ejs.Sort, 'Sort');
    test.ok(ejs.Highlight, 'Highlight');
    test.ok(ejs.TermSuggester, 'TermSuggester');
    test.ok(ejs.PhraseSuggester, 'PhraseSuggester');
    test.ok(ejs.DirectSettingsMixin, 'DirectSettingsMixin');
    test.ok(ejs.DirectGenerator, 'DirectGenerator');
    test.ok(ejs.MultiSearchRequest, 'MultiSearchRequest');
    test.ok(ejs.Rescore, 'Rescore');
    
    test.done();
  },
  Rescore: function (test) {
    test.expect(17);
    
    var rescore = ejs.Rescore(),
      termQuery1 = ejs.TermQuery('f1', 't1'),
      termQuery2 = ejs.TermQuery('f2', 't2'),
      expected,
      doTest = function () {
        test.deepEqual(rescore._self(), expected);
      };
    
    expected = {
      query: {}
    };
    
    test.ok(rescore, 'Rescore exists');
    test.ok(rescore._self(), '_self() works');
    doTest();
    
    rescore = ejs.Rescore(100);
    expected.window_size = 100;
    doTest();
    
    rescore = ejs.Rescore(1000, termQuery1);
    expected.window_size = 1000;
    expected.query.rescore_query = termQuery1._self();
    doTest();
    
    rescore.windowSize(100);
    expected.window_size = 100;
    doTest();
    
    rescore.rescoreQuery(termQuery2);
    expected.query.rescore_query = termQuery2._self();
    doTest();
    
    rescore.queryWeight(2);
    expected.query.query_weight = 2;
    doTest();
    
    rescore.rescoreQueryWeight(3);
    expected.query.rescore_query_weight = 3;
    doTest();
    
    test.strictEqual(rescore._type(), 'rescore');
    test.strictEqual(rescore.toString(), JSON.stringify(expected));
    
    test.throws(function () {
      ejs.Rescore('invalid');
    }, TypeError);
    
    test.throws(function () {
      ejs.Rescore(2, 'invalid');
    }, TypeError);
    
    test.throws(function () {
      rescore.rescoreQuery('invalid');
    }, TypeError);
    
    test.throws(function () {
      rescore.rescoreQueryWeight('invalid');
    }, TypeError);
    
    test.throws(function () {
      rescore.queryWeight('invalid');
    }, TypeError);
    
    test.throws(function () {
      rescore.windowSize('invalid');
    }, TypeError);
    
    test.done();
  },
  DirectGenerator: function (test) {
    test.expect(29);
    
    var generator = ejs.DirectGenerator(),
      expected,
      doTest = function () {
        test.deepEqual(generator._self(), expected);
      };
    
    expected = {};
    
    test.ok(generator, 'DirectGenerator exists');
    test.ok(generator._self(), '_self() works');
    doTest();
    
    generator.preFilter('pre analyzer');
    expected.pre_filter = 'pre analyzer';
    doTest();
    
    generator.postFilter('post analyzer');
    expected.post_filter = 'post analyzer';
    doTest();
    
    generator.field('f');
    expected.field = 'f';
    doTest();
    
    generator.size(5);
    expected.size = 5;
    doTest();
    
    generator.accuracy(0.6);
    expected.accuracy = 0.6;
    doTest(0.6);
    
    generator.suggestMode('missing');
    expected.suggest_mode = 'missing';
    doTest();
    
    generator.suggestMode('INVALID');
    doTest();
    
    generator.suggestMode('POPULAR');
    expected.suggest_mode = 'popular';
    doTest();
    
    generator.suggestMode('Always');
    expected.suggest_mode = 'always';
    doTest();
    
    generator.sort('score');
    expected.sort = 'score';
    doTest();
    
    generator.sort('INVALID');
    doTest();
    
    generator.sort('FREQUENCY');
    expected.sort = 'frequency';
    doTest();
    
    generator.stringDistance('internal');
    expected.string_distance = 'internal';
    doTest();
    
    generator.stringDistance('INVALID');
    doTest();
    
    generator.stringDistance('DAMERAU_LEVENSHTEIN');
    expected.string_distance = 'damerau_levenshtein';
    doTest();
    
    generator.stringDistance('Levenstein');
    expected.string_distance = 'levenstein';
    doTest();
    
    generator.stringDistance('jarowinkler');
    expected.string_distance = 'jarowinkler';
    doTest();
    
    generator.stringDistance('ngram');
    expected.string_distance = 'ngram';
    doTest();
    
    generator.maxEdits(3);
    expected.max_edits = 3;
    doTest();
    
    generator.maxInspections(10);
    expected.max_inspections = 10;
    doTest();
    
    generator.maxTermFreq(0.7);
    expected.max_term_freq = 0.7;
    doTest();
    
    generator.prefixLen(4);
    expected.prefix_len = 4;
    doTest();
    
    generator.minWordLen(3);
    expected.min_word_len = 3;
    doTest();
    
    generator.minDocFreq(0.1);
    expected.min_doc_freq = 0.1;
    doTest();
    
    test.strictEqual(generator._type(), 'generator');
    test.strictEqual(generator.toString(), JSON.stringify(expected));
    
    test.done();
  },
  TermSuggester: function (test) {
    test.expect(30);
    
    var suggester = ejs.TermSuggester('suggester'),
      expected,
      doTest = function () {
        test.deepEqual(suggester._self(), expected);
      };
    
    expected = {
      suggester: {
        term: {}
      }
    };
    
    test.ok(suggester, 'TermSuggester exists');
    test.ok(suggester._self(), '_self() works');
    doTest();
    
    suggester.text('sugest termz');
    expected.suggester.text = 'sugest termz';
    doTest();
    
    suggester.analyzer('analyzer');
    expected.suggester.term.analyzer = 'analyzer';
    doTest();
    
    suggester.field('f');
    expected.suggester.term.field = 'f';
    doTest();
    
    suggester.size(5);
    expected.suggester.term.size = 5;
    doTest();
    
    suggester.shardSize(100);
    expected.suggester.term.shard_size = 100;
    doTest();
    
    suggester.accuracy(0.6);
    expected.suggester.term.accuracy = 0.6;
    doTest(0.6);
    
    suggester.suggestMode('missing');
    expected.suggester.term.suggest_mode = 'missing';
    doTest();
    
    suggester.suggestMode('INVALID');
    doTest();
    
    suggester.suggestMode('POPULAR');
    expected.suggester.term.suggest_mode = 'popular';
    doTest();
    
    suggester.suggestMode('Always');
    expected.suggester.term.suggest_mode = 'always';
    doTest();
    
    suggester.sort('score');
    expected.suggester.term.sort = 'score';
    doTest();
    
    suggester.sort('INVALID');
    doTest();
    
    suggester.sort('FREQUENCY');
    expected.suggester.term.sort = 'frequency';
    doTest();
    
    suggester.stringDistance('internal');
    expected.suggester.term.string_distance = 'internal';
    doTest();
    
    suggester.stringDistance('INVALID');
    doTest();
    
    suggester.stringDistance('DAMERAU_LEVENSHTEIN');
    expected.suggester.term.string_distance = 'damerau_levenshtein';
    doTest();
    
    suggester.stringDistance('Levenstein');
    expected.suggester.term.string_distance = 'levenstein';
    doTest();
    
    suggester.stringDistance('jarowinkler');
    expected.suggester.term.string_distance = 'jarowinkler';
    doTest();
    
    suggester.stringDistance('ngram');
    expected.suggester.term.string_distance = 'ngram';
    doTest();
    
    suggester.maxEdits(3);
    expected.suggester.term.max_edits = 3;
    doTest();
    
    suggester.maxInspections(10);
    expected.suggester.term.max_inspections = 10;
    doTest();
    
    suggester.maxTermFreq(0.7);
    expected.suggester.term.max_term_freq = 0.7;
    doTest();
    
    suggester.prefixLen(4);
    expected.suggester.term.prefix_len = 4;
    doTest();
    
    suggester.minWordLen(3);
    expected.suggester.term.min_word_len = 3;
    doTest();
    
    suggester.minDocFreq(0.1);
    expected.suggester.term.min_doc_freq = 0.1;
    doTest();
    
    test.strictEqual(suggester._type(), 'suggest');
    test.strictEqual(suggester.toString(), JSON.stringify(expected));
    
    test.done();
  },
  PhraseSuggester: function (test) {
    test.expect(24);
    
    var suggester = ejs.PhraseSuggester('suggester'),
      gen1 = ejs.DirectGenerator().field('body')
        .suggestMode('always')
        .minWordLen(1),
      gen2 = ejs.DirectGenerator().field('reverse')
        .suggestMode('always')
        .minWordLen(1)
        .preFilter('reverse')
        .postFilter('reverse'),
      gen3 = ejs.DirectGenerator().field('body')
        .suggestMode('popular')
        .minWordLen(2)
        .prefixLen(3)
        .size(100),
      expected,
      doTest = function () {
        test.deepEqual(suggester._self(), expected);
      };
    
    expected = {
      suggester: {
        phrase: {}
      }
    };
    
    test.ok(suggester, 'PhraseSuggester exists');
    test.ok(suggester._self(), '_self() works');
    doTest();
    
    suggester.text('sugest termz');
    expected.suggester.text = 'sugest termz';
    doTest();
    
    suggester.analyzer('analyzer');
    expected.suggester.phrase.analyzer = 'analyzer';
    doTest();
    
    suggester.field('f');
    expected.suggester.phrase.field = 'f';
    doTest();
    
    suggester.size(5);
    expected.suggester.phrase.size = 5;
    doTest();
    
    suggester.shardSize(100);
    expected.suggester.phrase.shard_size = 100;
    doTest();
    
    suggester.realWorldErrorLikelihood(0.99);
    expected.suggester.phrase.real_world_error_likelihood = 0.99;
    doTest();
    
    suggester.confidence(0.6);
    expected.suggester.phrase.confidence = 0.6;
    doTest();
    
    suggester.separator('|');
    expected.suggester.phrase.separator = '|';
    doTest();
    
    suggester.maxErrors(0.5);
    expected.suggester.phrase.max_errors = 0.5;
    doTest();
    
    suggester.gramSize(2);
    expected.suggester.phrase.gram_size = 2;
    doTest();
    
    suggester.forceUnigrams(false);
    expected.suggester.phrase.force_unigrams = false;
    doTest();
    
    suggester.linearSmoothing(0.7, 0.2, 0.1);
    expected.suggester.phrase.smoothing = {
      linear: {
        trigram_lambda: 0.7,
        bigram_lambda: 0.2,
        unigram_lambda: 0.1
      }
    };
    doTest();
    
    suggester.laplaceSmoothing(0.7);
    expected.suggester.phrase.smoothing = {
      laplace: {
        alpha: 0.7
      }
    };
    doTest();
    
    suggester.stupidBackoffSmoothing(0.5);
    expected.suggester.phrase.smoothing = {
      stupid_backoff: {
        discount: 0.5
      }
    };
    doTest();
    
    suggester.directGenerator(gen1);
    expected.suggester.phrase.direct_generator = [gen1._self()];
    doTest();
    
    suggester.directGenerator(gen2);
    expected.suggester.phrase.direct_generator.push(gen2._self());
    doTest();
    
    suggester.directGenerator([gen3, gen1]);
    expected.suggester.phrase.direct_generator = [gen3._self(), gen1._self()];
    doTest();
    
    test.strictEqual(suggester._type(), 'suggest');
    test.strictEqual(suggester.toString(), JSON.stringify(expected));
    
    test.throws(function () {
      suggester.directGenerator('invalid');
    }, TypeError);
    
    test.throws(function () {
      suggester.directGenerator([gen1, gen2, 'invalid']);
    }, TypeError);
    
    test.done();
  },
  Highlight: function (test) {
    test.expect(47);
    
    var highlight = ejs.Highlight(['title', 'content']),
      expected,
      doTest = function () {
        test.deepEqual(highlight._self(), expected);
      };
    
    expected = {
      fields: {
        title: {},
        content: {}
      }
    };  
    
    test.ok(highlight, 'Highlight exists');
    test.ok(highlight._self(), '_self() works');
    doTest();
    
    highlight.fields('teaser');
    expected.fields.teaser = {};
    doTest();
    
    highlight.fields(['body', 'summary']);
    expected.fields.body = {};
    expected.fields.summary = {};
    doTest();
    
    highlight.preTags('<em>');
    expected.pre_tags = ['<em>'];
    doTest();
    
    highlight.preTags(['<tag1>', '<tag2>']);
    expected.pre_tags = ['<tag1>', '<tag2>'];
    doTest();
    
    highlight.preTags('<em>', 'content');
    expected.fields.content.pre_tags = ['<em>'];
    doTest();
    
    // test adding tags to field that does not exist
    // it should be added
    highlight.preTags(['<tag1>', '<tag2>'], 'my_field');
    expected.fields.my_field = {pre_tags: ['<tag1>', '<tag2>']};
    doTest();
    
    highlight.postTags('<em>');
    expected.post_tags = ['<em>'];
    doTest();
    
    highlight.postTags(['<tag1>', '<tag2>']);
    expected.post_tags = ['<tag1>', '<tag2>'];
    doTest();
    
    highlight.postTags('<em>', 'content');
    expected.fields.content.post_tags = ['<em>'];
    doTest();
    
    highlight.postTags(['<tag1>', '<tag2>'], 'my_field');
    expected.fields.my_field.post_tags = ['<tag1>', '<tag2>'];
    doTest();
    
    highlight.order('score');
    expected.order = 'score';
    doTest();
    
    highlight.order('INVALID');
    doTest();
    
    highlight.order('score', 'title');
    expected.fields.title.order = 'score';
    doTest();
    
    highlight.tagsSchema('styled');
    expected.tags_schema = 'styled';
    doTest();
    
    highlight.tagsSchema('INVALID');
    doTest();
    
    highlight.highlightFilter(true);
    expected.highlight_filter = true;
    doTest();
    
    highlight.highlightFilter(false, 'body');
    expected.fields.body.highlight_filter = false;
    doTest();
    
    // addings a field that already exists with options
    // should not change anything
    highlight.fields('body');
    doTest();
    
    highlight.fragmentSize(500);
    expected.fragment_size = 500;
    doTest();
    
    highlight.fragmentSize(300, 'title');
    expected.fields.title.fragment_size = 300;
    doTest();
    
    highlight.numberOfFragments(10);
    expected.number_of_fragments = 10;
    doTest();
    
    highlight.numberOfFragments(2, 'content');
    expected.fields.content.number_of_fragments = 2;
    doTest();
    
    highlight.encoder('default');
    expected.encoder = 'default';
    doTest();
    
    highlight.encoder('INVALID');
    doTest();
    
    highlight.encoder('HTML');
    expected.encoder = 'html';
    doTest();
    
    highlight.requireFieldMatch(true);
    expected.require_field_match = true;
    doTest();
    
    highlight.requireFieldMatch(true, 'title');
    expected.fields.title.require_field_match = true;
    doTest();
    
    highlight.boundaryMaxScan(30);
    expected.boundary_max_scan = 30;
    doTest();
    
    highlight.boundaryMaxScan(10, 'title');
    expected.fields.title.boundary_max_scan = 10;
    doTest();
    
    highlight.boundaryChars('$#{}');
    expected.boundary_chars = '$#{}';
    doTest();
    
    highlight.boundaryChars('#', 'content');
    expected.fields.content.boundary_chars = '#';
    doTest();
    
    highlight.type('highlighter');
    expected.type = 'highlighter';
    doTest();
    
    highlight.type('INVALID');
    doTest();
    
    highlight.type('FAST-VECTOR-HIGHLIGHTER', 'body');
    expected.fields.body.type = 'fast-vector-highlighter';
    doTest();
    
    highlight.fragmenter('simple');
    expected.fragmenter = 'simple';
    doTest();
    
    highlight.fragmenter('INVALID');
    doTest();
    
    highlight.fragmenter('SPAN', 'title');
    expected.fields.title.fragmenter = 'span';
    doTest();
    
    highlight.options({a: 1, b: 2});
    expected.options = {a: 1, b: 2};
    doTest();
    
    highlight.options({c: 3}, 'body');
    expected.fields.body.options = {c: 3};
    doTest();
    
    test.strictEqual(highlight._type(), 'highlight');
    test.strictEqual(highlight.toString(), JSON.stringify(expected));
    
    test.throws(function () {
      highlight.options('invalid');
    }, TypeError);
    
    test.throws(function () {
      highlight.options(['invalid']);
    }, TypeError);
    
    test.throws(function () {
      highlight.options(ejs.GeoPoint());
    }, TypeError);
    
    test.done();
  },
  Sort: function (test) {
    test.expect(37);
    
    var sort = ejs.Sort(),
      termFilter = ejs.TermFilter('tf1', 'tv1'),
      geoPoint = ejs.GeoPoint([37.7819288, -122.396480]),
      expected,
      doTest = function () {
        test.deepEqual(sort._self(), expected);
      };
    
    expected = {
      _score: {}
    };  
    
    test.ok(sort, 'Sort exists');
    test.ok(sort._self(), '_self() works');
    doTest();
    
    sort.field('title');
    expected = {
      title: {}
    };
    doTest();
    
    sort.order('asc');
    expected.title.order = 'asc';
    doTest();
    
    sort.order('INVALID');
    doTest();
    
    sort.order('DESC');
    expected.title.order = 'desc';
    doTest();
    
    sort.asc();
    expected.title.order = 'asc';
    doTest();
    
    sort.desc();
    expected.title.order = 'desc';
    doTest();
    
    sort.reverse(true);
    expected.title.reverse = true;
    doTest();
    
    sort.missing('_last');
    expected.title.missing = '_last';
    doTest();
    
    sort.ignoreUnmapped(true);
    expected.title.ignore_unmapped = true;
    doTest();
    
    sort.mode('min');
    expected.title.mode = 'min';
    doTest();
    
    sort.mode('INVALID');
    doTest();
    
    sort.mode('MAX');
    expected.title.mode = 'max';
    doTest();
    
    sort.mode('Avg');
    expected.title.mode = 'avg';
    doTest();
    
    sort.mode('sum');
    expected.title.mode = 'sum';
    doTest();
    
    sort.nestedPath('nested.path');
    expected.title.nested_path = 'nested.path';
    doTest();
    
    sort.nestedFilter(termFilter);
    expected.title.nested_filter = termFilter._self();
    doTest();
    
    // geo distance sorting tests
    sort = ejs.Sort('location').geoDistance(geoPoint);
    expected = {
      _geo_distance: {
        location: geoPoint._self()
      }
    };
    doTest();
    
    sort.unit('mi');
    expected._geo_distance.unit = 'mi';
    doTest();
    
    sort.unit('INVALID');
    doTest();
    
    sort.unit('KM');
    expected._geo_distance.unit = 'km';
    doTest();
    
    sort.normalize(true);
    expected._geo_distance.normalize = true;
    doTest();
    
    sort.distanceType('arc');
    expected._geo_distance.distance_type = 'arc';
    doTest();
    
    sort.distanceType('INVALID');
    doTest();
    
    sort.distanceType('PLANE');
    expected._geo_distance.distance_type = 'plane';
    doTest();
    
    // script sorting tests
    sort = ejs.Sort().script("doc['field_name'].value * factor");
    expected = {
      _script: {
        script: "doc['field_name'].value * factor"
      }
    };
    doTest();
    
    sort.lang('mvel');
    expected._script.lang = 'mvel';
    doTest();
    
    sort.params({p1: true, p2: 'v2'});
    expected._script.params = {p1: true, p2: 'v2'};
    doTest();
    
    sort.type('string');
    expected._script.type = 'string';
    doTest();
    
    sort.type('INVALID');
    doTest();
    
    sort.type('NUMBER');
    expected._script.type = 'number';
    doTest();
    
    test.strictEqual(sort._type(), 'sort');
    test.strictEqual(sort.toString(), JSON.stringify(expected));
    
    test.throws(function () {
      sort.geoDistance('invalid');
    }, TypeError);
    
    test.throws(function () {
      sort.nestedFilter('invalid');
    }, TypeError);
    
    test.done();
  },
  Shape: function (test) {
    test.expect(13);
    
    var shape = ejs.Shape('envelope', [[-45.0, 45.0], [45.0, -45.0]]),
      expected,
      doTest = function () {
        test.deepEqual(shape._self(), expected);
      };
    
    expected = {
      type: 'envelope',
      coordinates: [[-45.0, 45.0], [45.0, -45.0]]
    };  
    
    test.ok(shape, 'Shape exists');
    test.ok(shape._self(), '_self() works');
    doTest();
    
    shape.type('point');
    expected.type = 'point';
    doTest();
    
    shape.type('INVALID');
    doTest();
    
    shape.type('LINESTRING');
    expected.type = 'linestring';
    doTest();
    
    shape.type('multipoint');
    expected.type = 'multipoint';
    doTest();
    
    shape.type('envelope');
    expected.type = 'envelope';
    doTest();
    
    shape.type('multiPolygon');
    expected.type = 'multipolygon';
    doTest();
    
    shape.type('polygon');
    expected.type = 'polygon';
    doTest();
    
    shape.coordinates([[-180.0, 10.0], [20.0, 90.0], [180.0, -5.0], 
      [-30.0, -90.0]]);
    expected.coordinates = [[-180.0, 10.0], [20.0, 90.0], [180.0, -5.0], 
      [-30.0, -90.0]];
    doTest();
    
    test.strictEqual(shape._type(), 'shape');
    test.strictEqual(shape.toString(), JSON.stringify(expected));
    
    test.done();
  },
  IndexedShape: function (test) {
    test.expect(9);
    
    var indexedShape = ejs.IndexedShape('countries', 'New Zealand'),
      expected,
      doTest = function () {
        test.deepEqual(indexedShape._self(), expected);
      };
    
    expected = {
      type: 'countries',
      id: 'New Zealand'
    };  
    
    test.ok(indexedShape, 'IndexedShape exists');
    test.ok(indexedShape._self(), '_self() works');
    doTest();
    
    indexedShape.type('state');
    expected.type = 'state';
    doTest();
    
    indexedShape.id('CA');
    expected.id = 'CA';
    doTest();
    
    indexedShape.index('states');
    expected.index = 'states';
    doTest();
    
    indexedShape.shapeFieldName('stateshape');
    expected.shape_field_name = 'stateshape';
    doTest();
    
    test.strictEqual(indexedShape._type(), 'indexed shape');
    test.strictEqual(indexedShape.toString(), JSON.stringify(expected));
    
    test.done();
  },
  GeoPoint: function (test) {
    test.expect(10);
    
    var geoPoint = ejs.GeoPoint(),
      expected,
      doTest = function () {
        test.deepEqual(geoPoint._self(), expected);
      };
    
    expected = [0, 0];
    
    test.ok(geoPoint, 'GeoPoint exists');
    test.ok(geoPoint._self(), '_self() works');
    doTest();
    
    // [lat, lon] constructor converted to GeoJSON [lon, lat]
    geoPoint = ejs.GeoPoint([37.7819288, -122.396480]);
    expected = [-122.396480, 37.7819288];
    doTest();
    
    geoPoint.properties({lat: 37.7817289, lon: -122.396181});
    expected = {lat: 37.7817289, lon: -122.396181};
    doTest();
    
    geoPoint.string("37.7819288,-122.396480");
    expected = "37.7819288,-122.396480";
    doTest();
    
    geoPoint.geohash('drn5x1g8cu2y');
    expected = 'drn5x1g8cu2y';
    doTest();
    
    // [lat, lon] array converted to GeoJSON [lon, lat]
    geoPoint.array([37.7817289, -122.396181]);
    expected = [-122.396181, 37.7817289];
    doTest();
    
    test.strictEqual(geoPoint._type(), 'geo point');
    test.strictEqual(geoPoint.toString(), JSON.stringify(expected));
    
    test.done();
  },
  ScriptField: function (test) {
    test.expect(9);
    
    var cp = ejs.ScriptField('f'),
      expected,
      doTest = function () {
        test.deepEqual(cp._self(), expected);
      };
    
    expected = {
      f: {}
    };  
    
    test.ok(cp, 'ScriptField exists');
    test.ok(cp._self(), '_self() works');
    doTest();
    
    cp.lang('mvel');
    expected.f.lang = 'mvel';
    doTest();
    
    cp.script('script src');
    expected.f.script = 'script src';
    doTest();
    
    cp.params({param1: 'p1', param2: 2});
    expected.f.params = {param1: 'p1', param2: 2};
    doTest();
    
    cp.ignoreFailure(true);
    expected.f.ignore_failure = true;
    doTest();
    
    test.strictEqual(cp._type(), 'script field');
    test.strictEqual(cp.toString(), JSON.stringify(expected));
    
    test.done();
  },
  Request: function (test) {
    test.expect(165);

    var req = ejs.Request({indices: ['index1'], types: ['type1']}),
      matchAll = ejs.MatchAllQuery(),
      termQuery = ejs.TermQuery('t', 'v'),
      termFilter = ejs.TermFilter('tf', 'vf'),
      filterFacet = ejs.FilterFacet('my_filter_facet').filter(termFilter),
      termsFacet = ejs.TermsFacet('my_terms_facet').field('author'),
      scriptField = ejs.ScriptField('my_script_field')
        .script('doc["my_field_name"].value * 2'),
      scriptField2 = ejs.ScriptField('my_script_field2')
        .script("doc['my_field_name'].value * factor")
        .params({'factor': 2.0}),
      termSuggest = ejs.TermSuggester('my_term_suggester')
        .text('sugest termsz'),
      phraseSuggest = ejs.PhraseSuggester('my_phrase_suggester'),
      rescore = ejs.Rescore(1000, termQuery).queryWeight(3),
      expected,
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
        
        test.deepEqual(req._self(), expected);
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

    test.deepEqual(req.indices(), ['index1']);
    test.deepEqual(req.types(), ['type1']);
    expectedMethod = 'post';
    expectedPath = '/index1/type1/_search';
    expectedData = JSON.stringify(expected);
    req.doSearch();

    req.indices([]);
    test.deepEqual(req.indices(), ['_all']);
    expectedPath = '/_all/type1/_search';
    req.doSearch();

    req.types([]);
    test.deepEqual(req.types(), []);
    expectedPath = '/_all/_search';
    req.doSearch();

    req.indices([]);
    test.deepEqual(req.indices(), []);
    expectedPath = '/_search';
    req.doSearch();

    req.indices(['index1', 'index2']);
    test.deepEqual(req.indices(), ['index1', 'index2']);
    expectedPath = '/index1,index2/_search';
    req.doSearch();

    req.types(['type1', 'type2']);
    test.deepEqual(req.types(), ['type1', 'type2']);
    expectedPath = '/index1,index2/type1,type2/_search';
    req.doSearch();

    req = ejs.Request({});
    test.deepEqual(req.indices(), []);
    test.deepEqual(req.types(), []);
    expectedPath = '/_search';
    req.doSearch();
    
    req = ejs.Request({
      indices: 'index1',
      types: 'type1'
    });
    test.deepEqual(req.indices(), ['index1']);
    test.deepEqual(req.types(), ['type1']);
    expectedPath = '/index1/type1/_search';
    req.doSearch();

    req = ejs.Request({
      types: 'type1'
    });
    test.deepEqual(req.indices(), ['_all']);
    test.deepEqual(req.types(), ['type1']);
    expectedPath = '/_all/type1/_search';
    req.doSearch();

    req = ejs.Request({routing: 'route1'});
    test.deepEqual(req.routing(), 'route1');
    expectedPath = '/_search?routing=route1';
    req.doSearch();
    
    req.routing('');
    test.deepEqual(req.routing(), '');
    expectedPath = '/_search';
    req.doSearch();
    
    req.routing('route2,route3');
    test.deepEqual(req.routing(), 'route2,route3');
    expectedPath = '/_search?routing=route2%2Croute3';
    req.doSearch();
    
    req.timeout(5000);
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000';
    req.doSearch();
    
    req.replication('async');
    test.strictEqual(req.replication(), 'async');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=async';
    req.doSearch();
    
    req.replication('invalid');
    test.strictEqual(req.replication(), 'async');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=async';
    req.doSearch();
    
    req.replication('SYNC');
    test.strictEqual(req.replication(), 'sync');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=sync';
    req.doSearch();
    
    req.replication('default');
    test.strictEqual(req.replication(), 'default');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=default';
    req.doSearch();
    
    req.consistency('default');
    test.strictEqual(req.consistency(), 'default');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=default&consistency=default';
    req.doSearch();
    
    req.consistency('invalid');
    test.strictEqual(req.consistency(), 'default');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=default&consistency=default';
    req.doSearch();
    
    req.consistency('ONE');
    test.strictEqual(req.consistency(), 'one');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=default&consistency=one';
    req.doSearch();
    
    req.consistency('quorum');
    test.strictEqual(req.consistency(), 'quorum');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=default&consistency=quorum';
    req.doSearch();
    
    req.consistency('ALL');
    test.strictEqual(req.consistency(), 'all');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=default&consistency=all';
    req.doSearch();
    
    req.preference('_primary');
    test.strictEqual(req.preference(), '_primary');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=default&consistency=all&preference=_primary';
    req.doSearch();
    
    req.ignoreIndices('none');
    test.strictEqual(req.ignoreIndices(), 'none');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=default&consistency=all&preference=_primary&ignore_indices=none';
    req.doSearch();
    
    req.ignoreIndices('INVALID');
    test.strictEqual(req.ignoreIndices(), 'none');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=default&consistency=all&preference=_primary&ignore_indices=none';
    req.doSearch();
    
    req.ignoreIndices('MISSING');
    test.strictEqual(req.ignoreIndices(), 'missing');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=default&consistency=all&preference=_primary&ignore_indices=missing';
    req.doSearch();
    
    req.searchType('dfs_query_then_fetch');
    test.strictEqual(req.searchType(), 'dfs_query_then_fetch');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=default&consistency=all&preference=_primary&ignore_indices=missing&search_type=dfs_query_then_fetch';
    req.doSearch();
    
    req.searchType('INVALID');
    test.strictEqual(req.searchType(), 'dfs_query_then_fetch');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=default&consistency=all&preference=_primary&ignore_indices=missing&search_type=dfs_query_then_fetch';
    req.doSearch();
    
    req.searchType('DFS_QUERY_AND_FETCH');
    test.strictEqual(req.searchType(), 'dfs_query_and_fetch');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=default&consistency=all&preference=_primary&ignore_indices=missing&search_type=dfs_query_and_fetch';
    req.doSearch();
    
    req.searchType('Query_then_Fetch');
    test.strictEqual(req.searchType(), 'query_then_fetch');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=default&consistency=all&preference=_primary&ignore_indices=missing&search_type=query_then_fetch';
    req.doSearch();
    
    req.searchType('query_and_fetch');
    test.strictEqual(req.searchType(), 'query_and_fetch');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=default&consistency=all&preference=_primary&ignore_indices=missing&search_type=query_and_fetch';
    req.doSearch();
    
    req.searchType('scan');
    test.strictEqual(req.searchType(), 'scan');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=default&consistency=all&preference=_primary&ignore_indices=missing&search_type=scan';
    req.doSearch();
    
    req.searchType('count');
    test.strictEqual(req.searchType(), 'count');
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=default&consistency=all&preference=_primary&ignore_indices=missing&search_type=count';
    req.doSearch();
    
    req.local(true);
    test.strictEqual(req.local(), true);
    expectedPath = '/_search?routing=route2%2Croute3&timeout=5000&replication=default&consistency=all&preference=_primary&ignore_indices=missing&search_type=count&local=true';
    req.doSearch();
    
    req = ejs.Request({indices: 'index', types: 'type'}).query(matchAll);  
    expected = {
      query: matchAll._self()
    };
    expectedPath = '/index/type/_search';
    expectedData = JSON.stringify(expected);
    req.doSearch();
    
    // test count request
    expectedPath = '/index/type/_count';
    expectedMethod = 'post';
    expectedData = JSON.stringify(matchAll._self());
    req.doCount();
    
    // test delete by query request
    expectedPath = '/index/type/_query';
    expectedMethod = 'delete';
    expectedData = JSON.stringify(matchAll._self());
    req.doDeleteByQuery();
    
    // test search shards
    expectedPath = '/index/type/_search_shards';
    expectedMethod = 'post';
    expectedData = '';
    req.doSearchShards();
    
    req.sort('field1');
    expected.sort = ['field1'];
    req.doSearch();
    
    req.sort('field2', 'asc');
    expected.sort.push({field2: {order: 'asc'}});
    req.doSearch();
    
    req.sort('field3', 'invalid');
    req.doSearch();
    
    req.sort('field3', 'DESC');
    expected.sort.push({field3: {order: 'desc'}});
    req.doSearch();
    
    req.sort(ejs.Sort('field4').asc());
    expected.sort.push({field4: {order: 'asc'}});
    req.doSearch();
    
    var geoSort = ejs.Sort('location')
      .geoDistance(ejs.GeoPoint([37.7819288, -122.396480]))
      .unit('mi').normalize(true);
    req.sort(geoSort);
    expected.sort.push(geoSort._self());
    req.doSearch();
    
    req.sort(['field5', geoSort]);
    expected.sort = ['field5', geoSort._self()];
    req.doSearch();
    
    test.deepEqual(req.sort(), expected.sort);
    
    req.trackScores(true);
    expected.track_scores = true;
    req.doSearch();
    
    req.fields('field1');
    expected.fields = ['field1'];
    req.doSearch();
    
    req.fields('field2');
    expected.fields.push('field2');
    req.doSearch();
    
    req.fields(['field3', 'field4']);
    expected.fields = ['field3', 'field4'];
    req.doSearch();
    
    var hlt = ejs.Highlight('body').fragmentSize(500, 'body');
    
    req.highlight(hlt);
    expected.highlight = hlt._self();
    req.doSearch();
    
    req.size(20);
    expected.size = 20;
    doTest();
    
    req.from(10);
    expected.from = 10;
    doTest();
    
    req.query(termQuery);
    expected.query = termQuery._self();
    doTest();
    
    req.facet(filterFacet);
    expected.facets = filterFacet._self();
    doTest();
    
    req.facet(termsFacet);
    // extend is not avaiable in tests so just set place the facet
    // value into the existing facets object
    expected.facets.my_terms_facet = termsFacet._self().my_terms_facet;
    doTest();
    
    req.filter(termFilter);
    expected.filter = termFilter._self();
    doTest();
    
    req.suggest("global suggest text");
    expected.suggest = {text: 'global suggest text'};
    doTest();
    
    req.suggest(termSuggest);
    expected.suggest.my_term_suggester = termSuggest._self().my_term_suggester;
    doTest();
    
    req.suggest(phraseSuggest);
    expected.suggest.my_phrase_suggester = phraseSuggest._self().my_phrase_suggester;
    doTest();
    
    req.rescore(rescore);
    expected.rescore = rescore._self();
    doTest();
    
    req.scriptField(scriptField);
    expected.script_fields = scriptField._self();
    doTest();
    
    req.scriptField(scriptField2);
    expected.script_fields.my_script_field2 = scriptField2._self().my_script_field2;
    doTest();
    
    req.indexBoost('index', 5.0);
    expected.indices_boost = {index: 5.0};
    doTest();
    
    req.indexBoost('index2', 3.2);
    expected.indices_boost.index2 = 3.2;
    doTest();
    
    req.explain(true);
    expected.explain = true;
    doTest();
    
    req.version(false);
    expected.version = false;
    doTest();
    
    req.minScore(0.5);
    expected.min_score = 0.5;
    doTest();
    
    test.strictEqual(req._type(), 'request');
    test.strictEqual(req.toString(), JSON.stringify(expected));

    test.throws(function () {
      req.query('invalid');
    }, TypeError);
    
    test.throws(function () {
      req.facet('invalid');
    }, TypeError);
    
    test.throws(function () {
      req.filter('invalid');
    }, TypeError);
    
    test.throws(function () {
      req.indices(2);
    }, TypeError);
    
    test.throws(function () {
      req.types(3);
    }, TypeError);
    
    test.throws(function () {
      req.scriptField('invalid');
    }, TypeError);
    
    test.throws(function () {
      req.sort(2);
    }, TypeError);
    
    test.throws(function () {
      req.sort(['valid', 3]);
    }, TypeError);
    
    test.throws(function () {
      req.fields(3);
    }, TypeError);
    
    test.throws(function () {
      req.highlight('invalid');
    }, TypeError);
    
    test.throws(function () {
      req.suggest(3);
    }, TypeError);
    
    test.throws(function () {
      req.rescore('invalid');
    }, TypeError);
    
    test.done();
  },
  MultiSearchRequest: function (test) {
    test.expect(77);

    var mreq = ejs.MultiSearchRequest({indices: ['index1'], types: ['type1']}), 
      req = ejs.Request({indices: ['index1'], types: ['type1']})
        .query(ejs.MatchAllQuery()),
      req2 = ejs.Request().preference('_local').timeout(300)
        .query(ejs.TermQuery('t', 'v'))
        .filter(ejs.TermFilter('tf', 'vf')),
      req3 = ejs.Request({types: 'type2'}).routing('abc')
        .ignoreIndices('ignored')
        .query(ejs.MatchAllQuery())
        .facet(ejs.TermsFacet('my_terms_facet').field('author')),
      req4 = ejs.Request().searchType('dfs_query_and_fetch')
        .query(ejs.MatchAllQuery()),
      rawReq,
      expected,
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
        
        test.deepEqual(mreq._self(), expected);
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
    
    expected = [];

    test.deepEqual(mreq.indices(), ['index1']);
    test.deepEqual(mreq.types(), ['type1']);
    expectedMethod = 'post';
    expectedPath = '/index1/type1/_msearch';
    mreq.doSearch();


    mreq.indices([]);
    test.deepEqual(mreq.indices(), ['_all']);
    expectedPath = '/_all/type1/_msearch';
    mreq.doSearch();

    mreq.types([]);
    test.deepEqual(mreq.types(), []);
    expectedPath = '/_all/_msearch';
    mreq.doSearch();

    mreq.indices([]);
    test.deepEqual(mreq.indices(), []);
    expectedPath = '/_msearch';
    mreq.doSearch();

    mreq.indices(['index1', 'index2']);
    test.deepEqual(mreq.indices(), ['index1', 'index2']);
    expectedPath = '/index1,index2/_msearch';
    mreq.doSearch();

    mreq.types(['type1', 'type2']);
    test.deepEqual(mreq.types(), ['type1', 'type2']);
    expectedPath = '/index1,index2/type1,type2/_msearch';
    mreq.doSearch();

    mreq = ejs.MultiSearchRequest({});
    test.deepEqual(mreq.indices(), []);
    test.deepEqual(mreq.types(), []);
    expectedPath = '/_msearch';
    mreq.doSearch();
    
    mreq = ejs.MultiSearchRequest({
      indices: 'index1',
      types: 'type1'
    });
    test.deepEqual(mreq.indices(), ['index1']);
    test.deepEqual(mreq.types(), ['type1']);
    expectedPath = '/index1/type1/_msearch';
    mreq.doSearch();

    mreq = ejs.MultiSearchRequest({
      types: 'type1'
    });
    test.deepEqual(mreq.indices(), ['_all']);
    test.deepEqual(mreq.types(), ['type1']);
    expectedPath = '/_all/type1/_msearch';
    mreq.doSearch();
    
    mreq = ejs.MultiSearchRequest().requests(req);
    expected = [req._self()];
    expectedData = 
      JSON.stringify({indices: req.indices(), types: req.types()}) +
      '\n' + req.toString() + '\n';
    test.deepEqual(mreq.requests(), [req]);
    mreq.doSearch();
    
    mreq.requests(req2);
    expected.push(req2._self());
    rawReq = req2._self();
    rawReq.timeout = 300;
    expectedData = 
      JSON.stringify({indices: req.indices(), types: req.types()}) +
      '\n' + req.toString() + '\n' +
      JSON.stringify({preference: req2.preference()}) +
      '\n' + JSON.stringify(rawReq) + '\n';
    test.deepEqual(mreq.requests(), [req, req2]);
    mreq.doSearch();
    
    mreq.requests([req3, req4]);
    expected = [req3._self(), req4._self()];
    expectedData = 
      JSON.stringify({indices: req3.indices(), types: req3.types(),
        routing: req3.routing(), ignore_indices: req3.ignoreIndices()}) +
      '\n' + req3.toString() + '\n' +
      JSON.stringify({search_type: req4.searchType()}) +
      '\n' + req4.toString() + '\n';
    test.deepEqual(mreq.requests(), [req3, req4]);
    mreq.doSearch();
    
    mreq.requests(req2);
    expected.push(req2._self());
    expectedData = 
      JSON.stringify({indices: req3.indices(), types: req3.types(),
        routing: req3.routing(), ignore_indices: req3.ignoreIndices()}) +
      '\n' + req3.toString() + '\n' +
      JSON.stringify({search_type: req4.searchType()}) +
      '\n' + req4.toString() + '\n' + 
      JSON.stringify({preference: req2.preference()}) +
      '\n' + JSON.stringify(rawReq) + '\n';
    test.deepEqual(mreq.requests(), [req3, req4, req2]);
    mreq.doSearch();
    
    mreq = ejs.MultiSearchRequest().ignoreIndices('none');
    test.strictEqual(mreq.ignoreIndices(), 'none');
    expected = [];
    expectedPath = '/_msearch?ignore_indices=none';
    mreq.doSearch();
    
    mreq.ignoreIndices('INVALID');
    test.strictEqual(mreq.ignoreIndices(), 'none');
    expectedPath = '/_msearch?ignore_indices=none';
    mreq.doSearch();
    
    mreq.ignoreIndices('MISSING');
    test.strictEqual(mreq.ignoreIndices(), 'missing');
    expectedPath = '/_msearch?ignore_indices=missing';
    mreq.doSearch();
    
    mreq.searchType('dfs_query_then_fetch');
    test.strictEqual(mreq.searchType(), 'dfs_query_then_fetch');
    expectedPath = '/_msearch?ignore_indices=missing&search_type=dfs_query_then_fetch';
    mreq.doSearch();
    
    mreq.searchType('INVALID');
    test.strictEqual(mreq.searchType(), 'dfs_query_then_fetch');
    expectedPath = '/_msearch?ignore_indices=missing&search_type=dfs_query_then_fetch';
    mreq.doSearch();
    
    mreq.searchType('DFS_QUERY_AND_FETCH');
    test.strictEqual(mreq.searchType(), 'dfs_query_and_fetch');
    expectedPath = '/_msearch?ignore_indices=missing&search_type=dfs_query_and_fetch';
    mreq.doSearch();
    
    mreq.searchType('Query_then_Fetch');
    test.strictEqual(mreq.searchType(), 'query_then_fetch');
    expectedPath = '/_msearch?ignore_indices=missing&search_type=query_then_fetch';
    mreq.doSearch();
    
    mreq.searchType('query_and_fetch');
    test.strictEqual(mreq.searchType(), 'query_and_fetch');
    expectedPath = '/_msearch?ignore_indices=missing&search_type=query_and_fetch';
    mreq.doSearch();
    
    mreq.searchType('scan');
    test.strictEqual(mreq.searchType(), 'scan');
    expectedPath = '/_msearch?ignore_indices=missing&search_type=scan';
    mreq.doSearch();
    
    mreq.searchType('count');
    test.strictEqual(mreq.searchType(), 'count');
    expectedPath = '/_msearch?ignore_indices=missing&search_type=count';
    mreq.doSearch();
    
    test.strictEqual(mreq._type(), 'multi search request');
    test.strictEqual(mreq.toString(), JSON.stringify(expected));

    test.throws(function () {
      mreq.requests('invalid');
    }, TypeError);
    
    test.done();
  }
};
