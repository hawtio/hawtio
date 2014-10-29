  /**
    @class
    <p>Constructs a filter for docs matching any of the terms added to this
    object. Unlike a RangeFilter this can be used for filtering on multiple
    terms that are not necessarily in a sequence.</p>

    @name ejs.TermFilter

    @desc
    Constructs a filter for docs matching the term added to this object.

    @param {string} fieldName The document field/fieldName to execute the filter against.
    @param {string} term The literal term used to filter the results.
    */
  ejs.TermFilter = function (fieldName, term) {

    /**
         The internal filter object. Use the get() method for access.
         @member ejs.TermFilter
         @property {Object} filter
         */
    var filter = {
      term: {}
    };

    filter.term[fieldName] = term;

    return {

      /**
             Provides access to the filter fieldName used to construct the 
             termFilter object.
             
             @member ejs.TermFilter
             @param {String} f the fieldName term
             @returns {Object} returns <code>this</code> so that calls can be chained.
              When k is not specified, Returns {String}, the filter fieldName used to construct 
              the termFilter object.
             */
      field: function (f) {
        var oldValue = filter.term[fieldName];
      
        if (f == null) {
          return fieldName;
        }
      
        delete filter.term[fieldName];
        fieldName = f;
        filter.term[fieldName] = oldValue;
      
        return this;
      },

      /**
             Provides access to the filter term used to construct the 
             termFilter object.
             
             @member ejs.TermFilter
             @returns {Object} returns <code>this</code> so that calls can be chained.
              When k is not specified, Returns {String}, the filter term used 
              to construct the termFilter object.
             */
      term: function (v) {
        if (v == null) {
          return filter.term[fieldName];
        }
      
        filter.term[fieldName] = v;
        return this;
      },

      /**
            Sets the filter name.

            @member ejs.TermFilter
            @param {String} name A name for the filter.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      name: function (name) {
        if (name == null) {
          return filter.term._name;
        }

        filter.term._name = name;
        return this;
      },

      /**
            Enable or disable caching of the filter

            @member ejs.TermFilter
            @param {Boolean} trueFalse True to cache the filter, false otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cache: function (trueFalse) {
        if (trueFalse == null) {
          return filter.term._cache;
        }

        filter.term._cache = trueFalse;
        return this;
      },

      /**
            Sets the cache key.

            @member ejs.TermFilter
            @param {String} key the cache key as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cacheKey: function (key) {
        if (key == null) {
          return filter.term._cache_key;
        }

        filter.term._cache_key = key;
        return this;
      },
      
      /**
             Serializes the internal filter object as a JSON string.
             
             @member ejs.TermFilter
             @returns {String} Returns a JSON representation of the termFilter object.
             */
      toString: function () {
        return JSON.stringify(filter);
      },
    
      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.TermFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
            Returns the filter object.  For internal use only.
            
            @member ejs.TermFilter
            @returns {Object} Returns the object's filter property.
            */
      _self: function () {
        return filter;
      }
    };
  };
