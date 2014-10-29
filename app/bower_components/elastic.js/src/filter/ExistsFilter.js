  /**
    @class
    <p>An existsFilter matches documents where the specified field is present
    and the field contains a legitimate value.</p>

    @name ejs.ExistsFilter

    @desc
    Filters documents where a specified field exists and contains a value.

    @param {String} fieldName the field name that must exists and contain a value.
    */
  ejs.ExistsFilter = function (fieldName) {

    /**
         The internal filter object. Use <code>get()</code>

         @member ejs.ExistsFilter
         @property {Object} filter
         */
    var filter = {
      exists: {
        field: fieldName
      }
    };

    return {

      /**
            Sets the field to check for missing values.

            @member ejs.ExistsFilter
            @param {String} name A name of the field.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (name) {
        if (name == null) {
          return filter.exists.field;
        }

        filter.exists.field = name;
        return this;
      },
      
      /**
            Sets the filter name.

            @member ejs.ExistsFilter
            @param {String} name A name for the filter.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      name: function (name) {
        if (name == null) {
          return filter.exists._name;
        }

        filter.exists._name = name;
        return this;
      },
      
      /**
             Returns the filter container as a JSON string

             @member ejs.ExistsFilter
             @returns {String} JSON representation of the existsFilter object
             */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.ExistsFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
             Returns the filter object.

             @member ejs.ExistsFilter
             @returns {Object} filter object
             */
      _self: function () {
        return filter;
      }
    };
  };
