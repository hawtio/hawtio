  /**
    @class
    <p>A query that executes high-frequency terms in a optional sub-query to 
    prevent slow queries due to "common" terms like stopwords.</p>
  
    <p>This query basically builds two queries out of the terms in the query 
    string where low-frequency terms are added to a required boolean clause and 
    high-frequency terms are added to an optional boolean clause. The optional 
    clause is only executed if the required "low-frequency' clause matches.</p>
  
    <p><code>CommonTermsQuery</code> has several advantages over stopword 
    filtering at index or query time since a term can be "classified" based on 
    the actual document frequency in the index and can prevent slow queries even 
    across domains without specialized stopword files.</p>
  
    @name ejs.CommonTermsQuery
    @since elasticsearch 0.90
  
    @desc
    A query that executes high-frequency terms in a optional sub-query.

    @param {String} field the document field/key to query against
    @param {String} qstr the query string
    */
  ejs.CommonTermsQuery = function (field, qstr) {

    /**
         The internal query object. <code>Use get()</code>
         @member ejs.CommonTermsQuery
         @property {Object} query
         */
    var query = {
      common: {}
    };
  
    // support for full Builder functionality where no constructor is used
    // use dummy field until one is set
    if (field == null) {
      field = 'no_field_set';
    }
  
    query.common[field] = {};
  
    // only set the query is one is passed in
    if (qstr != null) {
      query.common[field].query = qstr;
    }
  
    return {

      /**
            Sets the field to query against.

            @member ejs.CommonTermsQuery
            @param {String} f A valid field name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (f) {
        var oldValue = query.common[field];
    
        if (f == null) {
          return field;
        }

        delete query.common[field];
        field = f;
        query.common[f] = oldValue;
    
        return this;
      },
  
      /**
            Sets the query string.

            @member ejs.CommonTermsQuery
            @param {String} qstr The query string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      query: function (qstr) {
        if (qstr == null) {
          return query.common[field].query;
        }

        query.common[field].query = qstr;
        return this;
      },

      /**
            Sets the analyzer name used to analyze the <code>Query</code> object.

            @member ejs.CommonTermsQuery
            @param {String} analyzer A valid analyzer name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      analyzer: function (analyzer) {
        if (analyzer == null) {
          return query.common[field].analyzer;
        }

        query.common[field].analyzer = analyzer;
        return this;
      },
    
      /**
            Enables or disables similarity coordinate scoring of documents
            commoning the <code>Query</code>. Default: false.

            @member ejs.CommonTermsQuery
            @param {String} trueFalse A <code>true/false</code value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      disableCoords: function (trueFalse) {
        if (trueFalse == null) {
          return query.common[field].disable_coords;
        }

        query.common[field].disable_coords = trueFalse;
        return this;
      },
          
      /**
            Sets the maximum threshold/frequency to be considered a low 
            frequency term.  Set to a value between 0 and 1.

            @member ejs.CommonTermsQuery
            @param {Number} freq A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      cutoffFrequency: function (freq) {
        if (freq == null) {
          return query.common[field].cutoff_frequency;
        }

        query.common[field].cutoff_frequency = freq;
        return this;
      },

      /**
            Sets the boolean operator to be used for high frequency terms.
            Default: AND

            @member ejs.CommonTermsQuery
            @param {String} op Any of "and" or "or", no quote characters.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      highFreqOperator: function (op) {
        if (op == null) {
          return query.common[field].high_freq_operator;
        }

        op = op.toLowerCase();
        if (op === 'and' || op === 'or') {
          query.common[field].high_freq_operator = op;
        }

        return this;
      },
    
      /**
            Sets the boolean operator to be used for low frequency terms.
            Default: AND
          
            @member ejs.CommonTermsQuery
            @param {String} op Any of "and" or "or", no quote characters.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      lowFreqOperator: function (op) {
        if (op == null) {
          return query.common[field].low_freq_operator;
        }

        op = op.toLowerCase();
        if (op === 'and' || op === 'or') {
          query.common[field].low_freq_operator = op;
        }

        return this;
      },
    
      /**
            Sets the minimum number of common that need to common in a document
            before that document is returned in the results.

            @member ejs.CommonTermsQuery
            @param {Integer} min A positive integer.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      minimumShouldMatch: function (min) {
        if (min == null) {
          return query.common[field].minimum_should_match;
        }
    
        query.common[field].minimum_should_match = min;
        return this;
      },

      /**
            Sets the boost value for documents commoning the <code>Query</code>.

            @member ejs.CommonTermsQuery
            @param {Number} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.common[field].boost;
        }

        query.common[field].boost = boost;
        return this;
      },
    
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.CommonTermsQuery
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
          
            @member ejs.CommonTermsQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
    
      /**
            Retrieves the internal <code>query</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.CommonTermsQuery
            @returns {String} returns this object's internal <code>query</code> property.
            */
      _self: function () {
        return query;
      }
    };
  };
