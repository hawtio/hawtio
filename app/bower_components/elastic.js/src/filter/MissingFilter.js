  /**
    @class
    <p>An missingFilter matches documents where the specified field contains no legitimate value.</p>

    @name ejs.MissingFilter

    @desc
    Filters documents where a specific field has no value present.

    @param {String} fieldName the field name to check for missing values.
    */
  ejs.MissingFilter = function (fieldName) {

    /**
         The internal filter object. Use <code>get()</code>

         @member ejs.MissingFilter
         @property {Object} filter
         */
    var filter = {
      missing: {
        field: fieldName
      }
    };

    return {

      /**
            Sets the field to check for missing values.

            @member ejs.MissingFilter
            @param {String} name A name of the field.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (name) {
        if (name == null) {
          return filter.missing.field;
        }

        filter.missing.field = name;
        return this;
      },
      
      /**
            Checks if the field doesn't exist.

            @member ejs.MissingFilter
            @param {Boolean} trueFalse True to check if the field doesn't exist.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      existence: function (trueFalse) {
        if (trueFalse == null) {
          return filter.missing.existence;
        }

        filter.missing.existence = trueFalse;
        return this;
      },

      /**
            Checks if the field has null values.

            @member ejs.MissingFilter
            @param {Boolean} trueFalse True to check if the field has nulls.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      nullValue: function (trueFalse) {
        if (trueFalse == null) {
          return filter.missing.null_value;
        }

        filter.missing.null_value = trueFalse;
        return this;
      },
            
      /**
            Sets the filter name.

            @member ejs.MissingFilter
            @param {String} name A name for the filter.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      name: function (name) {
        if (name == null) {
          return filter.missing._name;
        }

        filter.missing._name = name;
        return this;
      },
      
      /**
             Returns the filter container as a JSON string

             @member ejs.MissingFilter
             @returns {String} JSON representation of the missingFilter object
             */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.MissingFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
             Returns the filter object.

             @member ejs.MissingFilter
             @returns {Object} filter object
             */
      _self: function () {
        return filter;
      }
    };
  };
