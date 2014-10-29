  /**
    @class
    <p>A query that is parsed using Lucene's default query parser. Although Lucene provides the
    ability to create your own queries through its API, it also provides a rich query language
    through the Query Parser, a lexer which interprets a string into a Lucene Query.</p>

    </p>See the Lucene <a href="http://lucene.apache.org/java/2_9_1/queryparsersyntax.html">Query Parser Syntax</a>
    for more information.</p>

    @name ejs.QueryStringQuery

    @desc
    A query that is parsed using Lucene's default query parser.

    @param {String} qstr A valid Lucene query string.
    */
  ejs.QueryStringQuery = function (qstr) {

    /**
         The internal Query object. Use <code>get()</code>.
         @member ejs.QueryStringQuery
         @property {Object} query
         */
    var query = {
      query_string: {}
    };

    query.query_string.query = qstr;

    return {

      /**
            Sets the query string on this <code>Query</code> object.

            @member ejs.QueryStringQuery
            @param {String} qstr A valid Lucene query string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      query: function (qstr) {
        if (qstr == null) {
          return query.query_string.query;
        }

        query.query_string.query = qstr;
        return this;
      },

      /**
            Sets the default field/property this query should execute against.

            @member ejs.QueryStringQuery
            @param {String} fieldName The name of document field/property.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      defaultField: function (fieldName) {
        if (fieldName == null) {
          return query.query_string.default_field;
        }
      
        query.query_string.default_field = fieldName;
        return this;
      },

      /**
            A set of fields/properties this query should execute against.  
            Pass a single value to add to the existing list of fields and 
            pass an array to overwrite all existing fields.  For each field, 
            you can apply a field specific boost by appending a ^boost to the 
            field name.  For example, title^10, to give the title field a
            boost of 10.

            @member ejs.QueryStringQuery
            @param {Array} fieldNames A list of document fields/properties.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      fields: function (fieldNames) {
        if (query.query_string.fields == null) {
          query.query_string.fields = [];
        }
        
        if (fieldNames == null) {
          return query.query_string.fields;
        }
      
        if (isString(fieldNames)) {
          query.query_string.fields.push(fieldNames);
        } else if (isArray(fieldNames)) {
          query.query_string.fields = fieldNames;
        } else {
          throw new TypeError('Argument must be a string or array');
        }
        
        return this;
      },

      /**
            Sets whether or not queries against multiple fields should be combined using Lucene's
            <a href="http://lucene.apache.org/java/3_0_0/api/core/org/apache/lucene/search/DisjunctionMaxQuery.html">
            DisjunctionMaxQuery</a>

            @member ejs.QueryStringQuery
            @param {String} trueFalse A <code>true/false</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      useDisMax: function (trueFalse) {
        if (trueFalse == null) {
          return query.query_string.use_dis_max;
        }
      
        query.query_string.use_dis_max = trueFalse;
        return this;
      },

      /**
            Set the default <em>Boolean</em> operator. This operator is used to join individual query
            terms when no operator is explicity used in the query string (i.e., <code>this AND that</code>).
            Defaults to <code>OR</code> (<em>same as Google</em>).

            @member ejs.QueryStringQuery
            @param {String} op The operator to use, AND or OR.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      defaultOperator: function (op) {
        if (op == null) {
          return query.query_string.default_operator;
        }
      
        op = op.toUpperCase();
        if (op === 'AND' || op === 'OR') {
          query.query_string.default_operator = op;
        }
        
        return this;
      },

      /**
            Sets the analyzer name used to analyze the <code>Query</code> object.

            @member ejs.QueryStringQuery
            @param {String} analyzer A valid analyzer name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      analyzer: function (analyzer) {
        if (analyzer == null) {
          return query.query_string.analyzer;
        }

        query.query_string.analyzer = analyzer;
        return this;
      },

      /**
            Sets the quote analyzer name used to analyze the <code>query</code>
            when in quoted text.

            @member ejs.QueryStringQuery
            @param {String} analyzer A valid analyzer name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      quoteAnalyzer: function (analyzer) {
        if (analyzer == null) {
          return query.query_string.quote_analyzer;
        }

        query.query_string.quote_analyzer = analyzer;
        return this;
      },
      
      /**
            Sets whether or not wildcard characters (* and ?) are allowed as the
            first character of the <code>Query</code>.  Default: true.

            @member ejs.QueryStringQuery
            @param {Boolean} trueFalse A <code>true/false</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      allowLeadingWildcard: function (trueFalse) {
        if (trueFalse == null) {
          return query.query_string.allow_leading_wildcard;
        }

        query.query_string.allow_leading_wildcard = trueFalse;
        return this;
      },

      /**
            Sets whether or not terms from wildcard, prefix, fuzzy, and
            range queries should automatically be lowercased in the <code>Query</code>
            since they are not analyzed.  Default: true.

            @member ejs.QueryStringQuery
            @param {Boolean} trueFalse A <code>true/false</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lowercaseExpandedTerms: function (trueFalse) {
        if (trueFalse == null) {
          return query.query_string.lowercase_expanded_terms;
        }

        query.query_string.lowercase_expanded_terms = trueFalse;
        return this;
      },

      /**
            Sets whether or not position increments will be used in the
            <code>Query</code>. Default: true.

            @member ejs.QueryStringQuery
            @param {Boolean} trueFalse A <code>true/false</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      enablePositionIncrements: function (trueFalse) {
        if (trueFalse == null) {
          return query.query_string.enable_position_increments;
        }

        query.query_string.enable_position_increments = trueFalse;
        return this;
      },


      /**
            Sets the prefix length for fuzzy queries.  Default: 0.

            @member ejs.QueryStringQuery
            @param {Integer} fuzzLen A positive <code>integer</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      fuzzyPrefixLength: function (fuzzLen) {
        if (fuzzLen == null) {
          return query.query_string.fuzzy_prefix_length;
        }

        query.query_string.fuzzy_prefix_length = fuzzLen;
        return this;
      },

      /**
            Set the minimum similarity for fuzzy queries.  Default: 0.5.

            @member ejs.QueryStringQuery
            @param {Double} minSim A <code>double</code> value between 0 and 1.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      fuzzyMinSim: function (minSim) {
        if (minSim == null) {
          return query.query_string.fuzzy_min_sim;
        }

        query.query_string.fuzzy_min_sim = minSim;
        return this;
      },

      /**
            Sets the default slop for phrases. If zero, then exact phrase matches
            are required.  Default: 0.

            @member ejs.QueryStringQuery
            @param {Integer} slop A positive <code>integer</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      phraseSlop: function (slop) {
        if (slop == null) {
          return query.query_string.phrase_slop;
        }

        query.query_string.phrase_slop = slop;
        return this;
      },

      /**
            Sets the boost value of the <code>Query</code>.  Default: 1.0.

            @member ejs.QueryStringQuery
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.query_string.boost;
        }

        query.query_string.boost = boost;
        return this;
      },

      /**
            Sets whether or not we should attempt to analyzed wilcard terms in the
            <code>Query</code>. By default, wildcard terms are not analyzed.
            Analysis of wildcard characters is not perfect.  Default: false.

            @member ejs.QueryStringQuery
            @param {Boolean} trueFalse A <code>true/false</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      analyzeWildcard: function (trueFalse) {
        if (trueFalse == null) {
          return query.query_string.analyze_wildcard;
        }

        query.query_string.analyze_wildcard = trueFalse;
        return this;
      },

      /**
            Sets whether or not we should auto generate phrase queries *if* the
            analyzer returns more than one term. Default: false.

            @member ejs.QueryStringQuery
            @param {Boolean} trueFalse A <code>true/false</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      autoGeneratePhraseQueries: function (trueFalse) {
        if (trueFalse == null) {
          return query.query_string.auto_generate_phrase_queries;
        }

        query.query_string.auto_generate_phrase_queries = trueFalse;
        return this;
      },

      /**
            Sets a percent value controlling how many "should" clauses in the
            resulting <code>Query</code> should match.

            @member ejs.QueryStringQuery
            @param {Integer} minMatch An <code>integer</code> between 0 and 100.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      minimumShouldMatch: function (minMatch) {
        if (minMatch == null) {
          return query.query_string.minimum_should_match;
        }

        query.query_string.minimum_should_match = minMatch;
        return this;
      },

      /**
            Sets the tie breaker value for a <code>Query</code> using
            <code>DisMax</code>.  The tie breaker capability allows results
            that include the same term in multiple fields to be judged better than
            results that include this term in only the best of those multiple
            fields, without confusing this with the better case of two different
            terms in the multiple fields.  Default: 0.0.

            @member ejs.QueryStringQuery
            @param {Double} tieBreaker A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      tieBreaker: function (tieBreaker) {
        if (tieBreaker == null) {
          return query.query_string.tie_breaker;
        }

        query.query_string.tie_breaker = tieBreaker;
        return this;
      },

      /**
            If they query string should be escaped or not.

            @member ejs.QueryStringQuery
            @param {Boolean} trueFalse A <code>true/false</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      escape: function (trueFalse) {
        if (trueFalse == null) {
          return query.query_string.escape;
        }

        query.query_string.escape = trueFalse;
        return this;
      },

      /**
            Sets the max number of term expansions for fuzzy queries.  

            @member ejs.QueryStringQuery
            @param {Integer} max A positive <code>integer</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      fuzzyMaxExpansions: function (max) {
        if (max == null) {
          return query.query_string.fuzzy_max_expansions;
        }

        query.query_string.fuzzy_max_expansions = max;
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
            
            @member ejs.QueryStringQuery
            @param {String} m The rewrite method as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      fuzzyRewrite: function (m) {
        if (m == null) {
          return query.query_string.fuzzy_rewrite;
        }

        m = m.toLowerCase();
        if (m === 'constant_score_auto' || m === 'scoring_boolean' ||
          m === 'constant_score_boolean' || m === 'constant_score_filter' ||
          m.indexOf('top_terms_boost_') === 0 || 
          m.indexOf('top_terms_') === 0) {
            
          query.query_string.fuzzy_rewrite = m;
        }
        
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

            @member ejs.QueryStringQuery
            @param {String} m The rewrite method as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      rewrite: function (m) {
        if (m == null) {
          return query.query_string.rewrite;
        }
        
        m = m.toLowerCase();
        if (m === 'constant_score_auto' || m === 'scoring_boolean' ||
          m === 'constant_score_boolean' || m === 'constant_score_filter' ||
          m.indexOf('top_terms_boost_') === 0 || 
          m.indexOf('top_terms_') === 0) {
            
          query.query_string.rewrite = m;
        }
        
        return this;
      },

      /**
            Sets the suffix to automatically add to the field name when 
            performing a quoted search.

            @member ejs.QueryStringQuery
            @param {String} s The suffix as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      quoteFieldSuffix: function (s) {
        if (s == null) {
          return query.query_string.quote_field_suffix;
        }

        query.query_string.quote_field_suffix = s;
        return this;
      },
      
      /**
            Enables lenient parsing of the query string.

            @member ejs.QueryStringQuery
            @param {Boolean} trueFalse A boolean value
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lenient: function (trueFalse) {
        if (trueFalse == null) {
          return query.query_string.lenient;
        }

        query.query_string.lenient = trueFalse;
        return this;
      },
      
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.QueryStringQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.QueryStringQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.QueryStringQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
