  /**
    @mixin
    <p>The DirectSettingsMixin provides support for common options used across 
    various <code>Suggester</code> implementations.  This object should not be 
    used directly.</p>

    @name ejs.DirectSettingsMixin
    */
  ejs.DirectSettingsMixin = function () {

    /**
        The internal settings object.
        @member ejs.DirectSettingsMixin
        @property {Object} settings
        */
    var settings = {};

    return {
        
      /**
            <p>Sets the accuracy.  How similar the suggested terms at least 
            need to be compared to the original suggest text.</p>

            @member ejs.DirectSettingsMixin
            @param {Double} a A positive double value between 0 and 1.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      accuracy: function (a) {
        if (a == null) {
          return settings.accuracy;
        }
  
        settings.accuracy = a;
        return this;
      },
    
      /**
            <p>Sets the suggest mode.  Valid values are:</p>

            <dl>
              <dd><code>missing</code> - Only suggest terms in the suggest text that aren't in the index</dd>
              <dd><code>popular</code> - Only suggest suggestions that occur in more docs then the original suggest text term</dd>
              <dd><code>always</code> - Suggest any matching suggestions based on terms in the suggest text</dd> 
            </dl>

            @member ejs.DirectSettingsMixin
            @param {String} m The mode of missing, popular, or always.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      suggestMode: function (m) {
        if (m == null) {
          return settings.suggest_mode;
        }
  
        m = m.toLowerCase();
        if (m === 'missing' || m === 'popular' || m === 'always') {
          settings.suggest_mode = m;
        }
      
        return this;
      },
    
      /**
            <p>Sets the sort mode.  Valid values are:</p>

            <dl>
              <dd><code>score</code> - Sort by score first, then document frequency, and then the term itself</dd>
              <dd><code>frequency</code> - Sort by document frequency first, then simlarity score and then the term itself</dd>
            </dl>

            @member ejs.DirectSettingsMixin
            @param {String} s The score type of score or frequency.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      sort: function (s) {
        if (s == null) {
          return settings.sort;
        }
  
        s = s.toLowerCase();
        if (s === 'score' || s === 'frequency') {
          settings.sort = s;
        }
      
        return this;
      },
    
      /**
            <p>Sets what string distance implementation to use for comparing 
            how similar suggested terms are.  Valid values are:</p>

            <dl>
              <dd><code>internal</code> - based on damerau_levenshtein but but highly optimized for comparing string distance for terms inside the index</dd>
              <dd><code>damerau_levenshtein</code> - String distance algorithm based on Damerau-Levenshtein algorithm</dd>
              <dd><code>levenstein</code> - String distance algorithm based on Levenstein edit distance algorithm</dd>
              <dd><code>jarowinkler</code> - String distance algorithm based on Jaro-Winkler algorithm</dd>
              <dd><code>ngram</code> - String distance algorithm based on character n-grams</dd>
            </dl>

            @member ejs.DirectSettingsMixin
            @param {String} s The string distance algorithm name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      stringDistance: function (s) {
        if (s == null) {
          return settings.string_distance;
        }
  
        s = s.toLowerCase();
        if (s === 'internal' || s === 'damerau_levenshtein' || 
            s === 'levenstein' || s === 'jarowinkler' || s === 'ngram') {
          settings.string_distance = s;
        }
      
        return this;
      },
    
      /**
            <p>Sets the maximum edit distance candidate suggestions can have 
            in order to be considered as a suggestion.</p>

            @member ejs.DirectSettingsMixin
            @param {Integer} max An integer value greater than 0.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      maxEdits: function (max) {
        if (max == null) {
          return settings.max_edits;
        }
  
        settings.max_edits = max;
        return this;
      },
    
      /**
            <p>The factor that is used to multiply with the size in order 
            to inspect more candidate suggestions.</p>

            @member ejs.DirectSettingsMixin
            @param {Integer} max A positive integer value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      maxInspections: function (max) {
        if (max == null) {
          return settings.max_inspections;
        }
  
        settings.max_inspections = max;
        return this;
      },
    
      /**
            <p>Sets a maximum threshold in number of documents a suggest text 
            token can exist in order to be corrected.</p>

            @member ejs.DirectSettingsMixin
            @param {Double} max A positive double value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      maxTermFreq: function (max) {
        if (max == null) {
          return settings.max_term_freq;
        }
  
        settings.max_term_freq = max;
        return this;
      },
    
      /**
            <p>Sets the number of minimal prefix characters that must match in 
            order be a candidate suggestion.</p>

            @member ejs.DirectSettingsMixin
            @param {Integer} len A positive integer value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      prefixLen: function (len) {
        if (len == null) {
          return settings.prefix_len;
        }
  
        settings.prefix_len = len;
        return this;
      },
    
      /**
            <p>Sets the minimum length a suggest text term must have in order 
            to be corrected.</p>

            @member ejs.DirectSettingsMixin
            @param {Integer} len A positive integer value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      minWordLen: function (len) {
        if (len == null) {
          return settings.min_word_len;
        }
  
        settings.min_word_len = len;
        return this;
      },
    
      /**
            <p>Sets a minimal threshold of the number of documents a suggested 
            term should appear in.</p>

            @member ejs.DirectSettingsMixin
            @param {Double} min A positive double value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      minDocFreq: function (min) {
        if (min == null) {
          return settings.min_doc_freq;
        }
  
        settings.min_doc_freq = min;
        return this;
      },
  
      /**
            <p>Retrieves the internal <code>settings</code> object. This is typically used by
               internal API functions so use with caution.</p>

            @member ejs.DirectSettingsMixin
            @returns {String} returns this object's internal <code>settings</code> property.
            */
      _self: function () {
        return settings;
      }
    };
  };
