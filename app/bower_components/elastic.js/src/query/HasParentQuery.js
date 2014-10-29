  /**
    @class
    <p>The has_parent query works the same as the has_parent filter, by 
    automatically wrapping the filter with a constant_score. Results in 
    child documents that have parent docs matching the query being returned.</p>

    @name ejs.HasParentQuery

    @desc
    Returns results that have parent documents matching the query.

    @param {Object} qry A valid query object.
    @param {String} parentType The child type
    */
  ejs.HasParentQuery = function (qry, parentType) {

    if (!isQuery(qry)) {
      throw new TypeError('Argument must be a Query');
    }
    
    /**
         The internal query object. <code>Use _self()</code>
         @member ejs.HasParentQuery
         @property {Object} query
         */
    var query = {
      has_parent: {
        query: qry._self(),
        parent_type: parentType
      }
    };

    return {

      /**
            Sets the query

            @member ejs.HasParentQuery
            @param {Object} q A valid Query object
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      query: function (q) {
        if (q == null) {
          return query.has_parent.query;
        }
  
        if (!isQuery(q)) {
          throw new TypeError('Argument must be a Query');
        }
        
        query.has_parent.query = q._self();
        return this;
      },

      /**
            Sets the child document type to search against

            @member ejs.HasParentQuery
            @param {String} t A valid type name
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      parentType: function (t) {
        if (t == null) {
          return query.has_parent.parent_type;
        }
  
        query.has_parent.parent_type = t;
        return this;
      },

      /**
            Sets the scope of the query.  A scope allows to run facets on the 
            same scope name that will work against the parent documents. 

            @deprecated since elasticsearch 0.90
            @member ejs.HasParentQuery
            @param {String} s The scope name as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      scope: function (s) {
        return this;
      },

      /**
            Sets the scoring method.  Valid values are:
            
            none - the default, no scoring
            score - the score of the parent is used in all child documents.

            @deprecated since elasticsearch 0.90.1 use scoreMode
            
            @member ejs.HasParentQuery
            @param {String} s The score type as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      scoreType: function (s) {
        if (s == null) {
          return query.has_parent.score_type;
        }
    
        s = s.toLowerCase();
        if (s === 'none' || s === 'score') {
          query.has_parent.score_type = s;
        }
        
        return this;
      },
      
      /**
            Sets the scoring method.  Valid values are:
            
            none - the default, no scoring
            score - the score of the parent is used in all child documents.
            
            @member ejs.HasParentQuery
            @param {String} s The score type as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      scoreMode: function (s) {
        if (s == null) {
          return query.has_parent.score_mode;
        }
    
        s = s.toLowerCase();
        if (s === 'none' || s === 'score') {
          query.has_parent.score_mode = s;
        }
        
        return this;
      },
      
      /**
            Sets the boost value of the <code>Query</code>.

            @member ejs.HasParentQuery
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.has_parent.boost;
        }

        query.has_parent.boost = boost;
        return this;
      },
      
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.HasParentQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.HasParentQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.HasParentQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
