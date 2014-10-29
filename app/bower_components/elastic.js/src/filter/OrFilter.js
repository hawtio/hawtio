  /**
    @class
    A container filter that allows Boolean OR composition of filters.

    @name ejs.OrFilter

    @desc
    A container Filter that allows Boolean OR composition of filters.

    @param {Filter || Array} filters A valid Filter or array of Filters.
    */
  ejs.OrFilter = function (filters) {

    /**
         The internal filter object. Use <code>_self()</code>

         @member ejs.OrFilter
         @property {Object} filter
         */
    var filter, i, len;

    filter = {
      or: {
        filters: []
      }
    };

    if (isFilter(filters)) {
      filter.or.filters.push(filters._self());
    } else if (isArray(filters)) {
      for (i = 0, len = filters.length; i < len; i++) {
        if (!isFilter(filters[i])) {
          throw new TypeError('Argument must be array of Filters');
        }
        
        filter.or.filters.push(filters[i]._self());
      }
    } else {
      throw new TypeError('Argument must be a Filter or array of Filters');
    }

    return {

      /**
             Updates the filters.  If passed a single Filter it is added to 
             the existing filters.  If passed an array of Filters, they 
             replace all existing Filters.

             @member ejs.OrFilter
             @param {Filter || Array} fltr A Filter or array of Filters
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      filters: function (fltr) {
        var i, len;
        
        if (fltr == null) {
          return filter.or.filters;
        }
      
        if (isFilter(fltr)) {
          filter.or.filters.push(fltr._self());
        } else if (isArray(fltr)) {
          filter.or.filters = [];
          for (i = 0, len = fltr.length; i < len; i++) {
            if (!isFilter(fltr[i])) {
              throw new TypeError('Argument must be an array of Filters');
            }
            
            filter.or.filters.push(fltr[i]._self());
          }
        } else {
          throw new TypeError('Argument must be a Filter or array of Filters');
        }
        
        return this;
      },

      /**
            Sets the filter name.

            @member ejs.OrFilter
            @param {String} name A name for the filter.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      name: function (name) {
        if (name == null) {
          return filter.or._name;
        }

        filter.or._name = name;
        return this;
      },

      /**
            Enable or disable caching of the filter

            @member ejs.OrFilter
            @param {Boolean} trueFalse True to cache the filter, false otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cache: function (trueFalse) {
        if (trueFalse == null) {
          return filter.or._cache;
        }

        filter.or._cache = trueFalse;
        return this;
      },

      /**
            Sets the cache key.

            @member ejs.OrFilter
            @param {String} key the cache key as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cacheKey: function (key) {
        if (key == null) {
          return filter.or._cache_key;
        }

        filter.or._cache_key = key;
        return this;
      },
      
      /**
             Returns the filter container as a JSON string

             @member ejs.OrFilter
             @returns {String} JSON representation of the orFilter object
             */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.OrFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
             Returns the filter object.

             @member ejs.OrFilter
             @returns {Object} filter object
             */
      _self: function () {
        return filter;
      }
    };
  };
