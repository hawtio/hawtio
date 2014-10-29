  /**
    @class
    <p>Allows to highlight search results on one or more fields.  In order to 
    perform highlighting, the actual content of the field is required. If the 
    field in question is stored (has store set to yes in the mapping), it will 
    be used, otherwise, the actual _source will be loaded and the relevant 
    field will be extracted from it.</p>

    <p>If no term_vector information is provided (by setting it to 
    with_positions_offsets in the mapping), then the plain highlighter will be 
    used. If it is provided, then the fast vector highlighter will be used. 
    When term vectors are available, highlighting will be performed faster at 
    the cost of bigger index size.</p>

    <p>See http://www.elasticsearch.org/guide/reference/api/search/highlighting.html</p>

    @name ejs.Highlight

    @desc
    <p>Allows to highlight search results on one or more fields.</p>

    @param {String || Array} fields An optional field or array of fields to highlight.
    */
  ejs.Highlight = function (fields) {
  
    var highlight = {
      fields: {}
    },
  
    addOption = function (field, option, val) {
      if (field == null) {
        highlight[option] = val;
      } else {
        if (!has(highlight.fields, field)) {
          highlight.fields[field] = {};
        }
      
        highlight.fields[field][option] = val;
      }
    };

    if (fields != null) {
      if (isString(fields)) {
        highlight.fields[fields] = {};
      } else if (isArray(fields)) {
        each(fields, function (field) {
          highlight.fields[field] = {};
        });
      }
    }
  
    return {

      /**
            Allows you to set the fields that will be highlighted.  You can 
            specify a single field or an array of fields.  All fields are 
            added to the current list of fields.

            @member ejs.Highlight
            @param {String || Array} vals A field name or array of field names.
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      fields: function (vals) {
        if (vals == null) {
          return highlight.fields;
        }
      
        if (isString(vals)) {
          if (!has(highlight.fields, vals)) {
            highlight.fields[vals] = {};
          }
        } else if (isArray(vals)) {
          each(vals, function (field) {
            if (!has(highlight.fields, field)) {
              highlight.fields[field] = {};
            }
          });
        }
      },
    
      /**
            Sets the pre tags for highlighted fragments.  You can apply the
            tags to a specific field by passing the field name in to the 
            <code>oField</code> parameter.
        
            @member ejs.Highlight
            @param {String || Array} tags A single tag or an array of tags.
            @param {String} oField An optional field name
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      preTags: function (tags, oField) {
        if (tags === null && oField != null) {
          return highlight.fields[oField].pre_tags;
        } else if (tags == null) {
          return highlight.pre_tags;
        }
  
        if (isString(tags)) {
          addOption(oField, 'pre_tags', [tags]);
        } else if (isArray(tags)) {
          addOption(oField, 'pre_tags', tags);
        }
        
        return this;
      },

      /**
            Sets the post tags for highlighted fragments.  You can apply the
            tags to a specific field by passing the field name in to the 
            <code>oField</code> parameter.
        
            @member ejs.Highlight
            @param {String || Array} tags A single tag or an array of tags.
            @param {String} oField An optional field name
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      postTags: function (tags, oField) {
        if (tags === null && oField != null) {
          return highlight.fields[oField].post_tags;
        } else if (tags == null) {
          return highlight.post_tags;
        }
  
        if (isString(tags)) {
          addOption(oField, 'post_tags', [tags]);
        } else if (isArray(tags)) {
          addOption(oField, 'post_tags', tags);
        }
        
        return this;
      },
      
      /**
            Sets the order of highlight fragments.  You can apply the option
            to a specific field by passing the field name in to the 
            <code>oField</code> parameter.  Valid values for order are:
            
            score - the score calculated by Lucene's highlighting framework.
        
            @member ejs.Highlight
            @param {String} o The order.  Currently only "score".
            @param {String} oField An optional field name
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      order: function (o, oField) {
        if (o === null && oField != null) {
          return highlight.fields[oField].order;
        } else if (o == null) {
          return highlight.order;
        }
  
        o = o.toLowerCase();
        if (o === 'score') {
          addOption(oField, 'order', o);
        }
        
        return this;
      },
      
      /**
            Sets the schema to be used for the tags. Valid values are:
            
            styled - 10 <em> pre tags with css class of hltN, where N is 1-10
        
            @member ejs.Highlight
            @param {String} s The schema.  Currently only "styled".
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      tagsSchema: function (s) {
        if (s == null) {
          return highlight.tags_schema;
        }
  
        s = s.toLowerCase();
        if (s === 'styled') {
          highlight.tags_schema = s;
        }
        
        return this;
      },
      
      /**
            Enables highlights in documents matched by a filter.  
            You can apply the option to a specific field by passing the field 
            name in to the <code>oField</code> parameter.  Defaults to false.
            
            @member ejs.Highlight
            @param {Boolean} trueFalse If filtered docs should be highlighted.
            @param {String} oField An optional field name
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      highlightFilter: function (trueFalse, oField) {
        if (trueFalse === null && oField != null) {
          return highlight.fields[oField].highlight_filter;
        } else if (trueFalse == null) {
          return highlight.highlight_filter;
        }
  
        addOption(oField, 'highlight_filter', trueFalse);
        return this;
      },
      
      /**
            Sets the size of each highlight fragment in characters.  
            You can apply the option to a specific field by passing the field 
            name in to the <code>oField</code> parameter. Default:  100
            
            @member ejs.Highlight
            @param {Integer} size The fragment size in characters.
            @param {String} oField An optional field name
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      fragmentSize: function (size, oField) {
        if (size === null && oField != null) {
          return highlight.fields[oField].fragment_size;
        } else if (size == null) {
          return highlight.fragment_size;
        }
  
        addOption(oField, 'fragment_size', size);
        return this;
      },
      
      /**
            Sets the number of highlight fragments.
            You can apply the option to a specific field by passing the field 
            name in to the <code>oField</code> parameter. Default:  5

            @member ejs.Highlight
            @param {Integer} cnt The fragment size in characters.
            @param {String} oField An optional field name
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      numberOfFragments: function (cnt, oField) {
        if (cnt === null && oField != null) {
          return highlight.fields[oField].number_of_fragments;
        } else if (cnt == null) {
          return highlight.number_of_fragments;
        }

        addOption(oField, 'number_of_fragments', cnt);
        return this;
      },       

      /**
            Sets highlight encoder.  Valid values are:
            
            default - the default, no encoding
            html - to encode html characters if you use html tags
        
            @member ejs.Highlight
            @param {String} e The encoder.  default or html
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      encoder: function (e) {
        if (e == null) {
          return highlight.encoder;
        }
  
        e = e.toLowerCase();
        if (e === 'default' || e === 'html') {
          highlight.encoder = e;
        }
        
        return this;
      },

      /**
            When enabled it will cause a field to be highlighted only if a 
            query matched that field. false means that terms are highlighted 
            on all requested fields regardless if the query matches 
            specifically on them.  You can apply the option to a specific 
            field by passing the field name in to the <code>oField</code> 
            parameter.  Defaults to false.
            
            @member ejs.Highlight
            @param {Boolean} trueFalse If filtered docs should be highlighted.
            @param {String} oField An optional field name
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      requireFieldMatch: function (trueFalse, oField) {
        if (trueFalse === null && oField != null) {
          return highlight.fields[oField].require_field_match;
        } else if (trueFalse == null) {
          return highlight.require_field_match;
        }
  
        addOption(oField, 'require_field_match', trueFalse);
        return this;
      },

      /**
            Sets the max number of characters to scan while looking for the 
            start of a boundary character. You can apply the option to a 
            specific field by passing the field name in to the 
            <code>oField</code> parameter. Default:  20

            @member ejs.Highlight
            @param {Integer} cnt The max characters to scan.
            @param {String} oField An optional field name
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boundaryMaxScan: function (cnt, oField) {
        if (cnt === null && oField != null) {
          return highlight.fields[oField].boundary_max_scan;
        } else if (cnt == null) {
          return highlight.boundary_max_scan;
        }

        addOption(oField, 'boundary_max_scan', cnt);
        return this;
      },       

      /**
            Set's the boundary characters.  When highlighting a field that is 
            mapped with term vectors, boundary_chars can be configured to 
            define what constitutes a boundary for highlighting. It’s a single 
            string with each boundary character defined in it. You can apply
            the option to a specific field by passing the field name in to 
            the <code>oField</code> parameter. It defaults to ".,!? \t\n".
            
            @member ejs.Highlight
            @param {String} charStr The boundary chars in a string.
            @param {String} oField An optional field name
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      boundaryChars: function (charStr, oField) {
        if (charStr === null && oField != null) {
          return highlight.fields[oField].boundary_chars;
        } else if (charStr == null) {
          return highlight.boundary_chars;
        }
  
        addOption(oField, 'boundary_chars', charStr);
        return this;
      },
      
      /**
            Sets the highligher type.  You can apply the option
            to a specific field by passing the field name in to the 
            <code>oField</code> parameter.  Valid values for order are:
            
            fast-vector-highlighter - the fast vector based highligher
            highlighter - the slower plain highligher
        
            @member ejs.Highlight
            @param {String} t The highligher. 
            @param {String} oField An optional field name
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      type: function (t, oField) {
        if (t === null && oField != null) {
          return highlight.fields[oField].type;
        } else if (t == null) {
          return highlight.type;
        }
  
        t = t.toLowerCase();
        if (t === 'fast-vector-highlighter' || t === 'highlighter') {
          addOption(oField, 'type', t);
        }
        
        return this;
      },

      /**
            Sets the fragmenter type.  You can apply the option
            to a specific field by passing the field name in to the 
            <code>oField</code> parameter.  Valid values for order are:
            
            simple - breaks text up into same-size fragments with no concerns 
              over spotting sentence boundaries.
            span - breaks text up into same-size fragments but does not split 
              up Spans.
            
            @member ejs.Highlight
            @param {String} f The fragmenter. 
            @param {String} oField An optional field name
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      fragmenter: function (f, oField) {
        if (f === null && oField != null) {
          return highlight.fields[oField].fragmenter;
        } else if (f == null) {
          return highlight.fragmenter;
        }
  
        f = f.toLowerCase();
        if (f === 'simple' || f === 'span') {
          addOption(oField, 'fragmenter', f);
        }
        
        return this;
      },
      
      /**
            Sets arbitrary options that can be passed to the highlighter
            implementation in use.
            
            @since elasticsearch 0.90.1
            
            @member ejs.Highlight
            @param {String} opts A map/object of option name and values.
            @param {Object} oField An optional field name
            @returns {Object} returns <code>this</code> so that calls can be chained.
            */
      options: function (opts, oField) {
        if (opts === null && oField != null) {
          return highlight.fields[oField].options;
        } else if (opts == null) {
          return highlight.options;
        }

        if (!isObject(opts) || isArray(opts) || isEJSObject(opts)) {
          throw new TypeError('Parameter must be an object');
        }
        
        addOption(oField, 'options', opts);
        return this;
      },
      
      /**
            Allows you to serialize this object into a JSON encoded string.

            @member ejs.Highlight
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(highlight);
      },

      /**
            The type of ejs object.  For internal use only.
          
            @member ejs.Highlight
            @returns {String} the type of object
            */
      _type: function () {
        return 'highlight';
      },
    
      /**
            Retrieves the internal <code>script</code> object. This is typically used by
            internal API functions so use with caution.

            @member ejs.Highlight
            @returns {String} returns this object's internal object representation.
            */
      _self: function () {
        return highlight;
      }
    };
  };
