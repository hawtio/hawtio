  /**
    @class
    <p>The histogram facet works with numeric data by building a histogram across intervals
       of the field values. Each value is <em>rounded</em> into an interval (or placed in a
       bucket), and statistics are provided per interval/bucket (count and total).</p>

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

    @name ejs.HistogramFacet

    @desc
    <p>A facet which returns the N most frequent terms within a collection
       or set of collections.</p>

    @param {String} name The name which be used to refer to this facet. For instance,
        the facet itself might utilize a field named <code>doc_authors</code>. Setting
        <code>name</code> to <code>Authors</code> would allow you to refer to the
        facet by that name, possibly simplifying some of the display logic.

    */
  ejs.HistogramFacet = function (name) {

    /**
        The internal facet object.
        @member ejs.HistogramFacet
        @property {Object} facet
        */
    var facet = {};

    facet[name] = {
      histogram: {}
    };

    return {

      /**
            Sets the field to be used to construct the this facet.

            @member ejs.HistogramFacet
            @param {String} fieldName The field name whose data will be used to construct the facet.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (fieldName) {
        if (fieldName == null) {
          return facet[name].histogram.field;
        }
      
        facet[name].histogram.field = fieldName;
        return this;
      },

      /**
            Sets the bucket interval used to calculate the distribution.

            @member ejs.HistogramFacet
            @param {Number} numericInterval The bucket interval in which to group values.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      interval: function (numericInterval) {
        if (numericInterval == null) {
          return facet[name].histogram.interval;
        }
      
        facet[name].histogram.interval = numericInterval;
        return this;
      },

      /**
            Sets the bucket interval used to calculate the distribution based
            on a time value such as "1d", "1w", etc.

            @member ejs.HistogramFacet
            @param {Number} timeInterval The bucket interval in which to group values.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      timeInterval: function (timeInterval) {
        if (timeInterval == null) {
          return facet[name].histogram.time_interval;
        }
      
        facet[name].histogram.time_interval = timeInterval;
        return this;
      },

      /**
            Sets the "from", "start", or lower bounds bucket.  For example if 
            you have a value of 1023, an interval of 100, and a from value of 
            1500, it will be placed into the 1500 bucket vs. the normal bucket 
            of 1000.

            @member ejs.HistogramFacet
            @param {Number} from the lower bounds bucket value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      from: function (from) {
        if (from == null) {
          return facet[name].histogram.from;
        }
      
        facet[name].histogram.from = from;
        return this;
      },

      /**
            Sets the "to", "end", or upper bounds bucket.  For example if 
            you have a value of 1023, an interval of 100, and a to value of 
            900, it will be placed into the 900 bucket vs. the normal bucket 
            of 1000.

            @member ejs.HistogramFacet
            @param {Number} to the upper bounds bucket value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      to: function (to) {
        if (to == null) {
          return facet[name].histogram.to;
        }
      
        facet[name].histogram.to = to;
        return this;
      },
                  
      /**
            Allows you to specify a different value field to aggrerate over.

            @member ejs.HistogramFacet
            @param {String} fieldName The name of the field to be used.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      valueField: function (fieldName) {
        if (fieldName == null) {
          return facet[name].histogram.value_field;
        }
      
        facet[name].histogram.value_field = fieldName;
        return this;
      },

      /**
            Allows you to specify a different key field to be used to group intervals.

            @member ejs.HistogramFacet
            @param {String} fieldName The name of the field to be used.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      keyField: function (fieldName) {
        if (fieldName == null) {
          return facet[name].histogram.key_field;
        }
      
        facet[name].histogram.key_field = fieldName;
        return this;
      },

      /**
            Allows you modify the <code>value</code> field using a script. The modified value
            is then used to compute the statistical data.

            @member ejs.HistogramFacet
            @param {String} scriptCode A valid script string to execute.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      valueScript: function (scriptCode) {
        if (scriptCode == null) {
          return facet[name].histogram.value_script;
        }
      
        facet[name].histogram.value_script = scriptCode;
        return this;
      },

      /**
            Allows you modify the <code>key</code> field using a script. The modified value
            is then used to generate the interval.

            @member ejs.HistogramFacet
            @param {String} scriptCode A valid script string to execute.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      keyScript: function (scriptCode) {
        if (scriptCode == null) {
          return facet[name].histogram.key_script;
        }
      
        facet[name].histogram.key_script = scriptCode;
        return this;
      },

      /**
            The script language being used. Currently supported values are
            <code>javascript</code>, <code>groovy</code>, and <code>mvel</code>.

            @member ejs.HistogramFacet
            @param {String} language The language of the script.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lang: function (language) {
        if (language == null) {
          return facet[name].histogram.lang;
        }
      
        facet[name].histogram.lang = language;
        return this;
      },

      /**
            Sets parameters that will be applied to the script.  Overwrites 
            any existing params.

            @member ejs.HistogramFacet
            @param {Object} p An object where the keys are the parameter name and 
              values are the parameter value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      params: function (p) {
        if (p == null) {
          return facet[name].histogram.params;
        }
    
        facet[name].histogram.params = p;
        return this;
      },
      
      /**
            Sets the type of ordering that will be performed on the date
            buckets.  Valid values are:
            
            key - the default, sort by the bucket's key value
            count - sort by the number of items in the bucket
            total - sort by the sum/total of the items in the bucket
            
            @member ejs.HistogramFacet
            @param {String} o The ordering method: key, count, or total.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      order: function (o) {
        if (o == null) {
          return facet[name].histogram.order;
        }
      
        o = o.toLowerCase();
        if (o === 'key' || o === 'count' || o === 'total') {
          facet[name].histogram.order = o;
        }
        
        return this;
      },
      
      /**
            <p>Allows you to reduce the documents used for computing facet results.</p>

            @member ejs.HistogramFacet
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

            @member ejs.HistogramFacet
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
            
            @member ejs.HistogramFacet
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
            @member ejs.HistogramFacet
            @param {String} scope The scope name to calculate facet counts with.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      scope: function (scope) {
        return this;
      },
      
      /**
            <p>Enables caching of the <code>facetFilter</code></p>

            @member ejs.HistogramFacet
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

            @member ejs.HistogramFacet
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

            @member ejs.HistogramFacet
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(facet);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.HistogramFacet
            @returns {String} the type of object
            */
      _type: function () {
        return 'facet';
      },
      
      /**
            <p>Retrieves the internal <code>facet</code> object. This is typically used by
               internal API functions so use with caution.</p>

            @member ejs.HistogramFacet
            @returns {String} returns this object's internal <code>facet</code> property.
            */
      _self: function () {
        return facet;
      }
    };
  };
