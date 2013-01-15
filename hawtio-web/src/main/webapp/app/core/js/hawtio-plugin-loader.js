/*
 * Simple script loader and registry
 */

(function( window, undefined) {

  var hawtioPluginLoader = {
    urls: [],
    modules: []
  };

  hawtioPluginLoader.addModule = function(module) {
    console.log("Adding module: " + module);
    hawtioPluginLoader.modules.push(module);
  }

  hawtioPluginLoader.addUrl = function(url) {
    console.log("Adding URL: " + url);
    hawtioPluginLoader.urls.push(url);
  }

  hawtioPluginLoader.getModules = function() {
    return hawtioPluginLoader.modules;
  }

  hawtioPluginLoader.parseQueryString = function() {
      var query = (window.location.search || '?').substr(1);
      var map = {};
      query.replace(/([^&=]+)=?([^&]*)(?:&+|$)/g, function(match, key, value) {
          (map[key] = map[key] || []).push(value); 
        });
      return map;
  }

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
          console.error("Error fetching data: " + Exception);
        }

      } else {
        try {
          var data = $.get(url);
          var obj = $.parseJSON(data);
          $.extend(plugins, obj);
        } catch (Exception) {
          console.error("Error fetching data: " + Exception);
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
            console.error("Failed to load " + script + " exception: " + exception);
          });
        });
      });
    } else {
      // no scripts to load, so just do the callback
      callback();
    }

  };

  hawtioPluginLoader.debug = function() {
    console.log("Hi!");
    console.log("urls and modules");
    console.log(hawtioPluginLoader.urls);
    console.log(hawtioPluginLoader.modules);
  };

  window.hawtioPluginLoader = hawtioPluginLoader;

})(window);


