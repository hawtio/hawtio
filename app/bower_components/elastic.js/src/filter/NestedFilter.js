  /**
    @class
    <p>Nested filters allow you to search against content within objects that are
       embedded inside of other objects. It is similar to <code>XPath</code> 
       expressions in <code>XML</code> both conceptually and syntactically.</p>

    <p>
    The filter is executed against the nested objects / docs as if they were 
    indexed as separate docs and resulting in the root 
    parent doc (or parent nested mapping).</p>
  
    @name ejs.NestedFilter

    @desc
    <p>Constructs a filter that is capable of executing a filter against objects
       nested within a document.</p>

    @param {String} path The nested object path.

     */
  ejs.NestedFilter = function (path) {

    /**
         The internal Filter object. Use <code>_self()</code>.
         @member ejs.NestedFilter
         @property {Object} filter
         */
    var filter = {
      nested: {
        path: path
      }
    };

    return {
    
      /**
             Sets the root context for the nested filter.
             @member ejs.NestedFilter
             @param {String} p The path defining the root for the nested filter.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      path: function (p) {
        if (p == null) {
          return filter.nested.path;
        }
    
        filter.nested.path = p;
        return this;
      },

      /**
             Sets the nested query to be executed.
             @member ejs.NestedFilter
             @param {Query} oQuery A valid Query object
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      query: function (oQuery) {
        if (oQuery == null) {
          return filter.nested.query;
        }
    
        if (!isQuery(oQuery)) {
          throw new TypeError('Argument must be a Query object');
        }
        
        filter.nested.query = oQuery._self();
        return this;
      },


      /**
             Sets the nested filter to be executed.
             @member ejs.NestedFilter
             @param {Object} oFilter A valid Filter object
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      filter: function (oFilter) {
        if (oFilter == null) {
          return filter.nested.filter;
        }
    
        if (!isFilter(oFilter)) {
          throw new TypeError('Argument must be a Filter object');
        }
        
        filter.nested.filter = oFilter._self();
        return this;
      },

      /**
            Sets the boost value of the nested <code>Query</code>.

            @member ejs.NestedFilter
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return filter.nested.boost;
        }

        filter.nested.boost = boost;
        return this;
      },
    
      /**
            If the nested query should be "joined" with the parent document.
            Defaults to false.

            @member ejs.NestedFilter
            @param {Boolean} trueFalse If the query should be joined or not.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      join: function (trueFalse) {
        if (trueFalse == null) {
          return filter.nested.join;
        }

        filter.nested.join = trueFalse;
        return this;
      },
    
      /**
            Sets the scope of the filter.  A scope allows to run facets on the 
            same scope name that will work against the nested documents. 

            @deprecated since elasticsearch 0.90
            @member ejs.NestedFilter
            @param {String} s The scope name as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      scope: function (s) {
        return this;
      },
      
      /**
            Sets the filter name.

            @member ejs.NestedFilter
            @param {String} name A name for the filter.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      name: function (name) {
        if (name == null) {
          return filter.nested._name;
        }

        filter.nested._name = name;
        return this;
      },

      /**
            Enable or disable caching of the filter

            @member ejs.NestedFilter
            @param {Boolean} trueFalse True to cache the filter, false otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cache: function (trueFalse) {
        if (trueFalse == null) {
          return filter.nested._cache;
        }

        filter.nested._cache = trueFalse;
        return this;
      },
  
      /**
            Sets the cache key.

            @member ejs.NestedFilter
            @param {String} key the cache key as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cacheKey: function (key) {
        if (key == null) {
          return filter.nested._cache_key;
        }

        filter.nested._cache_key = key;
        return this;
      },
    
      /**
             Serializes the internal <em>filter</em> object as a JSON string.
             @member ejs.NestedFilter
             @returns {String} Returns a JSON representation of the termFilter object.
             */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.NestedFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
            This method is used to retrieve the raw filter object. It's designed
            for internal use when composing and serializing filters.
            
            @member ejs.NestedFilter
            @returns {Object} Returns the object's <em>filter</em> property.
            */
      _self: function () {
        return filter;
      }
    };
  };
