  /**
    @class
    <p>A shape which has already been indexed in another index and/or index 
    type. This is particularly useful for when you have a pre-defined list of 
    shapes which are useful to your application and you want to reference this 
    using a logical name (for example ‘New Zealand’) rather than having to 
    provide their coordinates each time.</p>

    @name ejs.IndexedShape

    @desc
    <p>Defines a shape that already exists in an index/type.</p>

    @param {String} type The name of the type where the shape is indexed.
    @param {String} id The document id of the shape.

    */
  ejs.IndexedShape = function (type, id) {

    var indexedShape = {
      type: type,
      id: id
    };

    return {

      /**
            Sets the type which the shape is indexed under.

            @member ejs.IndexedShape
            @param {String} t a valid shape type.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      type: function (t) {
        if (t == null) {
          return indexedShape.type;
        }
    
        indexedShape.type = t;
        return this;
      },

      /**
            Sets the document id of the indexed shape.

            @member ejs.IndexedShape
            @param {String} id a valid document id.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      id: function (id) {
        if (id == null) {
          return indexedShape.id;
        }
    
        indexedShape.id = id;
        return this;
      },

      /**
            Sets the index which the shape is indexed under. 
            Defaults to "shapes".

            @member ejs.IndexedShape
            @param {String} idx a valid index name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      index: function (idx) {
        if (idx == null) {
          return indexedShape.index;
        }
    
        indexedShape.index = idx;
        return this;
      },

      /**
            Sets the field name containing the indexed shape. 
            Defaults to "shape".

            @member ejs.IndexedShape
            @param {String} field a valid field name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      shapeFieldName: function (field) {
        if (field == null) {
          return indexedShape.shape_field_name;
        }
    
        indexedShape.shape_field_name = field;
        return this;
      },
              
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.IndexedShape
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(indexedShape);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.IndexedShape
            @returns {String} the type of object
            */
      _type: function () {
        return 'indexed shape';
      },
      
      /**
            Retrieves the internal <code>script</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.IndexedShape
            @returns {String} returns this object's internal object representation.
            */
      _self: function () {
        return indexedShape;
      }
    };
  };
