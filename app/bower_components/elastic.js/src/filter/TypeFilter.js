  /**
    @class
    <p>A Filter that filters results by a specified index type.</p>

    @name ejs.TypeFilter

    @desc
    Filter results by a specified index type.

    @param {String} type the index type to filter on.
    */
  ejs.TypeFilter = function (type) {

    /**
         The internal filter object. Use <code>get()</code>

         @member ejs.TypeFilter
         @property {Object} filter
         */
    var filter = {
      "type": {
        "value": type
      }
    };

    return {

      /**
             * Sets the type

             @member ejs.TypeFilter
             @param {String} type the index type to filter on
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      type: function (type) {
        if (type == null) {
          return filter.type.value;
        }
      
        filter.type.value = type;
        return this;
      },

      /**
             Returns the filter container as a JSON string

             @member ejs.TypeFilter
             @returns {String} JSON representation of the notFilter object
             */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.TypeFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
             Returns the filter object.

             @member ejs.TypeFilter
             @returns {Object} filter object
             */
      _self: function () {
        return filter;
      }
    };
  };
