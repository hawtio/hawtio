  /**
    @class
    <p>The <code>NodeStats</code> object provides an interface for accessing
    the stats for one or more (or all) nodes in your cluster.  Stats are 
    available for indicies, os, process, jvm, thread pool, network, filesystem,
    transport, and http.</p>

    @name ejs.NodeStats

    @desc Retrieve one or more (or all) of the cluster nodes statistics.
    */
  ejs.NodeStats = function () {

    var 
      params = {},
      paramExcludes = ['nodes'];

    return {

      /**
             <p>Set's the nodes to get the stats information for.  If a 
             single value is passed in it will be appended to the current list 
             of nodes.  If an array is passed in it will replace all existing 
             nodes.  Nodes can be identified in the APIs either using their 
             internal node id, the node name, address, custom attributes, or 
             _local for only the node receiving the request.</p>  
       
             @member ejs.NodeStats
             @param {String || Array} n A node identifier (id, name, etc).
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      nodes: function (n) {
        if (params.nodes == null) {
          params.nodes = [];
        }
  
        if (n == null) {
          return params.nodes;
        }
  
        if (isString(n)) {
          params.nodes.push(n);
        } else if (isArray(n)) {
          params.nodes = n;
        } else {
          throw new TypeError('Argument must be string or array');
        }
  
        return this;
      },

      /**
             <p>Clears all the flags (first). Useful, if you only want to 
             retrieve specific stats.</p>  

             @member ejs.NodeStats
             @param {Boolean} trueFalse True to clear all flags
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      clear: function (trueFalse) {
        if (trueFalse == null) {
          return params.clear;
        }
  
        params.clear = trueFalse;
        return this;
      },
  
      /**
             <p>Enables all stats flags.</p>  

             @member ejs.NodeStats
             @param {Boolean} trueFalse True to get all available stats
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      all: function (trueFalse) {
        if (trueFalse == null) {
          return params.all;
        }
  
        params.all = trueFalse;
        return this;
      },
    
      /**
             <p>If stats about indices should be returned.  This is enabled
             by default.</p>  

             @member ejs.NodeStats
             @param {Boolean} trueFalse True to get indicies stats
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      indices: function (trueFalse) {
        if (trueFalse == null) {
          return params.indices;
        }
  
        params.indices = trueFalse;
        return this;
      },
    
      /**
             <p>If stats about the os should be returned.</p>  

             @member ejs.NodeStats
             @param {Boolean} trueFalse True to get os stats
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      os: function (trueFalse) {
        if (trueFalse == null) {
          return params.os;
        }
  
        params.os = trueFalse;
        return this;
      },
    
      /**
             <p>If stats about the process should be returned.</p>  

             @member ejs.NodeStats
             @param {Boolean} trueFalse True to get process stats
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      process: function (trueFalse) {
        if (trueFalse == null) {
          return params.process;
        }
  
        params.process = trueFalse;
        return this;
      },
    
      /**
             <p>If stats about the jvm should be returned.</p>  

             @member ejs.NodeStats
             @param {Boolean} trueFalse True to get jvm stats
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      jvm: function (trueFalse) {
        if (trueFalse == null) {
          return params.jvm;
        }
  
        params.jvm = trueFalse;
        return this;
      },
    
      /**
             <p>If stats about the thread pool should be returned.</p>  

             @member ejs.NodeStats
             @param {Boolean} trueFalse True to get thread pool stats
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      threadPool: function (trueFalse) {
        if (trueFalse == null) {
          return params.thread_pool;
        }
  
        params.thread_pool = trueFalse;
        return this;
      },
    
      /**
             <p>If stats about the network should be returned.</p>  

             @member ejs.NodeStats
             @param {Boolean} trueFalse True to get network stats
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      network: function (trueFalse) {
        if (trueFalse == null) {
          return params.network;
        }
  
        params.network = trueFalse;
        return this;
      },
    
      /**
             <p>If stats about the file system (fs) should be returned.</p>  

             @member ejs.NodeStats
             @param {Boolean} trueFalse True to get file system stats
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      fs: function (trueFalse) {
        if (trueFalse == null) {
          return params.fs;
        }
  
        params.fs = trueFalse;
        return this;
      },
    
      /**
             <p>If stats about the transport should be returned.</p>  

             @member ejs.NodeStats
             @param {Boolean} trueFalse True to get transport stats
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      transport: function (trueFalse) {
        if (trueFalse == null) {
          return params.transport;
        }
  
        params.transport = trueFalse;
        return this;
      },
    
      /**
             <p>If stats about the http should be returned.</p>  

             @member ejs.NodeStats
             @param {Boolean} trueFalse True to get http stats
             @returns {Object} returns <code>this</code> so that calls can be chained.
             */
      http: function (trueFalse) {
        if (trueFalse == null) {
          return params.http;
        }
  
        params.http = trueFalse;
        return this;
      },
    
      /**
            <p>Allows you to serialize this object into a JSON encoded string.</p>

            @member ejs.NodeStats
            @returns {String} returns this object as a serialized JSON string.
            */
      toString: function () {
        return JSON.stringify(params);
      },

      /**
            <p>The type of ejs object.  For internal use only.</p>
      
            @member ejs.NodeStats
            @returns {String} the type of object
            */
      _type: function () {
        return 'node stats';
      },

      /**
            <p>Retrieves the internal <code>document</code> object. This is 
            typically used by internal API functions so use with caution.</p>

            @member ejs.NodeStats
            @returns {Object} returns this object's internal object.
            */
      _self: function () {
        return params;
      },

      /**
            <p>Retrieves very simple status on the health of the cluster.</p>

            @member ejs.NodeStats
            @param {Function} successcb A callback function that handles the response.
            @param {Function} errorcb A callback function that handles errors.
            @returns {Object} The return value is dependent on client implementation.
            */
      doStats: function (successcb, errorcb) {
        // make sure the user has set a client
        if (ejs.client == null) {
          throw new Error("No Client Set");
        }
  
        var url = '/_nodes';
    
        if (params.nodes && params.nodes.length > 0) {
          url = url + '/' + params.nodes.join();
        }
    
        url = url + '/stats';
      
        return ejs.client.get(url, genClientParams(params, paramExcludes), 
                                                          successcb, errorcb);
      }
  
    };
  };