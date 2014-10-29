  /**
    @class
    <p>Matches documents with fields that have terms within a certain range.</p>

    @name ejs.RangeFilter

    @desc
    Filters documents with fields that have terms within a certain range.

    @param {String} field A valid field name.
    */
  ejs.RangeFilter = function (field) {

    /**
         The internal filter object. <code>Use get()</code>
         @member ejs.RangeFilter
         @property {Object} filter
         */
    var filter = {
      range: {}
    };

    filter.range[field] = {};

    return {

      /**
             The field to run the filter against.

             @member ejs.RangeFilter
             @param {String} f A single field name.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      field: function (f) {
        var oldValue = filter.range[field];

        if (f == null) {
          return field;
        }

        delete filter.range[field];
        field = f;
        filter.range[f] = oldValue;

        return this;
      },

      /**
            The lower bound. Defaults to start from the first.

            @member ejs.RangeFilter
            @param {Variable Type} f the lower bound value, type depends on field type
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      from: function (f) {
        if (f == null) {
          return filter.range[field].from;
        }

        filter.range[field].from = f;
        return this;
      },

      /**
            The upper bound. Defaults to unbounded.

            @member ejs.RangeFilter
            @param {Variable Type} t the upper bound value, type depends on field type
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      to: function (t) {
        if (t == null) {
          return filter.range[field].to;
        }

        filter.range[field].to = t;
        return this;
      },

      /**
            Should the first from (if set) be inclusive or not. 
            Defaults to true

            @member ejs.RangeFilter
            @param {Boolean} trueFalse true to include, false to exclude 
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      includeLower: function (trueFalse) {
        if (trueFalse == null) {
          return filter.range[field].include_lower;
        }

        filter.range[field].include_lower = trueFalse;
        return this;
      },

      /**
            Should the last to (if set) be inclusive or not. Defaults to true.

            @member ejs.RangeFilter
            @param {Boolean} trueFalse true to include, false to exclude 
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      includeUpper: function (trueFalse) {
        if (trueFalse == null) {
          return filter.range[field].include_upper;
        }

        filter.range[field].include_upper = trueFalse;
        return this;
      },

      /**
            Greater than value.  Same as setting from to the value, and 
            include_lower to false,

            @member ejs.RangeFilter
            @param {Variable Type} val the value, type depends on field type
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      gt: function (val) {
        if (val == null) {
          return filter.range[field].gt;
        }

        filter.range[field].gt = val;
        return this;
      },

      /**
            Greater than or equal to value.  Same as setting from to the value,
            and include_lower to true.

            @member ejs.RangeFilter
            @param {Variable Type} val the value, type depends on field type
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      gte: function (val) {
        if (val == null) {
          return filter.range[field].gte;
        }

        filter.range[field].gte = val;
        return this;
      },

      /**
            Less than value.  Same as setting to to the value, and include_upper 
            to false.

            @member ejs.RangeFilter
            @param {Variable Type} val the value, type depends on field type
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lt: function (val) {
        if (val == null) {
          return filter.range[field].lt;
        }

        filter.range[field].lt = val;
        return this;
      },

      /**
            Less than or equal to value.  Same as setting to to the value, 
            and include_upper to true.

            @member ejs.RangeFilter
            @param {Variable Type} val the value, type depends on field type
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lte: function (val) {
        if (val == null) {
          return filter.range[field].lte;
        }

        filter.range[field].lte = val;
        return this;
      },
                          
      /**
            Sets the filter name.

            @member ejs.RangeFilter
            @param {String} name A name for the filter.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      name: function (name) {
        if (name == null) {
          return filter.range._name;
        }

        filter.range._name = name;
        return this;
      },

      /**
            Enable or disable caching of the filter

            @member ejs.RangeFilter
            @param {Boolean} trueFalse True to cache the filter, false otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cache: function (trueFalse) {
        if (trueFalse == null) {
          return filter.range._cache;
        }

        filter.range._cache = trueFalse;
        return this;
      },

      /**
            Sets the cache key.

            @member ejs.RangeFilter
            @param {String} key the cache key as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cacheKey: function (key) {
        if (key == null) {
          return filter.range._cache_key;
        }

        filter.range._cache_key = key;
        return this;
      },
    
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.RangeFilter
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.RangeFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
            Retrieves the internal <code>filter</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.RangeFilter
            @returns {String} returns this object's internal <code>filter</code> property.
            */
      _self: function () {
        return filter;
      }
    };
  };
