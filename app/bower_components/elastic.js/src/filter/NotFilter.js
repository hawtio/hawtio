  /**
    @class
    <p>A container Filter that excludes the documents matched by the
    contained filter.</p>

    @name ejs.NotFilter

    @desc
    Container filter that excludes the matched documents of the contained filter.

    @param {Object} oFilter a valid Filter object such as a termFilter, etc.
    */
  ejs.NotFilter = function (oFilter) {

    if (!isFilter(oFilter)) {
      throw new TypeError('Argument must be a Filter');
    }
    
    /**
         The internal filter object. Use <code>_self()</code>

         @member ejs.NotFilter
         @property {Object} filter
         */
    var filter = {
      not: oFilter._self()
    };

    return {

      /**
             Sets the filter

             @member ejs.NotFilter
             @param {Object} fltr A valid filter object such as a termFilter, etc.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      filter: function (fltr) {
        if (fltr == null) {
          return filter.not;
        }
      
        if (!isFilter(fltr)) {
          throw new TypeError('Argument must be a Filter');
        }
        
        filter.not = fltr._self();
        return this;
      },

      /**
            Sets the filter name.

            @member ejs.NotFilter
            @param {String} name A name for the filter.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      name: function (name) {
        if (name == null) {
          return filter.not._name;
        }

        filter.not._name = name;
        return this;
      },

      /**
            Enable or disable caching of the filter

            @member ejs.NotFilter
            @param {Boolean} trueFalse True to cache the filter, false otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cache: function (trueFalse) {
        if (trueFalse == null) {
          return filter.not._cache;
        }

        filter.not._cache = trueFalse;
        return this;
      },
    
      /**
            Sets the cache key.

            @member ejs.NotFilter
            @param {String} key the cache key as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cacheKey: function (key) {
        if (key == null) {
          return filter.not._cache_key;
        }

        filter.not._cache_key = key;
        return this;
      },
      
      /**
             Returns the filter container as a JSON string

             @member ejs.NotFilter
             @returns {String} JSON representation of the notFilter object
             */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.NotFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
             Returns the filter object.

             @member ejs.NotFilter
             @returns {Object} filter object
             */
      _self: function () {
        return filter;
      }
    };
  };
