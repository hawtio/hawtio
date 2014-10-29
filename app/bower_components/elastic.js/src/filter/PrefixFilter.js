  /**
    @class
    <p>Filters documents that have fields containing terms with a specified prefix (not analyzed). Similar
    to phrase query, except that it acts as a filter. Can be placed within queries that accept a filter.</p>

    @name ejs.PrefixFilter

    @desc
    Filters documents that have fields containing terms with a specified prefix.

    @param {String} fieldName the field name to be used during matching.
    @param {String} prefix the prefix value.
    */
  ejs.PrefixFilter = function (fieldName, prefix) {

    /**
         The internal filter object. Use <code>get()</code>

         @member ejs.PrefixFilter
         @property {Object} filter
         */
    var filter = {
      prefix: {}
    };

    filter.prefix[fieldName] = prefix;
    
    return {

      /**
             Returns the field name used to create this object.

             @member ejs.PrefixFilter
             @param {String} field the field name
             @returns {Object} returns <code>this</code> so that calls can be 
              chained. Returns {String}, field name when field is not specified.
             */
      field: function (field) {
        var oldValue = filter.prefix[fieldName];
      
        if (field == null) {
          return fieldName;
        }
      
        delete filter.prefix[fieldName];
        fieldName = field;
        filter.prefix[fieldName] = oldValue;
      
        return this;
      },
      
      /**
             Sets the prefix to search for.

             @member ejs.PrefixFilter
             @param {String} value the prefix value to match
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      prefix: function (value) {
        if (value == null) {
          return filter.prefix[fieldName];
        }
      
        filter.prefix[fieldName] = value;
        return this;
      },

      /**
            Sets the filter name.

            @member ejs.PrefixFilter
            @param {String} name A name for the filter.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      name: function (name) {
        if (name == null) {
          return filter.prefix._name;
        }

        filter.prefix._name = name;
        return this;
      },

      /**
            Enable or disable caching of the filter

            @member ejs.PrefixFilter
            @param {Boolean} trueFalse True to cache the filter, false otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cache: function (trueFalse) {
        if (trueFalse == null) {
          return filter.prefix._cache;
        }

        filter.prefix._cache = trueFalse;
        return this;
      },

      /**
            Sets the cache key.

            @member ejs.PrefixFilter
            @param {String} key the cache key as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cacheKey: function (key) {
        if (key == null) {
          return filter.prefix._cache_key;
        }

        filter.prefix._cache_key = key;
        return this;
      },
      
      /**
             Returns the filter container as a JSON string

             @member ejs.PrefixFilter
             @returns {String} JSON representation of the prefixFilter object
             */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.PrefixFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
             Returns the filter object.

             @member ejs.PrefixFilter
             @returns {Object} filter object
             */
      _self: function () {
        return filter;
      }
    };
  };
