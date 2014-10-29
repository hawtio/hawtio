  /**
    @class
    <p>A Shape object that can be used in queries and filters that 
    take a Shape.  Shape uses the GeoJSON format.</p>

    <p>See http://www.geojson.org/</p>

    @name ejs.Shape

    @desc
    <p>Defines a shape</p>

    @param {String} type A valid shape type.
    @param {Array} coords An valid coordinat definition for the given shape.

    */
  ejs.Shape = function (type, coords) {
  
    var 
      shape = {},
      validType = function (t) {
        var valid = false;
        if (t === 'point' || t === 'linestring' || t === 'polygon' || 
          t === 'multipoint' || t === 'envelope' || t === 'multipolygon') {
          valid = true;
        }

        return valid;
      };
    
    type = type.toLowerCase();
    if (validType(type)) {
      shape.type = type;
      shape.coordinates = coords;
    }  
  
    return {

      /**
            Sets the shape type.  Can be set to one of:  point, linestring, polygon,
            multipoint, envelope, or multipolygon.

            @member ejs.Shape
            @param {String} t a valid shape type.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      type: function (t) {
        if (t == null) {
          return shape.type;
        }
      
        t = t.toLowerCase();
        if (validType(t)) {
          shape.type = t;
        }
      
        return this;
      },

      /**
            Sets the coordinates for the shape definition.  Note, the coordinates
            are not validated in this api.  Please see GeoJSON and ElasticSearch
            documentation for correct coordinate definitions.

            @member ejs.Shape
            @param {Array} c a valid coordinates definition for the shape.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      coordinates: function (c) {
        if (c == null) {
          return shape.coordinates;
        }

        shape.coordinates = c;
        return this;
      },
        
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.Shape
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(shape);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.Shape
            @returns {String} the type of object
            */
      _type: function () {
        return 'shape';
      },
      
      /**
            Retrieves the internal <code>script</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.Shape
            @returns {String} returns this object's internal object representation.
            */
      _self: function () {
        return shape;
      }
    };
  };
