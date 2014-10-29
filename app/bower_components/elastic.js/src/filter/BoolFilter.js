  /**
    @class
    <p>A <code>BoolFilter</code> allows you to build <em>Boolean</em> filter constructs
    from individual filters. Similar in concept to Boolean query, except that 
    the clauses are other filters. Can be placed within queries that accept a 
    filter.
  
    @name ejs.BoolFilter

    @desc
    A Filter that matches documents matching boolean combinations of other
    filters.

    */
  ejs.BoolFilter = function () {

    /**
         The internal filter object. <code>Use _self()</code>
         @member ejs.BoolFilter
         @property {Object} filter
         */
    var filter = {
      bool: {}
    };

    return {

      /**
             Adds filter to boolean container. Given filter "must" appear in 
             matching documents.  If passed a single Filter it is added to the
             list of existing filters.  If passed an array of Filters, they
             replace all existing filters.

             @member ejs.BoolFilter
             @param {Filter || Array} oFilter A valid Filter or array of
              Filter objects.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      must: function (oFilter) {
        var i, len;
        
        if (filter.bool.must == null) {
          filter.bool.must = [];
        }
    
        if (oFilter == null) {
          return filter.bool.must;
        }

        if (isFilter(oFilter)) {
          filter.bool.must.push(oFilter._self());
        } else if (isArray(oFilter)) {
          filter.bool.must = [];
          for (i = 0, len = oFilter.length; i < len; i++) {
            if (!isFilter(oFilter[i])) {
              throw new TypeError('Argument must be an array of Filters');
            }
            
            filter.bool.must.push(oFilter[i]._self());
          }
        } else {
          throw new TypeError('Argument must be a Filter or array of Filters');
        }
        
        return this;
      },

      /**
             Adds filter to boolean container. Given filter "must not" appear 
             in matching documents. If passed a single Filter it is added to 
             the list of existing filters.  If passed an array of Filters, 
             they replace all existing filters.

             @member ejs.BoolFilter
             @param {Filter || Array} oFilter A valid Filter or array of
               Filter objects.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      mustNot: function (oFilter) {
        var i, len;
        
        if (filter.bool.must_not == null) {
          filter.bool.must_not = [];
        }

        if (oFilter == null) {
          return filter.bool.must_not;
        }
    
        if (isFilter(oFilter)) {
          filter.bool.must_not.push(oFilter._self());
        } else if (isArray(oFilter)) {
          filter.bool.must_not = [];
          for (i = 0, len = oFilter.length; i < len; i++) {
            if (!isFilter(oFilter[i])) {
              throw new TypeError('Argument must be an array of Filters');
            }
            
            filter.bool.must_not.push(oFilter[i]._self());
          }
        } else {
          throw new TypeError('Argument must be a Filter or array of Filters');
        }
        
        return this;
      },

      /**
             Adds filter to boolean container. Given filter "should" appear in 
             matching documents. If passed a single Filter it is added to 
             the list of existing filters.  If passed an array of Filters, 
             they replace all existing filters.

             @member ejs.BoolFilter
             @param {Filter || Array} oFilter A valid Filter or array of
                Filter objects.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      should: function (oFilter) {
        var i, len;
        
        if (filter.bool.should == null) {
          filter.bool.should = [];
        }

        if (oFilter == null) {
          return filter.bool.should;
        }
    
        if (isFilter(oFilter)) {
          filter.bool.should.push(oFilter._self());
        } else if (isArray(oFilter)) {
          filter.bool.should = [];
          for (i = 0, len = oFilter.length; i < len; i++) {
            if (!isFilter(oFilter[i])) {
              throw new TypeError('Argument must be an array of Filters');
            }
            
            filter.bool.should.push(oFilter[i]._self());
          }
        } else {
          throw new TypeError('Argument must be a Filter or array of Filters');
        }
        
        return this;
      },

      /**
            Sets the filter name.

            @member ejs.BoolFilter
            @param {String} name A name for the filter.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      name: function (name) {
        if (name == null) {
          return filter.bool._name;
        }

        filter.bool._name = name;
        return this;
      },

      /**
            Enable or disable caching of the filter

            @member ejs.BoolFilter
            @param {Boolean} trueFalse True to cache the filter, false otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cache: function (trueFalse) {
        if (trueFalse == null) {
          return filter.bool._cache;
        }

        filter.bool._cache = trueFalse;
        return this;
      },
  
      /**
            Sets the cache key.

            @member ejs.BoolFilter
            @param {String} key the cache key as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cacheKey: function (key) {
        if (key == null) {
          return filter.bool._cache_key;
        }

        filter.bool._cache_key = key;
        return this;
      },
    
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.BoolFilter
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.BoolFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
            Retrieves the internal <code>filter</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.BoolFilter
            @returns {String} returns this object's internal <code>filter</code> property.
            */
      _self: function () {
        return filter;
      }
    };
  };
