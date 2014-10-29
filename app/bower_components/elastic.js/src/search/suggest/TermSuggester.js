  /**
    @class
    <p>TermSuggester suggests terms based on edit distance. The provided suggest 
    text is analyzed before terms are suggested. The suggested terms are 
    provided per analyzed suggest text token.  This leaves the suggest-selection 
    to the API consumer.  For a higher level suggester, please use the 
    <code>PhraseSuggester</code>.</p>

    @name ejs.TermSuggester

    @since elasticsearch 0.90
    
    @desc
    <p>A suggester that suggests terms based on edit distance.</p>

    @borrows ejs.DirectSettingsMixin.accuracy as accuracy
    @borrows ejs.DirectSettingsMixin.suggestMode as suggestMode
    @borrows ejs.DirectSettingsMixin.sort as sort
    @borrows ejs.DirectSettingsMixin.stringDistance as stringDistance
    @borrows ejs.DirectSettingsMixin.maxEdits as maxEdits
    @borrows ejs.DirectSettingsMixin.maxInspections as maxInspections
    @borrows ejs.DirectSettingsMixin.maxTermFreq as maxTermFreq
    @borrows ejs.DirectSettingsMixin.prefixLength as prefixLength
    @borrows ejs.DirectSettingsMixin.minWordLen as minWordLen
    @borrows ejs.DirectSettingsMixin.minDocFreq as minDocFreq

    @param {String} name The name which be used to refer to this suggester.
    */
  ejs.TermSuggester = function (name) {

    /**
        The internal suggest object.
        @member ejs.TermSuggester
        @property {Object} suggest
        */
    var suggest = {},
  
    // common suggester options
    _common = ejs.DirectSettingsMixin();
    
    // setup correct term suggestor format
    suggest[name] = {term: _common._self()};

    return extend(_common, {

      /**
            <p>Sets the text to get suggestions for.  If not set, the global
            suggestion text will be used.</p>

            @member ejs.TermSuggester
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

            @member ejs.TermSuggester
            @param {String} analyzer A valid analyzer name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      analyzer: function (analyzer) {
        if (analyzer == null) {
          return suggest[name].term.analyzer;
        }
    
        suggest[name].term.analyzer = analyzer;
        return this;
      },
      
      /**
            <p>Sets the field used to generate suggestions from.</p>

            @member ejs.TermSuggester
            @param {String} field A valid field name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (field) {
        if (field == null) {
          return suggest[name].term.field;
        }
    
        suggest[name].term.field = field;
        return this;
      },
      
      /**
            <p>Sets the number of suggestions returned for each token.</p>

            @member ejs.TermSuggester
            @param {Integer} s A positive integer value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      size: function (s) {
        if (s == null) {
          return suggest[name].term.size;
        }
    
        suggest[name].term.size = s;
        return this;
      },
      
      /**
            <p>Sets the maximum number of suggestions to be retrieved from 
            each individual shard.</p>

            @member ejs.TermSuggester
            @param {Integer} s A positive integer value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      shardSize: function (s) {
        if (s == null) {
          return suggest[name].term.shard_size;
        }
    
        suggest[name].term.shard_size = s;
        return this;
      },
      
      /**
            <p>Allows you to serialize this object into a JSON encoded string.</p>

            @member ejs.TermSuggester
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(suggest);
      },

      /**
            The type of ejs object.  For internal use only.
          
            @member ejs.TermSuggester
            @returns {String} the type of object
            */
      _type: function () {
        return 'suggest';
      },
    
      /**
            <p>Retrieves the internal <code>suggest</code> object. This is typically used by
               internal API functions so use with caution.</p>

            @member ejs.TermSuggester
            @returns {String} returns this object's internal <code>suggest</code> property.
            */
      _self: function () {
        return suggest;
      }
    });
  };
