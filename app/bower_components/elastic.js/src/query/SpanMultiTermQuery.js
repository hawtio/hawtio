  /**
    @class
    <p>Wraps lucene MultiTermQueries as a SpanQuery so it can be used in the
    various Span* queries.  Examples of valid MultiTermQueries are
    <code>Fuzzy, NumericRange, Prefix, Regex, Range, and Wildcard</code>.</p>

    @name ejs.SpanMultiTermQuery
    @since elasticsearch 0.90

    @desc
    Use MultiTermQueries as a SpanQuery.

    @param {Query} qry An optional multi-term query object.
    */
  ejs.SpanMultiTermQuery = function (qry) {

    if (qry != null && !isQuery(qry)) {
      throw new TypeError('Argument must be a MultiTermQuery');
    }

    /**
         The internal query object. <code>Use _self()</code>
         @member ejs.SpanMultiTermQuery
         @property {Object} query
         */
    var query = {
      span_multi: {
        match: {}
      }
    };

    if (qry != null) {
      query.span_multi.match = qry._self();
    }

    return {

      /**
            Sets the span query to match on.

            @member ejs.SpanMultiTermQuery
            @param {Object} mtQuery Any valid multi-term query.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      match: function (mtQuery) {
        if (mtQuery == null) {
          return query.span_multi.match;
        }
  
        if (!isQuery(mtQuery)) {
          throw new TypeError('Argument must be a MultiTermQuery');
        }
    
        query.span_multi.match = mtQuery._self();
        return this;
      },
  
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.SpanMultiTermQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
        
            @member ejs.SpanMultiTermQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
  
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.SpanMultiTermQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
