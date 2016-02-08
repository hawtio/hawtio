/*
 * Copyright 2009-2013 Roland Huss
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * Simplified access to the Jolokia agent.
 *
 * This script will add convenience methods to <code>Jolokia</code> for
 * simplified access to JMX information. Before including this script, "jolokia.js"
 * must be included.
 *
 * It is recommended to compress this script before using it in production.
 *
 * @author roland
 */

(function() {
    var builder = function($,Jolokia) {
        /**
         * Get one or more attributes
         *
         * @param mbean objectname of MBean to query. Can be a pattern.
         * @param attribute attribute name. If an array, multiple attributes are fetched.
         *                  If <code>null</code>, all attributes are fetched.
         * @param path optional path within the return value. For multi-attribute fetch, the path
         *             is ignored.
         * @param opts options passed to Jolokia.request()
         * @return the value of the attribute, possibly a complex object
         */
        function getAttribute(mbean,attribute,path,opts) {
            if (arguments.length === 3 && $.isPlainObject(path)) {
                opts = path;
                path = null;
            } else if (arguments.length == 2 && $.isPlainObject(attribute)) {
                opts = attribute;
                attribute = null;
                path = null;
            }
            var req = { type: "read", mbean: mbean, attribute: attribute };
            addPath(req,path);
            return extractValue(this.request(req,prepareSucessCallback(opts)),opts);
        }

        /**
         * Set an attribute on a MBean.
         *
         * @param mbean objectname of MBean to set
         * @param attribute the attribute to set
         * @param value the value to set
         * @param path an optional <em>inner path</em> which, when given, is used to determine
         *        an inner object to set the value on
         * @param opts additional options passed to Jolokia.request()
         * @return the previous value
         */
        function setAttribute(mbean,attribute,value,path,opts) {
            if (arguments.length === 4 && $.isPlainObject(path)) {
                opts = path;
                path = null;
            }
            var req = { type: "write", mbean: mbean, attribute: attribute, value: value };
            addPath(req,path);
            return extractValue(this.request(req,prepareSucessCallback(opts)),opts);
        }

        /**
         * Execute a JMX operation and return the result value
         *
         * @param mbean objectname of the MBean to operate on
         * @param operation name of operation to execute. Can contain a signature in case overloaded
         *                  operations are to be called (comma separated fully qualified argument types
         *                  append to the operation name within parentheses)
         * @param arg1, arg2, ..... one or more argument required for executing the operation.
         * @param opts optional options for Jolokia.request() (must be an object)
         * @return the return value of the JMX operation.
         */
        function execute(mbean,operation) {
            var req = { type: "exec", mbean: mbean, operation: operation };
            var opts, end = arguments.length;
            if (arguments.length > 2 && $.isPlainObject(arguments[arguments.length-1])) {
                opts = arguments[arguments.length-1];
                end = arguments.length-1;
            }
            if (end > 2) {
                var args = [];
                for (var i = 2; i < end; i++) {
                    args[i-2] = arguments[i];
                }
                req.arguments = args;
            }
            return extractValue(this.request(req,prepareSucessCallback(opts)),opts);
        }

        /**
         * Search for MBean based on a pattern and return a reference to the list of found
         * MBeans names (as string). If no MBean can be found, <code>null</code> is returned. For
         * example,
         *
         * jolokia.search("*:j2eeType=J2EEServer,*")
         *
         * searches all MBeans whose name are matching this pattern, which are according
         * to JSR77 all application servers in all available domains.
         *
         * @param mbeanPattern pattern to search for
         * @param opts optional options for Jolokia.request()
         * @return an array with ObjectNames as string
         */
        function search(mbeanPattern,opts) {
            var req = { type: "search", mbean: mbeanPattern};
            return extractValue(this.request(req,prepareSucessCallback(opts)),opts);
        }

        /**
         * This method return the version of the agent and the Jolokia protocol
         * version as part of an object. If available, server specific information
         * like the application server's name are returned as wel.
         * A typical response looks like
         *
         * <pre>
         *  {
         *    protocol: "4.0",
         *    agent: "0.82",
         *    info: {
         *       product: "glassfish",
         *       vendor": "Sun",
         *       extraInfo: {
         *          amxBooted: false
         *       }
         *  }
         * </pre>
         *
         * @param opts optional options for Jolokia.request()
         * @param version and other meta information as object
         */
        function version(opts) {
            return extractValue(this.request({type: "version"},prepareSucessCallback(opts)),opts);
        }


        /**
         * Get all MBeans as registered at the specified server. A C<$path> can be
         * specified in order to fetchy only a subset of the information. When no path is
         * given, the returned value has the following format
         *
         * <pre>
         * {
         *     &lt;domain&gt; :
         *     {
         *       &lt;canonical property list&gt; :
         *       {
         *           "attr" :
         *           {
         *              &lt;atrribute name&gt; :
         *              {
         *                 desc : &lt;description of attribute&gt;
         *                 type : &lt;java type&gt;,
         *                 rw : true/false
         *              },
         *              ....
         *           },
         *           "op" :
         *           {
         *              &lt;operation name&gt; :
         *              {
         *                "desc" : &lt;description of operation&gt;
         *                "ret" : &lt;return java type&gt;
         *                "args" :
         *                [
         *                   {
         *                     "desc" : &lt;description&gt;,
         *                     "name" : &lt;name&gt;,
         *                     "type" : &lt;java type&gt;
         *                   },
         *                   ....
         *                ]
         *              },
         *              ....
         *       },
         *       ....
         *     }
         *     ....
         *  }
         * </pre>
         *
         * A complete path has the format &lt;domain&gt;/property
         * list&gt;/("attribute"|"operation")/&lt;index&gt;">
         * (e.g. <code>java.lang/name=Code Cache,type=MemoryPool/attribute/0</code>). A path can be
         * provided partially, in which case the remaining map/array is returned. The path given must
         * be already properly escaped (i.e. slashes must be escaped like <code>!/</code> and exlamation
         * marks like <code>!!</code>.
         * See also the Jolokia Reference Manual for a more detailed discussion of inner paths and escaping.
         *
         *
         * @param path optional path for diving into the list
         * @param opts optional opts passed to Jolokia.request()
         */
        function list(path,opts) {
            if (arguments.length == 1 && !$.isArray(path) && $.isPlainObject(path)) {
                opts = path;
                path = null;
            }
            var req = { type: "list" };
            addPath(req,path);
            return extractValue(this.request(req,prepareSucessCallback(opts)),opts);
        }

        // =======================================================================
        // Private methods:

        // If path is an array, the elements get escaped. If not, it is
        // taken directly
        function addPath(req,path) {
            if (path != null) {
                if ($.isArray(path)) {
                    req.path = $.map(path,Jolokia.escape).join("/");
                } else {
                    req.path = path;
                }
            }
        }

        function extractValue(response,opts) {
            if (response == null) {
                return null;
            }
            if (response.status == 200) {
                return response.value;
            }
            if (opts && opts.error) {
                return opts.error(response);
            } else {
                throw new Error("Jolokia-Error: " + JSON.stringify(response));
            }
        }

        // Prepare callback to receive directly the value (instead of the full blown response)
        function prepareSucessCallback(opts) {
            if (opts && opts.success) {
                var parm = $.extend({},opts);
                parm.success = function(resp) {
                    opts.success(resp.value);
                };
                return parm;
            } else {
                return opts;
            }
        }

        // Extend the Jolokia prototype with new functionality (mixin)
        $.extend(Jolokia.prototype,
                {
                    "getAttribute" : getAttribute,
                    "setAttribute" : setAttribute,
                    "execute": execute,
                    "search": search,
                    "version": version,
                    "list": list
                });
        return Jolokia;
    };

    // =====================================================================================================
    // Register either at the global Jolokia object global or as an AMD module
    (function (root, factory) {
        if (typeof define === 'function' && define.amd) {
            // AMD. Register as a named module
            define(["jquery","jolokia"], factory);
        } else {
            if (root.Jolokia) {
                builder(jQuery,root.Jolokia);
            } else {
                console.error("No Jolokia definition found. Please include jolokia.js before jolokia-simple.js");
            }
        }
    }(this, function (jQuery,Jolokia) {
        return builder(jQuery,Jolokia);
    }));
})();

