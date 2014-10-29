  /**
    @class
    <p>A limit filter limits the number of documents (per shard) to execute on.</p>

    @name ejs.LimitFilter

    @desc
    Limits the number of documents to execute on.

    @param {Integer} limit The number of documents to execute on.
    */
  ejs.LimitFilter = function (limit) {

    /**
         The internal filter object. <code>Use get()</code>
         @member ejs.LimitFilter
         @property {Object} filter
         */
    var filter = {
      limit: {
        value: limit
      }
    };

    return {

      /**
            Sets the limit value.

            @member ejs.LimitFilter
            @param {Integer} val An The number of documents to execute on.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      value: function (val) {
        if (val == null) {
          return filter.limit.value;
        }

        if (!isNumber(val)) {
          throw new TypeError('Argument must be a numeric value');
        }
            
        filter.limit.value = val;
        return this;
      },
           
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.LimitFilter
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.LimitFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
            Retrieves the internal <code>filter</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.LimitFilter
            @returns {String} returns this object's internal <code>filter</code> property.
            */
      _self: function () {
        return filter;
      }
    };
  };
