  /**
    @class
    A container Filter that allows Boolean AND composition of Filters.

    @name ejs.AndFilter

    @desc
    A container Filter that allows Boolean AND composition of Filters.

    @param {Filter || Array} f A single Filter object or an array of valid 
      Filter objects.
    */
  ejs.AndFilter = function (f) {

    /**
         The internal filter object. Use <code>_self()</code>

         @member ejs.AndFilter
         @property {Object} filter
         */
    var i,
      len,
      filter = {
        and: {
          filters: []
        }
      };

    if (isFilter(f)) {
      filter.and.filters.push(f._self());
    } else if (isArray(f)) {
      for (i = 0, len = f.length; i < len; i++) {
        if (!isFilter(f[i])) {
          throw new TypeError('Array must contain only Filter objects');
        }
        
        filter.and.filters.push(f[i]._self());
      }
    } else {
      throw new TypeError('Argument must be a Filter or Array of Filters');
    }

    return {

      /**
             Sets the filters for the filter.  If fltr is a single 
             Filter, it is added to the current filters.  If fltr is an array
             of Filters, then they replace all existing filters.

             @member ejs.AndFilter
             @param {Filter || Array} fltr A valid filter object or an array of filters.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      filters: function (fltr) {
        var i,
          len;
          
        if (fltr == null) {
          return filter.and.filters;
        }
      
        if (isFilter(fltr)) {
          filter.and.filters.push(fltr._self());
        } else if (isArray(fltr)) {
          filter.and.filters = [];
          for (i = 0, len = fltr.length; i < len; i++) {
            if (!isFilter(fltr[i])) {
              throw new TypeError('Array must contain only Filter objects');
            }
            
            filter.and.filters.push(fltr[i]._self());
          }
        } else {
          throw new TypeError('Argument must be a Filter or an Array of Filters');
        }
        
        return this;
      },

      /**
            Sets the filter name.

            @member ejs.AndFilter
            @param {String} name A name for the filter.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      name: function (name) {
        if (name == null) {
          return filter.and._name;
        }

        filter.and._name = name;
        return this;
      },

      /**
            Enable or disable caching of the filter

            @member ejs.AndFilter
            @param {Boolean} trueFalse True to cache the filter, false otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cache: function (trueFalse) {
        if (trueFalse == null) {
          return filter.and._cache;
        }

        filter.and._cache = trueFalse;
        return this;
      },
  
      /**
            Sets the cache key.

            @member ejs.AndFilter
            @param {String} key the cache key as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cacheKey: function (key) {
        if (key == null) {
          return filter.and._cache_key;
        }

        filter.and._cache_key = key;
        return this;
      },
      
      /**
             Returns the filter container as a JSON string

             @member ejs.AndFilter
             @returns {String} JSON representation of the andFilter object
             */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.AndFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
             Returns the filter object.

             @member ejs.AndFilter
             @returns {Object} filter object
             */
      _self: function () {
        return filter;
      }
    };
  };
