  /**
    @class
    <p>More like this query find documents that are “like” provided text by 
    running it against one or more fields.</p>

    @name ejs.MoreLikeThisQuery

    @desc
    <p>Constructs a query where each documents returned are “like” provided text</p>

    @param {String || Array} fields A single field or array of fields to run against.
    @param {String} likeText The text to find documents like it.
  
     */
  ejs.MoreLikeThisQuery = function (fields, likeText) {

    /**
         The internal Query object. Use <code>get()</code>.
         @member ejs.MoreLikeThisQuery
         @property {Object} query
         */
    var query = {
      mlt: {
        like_text: likeText,
        fields: []
      }
    };

    if (isString(fields)) {
      query.mlt.fields.push(fields);
    } else if (isArray(fields)) {
      query.mlt.fields = fields;
    } else {
      throw new TypeError('Argument must be string or array');
    }
    
    return {
  
      /**
             The fields to run the query against.  If you call with a single field,
             it is added to the existing list of fields.  If called with an array
             of field names, it replaces any existing values with the new array.

             @member ejs.MoreLikeThisQuery
             @param {String || Array} f A single field name or a list of field names.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      fields: function (f) {
        if (f == null) {
          return query.mlt.fields;
        }
    
        if (isString(f)) {
          query.mlt.fields.push(f);
        } else if (isArray(f)) {
          query.mlt.fields = f;
        } else {
          throw new TypeError('Argument must be a string or array');
        }
    
        return this;
      },
  
      /**
            The text to find documents like

            @member ejs.MoreLikeThisQuery
            @param {String} s A text string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      likeText: function (txt) {
        if (txt == null) {
          return query.mlt.like_text;
        }
  
        query.mlt.like_text = txt;
        return this;
      },

      /**
            The percentage of terms to match on (float value). 
            Defaults to 0.3 (30 percent).

            @member ejs.MoreLikeThisQuery
            @param {Double} percent A double value between 0 and 1.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      percentTermsToMatch: function (percent) {
        if (percent == null) {
          return query.mlt.percent_terms_to_match;
        }
  
        query.mlt.percent_terms_to_match = percent;
        return this;
      },

      /**
            The frequency below which terms will be ignored in the source doc. 
            The default frequency is 2.

            @member ejs.MoreLikeThisQuery
            @param {Integer} freq A positive integer value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      minTermFreq: function (freq) {
        if (freq == null) {
          return query.mlt.min_term_freq;
        }
  
        query.mlt.min_term_freq = freq;
        return this;
      },
        
      /**
            The maximum number of query terms that will be included in any 
            generated query. Defaults to 25.

            @member ejs.MoreLikeThisQuery
            @param {Integer} max A positive integer value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      maxQueryTerms: function (max) {
        if (max == null) {
          return query.mlt.max_query_terms;
        }
  
        query.mlt.max_query_terms = max;
        return this;
      },

      /**
            An array of stop words. Any word in this set is considered 
            “uninteresting” and ignored. Even if your Analyzer allows stopwords, 
            you might want to tell the MoreLikeThis code to ignore them, as for 
            the purposes of document similarity it seems reasonable to assume 
            that “a stop word is never interesting”.
          
            @member ejs.MoreLikeThisQuery
            @param {Array} stopWords An array of string stopwords
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      stopWords: function (stopWords) {
        if (stopWords == null) {
          return query.mlt.stop_words;
        }
  
        query.mlt.stop_words = stopWords;
        return this;
      },

      /**
            The frequency at which words will be ignored which do not occur in 
            at least this many docs. Defaults to 5.

            @member ejs.MoreLikeThisQuery
            @param {Integer} min A positive integer value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      minDocFreq: function (min) {
        if (min == null) {
          return query.mlt.min_doc_freq;
        }
  
        query.mlt.min_doc_freq = min;
        return this;
      },

      /**
            The maximum frequency in which words may still appear. Words that 
            appear in more than this many docs will be ignored. 
            Defaults to unbounded.

            @member ejs.MoreLikeThisQuery
            @param {Integer} max A positive integer value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      maxDocFreq: function (max) {
        if (max == null) {
          return query.mlt.max_doc_freq;
        }
  
        query.mlt.max_doc_freq = max;
        return this;
      },

      /**
            The minimum word length below which words will be ignored. 
            Defaults to 0.
          
            @member ejs.MoreLikeThisQuery
            @param {Integer} len A positive integer value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      minWordLen: function (len) {
        if (len == null) {
          return query.mlt.min_word_len;
        }
  
        query.mlt.min_word_len = len;
        return this;
      },

      /**
            The maximum word length above which words will be ignored. 
            Defaults to unbounded (0).
          
            @member ejs.MoreLikeThisQuery
            @param {Integer} len A positive integer value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      maxWordLen: function (len) {
        if (len == null) {
          return query.mlt.max_word_len;
        }
  
        query.mlt.max_word_len = len;
        return this;
      },
            
      /**
            The analyzer that will be used to analyze the text. Defaults to the 
            analyzer associated with the field.

            @member ejs.MoreLikeThisQuery
            @param {String} analyzerName The name of the analyzer.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      analyzer: function (analyzerName) {
        if (analyzerName == null) {
          return query.mlt.analyzer;
        }
  
        query.mlt.analyzer = analyzerName;
        return this;
      },
    
      /**
            Sets the boost factor to use when boosting terms. 
            Defaults to 1.

            @member ejs.MoreLikeThisQuery
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boostTerms: function (boost) {
        if (boost == null) {
          return query.mlt.boost_terms;
        }

        query.mlt.boost_terms = boost;
        return this;
      },
                      
      /**
            Sets the boost value of the <code>Query</code>.

            @member ejs.MoreLikeThisQuery
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.mlt.boost;
        }

        query.mlt.boost = boost;
        return this;
      },

      /**
             Serializes the internal <em>query</em> object as a JSON string.
             @member ejs.MoreLikeThisQuery
             @returns {String} Returns a JSON representation of the Query object.
             */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.MoreLikeThisQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            This method is used to retrieve the raw query object. It's designed
            for internal use when composing and serializing queries.
            @member ejs.MoreLikeThisQuery
            @returns {Object} Returns the object's <em>query</em> property.
            */
      _self: function () {
        return query;
      }
    };
  };
