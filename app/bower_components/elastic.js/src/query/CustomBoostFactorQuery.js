  /**
    @class
    <p>A query allows to wrap another query and multiply its score by the 
    provided boost_factor. This can sometimes be desired since boost value set 
    on specific queries gets normalized, while this query boost factor does not.</p>

    @name ejs.CustomBoostFactorQuery

    @desc
    Boosts a queries score without that boost being normalized.

    @param {Object} qry A valid query object.
    */
  ejs.CustomBoostFactorQuery = function (qry) {

    if (!isQuery(qry)) {
      throw new TypeError('Argument must be a Query');
    }
    
    /**
         The internal query object. <code>Use _self()</code>
         @member ejs.CustomBoostFactorQuery
         @property {Object} query
         */
    var query = {
      custom_boost_factor: {
        query: qry._self()
      }
    };

    return {

      /**
            Sets the query to be apply the custom boost to.

            @member ejs.CustomBoostFactorQuery
            @param {Object} q A valid Query object
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      query: function (q) {
        if (q == null) {
          return query.custom_boost_factor.query;
        }
    
        if (!isQuery(q)) {
          throw new TypeError('Argument must be a Query');
        }
        
        query.custom_boost_factor.query = q._self();
        return this;
      },
  
      /**
            Sets the language used in the script.  

            @member ejs.CustomBoostFactorQuery
            @param {Double} boost The boost value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boostFactor: function (boost) {
        if (boost == null) {
          return query.custom_boost_factor.boost_factor;
        }

        query.custom_boost_factor.boost_factor = boost;
        return this;
      },
  
      /**
            Sets the boost value of the <code>Query</code>.

            @member ejs.CustomBoostFactorQuery
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.custom_boost_factor.boost;
        }

        query.custom_boost_factor.boost = boost;
        return this;
      },
        
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.CustomBoostFactorQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.CustomBoostFactorQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.CustomBoostFactorQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
