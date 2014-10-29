  /**
    @class
    <p>This query can be used to match all the documents
    in a given set of collections and/or types.</p>

    @name ejs.MatchAllQuery

    @desc
    <p>A query that returns all documents.</p>

     */
  ejs.MatchAllQuery = function () {

    /**
         The internal Query object. Use <code>get()</code>.
         @member ejs.MatchAllQuery
         @property {Object} query
         */
    var query = {
      match_all: {}
    };

    return {

      /**
            Sets the boost value of the <code>Query</code>.

            @member ejs.MatchAllQuery
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.match_all.boost;
        }

        query.match_all.boost = boost;
        return this;
      },
      
      /**
             Serializes the internal <em>query</em> object as a JSON string.
             @member ejs.MatchAllQuery
             @returns {String} Returns a JSON representation of the Query object.
             */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.MatchAllQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            This method is used to retrieve the raw query object. It's designed
            for internal use when composing and serializing queries.
            
            @member ejs.MatchAllQuery
            @returns {Object} Returns the object's <em>query</em> property.
            */
      _self: function () {
        return query;
      }
    };
  };
