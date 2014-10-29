/*jshint globalstrict:true */
/*global angular:true */
'use strict';

angular.module('featured.controllers', [])
    .controller('SearchCtrl', function($scope, $location, ejsResource) {
        
        // point to your ElasticSearch server
        var ejs = ejsResource('http://localhost:9200');
        var index = 'twitter';
        var fIndex = 'featured';
        var type = 'tweet';
        var fType = 'doc';
        
        // setup the indices and types to search across
        var request = ejs.Request()
            .indices([index, fIndex]);
        
        // define our search function that will be called when a user
        // submits a search
        $scope.search = function() {
            $scope.results = request
                .query(ejs.IndicesQuery(
                  ejs.ConstantScoreQuery()
                    .query(ejs.MatchQuery('keywords', $scope.queryTerm || '*'))
                    .boost(1000000),
                  fIndex)
                    .noMatchQuery(
                      ejs.QueryStringQuery($scope.queryTerm || '*')))
                .doSearch();
                
            $location.path("/results");
            $scope.queryTerm = "";
        };
        
        // if this is a featured result or not
        $scope.isFeatured = function (doc) {
          return doc._index === fIndex;
        };
        
        // index the sample documents
        $scope.indexSampleDocs = function () {

          // our example documents
          var docs = [
            ejs.Document(index, type, '1').source({
              user: 'mrweber', 
              message: 'Elastic.js - a Javascript implementation of the ElasticSearch Query DSL and Core API'}), 
        	  ejs.Document(index, type, '2').source({
        	    user: 'egaumer',
        	    message: 'FullScale Labs just released Elastic.js go check it out!'
        	  }),
            ejs.Document(index, type, '3').source({
              user: 'dataintensive',
              message: 'We are pleased to announce Elastic.js an implementation of the #elasticsearch query dsl'
            }),
            ejs.Document(index, type, '4').source({
              user: 'kimchy',
              message: 'The FullScale Labs team are awesome!  Go check out Elastic.js'
            }),
            ejs.Document(index, type, '5').source({
              user: 'egaumer',
              message: 'Use elastic.js to write a complex query and translate it to json with our query translator'
            }),
            ejs.Document(fIndex, fType, '1').source({
              title: 'ElasticSearch',
              description: 'An Open Source, Distributed, RESTful, Search Engine built on top of Apache Lucene.',
              url: 'http://www.elasticsearch.org/',
              keywords: ['elasticsearch', 'elastic search', 'es']
            }),
            ejs.Document(fIndex, fType, '2').source({
              title: 'Elastic.js',
              description: 'A JavaScript implementation of the ElasticSearch Query DSL and Core API.',
              url: 'https://github.com/fullscale/elastic.js',
              keywords: ['elasticjs', 'elastic.js', 'ejs']
            })
          ];

          // so search is only executed after all documents have been indexed
          var doSearch = _.after(docs.length, $scope.search);
          _.each(docs, function (doc) {
            doc.refresh(true).doIndex(doSearch);
          });
        };
        
    });