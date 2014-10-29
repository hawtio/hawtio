  /**
    @class
    <p>A spanNearQuery will look to find a number of spanQuerys within a given
    distance from each other.</p>

    @name ejs.SpanNearQuery

    @desc
    Matches spans which are near one another.

    @param {Query || Array} clauses A single SpanQuery or array of SpanQueries
    @param {Integer} slop The number of intervening unmatched positions

    */
  ejs.SpanNearQuery = function (clauses, slop) {

    /**
         The internal query object. <code>Use _self()</code>
         @member ejs.SpanNearQuery
         @property {Object} query
         */
    var i, len,
      query = {
        span_near: {
          clauses: [],
          slop: slop
        }
      };
    
    if (isQuery(clauses)) {
      query.span_near.clauses.push(clauses._self());
    } else if (isArray(clauses)) {
      for (i = 0, len = clauses.length; i < len; i++) {
        if (!isQuery(clauses[i])) {
          throw new TypeError('Argument must be array of SpanQueries');
        }
        
        query.span_near.clauses.push(clauses[i]._self());
      }
    } else {
      throw new TypeError('Argument must be SpanQuery or array of SpanQueries');
    }

    return {

      /**
            Sets the clauses used.  If passed a single SpanQuery, it is added
            to the existing list of clauses.  If passed an array of
            SpanQueries, they replace any existing clauses.

            @member ejs.SpanNearQuery
            @param {Query || Array} clauses A SpanQuery or array of SpanQueries.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      clauses: function (clauses) {
        var i, len;
        
        if (clauses == null) {
          return query.span_near.clauses;
        }
      
        if (isQuery(clauses)) {
          query.span_near.clauses.push(clauses._self());
        } else if (isArray(clauses)) {
          query.span_near.clauses = [];
          for (i = 0, len = clauses.length; i < len; i++) {
            if (!isQuery(clauses[i])) {
              throw new TypeError('Argument must be array of SpanQueries');
            }

            query.span_near.clauses.push(clauses[i]._self());
          }
        } else {
          throw new TypeError('Argument must be SpanQuery or array of SpanQueries');
        }
        
        return this;
      },

      /**
            Sets the maximum number of intervening unmatched positions.

            @member ejs.SpanNearQuery
            @param {Number} distance The number of intervening unmatched positions.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      slop: function (distance) {
        if (distance == null) {
          return query.span_near.slop;
        }
      
        query.span_near.slop = distance;
        return this;
      },

      /**
            Sets whether or not matches are required to be in-order.

            @member ejs.SpanNearQuery
            @param {Boolean} trueFalse Determines if matches must be in-order.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      inOrder: function (trueFalse) {
        if (trueFalse == null) {
          return query.span_near.in_order;
        }
      
        query.span_near.in_order = trueFalse;
        return this;
      },

      /**
            Sets whether or not payloads are being used. A payload is an arbitrary
            byte array stored at a specific position (i.e. token/term).

            @member ejs.SpanNearQuery
            @param {Boolean} trueFalse Whether or not to return payloads.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      collectPayloads: function (trueFalse) {
        if (trueFalse == null) {
          return query.span_near.collect_payloads;
        }
      
        query.span_near.collect_payloads = trueFalse;
        return this;
      },

      /**
            Sets the boost value of the <code>Query</code>.

            @member ejs.SpanNearQuery
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.span_near.boost;
        }

        query.span_near.boost = boost;
        return this;
      },
      
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.SpanNearQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.SpanNearQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.SpanNearQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
