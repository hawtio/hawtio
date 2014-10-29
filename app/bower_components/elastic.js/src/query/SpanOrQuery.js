  /**
    @class
    <p>The spanOrQuery takes an array of SpanQuerys and will match if any of the
    underlying SpanQueries match. The span or query maps to Lucene SpanOrQuery.</p>

    @name ejs.SpanOrQuery

    @desc
    Matches the union of its span clauses.

    @param {Object} clauses A single SpanQuery or array of SpanQueries.

    */
  ejs.SpanOrQuery = function (clauses) {

    /**
         The internal query object. <code>Use _self()</code>
         @member ejs.SpanOrQuery
         @property {Object} query
         */
    var i, 
      len,
      query = {
        span_or: {
          clauses: []
        }
      };

    if (isQuery(clauses)) {
      query.span_or.clauses.push(clauses._self());
    } else if (isArray(clauses)) {
      for (i = 0, len = clauses.length; i < len; i++) {
        if (!isQuery(clauses[i])) {
          throw new TypeError('Argument must be array of SpanQueries');
        }
        
        query.span_or.clauses.push(clauses[i]._self());
      }
    } else {
      throw new TypeError('Argument must be SpanQuery or array of SpanQueries');
    }

    return {

      /**
            Sets the clauses used.  If passed a single SpanQuery, it is added
            to the existing list of clauses.  If passed an array of
            SpanQueries, they replace any existing clauses.

            @member ejs.SpanOrQuery
            @param {Query || Array} clauses A SpanQuery or array of SpanQueries.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      clauses: function (clauses) {
        var i, len;
        
        if (clauses == null) {
          return query.span_or.clauses;
        }
      
        if (isQuery(clauses)) {
          query.span_or.clauses.push(clauses._self());
        } else if (isArray(clauses)) {
          query.span_or.clauses = [];
          for (i = 0, len = clauses.length; i < len; i++) {
            if (!isQuery(clauses[i])) {
              throw new TypeError('Argument must be array of SpanQueries');
            }

            query.span_or.clauses.push(clauses[i]._self());
          }
        } else {
          throw new TypeError('Argument must be SpanQuery or array of SpanQueries');
        }
        
        return this;
      },

      /**
            Sets the boost value of the <code>Query</code>.

            @member ejs.SpanOrQuery
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.span_or.boost;
        }

        query.span_or.boost = boost;
        return this;
      },
      
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.SpanOrQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.SpanOrQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.SpanOrQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
