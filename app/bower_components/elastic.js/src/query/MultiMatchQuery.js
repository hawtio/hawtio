  /**
    @class
    A <code>MultiMatchQuery</code> query builds further on top of the 
    <code>MatchQuery</code> by allowing multiple fields to be specified. 
    The idea here is to allow to more easily build a concise match type query 
    over multiple fields instead of using a relatively more expressive query 
    by using multiple match queries within a bool query.
  
    @name ejs.MultiMatchQuery

    @desc
    A Query that allow to more easily build a MatchQuery 
    over multiple fields

    @param {String || Array} fields the single field or array of fields to search across
    @param {String} qstr the query string
    */
  ejs.MultiMatchQuery = function (fields, qstr) {

    /**
         The internal query object. <code>Use get()</code>
         @member ejs.MultiMatchQuery
         @property {Object} query
         */
    var query = {
      multi_match: {
        query: qstr,
        fields: []
      }
    };

    if (isString(fields)) {
      query.multi_match.fields.push(fields);
    } else if (isArray(fields)) {
      query.multi_match.fields = fields;
    } else {
      throw new TypeError('Argument must be string or array');
    }
    
    return {

      /**
            Sets the fields to search across.  If passed a single value it is
            added to the existing list of fields.  If passed an array of 
            values, they overwite all existing values.

            @member ejs.MultiMatchQuery
            @param {String || Array} f A single field or list of fields names to 
              search across.
            @returns {Object} returns <code>this</code> so that calls can be 
              chained. Returns {Array} current value if `f` not specified.
            */
      fields: function (f) {
        if (f == null) {
          return query.multi_match.fields;
        }

        if (isString(f)) {
          query.multi_match.fields.push(f);
        } else if (isArray(f)) {
          query.multi_match.fields = f;
        } else {
          throw new TypeError('Argument must be string or array');
        }
        
        return this;
      },

      /**
            Sets whether or not queries against multiple fields should be combined using Lucene's
            <a href="http://lucene.apache.org/java/3_0_0/api/core/org/apache/lucene/search/DisjunctionMaxQuery.html">
            DisjunctionMaxQuery</a>

            @member ejs.MultiMatchQuery
            @param {String} trueFalse A <code>true/false</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      useDisMax: function (trueFalse) {
        if (trueFalse == null) {
          return query.multi_match.use_dis_max;
        }
      
        query.multi_match.use_dis_max = trueFalse;
        return this;
      },

      /**
            The tie breaker value.  The tie breaker capability allows results
            that include the same term in multiple fields to be judged better than
            results that include this term in only the best of those multiple
            fields, without confusing this with the better case of two different
            terms in the multiple fields.  Default: 0.0.

            @member ejs.MultiMatchQuery
            @param {Double} tieBreaker A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      tieBreaker: function (tieBreaker) {
        if (tieBreaker == null) {
          return query.multi_match.tie_breaker;
        }

        query.multi_match.tie_breaker = tieBreaker;
        return this;
      },

      /**
            Sets the maximum threshold/frequency to be considered a low 
            frequency term in a <code>CommonTermsQuery</code>.  
            Set to a value between 0 and 1.

            @member ejs.MultiMatchQuery
            @param {Number} freq A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cutoffFrequency: function (freq) {
        if (freq == null) {
          return query.multi_match.cutoff_frequency;
        }

        query.multi_match.cutoff_frequency = freq;
        return this;
      },
      
      /**
            Sets a percent value controlling how many "should" clauses in the
            resulting <code>Query</code> should match.

            @member ejs.MultiMatchQuery
            @param {Integer} minMatch An <code>integer</code> between 0 and 100.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      minimumShouldMatch: function (minMatch) {
        if (minMatch == null) {
          return query.multi_match.minimum_should_match;
        }

        query.multi_match.minimum_should_match = minMatch;
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

            @member ejs.MultiMatchQuery
            @param {String} m The rewrite method as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      rewrite: function (m) {
        if (m == null) {
          return query.multi_match.rewrite;
        }
        
        m = m.toLowerCase();
        if (m === 'constant_score_auto' || m === 'scoring_boolean' ||
          m === 'constant_score_boolean' || m === 'constant_score_filter' ||
          m.indexOf('top_terms_boost_') === 0 || 
          m.indexOf('top_terms_') === 0) {
            
          query.multi_match.rewrite = m;
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
            
            @member ejs.MultiMatchQuery
            @param {String} m The rewrite method as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      fuzzyRewrite: function (m) {
        if (m == null) {
          return query.multi_match.fuzzy_rewrite;
        }

        m = m.toLowerCase();
        if (m === 'constant_score_auto' || m === 'scoring_boolean' ||
          m === 'constant_score_boolean' || m === 'constant_score_filter' ||
          m.indexOf('top_terms_boost_') === 0 || 
          m.indexOf('top_terms_') === 0) {
            
          query.multi_match.fuzzy_rewrite = m;
        }
        
        return this;
      },

      /**
            Enables lenient parsing of the query string.

            @member ejs.MultiMatchQuery
            @param {Boolean} trueFalse A boolean value
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lenient: function (trueFalse) {
        if (trueFalse == null) {
          return query.multi_match.lenient;
        }

        query.multi_match.lenient = trueFalse;
        return this;
      },
                 
      /**
            Sets the boost value for documents matching the <code>Query</code>.

            @member ejs.MultiMatchQuery
            @param {Number} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.multi_match.boost;
        }

        query.multi_match.boost = boost;
        return this;
      },

      /**
            Sets the query string for the <code>Query</code>.

            @member ejs.MultiMatchQuery
            @param {String} qstr The query string to search for.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      query: function (qstr) {
        if (qstr == null) {
          return query.multi_match.query;
        }

        query.multi_match.query = qstr;
        return this;
      },

      /**
            Sets the type of the <code>MultiMatchQuery</code>.  Valid values are
            boolean, phrase, and phrase_prefix or phrasePrefix.

            @member ejs.MultiMatchQuery
            @param {String} type Any of boolean, phrase, phrase_prefix or phrasePrefix.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      type: function (type) {
        if (type == null) {
          return query.multi_match.type;
        }

        type = type.toLowerCase();
        if (type === 'boolean' || type === 'phrase' || type === 'phrase_prefix') {
          query.multi_match.type = type;
        }

        return this;
      },

      /**
            Sets the fuzziness value for the <code>Query</code>.

            @member ejs.MultiMatchQuery
            @param {Double} fuzz A <code>double</code> value between 0.0 and 1.0.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      fuzziness: function (fuzz) {
        if (fuzz == null) {
          return query.multi_match.fuzziness;
        }

        query.multi_match.fuzziness = fuzz;
        return this;
      },

      /**
            Sets the prefix length for a fuzzy prefix <code>Query</code>.

            @member ejs.MultiMatchQuery
            @param {Integer} l A positive <code>integer</code> length value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      prefixLength: function (l) {
        if (l == null) {
          return query.multi_match.prefix_length;
        }

        query.multi_match.prefix_length = l;
        return this;
      },

      /**
            Sets the max expansions of a fuzzy <code>Query</code>.

            @member ejs.MultiMatchQuery
            @param {Integer} e A positive <code>integer</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      maxExpansions: function (e) {
        if (e == null) {
          return query.multi_match.max_expansions;
        }

        query.multi_match.max_expansions = e;
        return this;
      },

      /**
            Sets default operator of the <code>Query</code>.  Default: or.

            @member ejs.MultiMatchQuery
            @param {String} op Any of "and" or "or", no quote characters.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      operator: function (op) {
        if (op == null) {
          return query.multi_match.operator;
        }

        op = op.toLowerCase();
        if (op === 'and' || op === 'or') {
          query.multi_match.operator = op;
        }

        return this;
      },

      /**
            Sets the default slop for phrases. If zero, then exact phrase matches
            are required.  Default: 0.

            @member ejs.MultiMatchQuery
            @param {Integer} slop A positive <code>integer</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      slop: function (slop) {
        if (slop == null) {
          return query.multi_match.slop;
        }

        query.multi_match.slop = slop;
        return this;
      },

      /**
            Sets the analyzer name used to analyze the <code>Query</code> object.

            @member ejs.MultiMatchQuery
            @param {String} analyzer A valid analyzer name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      analyzer: function (analyzer) {
        if (analyzer == null) {
          return query.multi_match.analyzer;
        }

        query.multi_match.analyzer = analyzer;
        return this;
      },

      /**
            Sets what happens when no terms match.  Valid values are
            "all" or "none".  

            @member ejs.MultiMatchQuery
            @param {String} q A no match action, "all" or "none".
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      zeroTermsQuery: function (q) {
        if (q == null) {
          return query.multi_match.zero_terms_query;
        }

        q = q.toLowerCase();
        if (q === 'all' || q === 'none') {
          query.multi_match.zero_terms_query = q;
        }
        
        return this;
      },
      
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.MultiMatchQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.MultiMatchQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            Retrieves the internal <code>Query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.MultiMatchQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
