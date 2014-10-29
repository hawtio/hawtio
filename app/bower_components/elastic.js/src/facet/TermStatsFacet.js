  /**
    @class
    <p>A termsStatsFacet allows you to compute statistics over an aggregate key (term). Essentially this
    facet provides the functionality of what is often refered to as a <em>pivot table</em>.</p>

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

    @name ejs.TermStatsFacet

    @desc
    <p>A facet which computes statistical data based on an aggregate key.</p>

    @param {String} name The name which be used to refer to this facet. For instance,
        the facet itself might utilize a field named <code>doc_authors</code>. Setting
        <code>name</code> to <code>Authors</code> would allow you to refer to the
        facet by that name, possibly simplifying some of the display logic.

    */
  ejs.TermStatsFacet = function (name) {

    /**
        The internal facet object.
        @member ejs.TermStatsFacet
        @property {Object} facet
        */
    var facet = {};

    facet[name] = {
      terms_stats: {}
    };

    return {

      /**
            Sets the field for which statistical information will be generated.

            @member ejs.TermStatsFacet
            @param {String} fieldName The field name whose data will be used to construct the facet.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      valueField: function (fieldName) {
        if (fieldName == null) {
          return facet[name].terms_stats.value_field;
        }
      
        facet[name].terms_stats.value_field = fieldName;
        return this;
      },

      /**
            Sets the field which will be used to pivot on (group-by).

            @member ejs.TermStatsFacet
            @param {String} fieldName The field name whose data will be used to construct the facet.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      keyField: function (fieldName) {
        if (fieldName == null) {
          return facet[name].terms_stats.key_field;
        }
      
        facet[name].terms_stats.key_field = fieldName;
        return this;
      },

      /**
            Sets a script that will provide the terms for a given document.

            @member ejs.TermStatsFacet
            @param {String} script The script code.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      scriptField: function (script) {
        if (script == null) {
          return facet[name].terms_stats.script_field;
        }
      
        facet[name].terms_stats.script_field = script;
        return this;
      },
      
      /**
            Define a script to evaluate of which the result will be used to generate
            the statistical information.

            @member ejs.TermStatsFacet
            @param {String} code The script code to execute.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      valueScript: function (code) {
        if (code == null) {
          return facet[name].terms_stats.value_script;
        }
      
        facet[name].terms_stats.value_script = code;
        return this;
      },

      /**
            <p>Allows you to return all terms, even if the frequency count is 0. This should not be
               used on fields that contain a large number of unique terms because it could cause
               <em>out-of-memory</em> errors.</p>

            @member ejs.TermStatsFacet
            @param {String} trueFalse <code>true</code> or <code>false</code>
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      allTerms: function (trueFalse) {
        if (trueFalse == null) {
          return facet[name].terms_stats.all_terms;
        }
      
        facet[name].terms_stats.all_terms = trueFalse;
        return this;
      },
      
      /**
            The script language being used. Currently supported values are
            <code>javascript</code>, <code>groovy</code>, and <code>mvel</code>.

            @member ejs.TermStatsFacet
            @param {String} language The language of the script.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lang: function (language) {
        if (language == null) {
          return facet[name].terms_stats.lang;
        }
      
        facet[name].terms_stats.lang = language;
        return this;
      },

      /**
            Allows you to set script parameters to be used during the execution of the script.

            @member ejs.TermStatsFacet
            @param {Object} oParams An object containing key/value pairs representing param name/value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      params: function (oParams) {
        if (oParams == null) {
          return facet[name].terms_stats.params;
        }
      
        facet[name].terms_stats.params = oParams;
        return this;
      },

      /**
            Sets the number of facet entries that will be returned for this facet. For instance, you
            might ask for only the top 5 aggregate keys although there might be hundreds of
            unique keys. <strong>Higher settings could cause memory strain</strong>.

            @member ejs.TermStatsFacet
            @param {Integer} facetSize The numer of facet entries to be returned.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      size: function (facetSize) {
        if (facetSize == null) {
          return facet[name].terms_stats.size;
        }
      
        facet[name].terms_stats.size = facetSize;
        return this;
      },

      /**
            Sets the type of ordering that will be performed on the date
            buckets.  Valid values are:
            
            count - default, sort by the number of items in the bucket
            term - sort by term value.
            reverse_count - reverse sort of the number of items in the bucket
            reverse_term - reverse sort of the term value.
            total - sorts by the total value of the bucket contents
            reverse_total - reverse sort of the total value of bucket contents
            min - the minimum value in the bucket
            reverse_min - the reverse sort of the minimum value
            max - the maximum value in the bucket
            reverse_max - the reverse sort of the maximum value
            mean - the mean value of the bucket contents
            reverse_mean - the reverse sort of the mean value of bucket contents.
            
            @member ejs.TermStatsFacet
            @param {String} o The ordering method
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      order: function (o) {
        if (o == null) {
          return facet[name].terms_stats.order;
        }
      
        o = o.toLowerCase();
        if (o === 'count' || o === 'term' || o === 'reverse_count' || 
          o === 'reverse_term' || o === 'total' || o === 'reverse_total' || 
          o === 'min' || o === 'reverse_min' || o === 'max' || 
          o === 'reverse_max' || o === 'mean' || o === 'reverse_mean') {
          
          facet[name].terms_stats.order = o;
        }
        
        return this;
      },

      /**
            <p>Allows you to reduce the documents used for computing facet results.</p>

            @member ejs.TermStatsFacet
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

            @member ejs.TermStatsFacet
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
            
            @member ejs.TermStatsFacet
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
            @member ejs.TermStatsFacet
            @param {String} scope The scope name to calculate facet counts with.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      scope: function (scope) {
        return this;
      },
      
      /**
            <p>Enables caching of the <code>facetFilter</code></p>

            @member ejs.TermStatsFacet
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

            @member ejs.TermStatsFacet
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

            @member ejs.TermStatsFacet
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(facet);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.TermStatsFacet
            @returns {String} the type of object
            */
      _type: function () {
        return 'facet';
      },
      
      /**
            <p>Retrieves the internal <code>facet</code> object. This is typically used by
               internal API functions so use with caution.</p>

            @member ejs.TermStatsFacet
            @returns {String} returns this object's internal <code>facet</code> property.
            */
      _self: function () {
        return facet;
      }
    };
  };
