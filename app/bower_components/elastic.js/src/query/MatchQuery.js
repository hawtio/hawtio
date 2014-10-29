  /**
    @class
    A <code>MatchQuery</code> is a type of <code>Query</code> that accepts 
    text/numerics/dates, analyzes it, generates a query based on the
    <code>MatchQuery</code> type.
  
    @name ejs.MatchQuery

    @desc
    A Query that appects text, analyzes it, generates internal query based
    on the MatchQuery type.

    @param {String} field the document field/field to query against
    @param {String} qstr the query string
    */
  ejs.MatchQuery = function (field, qstr) {

    /**
         The internal query object. <code>Use get()</code>
         @member ejs.MatchQuery
         @property {Object} query
         */
    var query = {
      match: {}
    };
    
    query.match[field] = {
      query: qstr
    };

    return {

      /**
            Sets the boost value for documents matching the <code>Query</code>.

            @member ejs.MatchQuery
            @param {Number} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.match[field].boost;
        }

        query.match[field].boost = boost;
        return this;
      },

      /**
            Sets the query string for the <code>Query</code>.

            @member ejs.MatchQuery
            @param {String} qstr The query string to search for.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      query: function (qstr) {
        if (qstr == null) {
          return query.match[field].query;
        }

        query.match[field].query = qstr;
        return this;
      },

      /**
            Sets the type of the <code>MatchQuery</code>.  Valid values are
            boolean, phrase, and phrase_prefix.

            @member ejs.MatchQuery
            @param {String} type Any of boolean, phrase, phrase_prefix.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      type: function (type) {
        if (type == null) {
          return query.match[field].type;
        }

        type = type.toLowerCase();
        if (type === 'boolean' || type === 'phrase' || type === 'phrase_prefix') {
          query.match[field].type = type;
        }

        return this;
      },

      /**
            Sets the fuzziness value for the <code>Query</code>.

            @member ejs.MatchQuery
            @param {Double} fuzz A <code>double</code> value between 0.0 and 1.0.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      fuzziness: function (fuzz) {
        if (fuzz == null) {
          return query.match[field].fuzziness;
        }

        query.match[field].fuzziness = fuzz;
        return this;
      },

      /**
            Sets the maximum threshold/frequency to be considered a low 
            frequency term in a <code>CommonTermsQuery</code>.  
            Set to a value between 0 and 1.

            @member ejs.MatchQuery
            @param {Number} freq A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cutoffFrequency: function (freq) {
        if (freq == null) {
          return query.match[field].cutoff_frequency;
        }

        query.match[field].cutoff_frequency = freq;
        return this;
      },
      
      /**
            Sets the prefix length for a fuzzy prefix <code>MatchQuery</code>.

            @member ejs.MatchQuery
            @param {Integer} l A positive <code>integer</code> length value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      prefixLength: function (l) {
        if (l == null) {
          return query.match[field].prefix_length;
        }

        query.match[field].prefix_length = l;
        return this;
      },

      /**
            Sets the max expansions of a fuzzy <code>MatchQuery</code>.

            @member ejs.MatchQuery
            @param {Integer} e A positive <code>integer</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      maxExpansions: function (e) {
        if (e == null) {
          return query.match[field].max_expansions;
        }

        query.match[field].max_expansions = e;
        return this;
      },

      /**
            Sets default operator of the <code>Query</code>.  Default: or.

            @member ejs.MatchQuery
            @param {String} op Any of "and" or "or", no quote characters.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      operator: function (op) {
        if (op == null) {
          return query.match[field].operator;
        }

        op = op.toLowerCase();
        if (op === 'and' || op === 'or') {
          query.match[field].operator = op;
        }

        return this;
      },

      /**
            Sets the default slop for phrases. If zero, then exact phrase matches
            are required.  Default: 0.

            @member ejs.MatchQuery
            @param {Integer} slop A positive <code>integer</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      slop: function (slop) {
        if (slop == null) {
          return query.match[field].slop;
        }

        query.match[field].slop = slop;
        return this;
      },

      /**
            Sets the analyzer name used to analyze the <code>Query</code> object.

            @member ejs.MatchQuery
            @param {String} analyzer A valid analyzer name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      analyzer: function (analyzer) {
        if (analyzer == null) {
          return query.match[field].analyzer;
        }

        query.match[field].analyzer = analyzer;
        return this;
      },

      /**
            Sets a percent value controlling how many "should" clauses in the
            resulting <code>Query</code> should match.

            @member ejs.MatchQuery
            @param {Integer} minMatch An <code>integer</code> between 0 and 100.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      minimumShouldMatch: function (minMatch) {
        if (minMatch == null) {
          return query.match[field].minimum_should_match;
        }

        query.match[field].minimum_should_match = minMatch;
        return this;
      },
      
      /**
            Sets rewrite method.  Valid values are: 
            
            constant_score_auto - tries to pick the best constant-score rewrite 
              method based on term and document counts from the query
              
            scoring_boolean - translates each term into boolean should and 
              keeps the scores as computed by the query
              
            constant_score_boolean - same as scoring_boolean, expect no scores
              are computed.
              
            constant_score_filter - first creates a private Filter, by visiting 
              each term in sequence and marking all docs for that term
              
            top_terms_boost_N - first translates each term into boolean should
              and scores are only computed as the boost using the top N
              scoring terms.  Replace N with an integer value.
              
            top_terms_N -   first translates each term into boolean should
                and keeps the scores as computed by the query. Only the top N
                scoring terms are used.  Replace N with an integer value.
            
            Default is constant_score_auto.

            This is an advanced option, use with care.

            @member ejs.MatchQuery
            @param {String} m The rewrite method as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      rewrite: function (m) {
        if (m == null) {
          return query.match[field].rewrite;
        }
        
        m = m.toLowerCase();
        if (m === 'constant_score_auto' || m === 'scoring_boolean' ||
          m === 'constant_score_boolean' || m === 'constant_score_filter' ||
          m.indexOf('top_terms_boost_') === 0 || 
          m.indexOf('top_terms_') === 0) {
            
          query.match[field].rewrite = m;
        }
        
        return this;
      },
      
      /**
            Sets fuzzy rewrite method.  Valid values are: 
            
            constant_score_auto - tries to pick the best constant-score rewrite 
              method based on term and document counts from the query
              
            scoring_boolean - translates each term into boolean should and 
              keeps the scores as computed by the query
              
            constant_score_boolean - same as scoring_boolean, expect no scores
              are computed.
              
            constant_score_filter - first creates a private Filter, by visiting 
              each term in sequence and marking all docs for that term
              
            top_terms_boost_N - first translates each term into boolean should
              and scores are only computed as the boost using the top N
              scoring terms.  Replace N with an integer value.
              
            top_terms_N -   first translates each term into boolean should
                and keeps the scores as computed by the query. Only the top N
                scoring terms are used.  Replace N with an integer value.
            
            Default is constant_score_auto.

            This is an advanced option, use with care.
            
            @member ejs.MatchQuery
            @param {String} m The rewrite method as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      fuzzyRewrite: function (m) {
        if (m == null) {
          return query.match[field].fuzzy_rewrite;
        }

        m = m.toLowerCase();
        if (m === 'constant_score_auto' || m === 'scoring_boolean' ||
          m === 'constant_score_boolean' || m === 'constant_score_filter' ||
          m.indexOf('top_terms_boost_') === 0 || 
          m.indexOf('top_terms_') === 0) {
            
          query.match[field].fuzzy_rewrite = m;
        }
        
        return this;
      },
      
      /**
            Set to false to use classic Levenshtein edit distance in the 
            fuzzy query.

            @member ejs.MatchQuery
            @param {Boolean} trueFalse A boolean value
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      fuzzyTranspositions: function (trueFalse) {
        if (trueFalse == null) {
          return query.match[field].fuzzy_transpositions;
        }

        query.match[field].fuzzy_transpositions = trueFalse;
        return this;
      },

      /**
            Enables lenient parsing of the query string.

            @member ejs.MatchQuery
            @param {Boolean} trueFalse A boolean value
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lenient: function (trueFalse) {
        if (trueFalse == null) {
          return query.match[field].lenient;
        }

        query.match[field].lenient = trueFalse;
        return this;
      },
    
      /**
            Sets what happens when no terms match.  Valid values are
            "all" or "none".  

            @member ejs.MatchQuery
            @param {String} q A no match action, "all" or "none".
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      zeroTermsQuery: function (q) {
        if (q == null) {
          return query.match[field].zero_terms_query;
        }

        q = q.toLowerCase();
        if (q === 'all' || q === 'none') {
          query.match[field].zero_terms_query = q;
        }
        
        return this;
      },
              
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.MatchQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.MatchQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.MatchQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
