  /**
    @class
    <p>A query that match on any (configurable) of the provided terms. This is 
    a simpler syntax query for using a bool query with several term queries 
    in the should clauses.</p>

    @name ejs.TermsQuery

    @desc
    A Query that matches documents containing provided terms. 

    @param {String} field the document field/key to query against
    @param {String || Array} terms a single term or array of "terms" to match
    */
  ejs.TermsQuery = function (field, terms) {

    /**
         The internal query object. <code>Use get()</code>
         @member ejs.TermsQuery
         @property {Object} query
         */
    var query = {
      terms: {}
    };
    
    if (isString(terms)) {
      query.terms[field] = [terms];
    } else if (isArray(terms)) {
      query.terms[field] = terms;
    } else {
      throw new TypeError('Argument must be string or array');
    }
    
    return {

      /**
            Sets the fields to query against.

            @member ejs.TermsQuery
            @param {String} f A valid field name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (f) {
        var oldValue = query.terms[field];
      
        if (f == null) {
          return field;
        }

        delete query.terms[field];
        field = f;
        query.terms[f] = oldValue;
      
        return this;
      },
    
      /**
            Sets the terms.  If you t is a String, it is added to the existing
            list of terms.  If t is an array, the list of terms replaces the
            existing terms.

            @member ejs.TermsQuery
            @param {String || Array} t A single term or an array or terms.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      terms: function (t) {
        if (t == null) {
          return query.terms[field];
        }

        if (isString(t)) {
          query.terms[field].push(t);
        } else if (isArray(t)) {
          query.terms[field] = t;
        } else {
          throw new TypeError('Argument must be string or array');
        }
      
        return this;
      },

      /**
            Sets the minimum number of terms that need to match in a document
            before that document is returned in the results.

            @member ejs.TermsQuery
            @param {Integer} min A positive integer.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      minimumShouldMatch: function (min) {
        if (min == null) {
          return query.terms.minimum_should_match;
        }
      
        query.terms.minimum_should_match = min;
        return this;
      },
      
      /**
            Enables or disables similarity coordinate scoring of documents
            matching the <code>Query</code>. Default: false.

            @member ejs.TermsQuery
            @param {String} trueFalse A <code>true/false</code value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      disableCoord: function (trueFalse) {
        if (trueFalse == null) {
          return query.terms.disable_coord;
        }

        query.terms.disable_coord = trueFalse;
        return this;
      },
            
      /**
            Sets the boost value for documents matching the <code>Query</code>.

            @member ejs.TermsQuery
            @param {Number} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.terms.boost;
        }

        query.terms.boost = boost;
        return this;
      },

      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.TermsQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.TermsQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.TermsQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
