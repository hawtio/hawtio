  /**
    @class
    <p>The geoDistanceFacet facet provides information over a range of distances from a
    provided point. This includes the number of hits that fall within each range,
    along with aggregate information (like total).</p>

    <p>Facets are similar to SQL <code>GROUP BY</code> statements but perform much
       better. You can also construct several <em>"groups"</em> at once by simply
       specifying multiple facets.</p>

    <div class="alert-message block-message info">
        <p>
            <strong>Tip: </strong>
            For more information on faceted navigation, see
            <a href="http://en.wikipedia.org/wiki/Faceted_classification">this</a>
            Wikipedia article on Faceted Classification.
        </p>
    </div>

    @name ejs.GeoDistanceFacet

    @desc
    <p>A facet which provides information over a range of distances from a provided point.</p>

    @param {String} name The name which be used to refer to this facet. For instance,
        the facet itself might utilize a field named <code>doc_authors</code>. Setting
        <code>name</code> to <code>Authors</code> would allow you to refer to the
        facet by that name, possibly simplifying some of the display logic.

    */
  ejs.GeoDistanceFacet = function (name) {

    /**
        The internal facet object.
        @member ejs.GeoDistanceFacet
        @property {Object} facet
        */
    var facet = {},
        point = ejs.GeoPoint([0, 0]),
        field = 'location';

    facet[name] = {
      geo_distance: {
        location: point._self(),
        ranges: []
      }
    };

    return {

      /**
            Sets the document field containing the geo-coordinate to be used 
            to calculate the distance.  Defaults to "location".

            @member ejs.GeoDistanceFacet
            @param {String} fieldName The field name whose data will be used to construct the facet.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (fieldName) {
        var oldValue = facet[name].geo_distance[field];
        
        if (fieldName == null) {
          return field;
        }

        delete facet[name].geo_distance[field];
        field = fieldName;
        facet[name].geo_distance[fieldName] = oldValue;
        
        return this;
      },

      /**
            Sets the point of origin from where distances will be measured.

            @member ejs.GeoDistanceFacet
            @param {GeoPoint} p A valid GeoPoint object
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      point: function (p) {
        if (p == null) {
          return point;
        }
      
        if (!isGeoPoint(p)) {
          throw new TypeError('Argument must be a GeoPoint');
        }
        
        point = p;
        facet[name].geo_distance[field] = p._self();
        return this;
      },

      /**
            Adds a new bounded range.

            @member ejs.GeoDistanceFacet
            @param {Number} from The lower bound of the range
            @param {Number} to The upper bound of the range
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      addRange: function (from, to) {
        if (arguments.length === 0) {
          return facet[name].geo_distance.ranges;
        }
      
        facet[name].geo_distance.ranges.push({
          from: from,
          to: to
        });
        
        return this;
      },

      /**
            Adds a new unbounded lower limit.

            @member ejs.GeoDistanceFacet
            @param {Number} from The lower limit of the unbounded range
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      addUnboundedFrom: function (from) {
        if (from == null) {
          return facet[name].geo_distance.ranges;
        }
      
        facet[name].geo_distance.ranges.push({
          from: from
        });
        
        return this;
      },

      /**
            Adds a new unbounded upper limit.

            @member ejs.GeoDistanceFacet
            @param {Number} to The upper limit of the unbounded range
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      addUnboundedTo: function (to) {
        if (to == null) {
          return facet[name].geo_distance.ranges;
        }
      
        facet[name].geo_distance.ranges.push({
          to: to
        });
        
        return this;
      },

      /**
             Sets the distance unit.  Valid values are "mi" for miles or "km"
             for kilometers. Defaults to "km".

             @member ejs.GeoDistanceFacet
             @param {Number} unit the unit of distance measure.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      unit: function (unit) {
        if (unit == null) {
          return facet[name].geo_distance.unit;
        }
      
        unit = unit.toLowerCase();
        if (unit === 'mi' || unit === 'km') {
          facet[name].geo_distance.unit = unit;
        }
        
        return this;
      },
      
      /**
            How to compute the distance. Can either be arc (better precision) 
            or plane (faster). Defaults to arc.

            @member ejs.GeoDistanceFacet
            @param {String} type The execution type as a string.  
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      distanceType: function (type) {
        if (type == null) {
          return facet[name].geo_distance.distance_type;
        }

        type = type.toLowerCase();
        if (type === 'arc' || type === 'plane') {
          facet[name].geo_distance.distance_type = type;
        }
        
        return this;
      },

      /**
            If the lat/long points should be normalized to lie within their
            respective normalized ranges.
            
            Normalized ranges are:
            lon = -180 (exclusive) to 180 (inclusive) range
            lat = -90 to 90 (both inclusive) range

            @member ejs.GeoDistanceFacet
            @param {String} trueFalse True if the coordinates should be normalized. False otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      normalize: function (trueFalse) {
        if (trueFalse == null) {
          return facet[name].geo_distance.normalize;
        }

        facet[name].geo_distance.normalize = trueFalse;
        return this;
      },
      
      /**
            Allows you to specify a different value field to aggrerate over.

            @member ejs.GeoDistanceFacet
            @param {String} fieldName The name of the field to be used.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      valueField: function (fieldName) {
        if (fieldName == null) {
          return facet[name].geo_distance.value_field;
        }
      
        facet[name].geo_distance.value_field = fieldName;
        return this;
      },
      
      /**
            Allows you modify the <code>value</code> field using a script. The modified value
            is then used to compute the statistical data.

            @member ejs.GeoDistanceFacet
            @param {String} scriptCode A valid script string to execute.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      valueScript: function (scriptCode) {
        if (scriptCode == null) {
          return facet[name].geo_distance.value_script;
        }
      
        facet[name].geo_distance.value_script = scriptCode;
        return this;
      },
      
      /**
            The script language being used. Currently supported values are
            <code>javascript</code>, <code>groovy</code>, and <code>mvel</code>.

            @member ejs.GeoDistanceFacet
            @param {String} language The language of the script.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lang: function (language) {
        if (language == null) {
          return facet[name].geo_distance.lang;
        }
      
        facet[name].geo_distance.lang = language;
        return this;
      },
      
      /**
            Sets parameters that will be applied to the script.  Overwrites 
            any existing params.

            @member ejs.GeoDistanceFacet
            @param {Object} p An object where the keys are the parameter name and 
              values are the parameter value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      params: function (p) {
        if (p == null) {
          return facet[name].geo_distance.params;
        }
    
        facet[name].geo_distance.params = p;
        return this;
      },
      
      /**
            <p>Allows you to reduce the documents used for computing facet results.</p>

            @member ejs.GeoDistanceFacet
            @param {Object} oFilter A valid <code>Filter</code> object.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      facetFilter: function (oFilter) {
        if (oFilter == null) {
          return facet[name].facet_filter;
        }
      
        if (!isFilter(oFilter)) {
          throw new TypeError('Argument must be a Filter');
        }
        
        facet[name].facet_filter = oFilter._self();
        return this;
      },

      /**
            <p>Computes values across the entire index</p>

            @member ejs.GeoDistanceFacet
            @param {Boolean} trueFalse Calculate facet counts globally or not.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      global: function (trueFalse) {
        if (trueFalse == null) {
          return facet[name].global;
        }
        
        facet[name].global = trueFalse;
        return this;
      },
      
      /**
            <p>Sets the mode the facet will use.<p>
            
            <dl>
                <dd><code>collector</code></dd>
                <dd><code>post</code></dd>
            <dl>
            
            @member ejs.GeoDistanceFacet
            @param {String} m The mode: collector or post.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      mode: function (m) {
        if (m == null) {
          return facet[name].mode;
        }
      
        m = m.toLowerCase();
        if (m === 'collector' || m === 'post') {
          facet[name].mode = m;
        }
        
        return this;
      },
      
      /**
            <p>Computes values across the the specified scope</p>

            @deprecated since elasticsearch 0.90
            @member ejs.GeoDistanceFacet
            @param {String} scope The scope name to calculate facet counts with.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      scope: function (scope) {
        return this;
      },
      
      /**
            <p>Enables caching of the <code>facetFilter</code></p>

            @member ejs.GeoDistanceFacet
            @param {Boolean} trueFalse If the facetFilter should be cached or not
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cacheFilter: function (trueFalse) {
        if (trueFalse == null) {
          return facet[name].cache_filter;
        }
        
        facet[name].cache_filter = trueFalse;
        return this;
      },
      
      /**
            <p>Sets the path to the nested document if faceting against a
            nested field.</p>

            @member ejs.GeoDistanceFacet
            @param {String} path The nested path
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      nested: function (path) {
        if (path == null) {
          return facet[name].nested;
        }
        
        facet[name].nested = path;
        return this;
      },
      
      /**
            <p>Allows you to serialize this object into a JSON encoded string.</p>

            @member ejs.GeoDistanceFacet
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(facet);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.GeoDistanceFacet
            @returns {String} the type of object
            */
      _type: function () {
        return 'facet';
      },
      
      /**
            <p>Retrieves the internal <code>facet</code> object. This is typically used by
               internal API functions so use with caution.</p>

            @member ejs.GeoDistanceFacet
            @returns {String} returns this object's internal <code>facet</code> property.
            */
      _self: function () {
        return facet;
      }
    };
  };
