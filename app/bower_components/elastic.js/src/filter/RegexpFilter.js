  /**
    @class
    <p>Filters documents that have a field value matching a regular expression. 
    Based on Lucene 4.0 RegexpFilter which uses automaton to efficiently iterate 
    over index terms.</p>

    @name ejs.RegexpFilter

    @desc
    Matches documents that have fields matching a regular expression.

    @param {String} field A valid field name.
    @param {String} value A regex pattern.
    */
  ejs.RegexpFilter = function (field, value) {

    /**
         The internal filter object. <code>Use get()</code>
         @member ejs.RegexpFilter
         @property {Object} filter
         */
    var filter = {
      regexp: {}
    };

    filter.regexp[field] = {
      value: value
    };

    return {

      /**
             The field to run the filter against.

             @member ejs.RegexpFilter
             @param {String} f A single field name.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      field: function (f) {
        var oldValue = filter.regexp[field];

        if (f == null) {
          return field;
        }

        delete filter.regexp[field];
        field = f;
        filter.regexp[f] = oldValue;

        return this;
      },

      /**
            The regexp value.

            @member ejs.RegexpFilter
            @param {String} p A string regexp
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      value: function (p) {
        if (p == null) {
          return filter.regexp[field].value;
        }

        filter.regexp[field].value = p;
        return this;
      },

      /**
            The regex flags to use.  Valid flags are:
        
            INTERSECTION - Support for intersection notation
            COMPLEMENT - Support for complement notation
            EMPTY - Support for the empty language symbol: #
            ANYSTRING - Support for the any string symbol: @
            INTERVAL - Support for numerical interval notation: <n-m>
            NONE - Disable support for all syntax options
            ALL - Enables support for all syntax options
        
            Use multiple flags by separating with a "|" character.  Example:
        
            INTERSECTION|COMPLEMENT|EMPTY

            @member ejs.RegexpFilter
            @param {String} f The flags as a string, separate multiple flags with "|".
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      flags: function (f) {
        if (f == null) {
          return filter.regexp[field].flags;
        }

        filter.regexp[field].flags = f;
        return this;
      },
  
      /**
            The regex flags to use as a numeric value.  Advanced use only,
            it is probably better to stick with the <code>flags</code> option.
        
            @member ejs.RegexpFilter
            @param {String} v The flags as a numeric value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      flagsValue: function (v) {
        if (v == null) {
          return filter.regexp[field].flags_value;
        }

        filter.regexp[field].flags_value = v;
        return this;
      },

      /**
            Sets the filter name.

            @member ejs.RegexpFilter
            @param {String} name A name for the filter.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      name: function (name) {
        if (name == null) {
          return filter.regexp._name;
        }

        filter.regexp._name = name;
        return this;
      },

      /**
            Enable or disable caching of the filter

            @member ejs.RegexpFilter
            @param {Boolean} trueFalse True to cache the filter, false otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cache: function (trueFalse) {
        if (trueFalse == null) {
          return filter.regexp._cache;
        }

        filter.regexp._cache = trueFalse;
        return this;
      },

      /**
            Sets the cache key.

            @member ejs.RegexpFilter
            @param {String} key the cache key as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cacheKey: function (key) {
        if (key == null) {
          return filter.regexp._cache_key;
        }

        filter.regexp._cache_key = key;
        return this;
      },
      
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.RegexpFilter
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
        
            @member ejs.RegexpFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
  
      /**
            Retrieves the internal <code>filter</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.RegexpFilter
            @returns {String} returns this object's internal <code>filter</code> property.
            */
      _self: function () {
        return filter;
      }
    };
  };
