  /**
    @class
    <p>This filter can be used to match on all the documents
    in a given set of collections and/or types.</p>

    @name ejs.MatchAllFilter

    @desc
    <p>A filter that matches on all documents</p>

     */
  ejs.MatchAllFilter = function () {

    /**
         The internal Query object. Use <code>get()</code>.
         @member ejs.MatchAllFilter
         @property {Object} filter
         */
    var filter = {
      match_all: {}
    };

    return {

      /**
             Serializes the internal <em>filter</em> object as a JSON string.
             @member ejs.MatchAllFilter
             @returns {String} Returns a JSON representation of the object.
             */
      toString: function () {
        return JSON.stringify(filter);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.MatchAllFilter
            @returns {String} the type of object
            */
      _type: function () {
        return 'filter';
      },
      
      /**
            This method is used to retrieve the raw filter object. It's designed
            for internal use when composing and serializing queries.
            @member ejs.MatchAllFilter
            @returns {Object} Returns the object's <em>filter</em> property.
            */
      _self: function () {
        return filter;
      }
    };
  };
