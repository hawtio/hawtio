  /**
    @class
    <p>Matches documents that have fields containing terms with a specified 
    prefix (not analyzed). The prefix query maps to Lucene PrefixQuery.</p>

    @name ejs.PrefixQuery

    @desc
    Matches documents containing the specified un-analyzed prefix.

    @param {String} field A valid field name.
    @param {String} value A string prefix.
    */
  ejs.PrefixQuery = function (field, value) {

    /**
         The internal query object. <code>Use get()</code>
         @member ejs.PrefixQuery
         @property {Object} query
         */
    var query = {
      prefix: {}
    };

    query.prefix[field] = {
      value: value
    };
  
    return {

      /**
             The field to run the query against.

             @member ejs.PrefixQuery
             @param {String} f A single field name.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      field: function (f) {
        var oldValue = query.prefix[field];
  
        if (f == null) {
          return field;
        }

        delete query.prefix[field];
        field = f;
        query.prefix[f] = oldValue;

        return this;
      },

      /**
            The prefix value.

            @member ejs.PrefixQuery
            @param {String} p A string prefix
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      value: function (p) {
        if (p == null) {
          return query.prefix[field].value;
        }

        query.prefix[field].value = p;
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

            @member ejs.PrefixQuery
            @param {String} m The rewrite method as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      rewrite: function (m) {
        if (m == null) {
          return query.prefix[field].rewrite;
        }
        
        m = m.toLowerCase();
        if (m === 'constant_score_auto' || m === 'scoring_boolean' ||
          m === 'constant_score_boolean' || m === 'constant_score_filter' ||
          m.indexOf('top_terms_boost_') === 0 || 
          m.indexOf('top_terms_') === 0) {
            
          query.prefix[field].rewrite = m;
        }
        
        return this;
      },
      
      /**
            Sets the boost value of the <code>Query</code>.

            @member ejs.PrefixQuery
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.prefix[field].boost;
        }

        query.prefix[field].boost = boost;
        return this;
      },
      
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.PrefixQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.PrefixQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.PrefixQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
