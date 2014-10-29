  /**
    @class
    <p>The has_child filter results in parent documents that have child docs 
    matching the query being returned.</p>

    @name ejs.HasChildFilter

    @desc
    Returns results that have child documents matching the filter.

    @param {Object} qry A valid query object.
    @param {String} type The child type
    */
  ejs.HasChildFilter = function (qry, type) {

    if (!isQuery(qry)) {
      throw new TypeError('No Query object found');
    }
    
    /**
         The internal query object. <code>Use _self()</code>
         @member ejs.HasChildFilter
         @property {Object} query
         */
    var filter = {
      has_child: {
        query: qry._self(),
        type: type
      }
    };

    return {

      /**
            Sets the query

            @member ejs.HasChildFilter
            @param {Query} q A valid Query object
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      query: function (q) {
        if (q == null) {
          return filter.has_child.query;
        }
  
        if (!isQuery(q)) {
          throw new TypeError('Argument must be a Query object');
        }
        
        filter.has_child.query = q._self();
        return this;
      },

      /**
            Sets the filter

            @since elasticsearch 0.90
            @member ejs.HasChildFilter
            @param {Query} f A valid Filter object
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      filter: function (f) {
        if (f == null) {
          return filter.has_child.filter;
        }
  
        if (!isFilter(f)) {
          throw new TypeError('Argument must be a Filter object');
        }
        
        filter.has_child.filter = f._self();
        return this;
      },

      /**
            Sets the child document type to search against

            @member ejs.HasChildFilter
            @param {String} t A valid type name
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      type: function (t) {
        if (t == null) {
          return filter.has_child.type;
        }
  
        filter.has_child.type = t;
        return this;
      },

      /**
            Sets the scope of the filter.  A scope allows to run facets on the 
            same scope name that will work against the child documents. 

            @deprecated since elasticsearch 0.90
            @member ejs.HasChildFilter
            @param {String} s The scope name as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      scope: function (s) {
        return this;
      },

      /**
            Sets the filter name.

            @member ejs.HasChildFilter
            @param {String} name A name for the filter.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      name: function (name) {
        if (name == null) {
          return filter.has_child._name;
        }

        filter.has_child._name = name;
        return this;
      },

      /**
            Enable or disable caching of the filter

            @member ejs.HasChildFilter
            @param {Boolean} trueFalse True to cache the filter, false otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cache: function (trueFalse) {
        if (trueFalse == null) {
          return filter.has_child._cache;
        }

        filter.has_child._cache = trueFalse;
        return this;
      },
  
      /**
            Sets the cache key.

            @member ejs.HasChildFilter
            @param {String} key the cache key as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cacheKey: function (key) {
        if (key == null) {
          return filter.has_child._cache_key;
        }

        filter.has_child._cache_key = key;
        return this;
      },
         
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.HasChildFilter
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.HasChildFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
            Retrieves the internal <code>filter</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.HasChildFilter
            @returns {String} returns this object's internal <code>filter</code> property.
            */
      _self: function () {
        return filter;
      }
    };
  };
