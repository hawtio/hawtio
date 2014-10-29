  /**
    @class
    <p>A filter that restricts matched results/docs to a given distance range from the
    point of origin. The format conforms with the GeoJSON specification.</p>

    @name ejs.GeoDistanceRangeFilter

    @desc
    Filter results to those which fall within the given distance range of the point of origin.

    @param {String} fieldName the document property/field containing the Geo Point (lon/lat).

    */
  ejs.GeoDistanceRangeFilter = function (fieldName) {

    /**
         The internal filter object. Use <code>_self()</code>

         @member ejs.GeoDistanceRangeFilter
         @property {Object} filter
         */
    var filter = {
      geo_distance_range: {}
    };

    filter.geo_distance_range[fieldName] = [0, 0];
    
    return {

     /**
            Sets the fields to filter against.

            @member ejs.GeoDistanceRangeFilter
            @param {String} f A valid field name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (f) {
        var oldValue = filter.geo_distance_range[fieldName];

        if (f == null) {
          return fieldName;
        }

        delete filter.geo_distance_range[fieldName];
        fieldName = f;
        filter.geo_distance_range[f] = oldValue;

        return this;
      },
      
      /**
             * Sets the start point of the distance range

             @member ejs.GeoDistanceRangeFilter
             @param {Number} numericDistance the numeric distance
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      from: function (numericDistance) {
        if (numericDistance == null) {
          return filter.geo_distance_range.from;
        }
      
        if (!isNumber(numericDistance)) {
          throw new TypeError('Argument must be a numeric value');
        }
        
        filter.geo_distance_range.from = numericDistance;
        return this;
      },

      /**
             * Sets the end point of the distance range

             @member ejs.GeoDistanceRangeFilter
             @param {Number} numericDistance the numeric distance
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      to: function (numericDistance) {
        if (numericDistance == null) {
          return filter.geo_distance_range.to;
        }

        if (!isNumber(numericDistance)) {
          throw new TypeError('Argument must be a numeric value');
        }
            
        filter.geo_distance_range.to = numericDistance;
        return this;
      },

      /**
            Should the first from (if set) be inclusive or not. 
            Defaults to true

            @member ejs.GeoDistanceRangeFilter
            @param {Boolean} trueFalse true to include, false to exclude 
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      includeLower: function (trueFalse) {
        if (trueFalse == null) {
          return filter.geo_distance_range.include_lower;
        }

        filter.geo_distance_range.include_lower = trueFalse;
        return this;
      },

      /**
            Should the last to (if set) be inclusive or not. Defaults to true.

            @member ejs.GeoDistanceRangeFilter
            @param {Boolean} trueFalse true to include, false to exclude 
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      includeUpper: function (trueFalse) {
        if (trueFalse == null) {
          return filter.geo_distance_range.include_upper;
        }

        filter.geo_distance_range.include_upper = trueFalse;
        return this;
      },

      /**
            Greater than value.  Same as setting from to the value, and 
            include_lower to false,

            @member ejs.GeoDistanceRangeFilter
            @param {Number} val the numeric distance
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      gt: function (val) {
        if (val == null) {
          return filter.geo_distance_range.gt;
        }

        if (!isNumber(val)) {
          throw new TypeError('Argument must be a numeric value');
        }
        
        filter.geo_distance_range.gt = val;
        return this;
      },

      /**
            Greater than or equal to value.  Same as setting from to the value,
            and include_lower to true.

            @member ejs.GeoDistanceRangeFilter
            @param {Number} val the numeric distance
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      gte: function (val) {
        if (val == null) {
          return filter.geo_distance_range.gte;
        }

        if (!isNumber(val)) {
          throw new TypeError('Argument must be a numeric value');
        }
        
        filter.geo_distance_range.gte = val;
        return this;
      },

      /**
            Less than value.  Same as setting to to the value, and include_upper 
            to false.

            @member ejs.GeoDistanceRangeFilter
            @param {Number} val the numeric distance
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lt: function (val) {
        if (val == null) {
          return filter.geo_distance_range.lt;
        }

        if (!isNumber(val)) {
          throw new TypeError('Argument must be a numeric value');
        }
        
        filter.geo_distance_range.lt = val;
        return this;
      },

      /**
            Less than or equal to value.  Same as setting to to the value, 
            and include_upper to true.

            @member ejs.GeoDistanceRangeFilter
            @param {Number} val the numeric distance
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lte: function (val) {
        if (val == null) {
          return filter.geo_distance_range.lte;
        }

        if (!isNumber(val)) {
          throw new TypeError('Argument must be a numeric value');
        }
        
        filter.geo_distance_range.lte = val;
        return this;
      },
      
      /**
             Sets the distance unit.  Valid values are "mi" for miles or "km"
             for kilometers. Defaults to "km".

             @member ejs.GeoDistanceRangeFilter
             @param {Number} unit the unit of distance measure.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      unit: function (unit) {
        if (unit == null) {
          return filter.geo_distance_range.unit;
        }
      
        unit = unit.toLowerCase();
        if (unit === 'mi' || unit === 'km') {
          filter.geo_distance_range.unit = unit;
        }
        
        return this;
      },

      /**
             Sets the point of origin in which distance will be measured from

             @member ejs.GeoDistanceRangeFilter
             @param {GeoPoint} p A valid GeoPoint object.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      point: function (p) {
        if (p == null) {
          return filter.geo_distance_range[fieldName];
        }
      
        if (isGeoPoint(p)) {
          filter.geo_distance_range[fieldName] = p._self();
        } else {
          throw new TypeError('Argument must be a GeoPoint');
        }
        
        return this;
      },


      /**
            How to compute the distance. Can either be arc (better precision) 
            or plane (faster). Defaults to arc.

            @member ejs.GeoDistanceRangeFilter
            @param {String} type The execution type as a string.  
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      distanceType: function (type) {
        if (type == null) {
          return filter.geo_distance_range.distance_type;
        }

        type = type.toLowerCase();
        if (type === 'arc' || type === 'plane') {
          filter.geo_distance_range.distance_type = type;
        }
        
        return this;
      },
      
      /**
            If the lat/long points should be normalized to lie within their
            respective normalized ranges.
            
            Normalized ranges are:
            lon = -180 (exclusive) to 180 (inclusive) range
            lat = -90 to 90 (both inclusive) range

            @member ejs.GeoDistanceRangeFilter
            @param {String} trueFalse True if the coordinates should be normalized. False otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      normalize: function (trueFalse) {
        if (trueFalse == null) {
          return filter.geo_distance_range.normalize;
        }

        filter.geo_distance_range.normalize = trueFalse;
        return this;
      },
      
      /**
            Will an optimization of using first a bounding box check will be 
            used. Defaults to memory which will do in memory checks. Can also 
            have values of indexed to use indexed value check, or none which 
            disables bounding box optimization.

            @member ejs.GeoDistanceRangeFilter
            @param {String} t optimization type of memory, indexed, or none.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      optimizeBbox: function (t) {
        if (t == null) {
          return filter.geo_distance_range.optimize_bbox;
        }

        t = t.toLowerCase();
        if (t === 'memory' || t === 'indexed' || t === 'none') {
          filter.geo_distance_range.optimize_bbox = t;
        }
        
        return this;
      },
      
      /**
            Sets the filter name.

            @member ejs.GeoDistanceRangeFilter
            @param {String} name A name for the filter.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      name: function (name) {
        if (name == null) {
          return filter.geo_distance_range._name;
        }

        filter.geo_distance_range._name = name;
        return this;
      },

      /**
            Enable or disable caching of the filter

            @member ejs.GeoDistanceRangeFilter
            @param {Boolean} trueFalse True to cache the filter, false otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cache: function (trueFalse) {
        if (trueFalse == null) {
          return filter.geo_distance_range._cache;
        }

        filter.geo_distance_range._cache = trueFalse;
        return this;
      },
    
      /**
            Sets the cache key.

            @member ejs.GeoDistanceRangeFilter
            @param {String} key the cache key as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cacheKey: function (key) {
        if (key == null) {
          return filter.geo_distance_range._cache_key;
        }

        filter.geo_distance_range._cache_key = key;
        return this;
      },
      /**
             Returns the filter container as a JSON string

             @member ejs.GeoDistanceRangeFilter
             @returns {String} JSON representation of the notFilter object
             */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.GeoDistanceRangeFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
             Returns the filter object.

             @member ejs.GeoDistanceRangeFilter
             @returns {Object} filter object
             */
      _self: function () {
        return filter;
      }
    };
  };
