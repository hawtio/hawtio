/*
 * Simple script loader and registry
 */

(function( window, undefined) {

  var hawtioPluginLoader = {
    urls: [],
    modules: []
  };

  hawtioPluginLoader.addModule = function(module) {
    // console.log("Adding module: " + module);
    hawtioPluginLoader.modules.push(module);
  };

  hawtioPluginLoader.addUrl = function(url) {
    // console.log("Adding URL: " + url);
    hawtioPluginLoader.urls.push(url);
  };

  hawtioPluginLoader.getModules = function() {
    return hawtioPluginLoader.modules.clone();
  };

  /**
   * Parses the given query search string of the form "?foo=bar&whatnot"
   * @param text
   * @return a map of key/values
   */
  hawtioPluginLoader.parseQueryString = function(text) {
      var query = (text || window.location.search || '?');
      var idx = -1;
      if (angular.isArray(query)) {
        query = query[0];
      }
      idx = query.indexOf("?");
      if (idx >= 0) {
        query = query.substr(idx + 1);
      }
      // if query string ends with #/ then lets remove that too
      idx = query.indexOf("#/");
      if (idx > 0) {
        query = query.substr(0, idx);
      }
      var map = {};
      query.replace(/([^&=]+)=?([^&]*)(?:&+|$)/g, function(match, key, value) {
          (map[key] = map[key] || []).push(value); 
        });
      return map;
  };

  /**
   * Parses the username:password from a http basic auth URL, e.g.
   * http://foo:bar@example.com
   */
  hawtioPluginLoader.getCredentials = function(urlString) {
/*
    No Uri class outside of IE right?

    var uri = new Uri(url);
    var credentials = uri.userInfo();
*/
    if (urlString) {
      var credentialsRegex = new RegExp(/.*:\/\/([^@]+)@.*/);
      var m = urlString.match(credentialsRegex);
      if (m && m.length > 1) {
        var credentials = m[1];
        if (credentials && credentials.indexOf(':') > -1) {
          return credentials.split(':');
        }
      }
    }
    return [];
  };

  hawtioPluginLoader.loadPlugins = function(callback) {

    var plugins = {};

    var regex = new RegExp(/^jolokia:/);

    $.each(hawtioPluginLoader.urls, function(index, url) {

      if (regex.test(url)) {
        var parts = url.split(':');
        parts = parts.reverse();
        parts.pop();

        var url = parts.pop();
        var attribute = parts.reverse().join(':');
        var jolokia = new Jolokia(url);

        try { 
          var data = jolokia.getAttribute(attribute, null);
          $.extend(plugins, data);
        } catch (Exception) {
          // console.error("Error fetching data: " + Exception);
        }

      } else {
        try {
          var data = $.get(url);
          var obj = $.parseJSON(data);
          $.extend(plugins, obj);
        } catch (Exception) {
          // console.error("Error fetching data: " + Exception);
        }
      }
    });

    // keep track of when scripts are loaded so we can execute the callback
    var loaded = $.map(plugins, function(n, i) { return i; }).length;

    var scriptLoaded = function() {
      loaded = loaded - 1;
      if (loaded == 0) {
        callback();
      }
    };

    if (loaded > 0) {
      $.each(plugins, function(key, data) {

        data.Scripts.forEach( function(script) {
          var scriptName = data.Context + "/" + script;

          $.getScript(scriptName)
          .done(function(script, textStatus) {
            scriptLoaded();
          }).fail(function(jqxhr, settings, exception) {
            // Can maybe let other scripts run still.
            scriptLoaded();
            // TODO - something else
            // console.error("Failed to load " + script + " exception: " + exception);
          });
        });
      });
    } else {
      // no scripts to load, so just do the callback
      callback();
    }

  };

  hawtioPluginLoader.debug = function() {
    console.log("urls and modules");
    console.log(hawtioPluginLoader.urls);
    console.log(hawtioPluginLoader.modules);
  };

  window.hawtioPluginLoader = hawtioPluginLoader;

})(window);


