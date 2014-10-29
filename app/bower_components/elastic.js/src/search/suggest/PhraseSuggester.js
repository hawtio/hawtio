  /**
    @class
    <p>PhraseSuggester extends the <code>PhraseSuggester</code> and suggests
    entire corrected phrases instead of individual tokens.  The individual
    phrase suggestions are weighted based on ngram-langugage models. In practice 
    it will be able to make better decision about which tokens to pick based on 
    co-occurence and frequencies.</p>

    @name ejs.PhraseSuggester

    @since elasticsearch 0.90
    
    @desc
    <p>A suggester that suggests entire corrected phrases.</p>

    @param {String} name The name which be used to refer to this suggester.
    */
  ejs.PhraseSuggester = function (name) {

    /**
        The internal suggest object.
        @member ejs.PhraseSuggester
        @property {Object} suggest
        */
    var suggest = {};
    suggest[name] = {phrase: {}};

    return {

      /**
            <p>Sets the text to get suggestions for.  If not set, the global
            suggestion text will be used.</p>

            @member ejs.PhraseSuggester
            @param {String} txt A string to get suggestions for.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      text: function (txt) {
        if (txt == null) {
          return suggest[name].text;
        }
    
        suggest[name].text = txt;
        return this;
      },

      /**
            <p>Sets analyzer used to analyze the suggest text.</p>

            @member ejs.PhraseSuggester
            @param {String} analyzer A valid analyzer name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      analyzer: function (analyzer) {
        if (analyzer == null) {
          return suggest[name].phrase.analyzer;
        }
    
        suggest[name].phrase.analyzer = analyzer;
        return this;
      },
      
      /**
            <p>Sets the field used to generate suggestions from.</p>

            @member ejs.PhraseSuggester
            @param {String} field A valid field name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (field) {
        if (field == null) {
          return suggest[name].phrase.field;
        }
    
        suggest[name].phrase.field = field;
        return this;
      },
      
      /**
            <p>Sets the number of suggestions returned for each token.</p>

            @member ejs.PhraseSuggester
            @param {Integer} s A positive integer value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      size: function (s) {
        if (s == null) {
          return suggest[name].phrase.size;
        }
    
        suggest[name].phrase.size = s;
        return this;
      },
      
      /**
            <p>Sets the maximum number of suggestions to be retrieved from 
            each individual shard.</p>

            @member ejs.PhraseSuggester
            @param {Integer} s A positive integer value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      shardSize: function (s) {
        if (s == null) {
          return suggest[name].phrase.shard_size;
        }
    
        suggest[name].phrase.shard_size = s;
        return this;
      },
      
      /**
            <p>Sets the likelihood of a term being a misspelled even if the 
            term exists in the dictionary. The default it 0.95 corresponding 
            to 5% or the real words are misspelled.</p>

            @member ejs.PhraseSuggester
            @param {Double} l A positive double value greater than 0.0.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      realWorldErrorLikelihood: function (l) {
        if (l == null) {
          return suggest[name].phrase.real_world_error_likelihood;
        }
    
        suggest[name].phrase.real_world_error_likelihood = l;
        return this;
      },
      
      /**
            <p>Sets the confidence level defines a factor applied to the input 
            phrases score which is used as a threshold for other suggest 
            candidates. Only candidates that score higher than the threshold 
            will be included in the result.</p>

            @member ejs.PhraseSuggester
            @param {Double} c A positive double value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      confidence: function (c) {
        if (c == null) {
          return suggest[name].phrase.confidence;
        }
    
        suggest[name].phrase.confidence = c;
        return this;
      },
      
      /**
            <p>Sets the separator that is used to separate terms in the bigram 
            field. If not set the whitespce character is used as a 
            separator.</p>

            @member ejs.PhraseSuggester
            @param {String} sep A string separator.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      separator: function (sep) {
        if (sep == null) {
          return suggest[name].phrase.separator;
        }
    
        suggest[name].phrase.separator = sep;
        return this;
      },
      
      /**
            <p>Sets the maximum percentage of the terms that at most 
            considered to be misspellings in order to form a correction.</p>

            @member ejs.PhraseSuggester
            @param {Double} c A positive double value greater between 0 and 1.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      maxErrors: function (max) {
        if (max == null) {
          return suggest[name].phrase.max_errors;
        }
    
        suggest[name].phrase.max_errors = max;
        return this;
      },
      
      /**
            <p>Sets the max size of the n-grams (shingles) in the field. If 
            the field doesn't contain n-grams (shingles) this should be 
            omitted or set to 1.</p>

            @member ejs.PhraseSuggester
            @param {Integer} s A positive integer value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      gramSize: function (s) {
        if (s == null) {
          return suggest[name].phrase.gram_size;
        }
    
        suggest[name].phrase.gram_size = s;
        return this;
      },
      
      /**
            <p>Forces the use of unigrams.</p>

            @member ejs.PhraseSuggester
            @param {Boolean} trueFalse True to force unigrams, false otherwise.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      forceUnigrams: function (trueFalse) {
        if (trueFalse == null) {
          return suggest[name].phrase.force_unigrams;
        }
    
        suggest[name].phrase.force_unigrams = trueFalse;
        return this;
      },
      
      /**
            <p>A smoothing model that takes the weighted mean of the unigrams, 
            bigrams and trigrams based on user supplied weights (lambdas). The
            sum of tl, bl, and ul must equal 1.</p>

            @member ejs.PhraseSuggester
            @param {Double} tl A positive double value used for trigram weight.
            @param {Double} bl A positive double value used for bigram weight.
            @param {Double} ul A positive double value used for unigram weight.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      linearSmoothing: function (tl, bl, ul) {
        if (arguments.length === 0) {
          return suggest[name].phrase.smoothing;
        }
    
        suggest[name].phrase.smoothing = {
          linear: {
            trigram_lambda: tl,
            bigram_lambda: bl,
            unigram_lambda: ul
          }
        };
        
        return this;
      },
      
      /**
            <p>A smoothing model that uses an additive smoothing model where a 
            constant (typically 1.0 or smaller) is added to all counts to 
            balance weights, The default alpha is 0.5.</p>

            @member ejs.PhraseSuggester
            @param {Double} alpha A double value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      laplaceSmoothing: function (alpha) {
        if (alpha == null) {
          return suggest[name].phrase.smoothing;
        }
    
        suggest[name].phrase.smoothing = {
          laplace: {
            alpha: alpha
          }
        };
        
        return this;
      },
      
      /**
            <p>A simple backoff model that backs off to lower order n-gram 
            models if the higher order count is 0 and discounts the lower 
            order n-gram model by a constant factor. The default discount is 
            0.4.</p>

            @member ejs.PhraseSuggester
            @param {Double} discount A double value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      stupidBackoffSmoothing: function (discount) {
        if (discount == null) {
          return suggest[name].phrase.smoothing;
        }
    
        suggest[name].phrase.smoothing = {
          stupid_backoff: {
            discount: discount
          }
        };
        
        return this;
      },
      
      /**
            Adds a direct generator. If passed a single <code>Generator</code>
            it is added to the list of existing generators.  If passed an 
            array of Generators, they replace all existing generators.

            @member ejs.PhraseSuggester
            @param {Generator || Array} oGenerator A valid Generator or 
              array of Generator objects.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      directGenerator: function (oGenerator) {
        var i, len;

        if (suggest[name].phrase.direct_generator == null) {
          suggest[name].phrase.direct_generator = [];
        }

        if (oGenerator == null) {
          return suggest[name].phrase.direct_generator;
        }

        if (isGenerator(oGenerator)) {
          suggest[name].phrase.direct_generator.push(oGenerator._self());
        } else if (isArray(oGenerator)) {
          suggest[name].phrase.direct_generator = [];
          for (i = 0, len = oGenerator.length; i < len; i++) {
            if (!isGenerator(oGenerator[i])) {
              throw new TypeError('Argument must be an array of Generators');
            }

            suggest[name].phrase.direct_generator.push(oGenerator[i]._self());
          }
        } else {
          throw new TypeError('Argument must be a Generator or array of Generators');
        }

        return this;
      },
        
      /**
            <p>Allows you to serialize this object into a JSON encoded string.</p>

            @member ejs.PhraseSuggester
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(suggest);
      },

      /**
            The type of ejs object.  For internal use only.
          
            @member ejs.PhraseSuggester
            @returns {String} the type of object
            */
      _type: function () {
        return 'suggest';
      },
    
      /**
            <p>Retrieves the internal <code>suggest</code> object. This is typically used by
               internal API functions so use with caution.</p>

            @member ejs.PhraseSuggester
            @returns {String} returns this object's internal <code>suggest</code> property.
            */
      _self: function () {
        return suggest;
      }
    };
  };
