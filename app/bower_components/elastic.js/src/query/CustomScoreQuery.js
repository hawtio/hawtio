  /**
    @class
    <p>A query that wraps another query and customize the scoring of it 
    optionally with a computation derived from other field values in the 
    doc (numeric ones) using script expression.</p>

    @name ejs.CustomScoreQuery

    @desc
    Scores a query based on a script.

    @param {Object} qry A valid query object.
    @param {String} script A valid script expression.
    */
  ejs.CustomScoreQuery = function (qry, script) {

    if (!isQuery(qry)) {
      throw new TypeError('Argument must be a Query');
    }
    
    /**
         The internal query object. <code>Use _self()</code>
         @member ejs.CustomScoreQuery
         @property {Object} query
         */
    var query = {
      custom_score: {
        query: qry._self(),
        script: script
      }
    };

    return {

      /**
            Sets the query to be apply the custom score to.

            @member ejs.CustomScoreQuery
            @param {Object} q A valid Query object
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      query: function (q) {
        if (q == null) {
          return query.custom_score.query;
        }
      
        if (!isQuery(q)) {
          throw new TypeError('Argument must be a Query');
        }
        
        query.custom_score.query = q._self();
        return this;
      },

      /**
            Sets the script that calculates the custom score

            @member ejs.CustomScoreQuery
            @param {String} s A valid script expression
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      script: function (s) {
        if (s == null) {
          return query.custom_score.script;
        }
      
        query.custom_score.script = s;
        return this;
      },

      /**
            Sets parameters that will be applied to the script.  Overwrites 
            any existing params.

            @member ejs.CustomScoreQuery
            @param {Object} p An object where the keys are the parameter name and 
              values are the parameter value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      params: function (p) {
        if (p == null) {
          return query.custom_score.params;
        }
      
        query.custom_score.params = p;
        return this;
      },
    
      /**
            Sets the language used in the script.  

            @member ejs.CustomScoreQuery
            @param {String} l The script language, defatuls to mvel.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lang: function (l) {
        if (l == null) {
          return query.custom_score.lang;
        }

        query.custom_score.lang = l;
        return this;
      },
    
      /**
            Sets the boost value of the <code>Query</code>.

            @member ejs.CustomScoreQuery
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.custom_score.boost;
        }

        query.custom_score.boost = boost;
        return this;
      },
          
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.CustomScoreQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.CustomScoreQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.CustomScoreQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
