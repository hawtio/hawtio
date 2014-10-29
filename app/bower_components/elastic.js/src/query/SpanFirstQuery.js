  /**
    @class
    <p>Matches spans near the beginning of a field. The spanFirstQuery allows you to search
    for Spans that start and end within the first <code>n</code> positions of the document.
    The span first query maps to Lucene SpanFirstQuery.</p>

    @name ejs.SpanFirstQuery

    @desc
    Matches spans near the beginning of a field.

    @param {Query} spanQry A valid SpanQuery
    @param {Integer} end the maximum end position in a match.
    
    */
  ejs.SpanFirstQuery = function (spanQry, end) {

    if (!isQuery(spanQry)) {
      throw new TypeError('Argument must be a SpanQuery');
    }
    
    /**
         The internal query object. <code>Use _self()</code>
         @member ejs.SpanFirstQuery
         @property {Object} query
         */
    var query = {
      span_first: {
        match: spanQry._self(),
        end: end
      }
    };

    return {

      /**
            Sets the span query to match on.

            @member ejs.SpanFirstQuery
            @param {Object} spanQuery Any valid span type query.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      match: function (spanQuery) {
        if (spanQuery == null) {
          return query.span_first.match;
        }
      
        if (!isQuery(spanQuery)) {
          throw new TypeError('Argument must be a SpanQuery');
        }
        
        query.span_first.match = spanQuery._self();
        return this;
      },

      /**
            Sets the maximum end position permitted in a match.

            @member ejs.SpanFirstQuery
            @param {Number} position The maximum position length to consider.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      end: function (position) {
        if (position == null) {
          return query.span_first.end;
        }
      
        query.span_first.end = position;
        return this;
      },

      /**
            Sets the boost value of the <code>Query</code>.

            @member ejs.SpanFirstQuery
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.span_first.boost;
        }

        query.span_first.boost = boost;
        return this;
      },
      
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.SpanFirstQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.SpanFirstQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.SpanFirstQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
