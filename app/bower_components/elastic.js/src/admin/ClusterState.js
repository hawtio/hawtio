  /**
    @class
    <p>The <code>ClusterState</code> object provides an interface for 
    accessing the state of your cluster.</p>

    @name ejs.ClusterState

    @desc Retrieves comprehensive state information of your cluster.
     
    */
  ejs.ClusterState = function () {

    var 
      params = {},
      paramExcludes = [];
    
    return {
    
      /**
             <p>If the operation will run on the local node only</p>  

             @member ejs.ClusterState
             @param {Boolean} trueFalse True to run on local node only
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      local: function (trueFalse) {
        if (trueFalse == null) {
          return params.local;
        }
      
        params.local = trueFalse;
        return this;
      },
      
      /**
             <p>Set's a timeout for the response from the master node.</p>  

             @member ejs.ClusterState
             @param {String} length The amount of time after which the operation
              will timeout.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      masterTimeout: function (length) {
        if (length == null) {
          return params.master_timeout;
        }
      
        params.master_timeout = length;
        return this;
      },
            
      /**
             <p>Sets if we should filter out the nodes part of the state
             response.</p>  

             @member ejs.ClusterState
             @param {Boolean} trueFalse True to filter out the nodes state
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      filterNodes: function (trueFalse) {
        if (trueFalse == null) {
          return params.filter_nodes;
        }
      
        params.filter_nodes = trueFalse;
        return this;
      },
      
      /**
             <p>Sets if we should filter out the routing table part of the 
             state response.</p>  

             @member ejs.ClusterState
             @param {Boolean} trueFalse True to filter out the routing table
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      filterRoutingTable: function (trueFalse) {
        if (trueFalse == null) {
          return params.filter_routing_table;
        }
      
        params.filter_routing_table = trueFalse;
        return this;
      },
      
      /**
             <p>Sets if we should filter out the metadata part of the 
             state response.</p>  

             @member ejs.ClusterState
             @param {Boolean} trueFalse True to filter out the metadata 
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      filterMetadata: function (trueFalse) {
        if (trueFalse == null) {
          return params.filter_metadata;
        }
      
        params.filter_metadata = trueFalse;
        return this;
      },
      
      /**
             <p>Sets if we should filter out the blocks part of the state
             response.</p>  

             @member ejs.ClusterState
             @param {Boolean} trueFalse True to filter out the blocks response
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      filterBlocks: function (trueFalse) {
        if (trueFalse == null) {
          return params.filter_blocks;
        }
      
        params.filter_blocks = trueFalse;
        return this;
      },
      
      /**
             <p>When not filtering metadata, a list of indices to include in 
             the metadata response.  If a single value is passed in it
             will be appended to the current list of indices.  If an array is
             passed in it will replace all existing indices.</p>  

             @member ejs.ClusterState
             @param {String || Array} i An index name or list of index names.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      filterIndices: function (i) {
        if (params.filter_indices == null) {
          params.filter_indices = [];
        }
      
        if (i == null) {
          return params.filter_indices;
        }
      
        if (isString(i)) {
          params.filter_indices.push(i);
        } else if (isArray(i)) {
          params.filter_indices = i;
        } else {
          throw new TypeError('Argument must be string or array');
        }
      
        return this;
      },
      
      /**
             <p>When not filtering metadata, a list of index templates to 
             include in the metadata response.  If a single value is passed in 
             it will be appended to the current list of templates.  If an 
             array is passed in it will replace all existing templates.</p>  

             @member ejs.ClusterState
             @param {String || Array} i A template name or list of template names.
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      filterIndexTemplates: function (i) {
        if (params.filter_index_templates == null) {
          params.filter_index_templates = [];
        }
      
        if (i == null) {
          return params.filter_index_templates;
        }
      
        if (isString(i)) {
          params.filter_index_templates.push(i);
        } else if (isArray(i)) {
          params.filter_index_templates = i;
        } else {
          throw new TypeError('Argument must be string or array');
        }
      
        return this;
      },
      
      /**
            <p>Allows you to serialize this object into a JSON encoded string.</p>

            @member ejs.ClusterState
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(params);
      },
    
      /**
            <p>The type of ejs object.  For internal use only.</p>
          
            @member ejs.ClusterState
            @returns {String} the type of object
            */
      _type: function () {
        return 'cluster state';
      },
    
      /**
            <p>Retrieves the internal <code>document</code> object. This is 
            typically used by internal API functions so use with caution.</p>

            @member ejs.ClusterState
            @returns {Object} returns this object's internal object.
            */
      _self: function () {
        return params;
      },
      
      /**
            <p>Retrieves comprehensive state information of the whole cluster.</p>

            @member ejs.ClusterState
            @param {Function} successcb A callback function that handles the response.
            @param {Function} errorcb A callback function that handles errors.
            @returns {Object} The return value is dependent on client implementation.
            */
      doState: function (successcb, errorcb) {
        // make sure the user has set a client
        if (ejs.client == null) {
          throw new Error("No Client Set");
        }
      
        var url = '/_cluster/state';
        
        return ejs.client.get(url, genClientParams(params, paramExcludes), 
                                                          successcb, errorcb);
      }

    };
  };