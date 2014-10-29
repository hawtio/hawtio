  /**
    @class
    A query that executes against a given field or document property. It is a simplified version
    of the <code><a href="/jsdocs/ejs.queryString.html">queryString</a></code> object.

    @name ejs.FieldQuery

    @desc
    A query that executes against a given field or document property.

    @param {String} field The field or document property to search against.
    @param {String} qstr The value to match.
    */
  ejs.FieldQuery = function (field, qstr) {

    /**
         The internal query object. <code>Use get()</code>
         @member ejs.FieldQuery
         @property {Object} query
         */
    var query = {
      field: {}
    };
    
    query.field[field] = {
      query: qstr
    };

    return {

      /**
             The field to run the query against.

             @member ejs.FieldQuery
             @param {String} f A single field name.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      field: function (f) {
        var oldValue = query.field[field];

        if (f == null) {
          return field;
        }

        delete query.field[field];
        field = f;
        query.field[f] = oldValue;

        return this;
      },
      
      /**
             <p>Sets the query string.</p>

             @member ejs.FieldQuery
             @param {String} q The lucene query string.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      query: function (q) {
        if (q == null) {
          return query.field[field].query;
        }

        query.field[field].query = q;
        return this;
      },
      
      /**
            <p>Set the default <code>Boolean</code> operator.</p> 

            <p>This operator is used to join individual query terms when no operator is 
            explicity used in the query string (i.e., <code>this AND that</code>).
            Defaults to <code>OR</code> (<em>same as Google</em>).</p>

            @member ejs.FieldQuery
            @param {String} op The operator, AND or OR.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      defaultOperator: function (op) {
        if (op == null) {
          return query.field[field].default_operator;
        }
      
        op = op.toUpperCase();
        if (op === 'AND' || op === 'OR') {
          query.field[field].default_operator = op;
        }
        
        return this;
      },

      /**
            <p>Sets the analyzer name used to analyze the <code>Query</code> object.</p>

            @member ejs.FieldQuery
            @param {String} analyzer A valid analyzer name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      analyzer: function (analyzer) {
        if (analyzer == null) {
          return query.field[field].analyzer;
        }

        query.field[field].analyzer = analyzer;
        return this;
      },

      /**
            <p>Sets the quote analyzer name used to analyze the <code>query</code>
            when in quoted text.</p>

            @member ejs.FieldQuery
            @param {String} analyzer A valid analyzer name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      quoteAnalyzer: function (analyzer) {
        if (analyzer == null) {
          return query.field[field].quote_analyzer;
        }

        query.field[field].quote_analyzer = analyzer;
        return this;
      },
      
      /**
            <p>Sets whether or not we should auto generate phrase queries *if* the
            analyzer returns more than one term. Default: false.</p>

            @member ejs.FieldQuery
            @param {Boolean} trueFalse A <code>true/false</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      autoGeneratePhraseQueries: function (trueFalse) {
        if (trueFalse == null) {
          return query.field[field].auto_generate_phrase_queries;
        }

        query.field[field].auto_generate_phrase_queries = trueFalse;
        return this;
      },

      /**
            <p>Sets whether or not wildcard characters (* and ?) are allowed as the
            first character of the <code>Query</code>.</p>  

            <p>Default: <code>true</code>.</p>

            @member ejs.FieldQuery
            @param {Boolean} trueFalse A <code>true/false</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      allowLeadingWildcard: function (trueFalse) {
        if (trueFalse == null) {
          return query.field[field].allow_leading_wildcard;
        }

        query.field[field].allow_leading_wildcard = trueFalse;
        return this;
      },

      /**
            <p>Sets whether or not terms from <code>wildcard, prefix, fuzzy,</code> and
            <code>range</code> queries should automatically be lowercased in the <code>Query</code>
            since they are not analyzed.</p>  

            <p>Default: <code>true</code>.</p>

            @member ejs.FieldQuery
            @param {Boolean} trueFalse A <code>true/false</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lowercaseExpandedTerms: function (trueFalse) {
        if (trueFalse == null) {
          return query.field[field].lowercase_expanded_terms;
        }

        query.field[field].lowercase_expanded_terms = trueFalse;
        return this;
      },

      /**
            <p>Sets whether or not position increments will be used in the
            <code>Query</code>.</p> 

            <p>Default: <code>true</code>.</p>

            @member ejs.FieldQuery
            @param {Boolean} trueFalse A <code>true/false</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      enablePositionIncrements: function (trueFalse) {
        if (trueFalse == null) {
          return query.field[field].enable_position_increments;
        }

        query.field[field].enable_position_increments = trueFalse;
        return this;
      },

      /**
            <p>Set the minimum similarity for fuzzy queries.</p>  

            <p>Default: <code>0.5</code>.</p>

            @member ejs.FieldQuery
            @param {Double} minSim A <code>double</code> value between 0 and 1.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      fuzzyMinSim: function (minSim) {
        if (minSim == null) {
          return query.field[field].fuzzy_min_sim;
        }

        query.field[field].fuzzy_min_sim = minSim;
        return this;
      },

      /**
            <p>Sets the boost value of the <code>Query</code>.</p>  

            <p>Default: <code>1.0</code>.</p>

            @member ejs.FieldQuery
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.field[field].boost;
        }

        query.field[field].boost = boost;
        return this;
      },

      /**
            <p>Sets the prefix length for fuzzy queries.</p>  
    
            <p>Default: <code>0</code>.</p>

            @member ejs.FieldQuery
            @param {Integer} fuzzLen A positive <code>integer</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      fuzzyPrefixLength: function (fuzzLen) {
        if (fuzzLen == null) {
          return query.field[field].fuzzy_prefix_length;
        }

        query.field[field].fuzzy_prefix_length = fuzzLen;
        return this;
      },

      /**
            <p>Sets the max number of term expansions for fuzzy queries.</p>

            @member ejs.FieldQuery
            @param {Integer} max A positive <code>integer</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      fuzzyMaxExpansions: function (max) {
        if (max == null) {
          return query.field[field].fuzzy_max_expansions;
        }

        query.field[field].fuzzy_max_expansions = max;
        return this;
      },

      /**
            <p>Sets fuzzy rewrite method.<p>  

            <p>Valid values are:</p>
            
            <dl>
                <dd><code>constant_score_auto</code> - tries to pick the best constant-score rewrite 
                 method based on term and document counts from the query</dd>
              
                <dd><code>scoring_boolean</code> - translates each term into boolean should and 
                 keeps the scores as computed by the query</dd>
              
                <dd><code>constant_score_boolean</code> - same as scoring_boolean, expect no scores
                 are computed.</dd>
              
                <dd><code>constant_score_filter</code> - first creates a private Filter, by visiting 
                 each term in sequence and marking all docs for that term</dd>
              
                <dd><code>top_terms_boost_N</code> - first translates each term into boolean should
                 and scores are only computed as the boost using the top <code>N</code>
                 scoring terms.  Replace <code>N</code> with an integer value.</dd>
              
                <dd><code>top_terms_N</code> - first translates each term into boolean should
                 and keeps the scores as computed by the query. Only the top <code>N</code>
                 scoring terms are used.  Replace <code>N</code> with an integer value.</dd>
            </dl>
            
            <p>Default is <code>constant_score_auto</code>.</p>

            <p>This is an advanced option, use with care.</p>
            
            @member ejs.FieldQuery
            @param {String} m The rewrite method as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      fuzzyRewrite: function (m) {
        if (m == null) {
          return query.field[field].fuzzy_rewrite;
        }

        m = m.toLowerCase();
        if (m === 'constant_score_auto' || m === 'scoring_boolean' ||
          m === 'constant_score_boolean' || m === 'constant_score_filter' ||
          m.indexOf('top_terms_boost_') === 0 || 
          m.indexOf('top_terms_') === 0) {
            
          query.field[field].fuzzy_rewrite = m;
        }
        
        return this;
      },

      /**
            <p>Sets rewrite method.</p>  

            <p>Valid values are:</p>
            
            <dl>
                <dd><code>constant_score_auto</code> - tries to pick the best constant-score rewrite 
                 method based on term and document counts from the query</dd>
              
                <dd><code>scoring_boolean</code> - translates each term into boolean should and 
                 keeps the scores as computed by the query</dd>
              
                <dd><code>constant_score_boolean</code> - same as scoring_boolean, expect no scores
                 are computed.</p>
              
                <dd><code>constant_score_filter</code> - first creates a private Filter, by visiting 
                 each term in sequence and marking all docs for that term</dd>
              
                <dd><code>top_terms_boost_N</code> - first translates each term into boolean should
                 and scores are only computed as the boost using the top <code>N</code>
                 scoring terms.  Replace <code>N</code> with an integer value.</dd>
              
                <dd><code>top_terms_N</code> - first translates each term into boolean should
                 and keeps the scores as computed by the query. Only the top <code>N</code>
                 scoring terms are used.  Replace <code>N</code> with an integer value.</dd>
            </dl>
            
            <p>Default is <code>constant_score_auto</code>.</p>

            This is an advanced option, use with care.

            @member ejs.FieldQuery
            @param {String} m The rewrite method as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      rewrite: function (m) {
        if (m == null) {
          return query.field[field].rewrite;
        }
        
        m = m.toLowerCase();
        if (m === 'constant_score_auto' || m === 'scoring_boolean' ||
          m === 'constant_score_boolean' || m === 'constant_score_filter' ||
          m.indexOf('top_terms_boost_') === 0 || 
          m.indexOf('top_terms_') === 0) {
            
          query.field[field].rewrite = m;
        }
        
        return this;
      },

      /**
            <p>Sets the suffix to automatically add to the field name when 
            performing a quoted search.</p>

            @member ejs.FieldQuery
            @param {String} s The suffix as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      quoteFieldSuffix: function (s) {
        if (s == null) {
          return query.field[field].quote_field_suffix;
        }

        query.field[field].quote_field_suffix = s;
        return this;
      },
                        
      /**
            <p>Sets the default slop for phrases. If zero, then exact phrase matches
            are required.</p>  

            <p>Default: <code>0</code>.</p>

            @member ejs.FieldQuery
            @param {Integer} slop A positive <code>integer</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      phraseSlop: function (slop) {
        if (slop == null) {
          return query.field[field].phrase_slop;
        }

        query.field[field].phrase_slop = slop;
        return this;
      },

      /**
            <p>Sets whether or not we should attempt to analyzed wilcard terms in the
            <code>Query</code>.</p> 

            <p>By default, wildcard terms are not analyzed. Analysis of wildcard characters is not perfect.</p>  

            <p>Default: <code>false</code>.</p>

            @member ejs.FieldQuery
            @param {Boolean} trueFalse A <code>true/false</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      analyzeWildcard: function (trueFalse) {
        if (trueFalse == null) {
          return query.field[field].analyze_wildcard;
        }

        query.field[field].analyze_wildcard = trueFalse;
        return this;
      },

      /**
            <p>If the query string should be escaped or not.</p>

            @member ejs.FieldQuery
            @param {Boolean} trueFalse A <code>true/false</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      escape: function (trueFalse) {
        if (trueFalse == null) {
          return query.field[field].escape;
        }

        query.field[field].escape = trueFalse;
        return this;
      },
      
      /**
            <p>Sets a percent value controlling how many <code>should</code> clauses in the
            resulting <code>Query</code> should match.</p>

            @member ejs.FieldQuery
            @param {Integer} minMatch An <code>integer</code> between 0 and 100.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      minimumShouldMatch: function (minMatch) {
        if (minMatch == null) {
          return query.field[field].minimum_should_match;
        }

        query.field[field].minimum_should_match = minMatch;
        return this;
      },

      /**
            <p>Allows you to serialize this object into a JSON encoded string.</p>

            @member ejs.FieldQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            <p>The type of ejs object.  For internal use only.</p>
            
            @member ejs.FieldQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            <p>Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.</p>

            @member ejs.FieldQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
