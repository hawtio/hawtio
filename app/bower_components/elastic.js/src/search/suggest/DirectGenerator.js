  /**
    @class
    <p>DirectGenerator is a candidate generator for <code>PhraseSuggester</code>.
    It generates terms based on edit distance and operators much like the
    <code>TermSuggester</code>.</p>

    @name ejs.DirectGenerator

    @since elasticsearch 0.90
  
    @desc
    <p>A candidate generator that generates terms based on edit distance.</p>

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
    */
  ejs.DirectGenerator = function () {

  
    var

    // common suggester options used in this generator
    _common = ejs.DirectSettingsMixin(),
  
    /**
        The internal generator object.
        @member ejs.DirectGenerator
        @property {Object} suggest
        */
    generator = _common._self();

    return extend(_common, {

      /**
            <p>Sets an analyzer that is applied to each of the tokens passed to 
            this generator.  The analyzer is applied to the original tokens,
            not the generated tokens.</p>

            @member ejs.DirectGenerator
            @param {String} analyzer A valid analyzer name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      preFilter: function (analyzer) {
        if (analyzer == null) {
          return generator.pre_filter;
        }
  
        generator.pre_filter = analyzer;
        return this;
      },
    
      /**
            <p>Sets an analyzer that is applied to each of the generated tokens 
            before they are passed to the actual phrase scorer.</p>

            @member ejs.DirectGenerator
            @param {String} analyzer A valid analyzer name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      postFilter: function (analyzer) {
        if (analyzer == null) {
          return generator.post_filter;
        }
  
        generator.post_filter = analyzer;
        return this;
      },
    
      /**
            <p>Sets the field used to generate suggestions from.</p>

            @member ejs.DirectGenerator
            @param {String} field A valid field name.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      field: function (field) {
        if (field == null) {
          return generator.field;
        }
  
        generator.field = field;
        return this;
      },
    
      /**
            <p>Sets the number of suggestions returned for each token.</p>

            @member ejs.DirectGenerator
            @param {Integer} s A positive integer value.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      size: function (s) {
        if (s == null) {
          return generator.size;
        }
  
        generator.size = s;
        return this;
      },
    
      /**
            <p>Allows you to serialize this object into a JSON encoded string.</p>

            @member ejs.DirectGenerator
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(generator);
      },

      /**
            The type of ejs object.  For internal use only.
        
            @member ejs.DirectGenerator
            @returns {String} the type of object
            */
      _type: function () {
        return 'generator';
      },
  
      /**
            <p>Retrieves the internal <code>generator</code> object. This is typically used by
               internal API functions so use with caution.</p>

            @member ejs.DirectGenerator
            @returns {String} returns this object's internal <code>generator</code> property.
            */
      _self: function () {
        return generator;
      }
    });
  };
