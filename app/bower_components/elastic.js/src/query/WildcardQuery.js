  /**
    @class
    <p>Matches documents that have fields matching a wildcard expression 
    (not analyzed). Supported wildcards are *, which matches any character 
    sequence (including the empty one), and ?, which matches any single 
    character. Note this query can be slow, as it needs to iterate over many 
    wildcards. In order to prevent extremely slow wildcard queries, a wildcard 
    wildcard should not start with one of the wildcards * or ?. The wildcard query 
    maps to Lucene WildcardQuery.</p>

    @name ejs.WildcardQuery

    @desc
    A Query that matches documents containing a wildcard. This may be
    combined with other wildcards with a BooleanQuery.

    @param {String} field the document field/key to query against
    @param {String} value the literal value to be matched
    */
  ejs.WildcardQuery = function (field, value) {

    /**
         The internal query object. <code>Use get()</code>
         @member ejs.WildcardQuery
         @property {Object} query
         */
    var query = {
      wildcard: {}
    };

    query.wildcard[field] = {
      value: value
    };

    return {

      /**
            Sets the fields to query against.

            @member ejs.WildcardQuery
            @param {String} f A valid field name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (f) {
        var oldValue = query.wildcard[field];
    
        if (f == null) {
          return field;
        }

        delete query.wildcard[field];
        field = f;
        query.wildcard[f] = oldValue;
    
        return this;
      },
  
      /**
            Sets the wildcard query value.

            @member ejs.WildcardQuery
            @param {String} v A single term.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      value: function (v) {
        if (v == null) {
          return query.wildcard[field].value;
        }

        query.wildcard[field].value = v;
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

            @member ejs.WildcardQuery
            @param {String} m The rewrite method as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      rewrite: function (m) {
        if (m == null) {
          return query.wildcard[field].rewrite;
        }
        
        m = m.toLowerCase();
        if (m === 'constant_score_auto' || m === 'scoring_boolean' ||
          m === 'constant_score_boolean' || m === 'constant_score_filter' ||
          m.indexOf('top_terms_boost_') === 0 || 
          m.indexOf('top_terms_') === 0) {
            
          query.wildcard[field].rewrite = m;
        }
        
        return this;
      },
      
      /**
            Sets the boost value for documents matching the <code>Query</code>.

            @member ejs.WildcardQuery
            @param {Number} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.wildcard[field].boost;
        }

        query.wildcard[field].boost = boost;
        return this;
      },

      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.WildcardQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.WildcardQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.WildcardQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
