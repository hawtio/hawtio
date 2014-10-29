  /**
    @class
    <p>The fuzzy_like_this_field query is the same as the fuzzy_like_this 
    query, except that it runs against a single field. It provides nicer query 
    DSL over the generic fuzzy_like_this query, and support typed fields 
    query (automatically wraps typed fields with type filter to match only on 
    the specific type).</p>

    <p>Fuzzifies ALL terms provided as strings and then picks the best n 
    differentiating terms. In effect this mixes the behaviour of FuzzyQuery and 
    MoreLikeThis but with special consideration of fuzzy scoring factors. This 
    generally produces good results for queries where users may provide details 
    in a number of fields and have no knowledge of boolean query syntax and 
    also want a degree of fuzzy matching and a fast query.</p>

    <p>For each source term the fuzzy variants are held in a BooleanQuery with 
    no coord factor (because we are not looking for matches on multiple variants 
    in any one doc). Additionally, a specialized TermQuery is used for variants 
    and does not use that variant term’s IDF because this would favour rarer 
    terms eg misspellings. Instead, all variants use the same IDF 
    ranking (the one for the source query term) and this is factored into the 
    variant’s boost. If the source query term does not exist in the index the 
    average IDF of the variants is used.</p>

    @name ejs.FuzzyLikeThisFieldQuery

    @desc
    <p>Constructs a query where each documents returned are “like” provided text</p>

    @param {String} field The field to run the query against.
    @param {String} likeText The text to find documents like it.
    */
  ejs.FuzzyLikeThisFieldQuery = function (field, likeText) {

    /**
         The internal Query object. Use <code>get()</code>.
         @member ejs.FuzzyLikeThisFieldQuery
         @property {Object} query
         */
    var query = {
      flt_field: {}
    };

    query.flt_field[field] = {
      like_text: likeText
    };
  
    return {
  
      /**
             The field to run the query against.

             @member ejs.FuzzyLikeThisFieldQuery
             @param {String} f A single field name.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      field: function (f) {
        var oldValue = query.flt_field[field];
      
        if (f == null) {
          return field;
        }
    
        delete query.flt_field[field];
        field = f;
        query.flt_field[f] = oldValue;
    
        return this;
      },
  
      /**
            The text to find documents like

            @member ejs.FuzzyLikeThisFieldQuery
            @param {String} s A text string.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      likeText: function (txt) {
        if (txt == null) {
          return query.flt_field[field].like_text;
        }
  
        query.flt_field[field].like_text = txt;
        return this;
      },

      /**
            Should term frequency be ignored. Defaults to false.

            @member ejs.FuzzyLikeThisFieldQuery
            @param {Boolean} trueFalse A boolean value
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      ignoreTf: function (trueFalse) {
        if (trueFalse == null) {
          return query.flt_field[field].ignore_tf;
        }
  
        query.flt_field[field].ignore_tf = trueFalse;
        return this;
      },

      /**
            The maximum number of query terms that will be included in any 
            generated query. Defaults to 25.

            @member ejs.FuzzyLikeThisFieldQuery
            @param {Integer} max A positive integer value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      maxQueryTerms: function (max) {
        if (max == null) {
          return query.flt_field[field].max_query_terms;
        }
  
        query.flt_field[field].max_query_terms = max;
        return this;
      },

      /**
            The minimum similarity of the term variants. Defaults to 0.5.

            @member ejs.FuzzyLikeThisFieldQuery
            @param {Double} min A positive double value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      minSimilarity: function (min) {
        if (min == null) {
          return query.flt_field[field].min_similarity;
        }
  
        query.flt_field[field].min_similarity = min;
        return this;
      },

      /**
            Length of required common prefix on variant terms. Defaults to 0..

            @member ejs.FuzzyLikeThisFieldQuery
            @param {Integer} len A positive integer value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      prefixLength: function (len) {
        if (len == null) {
          return query.flt_field[field].prefix_length;
        }
  
        query.flt_field[field].prefix_length = len;
        return this;
      },

      /**
            The analyzer that will be used to analyze the text. Defaults to the 
            analyzer associated with the field.

            @member ejs.FuzzyLikeThisFieldQuery
            @param {String} analyzerName The name of the analyzer.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      analyzer: function (analyzerName) {
        if (analyzerName == null) {
          return query.flt_field[field].analyzer;
        }
  
        query.flt_field[field].analyzer = analyzerName;
        return this;
      },
                      
      /**
            Sets the boost value of the <code>Query</code>.

            @member ejs.FuzzyLikeThisFieldQuery
            @param {Double} boost A positive <code>double</code> value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boost: function (boost) {
        if (boost == null) {
          return query.flt_field[field].boost;
        }

        query.flt_field[field].boost = boost;
        return this;
      },

      /**
             Serializes the internal <em>query</em> object as a JSON string.
             @member ejs.FuzzyLikeThisFieldQuery
             @returns {String} Returns a JSON representation of the Query object.
             */
      toString: function () {
        return JSON.stringify(query);
      },

      /**
            The type of ejs object.  For internal use only.
            
            @member ejs.FuzzyLikeThisFieldQuery
            @returns {String} the type of object
            */
      _type: function () {
        return 'query';
      },
      
      /**
            This method is used to retrieve the raw query object. It's designed
            for internal use when composing and serializing queries.
            @member ejs.FuzzyLikeThisFieldQuery
            @returns {Object} Returns the object's <em>query</em> property.
            */
      _self: function () {
        return query;
      }
    };
  };
