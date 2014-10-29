  /**
    @class
    <p>The DateHistogram facet works with time-based values by building a histogram across time
       intervals of the <code>value</code> field. Each value is <em>rounded</em> into an interval (or
       placed in a bucket), and statistics are provided per interval/bucket (count and total).</p>

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

    @name ejs.DateHistogramFacet

    @desc
    <p>A facet which returns the N most frequent terms within a collection
       or set of collections.</p>

    @param {String} name The name which be used to refer to this facet. For instance,
        the facet itself might utilize a field named <code>doc_authors</code>. Setting
        <code>name</code> to <code>Authors</code> would allow you to refer to the
        facet by that name, possibly simplifying some of the display logic.

    */
  ejs.DateHistogramFacet = function (name) {

    /**
        The internal facet object.
        @member ejs.DateHistogramFacet
        @property {Object} facet
        */
    var facet = {};

    facet[name] = {
      date_histogram: {}
    };

    return {

      /**
            Sets the field to be used to construct the this facet.

            @member ejs.DateHistogramFacet
            @param {String} fieldName The field name whose data will be used to construct the facet.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (fieldName) {
        if (fieldName == null) {
          return facet[name].date_histogram.field;
        }
      
        facet[name].date_histogram.field = fieldName;
        return this;
      },

      /**
            Allows you to specify a different key field to be used to group intervals.

            @member ejs.DateHistogramFacet
            @param {String} fieldName The name of the field to be used.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      keyField: function (fieldName) {
        if (fieldName == null) {
          return facet[name].date_histogram.key_field;
        }
      
        facet[name].date_histogram.key_field = fieldName;
        return this;
      },
      
      /**
            Allows you to specify a different value field to aggrerate over.

            @member ejs.DateHistogramFacet
            @param {String} fieldName The name of the field to be used.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      valueField: function (fieldName) {
        if (fieldName == null) {
          return facet[name].date_histogram.value_field;
        }
      
        facet[name].date_histogram.value_field = fieldName;
        return this;
      },
      
      /**
            Sets the bucket interval used to calculate the distribution.

            @member ejs.DateHistogramFacet
            @param {String} timeInterval The bucket interval. Valid values are <code>year, month, week, day, hour,</code> and <code>minute</code>.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      interval: function (timeInterval) {
        if (timeInterval == null) {
          return facet[name].date_histogram.interval;
        }
      
        facet[name].date_histogram.interval = timeInterval;
        return this;
      },

      /**
            <p>By default, time values are stored in UTC format.<p> 

            <p>This method allows users to set a time zone value that is then used 
            to compute intervals before rounding on the interval value. Equalivent to 
            <coe>preZone</code>.  Use <code>preZone</code> if possible. The 
            value is an offset from UTC.<p>
            
            <p>For example, to use EST you would set the value to <code>-5</code>.</p>

            @member ejs.DateHistogramFacet
            @param {Integer} tz An offset value from UTC.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      timeZone: function (tz) {
        if (tz == null) {
          return facet[name].date_histogram.time_zone;
        }
      
        facet[name].date_histogram.time_zone = tz;
        return this;
      },

      /**
            <p>By default, time values are stored in UTC format.<p> 

            <p>This method allows users to set a time zone value that is then used to 
            compute intervals before rounding on the interval value.  The value is an 
            offset from UTC.<p>
            
            <p>For example, to use EST you would set the value to <code>-5</code>.</p>

            @member ejs.DateHistogramFacet
            @param {Integer} tz An offset value from UTC.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      preZone: function (tz) {
        if (tz == null) {
          return facet[name].date_histogram.pre_zone;
        }
      
        facet[name].date_histogram.pre_zone = tz;
        return this;
      },
      
      /**
            <p>Enables large date interval conversions (day and up).</p>  

            <p>Set to true to enable and then set the <code>interval</code> to an 
            interval greater than a day.</p>
            
            @member ejs.DateHistogramFacet
            @param {Boolean} trueFalse A valid boolean value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      preZoneAdjustLargeInterval: function (trueFalse) {
        if (trueFalse == null) {
          return facet[name].date_histogram.pre_zone_adjust_large_interval;
        }
      
        facet[name].date_histogram.pre_zone_adjust_large_interval = trueFalse;
        return this;
      },
      
      /**
            <p>By default, time values are stored in UTC format.<p> 

            <p>This method allows users to set a time zone value that is then used to compute 
            intervals after rounding on the interval value.  The value is an offset from UTC.  
            The tz offset value is simply added to the resulting bucket's date value.<p>
            
            <p>For example, to use EST you would set the value to <code>-5</code>.</p>

            @member ejs.DateHistogramFacet
            @param {Integer} tz An offset value from UTC.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      postZone: function (tz) {
        if (tz == null) {
          return facet[name].date_histogram.post_zone;
        }
      
        facet[name].date_histogram.post_zone = tz;
        return this;
      },

      /**
            Set's a specific pre-rounding offset.  Format is 1d, 1h, etc.

            @member ejs.DateHistogramFacet
            @param {String} offset The offset as a string (1d, 1h, etc)
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      preOffset: function (offset) {
        if (offset == null) {
          return facet[name].date_histogram.pre_offset;
        }
      
        facet[name].date_histogram.pre_offset = offset;
        return this;
      },
      
      /**
            Set's a specific post-rounding offset.  Format is 1d, 1h, etc.

            @member ejs.DateHistogramFacet
            @param {String} offset The offset as a string (1d, 1h, etc)
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      postOffset: function (offset) {
        if (offset == null) {
          return facet[name].date_histogram.post_offset;
        }
      
        facet[name].date_histogram.post_offset = offset;
        return this;
      },
      
      /**
            <p>The date histogram works on numeric values (since time is stored 
            in milliseconds since the epoch in UTC).<p> 

            <p>But, sometimes, systems will store a different resolution (like seconds since UTC) 
            in a numeric field. The factor parameter can be used to change the value in the field 
            to milliseconds to actual do the relevant rounding, and then be applied again to get to 
            the original unit.</p>

            <p>For example, when storing in a numeric field seconds resolution, 
            the factor can be set to 1000.<p>

            @member ejs.DateHistogramFacet
            @param {Integer} f The conversion factor.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      factor: function (f) {
        if (f == null) {
          return facet[name].date_histogram.factor;
        }
      
        facet[name].date_histogram.factor = f;
        return this;
      },
      
      /**
            Allows you modify the <code>value</code> field using a script. The modified value
            is then used to compute the statistical data.

            @member ejs.DateHistogramFacet
            @param {String} scriptCode A valid script string to execute.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      valueScript: function (scriptCode) {
        if (scriptCode == null) {
          return facet[name].date_histogram.value_script;
        }
      
        facet[name].date_histogram.value_script = scriptCode;
        return this;
      },

      /**
            <p>Sets the type of ordering that will be performed on the date
            buckets.  Valid values are:<p>
            
            <dl>
                <dd><code>time</code> - the default, sort by the buckets start time in milliseconds.</dd>
                <dd><code>count</code> - sort by the number of items in the bucket</dd>
                <dd><code>total</code> - sort by the sum/total of the items in the bucket</dd>
            <dl>
            
            @member ejs.DateHistogramFacet
            @param {String} o The ordering method: time, count, or total.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      order: function (o) {
        if (o == null) {
          return facet[name].date_histogram.order;
        }
      
        o = o.toLowerCase();
        if (o === 'time' || o === 'count' || o === 'total') {
          facet[name].date_histogram.order = o;
        }
        
        return this;
      },
      
      /**
            The script language being used. Currently supported values are
            <code>javascript</code>, <code>groovy</code>, and <code>mvel</code>.

            @member ejs.DateHistogramFacet
            @param {String} language The language of the script.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lang: function (language) {
        if (language == null) {
          return facet[name].date_histogram.lang;
        }
      
        facet[name].date_histogram.lang = language;
        return this;
      },

      /**
            Sets parameters that will be applied to the script.  Overwrites 
            any existing params.

            @member ejs.DateHistogramFacet
            @param {Object} p An object where the keys are the parameter name and 
              values are the parameter value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      params: function (p) {
        if (p == null) {
          return facet[name].date_histogram.params;
        }
    
        facet[name].date_histogram.params = p;
        return this;
      },
      
      /**
            <p>Allows you to reduce the documents used for computing facet results.</p>

            @member ejs.DateHistogramFacet
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

            @member ejs.DateHistogramFacet
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
            
            @member ejs.DateHistogramFacet
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
            @member ejs.DateHistogramFacet
            @param {String} scope The scope name to calculate facet counts with.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      scope: function (scope) {
        return this;
      },
      
      /**
            <p>Enables caching of the <code>facetFilter</code></p>

            @member ejs.DateHistogramFacet
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

            @member ejs.DateHistogramFacet
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

            @member ejs.DateHistogramFacet
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(facet);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.DateHistogramFacet
            @returns {String} the type of object
            */
      _type: function () {
        return 'facet';
      },
      
      /**
            <p>Retrieves the internal <code>facet</code> object. This is typically used by
               internal API functions so use with caution.</p>

            @member ejs.DateHistogramFacet
            @returns {String} returns this object's internal <code>facet</code> property.
            */
      _self: function () {
        return facet;
      }
    };
  };
