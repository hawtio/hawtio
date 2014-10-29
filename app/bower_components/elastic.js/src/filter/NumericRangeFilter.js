  /**
    @class
    <p>Filters documents with fields that have values within a certain numeric 
    range. Similar to range filter, except that it works only with numeric 
    values, and the filter execution works differently.</p>
    
    <p>The numeric range filter works by loading all the relevant field values 
    into memory, and checking for the relevant docs if they satisfy the range 
    requirements. This requires more memory since the numeric range data are 
    loaded to memory, but can provide a significant increase in performance.</p> 
    
    <p>Note, if the relevant field values have already been loaded to memory, 
    for example because it was used in facets or was sorted on, then this 
    filter should be used.</p>

    @name ejs.NumericRangeFilter

    @desc
    A Filter that only accepts numeric values within a specified range.

    @param {string} fieldName The name of the field to filter on.
    */
  ejs.NumericRangeFilter = function (fieldName) {

    /**
         The internal filter object. Use <code>get()</code>

         @member ejs.NumericRangeFilter
         @property {Object} filter
         */
    var filter = {
      numeric_range: {}
    };

    filter.numeric_range[fieldName] = {};

    return {

      /**
             Returns the field name used to create this object.

             @member ejs.NumericRangeFilter
             @param {String} field the field name
             @returns {Object} returns <code>this</code> so that calls can be 
              chained. Returns {String}, field name when field is not specified.
             */
      field: function (field) {
        var oldValue = filter.numeric_range[fieldName];
      
        if (field == null) {
          return fieldName;
        }
      
        delete filter.numeric_range[fieldName];
        fieldName = field;
        filter.numeric_range[fieldName] = oldValue;
      
        return this;
      },
      
      /**
             Sets the endpoint for the current range.

             @member ejs.NumericRangeFilter
             @param {Number} startPoint A numeric value representing the start of the range
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      from: function (from) {
        if (from == null) {
          return filter.numeric_range[fieldName].from;
        }
        
        if (!isNumber(from)) {
          throw new TypeError('Argument must be a numeric value');
        }
        
        filter.numeric_range[fieldName].from = from;
        return this;
      },

      /**
             Sets the endpoint for the current range.

             @member ejs.NumericRangeFilter
             @param {Number} endPoint A numeric value representing the end of the range
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      to: function (to) {
        if (to == null) {
          return filter.numeric_range[fieldName].to;
        }

        if (!isNumber(to)) {
          throw new TypeError('Argument must be a numeric value');
        }
        
        filter.numeric_range[fieldName].to = to;
        return this;
      },

      /**
            Should the first from (if set) be inclusive or not. 
            Defaults to true

            @member ejs.NumericRangeFilter
            @param {Boolean} trueFalse true to include, false to exclude 
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      includeLower: function (trueFalse) {
        if (trueFalse == null) {
          return filter.numeric_range[fieldName].include_lower;
        }

        filter.numeric_range[fieldName].include_lower = trueFalse;
        return this;
      },

      /**
            Should the last to (if set) be inclusive or not. Defaults to true.

            @member ejs.NumericRangeFilter
            @param {Boolean} trueFalse true to include, false to exclude 
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      includeUpper: function (trueFalse) {
        if (trueFalse == null) {
          return filter.numeric_range[fieldName].include_upper;
        }

        filter.numeric_range[fieldName].include_upper = trueFalse;
        return this;
      },

      /**
            Greater than value.  Same as setting from to the value, and 
            include_lower to false,

            @member ejs.NumericRangeFilter
            @param {Variable Type} val the value, type depends on field type
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      gt: function (val) {
        if (val == null) {
          return filter.numeric_range[fieldName].gt;
        }

        if (!isNumber(val)) {
          throw new TypeError('Argument must be a numeric value');
        }
        
        filter.numeric_range[fieldName].gt = val;
        return this;
      },

      /**
            Greater than or equal to value.  Same as setting from to the value,
            and include_lower to true.

            @member ejs.NumericRangeFilter
            @param {Variable Type} val the value, type depends on field type
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      gte: function (val) {
        if (val == null) {
          return filter.numeric_range[fieldName].gte;
        }

        if (!isNumber(val)) {
          throw new TypeError('Argument must be a numeric value');
        }
        
        filter.numeric_range[fieldName].gte = val;
        return this;
      },

      /**
            Less than value.  Same as setting to to the value, and include_upper 
            to false.

            @member ejs.NumericRangeFilter
            @param {Variable Type} val the value, type depends on field type
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lt: function (val) {
        if (val == null) {
          return filter.numeric_range[fieldName].lt;
        }

        if (!isNumber(val)) {
          throw new TypeError('Argument must be a numeric value');
        }
        
        filter.numeric_range[fieldName].lt = val;
        return this;
      },

      /**
            Less than or equal to value.  Same as setting to to the value, 
            and include_upper to true.

            @member ejs.NumericRangeFilter
            @param {Variable Type} val the value, type depends on field type
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lte: function (val) {
        if (val == null) {
          return filter.numeric_range[fieldName].lte;
        }

        if (!isNumber(val)) {
          throw new TypeError('Argument must be a numeric value');
        }
        
        filter.numeric_range[fieldName].lte = val;
        return this;
      },
                          
      /**
            Sets the filter name.

            @member ejs.NumericRangeFilter
            @param {String} name A name for the filter.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      name: function (name) {
        if (name == null) {
          return filter.numeric_range._name;
        }

        filter.numeric_range._name = name;
        return this;
      },

      /**
            Enable or disable caching of the filter

            @member ejs.NumericRangeFilter
            @param {Boolean} trueFalse True to cache the filter, false otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cache: function (trueFalse) {
        if (trueFalse == null) {
          return filter.numeric_range._cache;
        }

        filter.numeric_range._cache = trueFalse;
        return this;
      },

      /**
            Sets the cache key.

            @member ejs.NumericRangeFilter
            @param {String} key the cache key as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cacheKey: function (key) {
        if (key == null) {
          return filter.numeric_range._cache_key;
        }

        filter.numeric_range._cache_key = key;
        return this;
      },
      
      /**
             Returns the filter container as a JSON string.

             @member ejs.NumericRangeFilter
             @returns {String} JSON representation of the numericRangeFilter object
             */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.NumericRangeFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
             Returns the filter object.

             @member ejs.NumericRangeFilter
             @returns {Object} filter object
             */
      _self: function () {
        return filter;
      }
    };
  };
