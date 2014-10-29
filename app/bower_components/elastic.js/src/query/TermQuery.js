  /**
    @class
    <p>A <code>TermQuery</code> can be used to return documents containing a given
    keyword or <em>term</em>. For instance, you might want to retieve all the
    documents/objects that contain the term <code>Javascript</code>. Term filters
    often serve as the basis for more complex queries such as <em>Boolean</em> queries.</p>

    @name ejs.TermQuery

    @desc
    A Query that matches documents containing a term. This may be
    combined with other terms with a BooleanQuery.

    @param {String} field the document field/key to query against
    @param {String} term the literal value to be matched
    */
  ejs.TermQuery = function (field, term) {

    /**
         The internal query object. <code>Use get()</code>
         @member ejs.TermQuery
         @property {Object} query
         */
    var query = {
      term: {}
    };

    query.term[field] = {
      term: term
    };

    return {

      /**
            Sets the fields to query against.

            @member ejs.TermQuery
            @param {String} f A valid field name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (f) {
        var oldValue = query.term[field];
      
        if (f == null) {
          return field;
        }

        delete query.term[field];
        field = f;
        query.term[f] = oldValue;
      
        return this;
      },
    
      /**
            Sets the term.

            @member ejs.TermQuery
            @param {String} t A single term.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      term: function (t) {
        if (t == null) {
          return query.term[field].term;
        }

        query.term[field].term = t;
        return this;
      },
      
      /**
            Sets the boost value for documents matching the <code>Query</code>.

            @member ejs.TermQuery
            @param {Number} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.term[field].boost;
        }

        query.term[field].boost = boost;
        return this;
      },

      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.TermQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.TermQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.TermQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
