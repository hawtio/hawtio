  /**
    @class
    <p>A spanTermQuery is the basic unit of Lucene's Span Query which allows for nested,
    positional restrictions when matching documents. The spanTermQuery simply matches
    spans containing a term. It's essentially a termQuery with positional information asscoaited.</p>

    @name ejs.SpanTermQuery

    @desc
    Matches spans containing a term

    @param {String} field the document field/field to query against
    @param {String} value the literal value to be matched
    */
  ejs.SpanTermQuery = function (field, value) {

    /**
         The internal query object. <code>Use get()</code>
         @member ejs.SpanTermQuery
         @property {Object} query
         */
    var query = {
      span_term: {}
    };

    query.span_term[field] = {
      term: value
    };

    return {

      /**
            Sets the field to query against.

            @member ejs.SpanTermQuery
            @param {String} f A valid field name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (f) {
        var oldValue = query.span_term[field];
      
        if (f == null) {
          return field;
        }

        delete query.span_term[field];
        field = f;
        query.span_term[f] = oldValue;
      
        return this;
      },
    
      /**
            Sets the term.

            @member ejs.SpanTermQuery
            @param {String} t A single term.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      term: function (t) {
        if (t == null) {
          return query.span_term[field].term;
        }

        query.span_term[field].term = t;
        return this;
      },
      
      /**
            Sets the boost value for documents matching the <code>Query</code>.

            @member ejs.SpanTermQuery
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.span_term[field].boost;
        }

        query.span_term[field].boost = boost;
        return this;
      },

      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.SpanTermQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.SpanTermQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.SpanTermQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
