  /**
    @class
    <p>Filters documents that only have the provided ids. Note, this filter 
    does not require the _id field to be indexed since it works using the 
    _uid field.</p>

    @name ejs.IdsQuery

    @desc
    Matches documents with the specified id(s).

    @param {Array || String} ids A single document id or a list of document ids.
    */
  ejs.IdsQuery = function (ids) {

    /**
         The internal query object. <code>Use get()</code>
         @member ejs.IdsQuery
         @property {Object} query
         */
    var query = {
      ids: {}
    };
    
    if (isString(ids)) {
      query.ids.values = [ids];
    } else if (isArray(ids)) {
      query.ids.values = ids;
    } else {
      throw new TypeError('Argument must be string or array');
    }

    return {

      /**
            Sets the values array or adds a new value. if val is a string, it
            is added to the list of existing document ids.  If val is an
            array it is set as the document values and replaces any existing values.

            @member ejs.IdsQuery
            @param {Array || String} val An single document id or an array of document ids.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      values: function (val) {
        if (val == null) {
          return query.ids.values;
        }
    
        if (isString(val)) {
          query.ids.values.push(val);
        } else if (isArray(val)) {
          query.ids.values = val;
        } else {
          throw new TypeError('Argument must be string or array');
        }
        
        return this;
      },

      /**
            Sets the type as a single type or an array of types.  If type is a
            string, it is added to the list of existing types.  If type is an
            array, it is set as the types and overwrites an existing types. This
            parameter is optional.

            @member ejs.IdsQuery
            @param {Array || String} type A type or a list of types
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      type: function (type) {
        if (query.ids.type == null) {
          query.ids.type = [];
        }
        
        if (type == null) {
          return query.ids.type;
        }
        
        if (isString(type)) {
          query.ids.type.push(type);
        } else if (isArray(type)) {
          query.ids.type = type;
        } else {
          throw new TypeError('Argument must be string or array');
        }
        
        return this;
      },

      /**
            Sets the boost value of the <code>Query</code>.

            @member ejs.IdsQuery
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.ids.boost;
        }

        query.ids.boost = boost;
        return this;
      },
            
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.IdsQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.IdsQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.IdsQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
