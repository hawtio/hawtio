  /**
    @class
    <p>Matches documents that have fields matching a regular expression. Based 
    on Lucene 4.0 RegexpQuery which uses automaton to efficiently iterate over 
    index terms.</p>

    @name ejs.RegexpQuery

    @desc
    Matches documents that have fields matching a regular expression.

    @param {String} field A valid field name.
    @param {String} value A regex pattern.
    */
  ejs.RegexpQuery = function (field, value) {

    /**
         The internal query object. <code>Use get()</code>
         @member ejs.RegexpQuery
         @property {Object} query
         */
    var query = {
      regexp: {}
    };

    query.regexp[field] = {
      value: value
    };

    return {

      /**
             The field to run the query against.

             @member ejs.RegexpQuery
             @param {String} f A single field name.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      field: function (f) {
        var oldValue = query.regexp[field];

        if (f == null) {
          return field;
        }

        delete query.regexp[field];
        field = f;
        query.regexp[f] = oldValue;

        return this;
      },

      /**
            The regexp value.

            @member ejs.RegexpQuery
            @param {String} p A string regexp
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      value: function (p) {
        if (p == null) {
          return query.regexp[field].value;
        }

        query.regexp[field].value = p;
        return this;
      },

      /**
            The regex flags to use.  Valid flags are:
          
            INTERSECTION - Support for intersection notation
            COMPLEMENT - Support for complement notation
            EMPTY - Support for the empty language symbol: #
            ANYSTRING - Support for the any string symbol: @
            INTERVAL - Support for numerical interval notation: <n-m>
            NONE - Disable support for all syntax options
            ALL - Enables support for all syntax options
          
            Use multiple flags by separating with a "|" character.  Example:
          
            INTERSECTION|COMPLEMENT|EMPTY

            @member ejs.RegexpQuery
            @param {String} f The flags as a string, separate multiple flags with "|".
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      flags: function (f) {
        if (f == null) {
          return query.regexp[field].flags;
        }

        query.regexp[field].flags = f;
        return this;
      },
    
      /**
            The regex flags to use as a numeric value.  Advanced use only,
            it is probably better to stick with the <code>flags</code> option.
          
            @member ejs.RegexpQuery
            @param {String} v The flags as a numeric value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      flagsValue: function (v) {
        if (v == null) {
          return query.regexp[field].flags_value;
        }

        query.regexp[field].flags_value = v;
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

            @member ejs.RegexpQuery
            @param {String} m The rewrite method as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      rewrite: function (m) {
        if (m == null) {
          return query.regexp[field].rewrite;
        }
      
        m = m.toLowerCase();
        if (m === 'constant_score_auto' || m === 'scoring_boolean' ||
          m === 'constant_score_boolean' || m === 'constant_score_filter' ||
          m.indexOf('top_terms_boost_') === 0 || 
          m.indexOf('top_terms_') === 0) {
          
          query.regexp[field].rewrite = m;
        }
      
        return this;
      },
    
      /**
            Sets the boost value of the <code>Query</code>.

            @member ejs.RegexpQuery
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.regexp[field].boost;
        }

        query.regexp[field].boost = boost;
        return this;
      },
    
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.RegexpQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
          
            @member ejs.RegexpQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
    
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.RegexpQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
