  /**
    @class
    <p>Matches documents with fields that have terms within a certain range. 
    The type of the Lucene query depends on the field type, for string fields, 
    the TermRangeQuery, while for number/date fields, the query is a 
    NumericRangeQuery.</p>

    @name ejs.RangeQuery

    @desc
    Matches documents with fields that have terms within a certain range.

    @param {String} field A valid field name.
    */
  ejs.RangeQuery = function (field) {

    /**
         The internal query object. <code>Use get()</code>
         @member ejs.RangeQuery
         @property {Object} query
         */
    var query = {
      range: {}
    };

    query.range[field] = {};

    return {

      /**
             The field to run the query against.

             @member ejs.RangeQuery
             @param {String} f A single field name.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      field: function (f) {
        var oldValue = query.range[field];

        if (f == null) {
          return field;
        }

        delete query.range[field];
        field = f;
        query.range[f] = oldValue;

        return this;
      },

      /**
            The lower bound. Defaults to start from the first.

            @member ejs.RangeQuery
            @param {Variable Type} f the lower bound value, type depends on field type
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      from: function (f) {
        if (f == null) {
          return query.range[field].from;
        }

        query.range[field].from = f;
        return this;
      },

      /**
            The upper bound. Defaults to unbounded.

            @member ejs.RangeQuery
            @param {Variable Type} t the upper bound value, type depends on field type
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      to: function (t) {
        if (t == null) {
          return query.range[field].to;
        }

        query.range[field].to = t;
        return this;
      },

      /**
            Should the first from (if set) be inclusive or not. 
            Defaults to true

            @member ejs.RangeQuery
            @param {Boolean} trueFalse true to include, false to exclude 
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      includeLower: function (trueFalse) {
        if (trueFalse == null) {
          return query.range[field].include_lower;
        }

        query.range[field].include_lower = trueFalse;
        return this;
      },

      /**
            Should the last to (if set) be inclusive or not. Defaults to true.

            @member ejs.RangeQuery
            @param {Boolean} trueFalse true to include, false to exclude 
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      includeUpper: function (trueFalse) {
        if (trueFalse == null) {
          return query.range[field].include_upper;
        }

        query.range[field].include_upper = trueFalse;
        return this;
      },

      /**
            Greater than value.  Same as setting from to the value, and 
            include_lower to false,

            @member ejs.RangeQuery
            @param {Variable Type} val the value, type depends on field type
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      gt: function (val) {
        if (val == null) {
          return query.range[field].gt;
        }

        query.range[field].gt = val;
        return this;
      },

      /**
            Greater than or equal to value.  Same as setting from to the value,
            and include_lower to true.

            @member ejs.RangeQuery
            @param {Variable Type} val the value, type depends on field type
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      gte: function (val) {
        if (val == null) {
          return query.range[field].gte;
        }

        query.range[field].gte = val;
        return this;
      },

      /**
            Less than value.  Same as setting to to the value, and include_upper 
            to false.

            @member ejs.RangeQuery
            @param {Variable Type} val the value, type depends on field type
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lt: function (val) {
        if (val == null) {
          return query.range[field].lt;
        }

        query.range[field].lt = val;
        return this;
      },

      /**
            Less than or equal to value.  Same as setting to to the value, 
            and include_upper to true.

            @member ejs.RangeQuery
            @param {Variable Type} val the value, type depends on field type
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lte: function (val) {
        if (val == null) {
          return query.range[field].lte;
        }

        query.range[field].lte = val;
        return this;
      },
                            
      /**
            Sets the boost value of the <code>Query</code>.

            @member ejs.RangeQuery
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.range[field].boost;
        }

        query.range[field].boost = boost;
        return this;
      },
    
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.RangeQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.RangeQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.RangeQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
