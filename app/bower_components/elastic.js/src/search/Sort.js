  /**
    @class
    <p>A Sort object that can be used in on the Request object to specify 
    various types of sorting.</p>

    <p>See http://www.elasticsearch.org/guide/reference/api/search/sort.html</p>

    @name ejs.Sort

    @desc
    <p>Defines a sort value</p>

    @param {String} fieldName The fieldName to sort against.  Defaults to _score
      if not specified.
    */
  ejs.Sort = function (fieldName) {

    // default to sorting against the documents score.
    if (fieldName == null) {
      fieldName = '_score';
    }
  
    var sort = {},
      key = fieldName, // defaults to field search
      geo_key = '_geo_distance', // used when doing geo distance sort
      script_key = '_script'; // used when doing script sort
    
    // defaults to a field sort
    sort[key] = {};

    return {

      /**
            Set's the field to sort on

            @member ejs.Sort
            @param {String} f The name of a field 
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (f) {
        var oldValue = sort[key];
      
        if (f == null) {
          return fieldName;
        }
    
        delete sort[key];      
        fieldName = f;
        key = f;
        sort[key] = oldValue;
      
        return this;
      },

      /**
            Enables sorting based on a distance from a GeoPoint

            @member ejs.Sort
            @param {GeoPoint} point A valid GeoPoint object
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      geoDistance: function (point) {
        var oldValue = sort[key];
      
        if (point == null) {
          return sort[key][fieldName];
        }
    
        if (!isGeoPoint(point)) {
          throw new TypeError('Argument must be a GeoPoint');
        }
      
        delete sort[key];
        key = geo_key;
        sort[key] = oldValue;
        sort[key][fieldName] = point._self();
      
        return this;
      },
    
      /**
            Enables sorting based on a script.

            @member ejs.Sort
            @param {String} scriptCode The script code as a string
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      script: function (scriptCode) {
        var oldValue = sort[key];
      
        if (scriptCode == null) {
          return sort[key].script;
        }
      
        delete sort[key];
        key = script_key;
        sort[key] = oldValue;
        sort[key].script = scriptCode;
      
        return this;
      },
    
      /**
            Sets the sort order.  Valid values are:
          
            asc - for ascending order
            desc - for descending order

            Valid during sort types:  field, geo distance, and script
          
            @member ejs.Sort
            @param {String} o The sort order as a string, asc or desc.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      order: function (o) {
        if (o == null) {
          return sort[key].order;
        }
    
        o = o.toLowerCase();
        if (o === 'asc' || o === 'desc') {
          sort[key].order = o;  
        }
      
        return this;
      },
    
      /**
            Sets the sort order to ascending (asc).  Same as calling
            <code>order('asc')</code>.
          
            @member ejs.Sort
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      asc: function () {
        sort[key].order = 'asc';
        return this;
      },
      
      /**
            Sets the sort order to descending (desc).  Same as calling
            <code>order('desc')</code>.
          
            @member ejs.Sort
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      desc: function () {
        sort[key].order = 'desc';
        return this;
      },
      
      /**
            Sets the order with a boolean value.  
          
            true = descending sort order
            false = ascending sort order

            Valid during sort types:  field, geo distance, and script
          
            @member ejs.Sort
            @param {Boolean} trueFalse If sort should be in reverse order.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      reverse: function (trueFalse) {
        if (trueFalse == null) {
          return sort[key].reverse;
        }
    
        sort[key].reverse = trueFalse;  
        return this;
      },
    
      /**
            Sets the value to use for missing fields.  Valid values are:
          
            _last - to put documents with the field missing last
            _first - to put documents with the field missing first
            {String} - any string value to use as the sort value.

            Valid during sort types:  field
          
            @member ejs.Sort
            @param {String} m The value to use for documents with the field missing.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      missing: function (m) {
        if (m == null) {
          return sort[key].missing;
        }
    
        sort[key].missing = m;  
        return this;
      },
    
      /**
            Sets if the sort should ignore unmapped fields vs throwing an error.

            Valid during sort types:  field
          
            @member ejs.Sort
            @param {Boolean} trueFalse If sort should ignore unmapped fields.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      ignoreUnmapped: function (trueFalse) {
        if (trueFalse == null) {
          return sort[key].ignore_unmapped;
        }
    
        sort[key].ignore_unmapped = trueFalse;  
        return this;
      },
    
      /**
             Sets the distance unit.  Valid values are "mi" for miles or "km"
             for kilometers. Defaults to "km".

             Valid during sort types:  geo distance
           
             @member ejs.Sort
             @param {Number} unit the unit of distance measure.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      unit: function (unit) {
        if (unit == null) {
          return sort[key].unit;
        }
    
        unit = unit.toLowerCase();
        if (unit === 'mi' || unit === 'km') {
          sort[key].unit = unit;
        }
      
        return this;
      },
    
      /**
            If the lat/long points should be normalized to lie within their
            respective normalized ranges.
          
            Normalized ranges are:
            lon = -180 (exclusive) to 180 (inclusive) range
            lat = -90 to 90 (both inclusive) range

            Valid during sort types:  geo distance
          
            @member ejs.Sort
            @param {String} trueFalse True if the coordinates should be normalized. False otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      normalize: function (trueFalse) {
        if (trueFalse == null) {
          return sort[key].normalize;
        }

        sort[key].normalize = trueFalse;
        return this;
      },
    
      /**
            How to compute the distance. Can either be arc (better precision) 
            or plane (faster). Defaults to arc.

            Valid during sort types:  geo distance
          
            @member ejs.Sort
            @param {String} type The execution type as a string.  
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      distanceType: function (type) {
        if (type == null) {
          return sort[key].distance_type;
        }

        type = type.toLowerCase();
        if (type === 'arc' || type === 'plane') {
          sort[key].distance_type = type;
        }
      
        return this;
      },
    
      /**
            Sets parameters that will be applied to the script.  Overwrites 
            any existing params.

            Valid during sort types:  script
          
            @member ejs.Sort
            @param {Object} p An object where the keys are the parameter name and 
              values are the parameter value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      params: function (p) {
        if (p == null) {
          return sort[key].params;
        }
  
        sort[key].params = p;
        return this;
      },
  
      /**
            Sets the script language.

            Valid during sort types:  script
          
            @member ejs.Sort
            @param {String} lang The script language, default mvel.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lang: function (lang) {
        if (lang == null) {
          return sort[key].lang;
        }

        sort[key].lang = lang;
        return this;
      },
    
      /**
            Sets the script sort type.  Valid values are:
          
            <dl>
                <dd><code>string</code> - script return value is sorted as a string</dd>
                <dd><code>number</code> - script return value is sorted as a number</dd>
            <dl>

            Valid during sort types:  script
          
            @member ejs.Sort
            @param {String} type The sort type.  Either string or number.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      type: function (type) {
        if (type == null) {
          return sort[key].type;
        }

        type = type.toLowerCase();
        if (type === 'string' || type === 'number') {
          sort[key].type = type;
        }
      
        return this;
      },

      /**
            Sets the sort mode.  Valid values are:
          
            <dl>
                <dd><code>min</code> - sort by lowest value</dd>
                <dd><code>max</code> - sort by highest value</dd>
                <dd><code>sum</code> - sort by the sum of all values</dd>
                <dd><code>avg</code> - sort by the average of all values</dd>
            <dl>
            
            Valid during sort types:  field, geo distance
          
            @since elasticsearch 0.90
            @member ejs.Sort
            @param {String} m The sort mode.  Either min, max, sum, or avg.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      mode: function (m) {
        if (m == null) {
          return sort[key].mode;
        }

        m = m.toLowerCase();
        if (m === 'min' || m === 'max' || m === 'sum' || m === 'avg') {
          sort[key].mode = m;
        }
      
        return this;
      },
      
      /**
            Sets the path of the nested object.

            Valid during sort types:  field, geo distance
          
            @since elasticsearch 0.90
            @member ejs.Sort
            @param {String} path The nested path value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      nestedPath: function (path) {
        if (path == null) {
          return sort[key].nested_path;
        }

        sort[key].nested_path = path;
        return this;
      },
      
      /**
            <p>Allows you to set a filter that nested objects must match
            in order to be considered during sorting.</p>

            Valid during sort types: field, geo distance
            
            @since elasticsearch 0.90
            @member ejs.Sort
            @param {Object} oFilter A valid <code>Filter</code> object.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      nestedFilter: function (oFilter) {
        if (oFilter == null) {
          return sort[key].nested_filter;
        }
      
        if (!isFilter(oFilter)) {
          throw new TypeError('Argument must be a Filter');
        }
        
        sort[key].nested_filter = oFilter._self();
        return this;
      },
          
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.Sort
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(sort);
      },

      /**
            The type of ejs object.  For internal use only.
          
            @member ejs.Sort
            @returns {String} the type of object
            */
      _type: function () {
        return 'sort';
      },
    
      /**
            Retrieves the internal <code>script</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.Sort
            @returns {String} returns this object's internal object representation.
            */
      _self: function () {
        return sort;
      }
    };
  };
