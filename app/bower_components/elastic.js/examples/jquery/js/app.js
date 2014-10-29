/*jshint jquery:true */

(function () {
  'use strict';

  // setup elastic.js client for jQuery
  ejs.client = ejs.jQueryClient('http://localhost:9200');
  
  $(function () {
    
    // grab the templates and compile them only once
    var searchTmpl = _.template($('#searchTmpl').html()),
      resultsTmpl = _.template($('#resultsTmpl').html()),
      viewport = $('#viewport'),
      
      // setup the indices and types to search across
      index = 'twitter',
      type = 'tweet',
      request = ejs.Request({indices: index, types: type}),
      
      // generates the elastic.js query and executes the search
      executeSearch = function (qstr) {
        request.query(ejs.QueryStringQuery(qstr || '*'))
          .doSearch(gotoResults);
      },
      
      // renders the main search page
      gotoSearch = function () {
        viewport.empty().append(searchTmpl({}))
          .find('#formSearch')
          .submit(function (e) {
            var txtSearch = $('#txtSearch');
            executeSearch(txtSearch.val());
            txtSearch.val('');
            return false; // prevent form submission
          });
      },
      
      // renders the results page
      gotoResults = function (results) {
        viewport.empty().append(resultsTmpl({results: results}))
          .find('#goBack')
          .click(function () {
            gotoSearch();
          });
      },
      
      // index sample documents
      indexSampleDocs = function () {

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
          })
        ];

        // so search is only executed after all documents have been indexed
        var doSearch = _.after(docs.length, function () {
          executeSearch('');
        });
        
        _.each(docs, function (doc) {
          doc.refresh(true).doIndex(doSearch);
        });
      };
      
      // link our index docs button
      $('#btnIndexDocs').click(indexSampleDocs);
       
      // load the search page as the landing page
      gotoSearch();
  });
}).call(this);