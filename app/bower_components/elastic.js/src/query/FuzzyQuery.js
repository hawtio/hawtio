  /**
    @class
    <p>A fuzzy search query based on the Damerau-Levenshtein (optimal string 
    alignment) algorithm, though you can explicitly choose classic Levenshtein 
    by passing false to the transpositions parameter./p>
  
    <p>fuzzy query on a numeric field will result in a range query “around” 
    the value using the min_similarity value. As an example, if you perform a
    fuzzy query against a field value of "12" with a min similarity setting
    of "2", the query will search for values between "10" and "14".</p>

    @name ejs.FuzzyQuery

    @desc
    <p>Constructs a query where each documents returned are “like” provided text</p>
    
    @param {String} field The field to run the fuzzy query against.
    @param {String} value The value to fuzzify.
    
     */
  ejs.FuzzyQuery = function (field, value) {

    /**
         The internal Query object. Use <code>get()</code>.
         @member ejs.FuzzyQuery
         @property {Object} query
         */
    var query = {
      fuzzy: {}
    };

    query.fuzzy[field] = {
      value: value
    };

    return {

      /**
             <p>The field to run the query against.</p>

             @member ejs.FuzzyQuery
             @param {String} f A single field name.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      field: function (f) {
        var oldValue = query.fuzzy[field];
    
        if (f == null) {
          return field;
        }
  
        delete query.fuzzy[field];
        field = f;
        query.fuzzy[f] = oldValue;
  
        return this;
      },

      /**
            <p>The query text to fuzzify.</p>

            @member ejs.FuzzyQuery
            @param {String} s A text string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      value: function (txt) {
        if (txt == null) {
          return query.fuzzy[field].value;
        }

        query.fuzzy[field].value = txt;
        return this;
      },

      /**
            <p>Set to false to use classic Levenshtein edit distance.</p>

            @member ejs.FuzzyQuery
            @param {Boolean} trueFalse A boolean value
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      transpositions: function (trueFalse) {
        if (trueFalse == null) {
          return query.fuzzy[field].transpositions;
        }

        query.fuzzy[field].transpositions = trueFalse;
        return this;
      },

      /**
            <p>The maximum number of query terms that will be included in any 
            generated query. Defaults to <code>50</code>.<p>

            @member ejs.FuzzyQuery
            @param {Integer} max A positive integer value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      maxExpansions: function (max) {
        if (max == null) {
          return query.fuzzy[field].max_expansions;
        }

        query.fuzzy[field].max_expansions = max;
        return this;
      },

      /**
            <p>The minimum similarity of the term variants. Defaults to <code>0.5</code>.</p>

            @member ejs.FuzzyQuery
            @param {Double} min A positive double value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      minSimilarity: function (min) {
        if (min == null) {
          return query.fuzzy[field].min_similarity;
        }

        query.fuzzy[field].min_similarity = min;
        return this;
      },

      /**
            <p>Length of required common prefix on variant terms. Defaults to <code>0</code>.</p>

            @member ejs.FuzzyQuery
            @param {Integer} len A positive integer value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      prefixLength: function (len) {
        if (len == null) {
          return query.fuzzy[field].prefix_length;
        }

        query.fuzzy[field].prefix_length = len;
        return this;
      },
      
      /**
            <p>Sets rewrite method.  Valid values are:</p> 
            
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

            @member ejs.FuzzyQuery
            @param {String} m The rewrite method as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      rewrite: function (m) {
        if (m == null) {
          return query.fuzzy[field].rewrite;
        }
        
        m = m.toLowerCase();
        if (m === 'constant_score_auto' || m === 'scoring_boolean' ||
          m === 'constant_score_boolean' || m === 'constant_score_filter' ||
          m.indexOf('top_terms_boost_') === 0 || 
          m.indexOf('top_terms_') === 0) {
            
          query.fuzzy[field].rewrite = m;
        }
        
        return this;
      },
      
                    
      /**
            <p>Sets the boost value of the <code>Query</code>.</p>

            @member ejs.FuzzyQuery
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.fuzzy[field].boost;
        }

        query.fuzzy[field].boost = boost;
        return this;
      },

      /**
             <p>Serializes the internal <code>query</code> object as a JSON string.</p>

             @member ejs.FuzzyQuery
             @returns {String} Returns a JSON representation of the Query object.
             */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            <p>The type of ejs object.  For internal use only.</p>
            
            @member ejs.FuzzyQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            <p>This method is used to retrieve the raw query object. It's designed
            for internal use when composing and serializing queries.</p>

            @member ejs.FuzzyQuery
            @returns {Object} Returns the object's <em>query</em> property.
            */
      _self: function () {
        return query;
      }
    };
  };
