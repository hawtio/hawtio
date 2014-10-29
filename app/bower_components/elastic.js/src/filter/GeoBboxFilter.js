  /**
    @class
    <p>A filter that restricts matched results/docs to a geographic bounding box described by
    the specified lon and lat coordinates. The format conforms with the GeoJSON specification.</p>

    @name ejs.GeoBboxFilter

    @desc
    Filter results to those which are contained within the defined bounding box.

    @param {String} fieldName the document property/field containing the Geo Point (lon/lat).

    */
  ejs.GeoBboxFilter = function (fieldName) {

    /**
         The internal filter object. Use <code>_self()</code>

         @member ejs.GeoBboxFilter
         @property {Object} filter
         */
    var filter = {
      geo_bounding_box: {}
    };

    filter.geo_bounding_box[fieldName] = {};

    return {

      /**
            Sets the fields to filter against.

            @member ejs.GeoBboxFilter
            @param {String} f A valid field name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (f) {
        var oldValue = filter.geo_bounding_box[fieldName];
    
        if (f == null) {
          return fieldName;
        }

        delete filter.geo_bounding_box[fieldName];
        fieldName = f;
        filter.geo_bounding_box[f] = oldValue;
    
        return this;
      },
      
      /**
             Sets the top-left coordinate of the bounding box

             @member ejs.GeoBboxFilter
             @param {GeoPoint} p A valid GeoPoint object
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      topLeft: function (p) {
        if (p == null) {
          return filter.geo_bounding_box[fieldName].top_left;
        }
      
        if (isGeoPoint(p)) {
          filter.geo_bounding_box[fieldName].top_left = p._self();
        } else {
          throw new TypeError('Argument must be a GeoPoint');
        }
        
        return this;
      },

      /**
             Sets the bottom-right coordinate of the bounding box

             @member ejs.GeoBboxFilter
             @param {GeoPoint} p A valid GeoPoint object
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      bottomRight: function (p) {
        if (p == null) {
          return filter.geo_bounding_box[fieldName].bottom_right;
        }
      
        if (isGeoPoint(p)) {
          filter.geo_bounding_box[fieldName].bottom_right = p._self();
        } else {
          throw new TypeError('Argument must be a GeoPoint');
        }
        
        return this;
      },

      /**
            Sets the type of the bounding box execution. Valid values are
            "memory" and "indexed".  Default is memory.

            @member ejs.GeoBboxFilter
            @param {String} type The execution type as a string.  
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      type: function (type) {
        if (type == null) {
          return filter.geo_bounding_box.type;
        }

        type = type.toLowerCase();
        if (type === 'memory' || type === 'indexed') {
          filter.geo_bounding_box.type = type;
        }
        
        return this;
      },
      
      /**
            If the lat/long points should be normalized to lie within their
            respective normalized ranges.
            
            Normalized ranges are:
            lon = -180 (exclusive) to 180 (inclusive) range
            lat = -90 to 90 (both inclusive) range

            @member ejs.GeoBboxFilter
            @param {String} trueFalse True if the coordinates should be normalized. False otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      normalize: function (trueFalse) {
        if (trueFalse == null) {
          return filter.geo_bounding_box.normalize;
        }

        filter.geo_bounding_box.normalize = trueFalse;
        return this;
      },
      
      /**
            Sets the filter name.

            @member ejs.GeoBboxFilter
            @param {String} name A name for the filter.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      name: function (name) {
        if (name == null) {
          return filter.geo_bounding_box._name;
        }

        filter.geo_bounding_box._name = name;
        return this;
      },

      /**
            Enable or disable caching of the filter

            @member ejs.GeoBboxFilter
            @param {Boolean} trueFalse True to cache the filter, false otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cache: function (trueFalse) {
        if (trueFalse == null) {
          return filter.geo_bounding_box._cache;
        }

        filter.geo_bounding_box._cache = trueFalse;
        return this;
      },
    
      /**
            Sets the cache key.

            @member ejs.GeoBboxFilter
            @param {String} key the cache key as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cacheKey: function (key) {
        if (key == null) {
          return filter.geo_bounding_box._cache_key;
        }

        filter.geo_bounding_box._cache_key = key;
        return this;
      },
      
      /**
             Returns the filter container as a JSON string

             @member ejs.GeoBboxFilter
             @returns {String} JSON representation of the notFilter object
             */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.GeoBboxFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
             Returns the filter object.

             @member ejs.GeoBboxFilter
             @returns {Object} filter object
             */
      _self: function () {
        return filter;
      }
    };
  };
