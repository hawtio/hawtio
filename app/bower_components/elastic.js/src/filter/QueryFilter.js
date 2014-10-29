  /**
    @class
    <p>Wraps any query to be used as a filter. Can be placed within queries 
    that accept a filter.</p>

    <p>The result of the filter is not cached by default.  Set the cache 
    parameter to true to cache the result of the filter. This is handy when the 
    same query is used on several (many) other queries.</p> 
  
    <p>Note, the process of caching the first execution is higher when not 
    caching (since it needs to satisfy different queries).</p>
  
    @name ejs.QueryFilter

    @desc
    Filters documents matching the wrapped query.

    @param {Object} qry A valid query object.
    */
  ejs.QueryFilter = function (qry) {

    if (!isQuery(qry)) {
      throw new TypeError('Argument must be a Query');
    }
    
    /**
         The internal query object. <code>Use _self()</code>
         @member ejs.QueryFilter
         @property {Object} query
         */
    var filter = {
      fquery: {
        query: qry._self()
      }
    };

    return {

      /**
            Sets the query

            @member ejs.QueryFilter
            @param {Object} q A valid Query object
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      query: function (q) {
        if (q == null) {
          return filter.fquery.query;
        }

        if (!isQuery(q)) {
          throw new TypeError('Argument must be a Query');
        }
        
        filter.fquery.query = q._self();
        return this;
      },

      /**
            Sets the filter name.

            @member ejs.QueryFilter
            @param {String} name A name for the filter.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      name: function (name) {
        if (name == null) {
          return filter.fquery._name;
        }

        filter.fquery._name = name;
        return this;
      },

      /**
            Enable or disable caching of the filter

            @member ejs.QueryFilter
            @param {Boolean} trueFalse True to cache the filter, false otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cache: function (trueFalse) {
        if (trueFalse == null) {
          return filter.fquery._cache;
        }

        filter.fquery._cache = trueFalse;
        return this;
      },
  
      /**
            Sets the cache key.

            @member ejs.QueryFilter
            @param {String} key the cache key as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cacheKey: function (key) {
        if (key == null) {
          return filter.fquery._cache_key;
        }

        filter.fquery._cache_key = key;
        return this;
      },
            
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.QueryFilter
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.QueryFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
            Retrieves the internal <code>filter</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.QueryFilter
            @returns {String} returns this object's internal <code>filter</code> property.
            */
      _self: function () {
        return filter;
      }
    };
  };
