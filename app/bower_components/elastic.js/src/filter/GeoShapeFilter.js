  /**
    @class
    <p>Efficient filtering of documents containing shapes indexed using the 
    geo_shape type.</p>

    <p>Much like the geo_shape type, the geo_shape filter uses a grid square 
    representation of the filter shape to find those documents which have shapes 
    that relate to the filter shape in a specified way. In order to do this, the 
    field being queried must be of geo_shape type. The filter will use the same 
    PrefixTree configuration as defined for the field.</p>

    @name ejs.GeoShapeFilter

    @desc
    A Filter to find documents with a geo_shapes matching a specific shape.

    */
  ejs.GeoShapeFilter = function (field) {

    /**
         The internal filter object. <code>Use _self()</code>
         @member ejs.GeoShapeFilter
         @property {Object} GeoShapeFilter
         */
    var filter = {
      geo_shape: {}
    };

    filter.geo_shape[field] = {};

    return {

      /**
            Sets the field to filter against.

            @member ejs.GeoShapeFilter
            @param {String} f A valid field name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (f) {
        var oldValue = filter.geo_shape[field];
  
        if (f == null) {
          return field;
        }

        delete filter.geo_shape[field];
        field = f;
        filter.geo_shape[f] = oldValue;
  
        return this;
      },

      /**
            Sets the shape

            @member ejs.GeoShapeFilter
            @param {String} shape A valid <code>Shape</code> object.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      shape: function (shape) {
        if (shape == null) {
          return filter.geo_shape[field].shape;
        }

        if (filter.geo_shape[field].indexed_shape != null) {
          delete filter.geo_shape[field].indexed_shape;
        }
      
        filter.geo_shape[field].shape = shape._self();
        return this;
      },

      /**
            Sets the indexed shape.  Use this if you already have shape definitions
            already indexed.

            @member ejs.GeoShapeFilter
            @param {String} indexedShape A valid <code>IndexedShape</code> object.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      indexedShape: function (indexedShape) {
        if (indexedShape == null) {
          return filter.geo_shape[field].indexed_shape;
        }

        if (filter.geo_shape[field].shape != null) {
          delete filter.geo_shape[field].shape;
        }
      
        filter.geo_shape[field].indexed_shape = indexedShape._self();
        return this;
      },

      /**
            Sets the shape relation type.  A relationship between a Query Shape 
            and indexed Shapes that will be used to determine if a Document 
            should be matched or not.  Valid values are:  intersects, disjoint,
            and within.

            @member ejs.GeoShapeFilter
            @param {String} indexedShape A valid <code>IndexedShape</code> object.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      relation: function (relation) {
        if (relation == null) {
          return filter.geo_shape[field].relation;
        }

        relation = relation.toLowerCase();
        if (relation === 'intersects' || relation === 'disjoint' || relation === 'within') {
          filter.geo_shape[field].relation = relation;
        }
    
        return this;
      },

      /**
            <p>Sets the spatial strategy.</p>  
            <p>Valid values are:</p>
            
            <dl>
                <dd><code>recursive</code> - default, recursively traverse nodes in
                  the spatial prefix tree.  This strategy has support for 
                  searching non-point shapes.</dd>
                <dd><code>term</code> - uses a large TermsFilter on each node
                  in the spatial prefix tree.  It only supports the search of 
                  indexed Point shapes.</dd>
            </dl>

            <p>This is an advanced setting, use with care.</p>
            
            @since elasticsearch 0.90
            @member ejs.GeoShapeFilter
            @param {String} strategy The strategy as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      strategy: function (strategy) {
        if (strategy == null) {
          return filter.geo_shape[field].strategy;
        }

        strategy = strategy.toLowerCase();
        if (strategy === 'recursive' || strategy === 'term') {
          filter.geo_shape[field].strategy = strategy;
        }
        
        return this;
      },
        
      /**
            Sets the filter name.

            @member ejs.GeoShapeFilter
            @param {String} name A name for the filter.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      name: function (name) {
        if (name == null) {
          return filter.geo_shape._name;
        }

        filter.geo_shape._name = name;
        return this;
      },

      /**
            Enable or disable caching of the filter

            @member ejs.GeoShapeFilter
            @param {Boolean} trueFalse True to cache the filter, false otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cache: function (trueFalse) {
        if (trueFalse == null) {
          return filter.geo_shape._cache;
        }

        filter.geo_shape._cache = trueFalse;
        return this;
      },
    
      /**
            Sets the cache key.

            @member ejs.GeoShapeFilter
            @param {String} key the cache key as a string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cacheKey: function (key) {
        if (key == null) {
          return filter.geo_shape._cache_key;
        }

        filter.geo_shape._cache_key = key;
        return this;
      },
        
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.GeoShapeFilter
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.GeoShapeFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
            Retrieves the internal <code>filter</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.GeoShapeFilter
            @returns {String} returns this object's internal <code>filter</code> property.
            */
      _self: function () {
        return filter;
      }
    };
  };
