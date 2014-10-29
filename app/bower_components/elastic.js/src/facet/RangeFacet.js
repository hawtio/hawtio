  /**
    @class
    <p>A RangeFacet allows you to specify a set of ranges and get both the number of docs (count) that
       fall within each range, and aggregated data based on the field, or another specified field.</p>

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

    @name ejs.RangeFacet

    @desc
    <p>A facet which provides information over a range of numeric intervals.</p>

    @param {String} name The name which be used to refer to this facet. For instance,
        the facet itself might utilize a field named <code>doc_authors</code>. Setting
        <code>name</code> to <code>Authors</code> would allow you to refer to the
        facet by that name, possibly simplifying some of the display logic.

    */
  ejs.RangeFacet = function (name) {

    /**
        The internal facet object.
        @member ejs.RangeFacet
        @property {Object} facet
        */
    var facet = {};

    facet[name] = {
      range: {
        ranges: []
      }
    };

    return {

      /**
            Sets the document field to be used for the facet.

            @member ejs.RangeFacet
            @param {String} fieldName The field name whose data will be used to compute the interval.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (fieldName) {
        if (fieldName == null) {
          return facet[name].range.field;
        }
      
        facet[name].range.field = fieldName;
        return this;
      },

      /**
            Allows you to specify an alternate key field to be used to compute the interval.

            @member ejs.RangeFacet
            @param {String} fieldName The field name whose data will be used to compute the interval.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      keyField: function (fieldName) {
        if (fieldName == null) {
          return facet[name].range.key_field;
        }
      
        facet[name].range.key_field = fieldName;
        return this;
      },

      /**
            Allows you to specify an alternate value field to be used to compute statistical information.

            @member ejs.RangeFacet
            @param {String} fieldName The field name whose data will be used to compute statistics.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      valueField: function (fieldName) {
        if (fieldName == null) {
          return facet[name].range.value_field;
        }
      
        facet[name].range.value_field = fieldName;
        return this;
      },

      /**
            Allows you modify the <code>value</code> field using a script. The modified value
            is then used to compute the statistical data.

            @member ejs.RangeFacet
            @param {String} scriptCode A valid script string to execute.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      valueScript: function (scriptCode) {
        if (scriptCode == null) {
          return facet[name].range.value_script;
        }
      
        facet[name].range.value_script = scriptCode;
        return this;
      },

      /**
            Allows you modify the <code>key</code> field using a script. The modified value
            is then used to generate the interval.

            @member ejs.RangeFacet
            @param {String} scriptCode A valid script string to execute.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      keyScript: function (scriptCode) {
        if (scriptCode == null) {
          return facet[name].range.key_script;
        }
      
        facet[name].range.key_script = scriptCode;
        return this;
      },

      /**
            The script language being used. Currently supported values are
            <code>javascript</code>, <code>groovy</code>, and <code>mvel</code>.

            @member ejs.RangeFacet
            @param {String} language The language of the script.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lang: function (language) {
        if (language == null) {
          return facet[name].range.lang;
        }
      
        facet[name].range.lang = language;
        return this;
      },

      /**
            Sets parameters that will be applied to the script.  Overwrites 
            any existing params.

            @member ejs.RangeFacet
            @param {Object} p An object where the keys are the parameter name and 
              values are the parameter value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      params: function (p) {
        if (p == null) {
          return facet[name].range.params;
        }
    
        facet[name].range.params = p;
        return this;
      },
      
      /**
            Adds a new bounded range.

            @member ejs.RangeFacet
            @param {Number} from The lower bound of the range (can also be <code>Date</code>).
            @param {Number} to The upper bound of the range (can also be <code>Date</code>).
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      addRange: function (from, to) {
        if (arguments.length === 0) {
          return facet[name].range.ranges;
        }
      
        facet[name].range.ranges.push({
          from: from,
          to: to
        });
        
        return this;
      },

      /**
            Adds a new unbounded lower limit.

            @member ejs.RangeFacet
            @param {Number} from The lower limit of the unbounded range (can also be <code>Date</code>).
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      addUnboundedFrom: function (from) {
        if (from == null) {
          return facet[name].range.ranges;
        }
      
        facet[name].range.ranges.push({
          from: from
        });
        
        return this;
      },

      /**
            Adds a new unbounded upper limit.

            @member ejs.RangeFacet
            @param {Number} to The upper limit of the unbounded range (can also be <code>Date</code>).
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      addUnboundedTo: function (to) {
        if (to == null) {
          return facet[name].range.ranges;
        }
      
        facet[name].range.ranges.push({
          to: to
        });
        
        return this;
      },

      /**
            <p>Allows you to reduce the documents used for computing facet results.</p>

            @member ejs.RangeFacet
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

            @member ejs.RangeFacet
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
            
            @member ejs.RangeFacet
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
            @member ejs.RangeFacet
            @param {String} scope The scope name to calculate facet counts with.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      scope: function (scope) {
        return this;
      },
      
      /**
            <p>Enables caching of the <code>facetFilter</code></p>

            @member ejs.RangeFacet
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

            @member ejs.RangeFacet
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

            @member ejs.RangeFacet
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(facet);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.RangeFacet
            @returns {String} the type of object
            */
      _type: function () {
        return 'facet';
      },
      
      /**
            <p>Retrieves the internal <code>facet</code> object. This is typically used by
               internal API functions so use with caution.</p>

            @member ejs.RangeFacet
            @returns {String} returns this object's internal <code>facet</code> property.
            */
      _self: function () {
        return facet;
      }
    };
  };
