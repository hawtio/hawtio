  /**
    @class
    <p>A filter allowing to define scripts as filters</p>

    @name ejs.ScriptFilter

    @desc
    A filter allowing to define scripts as filters.

    @param {String} script The script as a string.
    */
  ejs.ScriptFilter = function (script) {

    /**
         The internal filter object. <code>Use get()</code>
         @member ejs.ScriptFilter
         @property {Object} filter
         */
    var filter = {
      script: {
        script: script
      }
    };

    return {

      /**
            Sets the script.

            @member ejs.ScriptFilter
            @param {String} s The script as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      script: function (s) {
        if (s == null) {
          return filter.script.script;
        }
  
        filter.script.script = s;
        return this;
      },

      /**
            Sets parameters that will be applied to the script.  Overwrites 
            any existing params.

            @member ejs.ScriptFilter
            @param {Object} p An object where the keys are the parameter name and 
              values are the parameter value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      params: function (p) {
        if (p == null) {
          return filter.script.params;
        }
    
        filter.script.params = p;
        return this;
      },
    
      /**
            Sets the script language.

            @member ejs.ScriptFilter
            @param {String} lang The script language, default mvel.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lang: function (lang) {
        if (lang == null) {
          return filter.script.lang;
        }
  
        filter.script.lang = lang;
        return this;
      },
    
      /**
            Sets the filter name.

            @member ejs.ScriptFilter
            @param {String} name A name for the filter.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      name: function (name) {
        if (name == null) {
          return filter.script._name;
        }

        filter.script._name = name;
        return this;
      },

      /**
            Enable or disable caching of the filter

            @member ejs.ScriptFilter
            @param {Boolean} trueFalse True to cache the filter, false otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cache: function (trueFalse) {
        if (trueFalse == null) {
          return filter.script._cache;
        }

        filter.script._cache = trueFalse;
        return this;
      },

      /**
            Sets the cache key.

            @member ejs.ScriptFilter
            @param {String} key the cache key as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cacheKey: function (key) {
        if (key == null) {
          return filter.script._cache_key;
        }

        filter.script._cache_key = key;
        return this;
      },
             
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.ScriptFilter
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.ScriptFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
            Retrieves the internal <code>filter</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.ScriptFilter
            @returns {String} returns this object's internal <code>filter</code> property.
            */
      _self: function () {
        return filter;
      }
    };
  };
