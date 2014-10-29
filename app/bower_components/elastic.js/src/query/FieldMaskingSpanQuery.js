  /**
    @class
    <p>Wrapper to allow SpanQuery objects participate in composite single-field 
    SpanQueries by 'lying' about their search field. That is, the masked 
    SpanQuery will function as normal, but when asked for the field it 
    queries against, it will return the value specified as the masked field vs.
    the real field used in the wrapped span query.</p>

    @name ejs.FieldMaskingSpanQuery

    @desc
    Wraps a SpanQuery and hides the real field being searched across.

    @param {Query} spanQry A valid SpanQuery
    @param {Integer} field the maximum field position in a match.
  
    */
  ejs.FieldMaskingSpanQuery = function (spanQry, field) {

    if (!isQuery(spanQry)) {
      throw new TypeError('Argument must be a SpanQuery');
    }
  
    /**
         The internal query object. <code>Use _self()</code>
         @member ejs.FieldMaskingSpanQuery
         @property {Object} query
         */
    var query = {
      field_masking_span: {
        query: spanQry._self(),
        field: field
      }
    };

    return {

      /**
            Sets the span query to wrap.

            @member ejs.FieldMaskingSpanQuery
            @param {Query} spanQuery Any valid span type query.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      query: function (spanQuery) {
        if (spanQuery == null) {
          return query.field_masking_span.query;
        }
    
        if (!isQuery(spanQuery)) {
          throw new TypeError('Argument must be a SpanQuery');
        }
      
        query.field_masking_span.query = spanQuery._self();
        return this;
      },

      /**
            Sets the value of the "masked" field.  

            @member ejs.FieldMaskingSpanQuery
            @param {String} f A field name the wrapped span query should use
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (f) {
        if (f == null) {
          return query.field_masking_span.field;
        }
    
        query.field_masking_span.field = f;
        return this;
      },

      /**
            Sets the boost value of the <code>Query</code>.

            @member ejs.FieldMaskingSpanQuery
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.field_masking_span.boost;
        }

        query.field_masking_span.boost = boost;
        return this;
      },
    
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.FieldMaskingSpanQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.FieldMaskingSpanQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.FieldMaskingSpanQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
