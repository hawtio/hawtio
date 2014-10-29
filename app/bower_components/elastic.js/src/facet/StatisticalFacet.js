  /**
    @class
    <p>A statistical facet allows you to compute statistical data over a numeric fields. Statistical data includes
    the count, total, sum of squares, mean (average), minimum, maximum, variance, and standard deviation.</p>

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

    @name ejs.StatisticalFacet

    @desc
    <p>A facet which returns statistical information about a numeric field</p>

    @param {String} name The name which be used to refer to this facet. For instance,
        the facet itself might utilize a field named <code>doc_authors</code>. Setting
        <code>name</code> to <code>Authors</code> would allow you to refer to the
        facet by that name, possibly simplifying some of the display logic.

    */
  ejs.StatisticalFacet = function (name) {

    /**
        The internal facet object.
        @member ejs.StatisticalFacet
        @property {Object} facet
        */
    var facet = {};

    facet[name] = {
      statistical: {}
    };

    return {

      /**
            Sets the field to be used to construct the this facet.

            @member ejs.StatisticalFacet
            @param {String} fieldName The field name whose data will be used to construct the facet.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (fieldName) {
        if (fieldName == null) {
          return facet[name].statistical.field;
        }
      
        facet[name].statistical.field = fieldName;
        return this;
      },

      /**
            Aggregate statistical info across a set of fields.

            @member ejs.StatisticalFacet
            @param {Array} aFieldName An array of field names.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      fields: function (fields) {
        if (fields == null) {
          return facet[name].statistical.fields;
        }
      
        if (!isArray(fields)) {
          throw new TypeError('Argument must be an array');
        }
        
        facet[name].statistical.fields = fields;
        return this;
      },

      /**
            Define a script to evaluate of which the result will be used to generate
            the statistical information.

            @member ejs.StatisticalFacet
            @param {String} code The script code to execute.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      script: function (code) {
        if (code == null) {
          return facet[name].statistical.script;
        }
      
        facet[name].statistical.script = code;
        return this;
      },

      /**
            The script language being used. Currently supported values are
            <code>javascript</code>, <code>groovy</code>, and <code>mvel</code>.

            @member ejs.StatisticalFacet
            @param {String} language The language of the script.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lang: function (language) {
        if (language == null) {
          return facet[name].statistical.lang;
        }
      
        facet[name].statistical.lang = language;
        return this;
      },

      /**
            Allows you to set script parameters to be used during the execution of the script.

            @member ejs.StatisticalFacet
            @param {Object} oParams An object containing key/value pairs representing param name/value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      params: function (oParams) {
        if (oParams == null) {
          return facet[name].statistical.params;
        }
      
        facet[name].statistical.params = oParams;
        return this;
      },

      /**
            <p>Allows you to reduce the documents used for computing facet results.</p>

            @member ejs.StatisticalFacet
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

            @member ejs.StatisticalFacet
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
            
            @member ejs.StatisticalFacet
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
            @member ejs.StatisticalFacet
            @param {String} scope The scope name to calculate facet counts with.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      scope: function (scope) {
        return this;
      },
      
      /**
            <p>Enables caching of the <code>facetFilter</code></p>

            @member ejs.StatisticalFacet
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

            @member ejs.StatisticalFacet
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

            @member ejs.StatisticalFacet
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(facet);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.StatisticalFacet
            @returns {String} the type of object
            */
      _type: function () {
        return 'facet';
      },
      
      /**
            <p>Retrieves the internal <code>facet</code> object. This is typically used by
               internal API functions so use with caution.</p>

            @member ejs.StatisticalFacet
            @returns {String} returns this object's internal <code>facet</code> property.
            */
      _self: function () {
        return facet;
      }
    };
  };
