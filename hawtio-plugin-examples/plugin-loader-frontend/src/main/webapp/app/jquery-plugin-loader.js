/*
 * Simple script loader and registry
 */

(function( $, undefined) {

  $.plugin_loader = {
    modules: []
  };

  $.plugin_loader.loadPlugins = function(callback) {

    var parseQueryString = function() {
      var query = (window.location.search || '?').substr(1);
      var map = {};
      query.replace(/([^&=]+)=?([^&]*)(?:&+|$)/g, function(match, key, value) {
          (map[key] = map[key] || []).push(value); 
        });
      return map;
    }

    // TODO - Pull this bit out and make configurable
    // ------------------
    var queryString = parseQueryString();
    var url = queryString['url'] || "/jolokia";

    var jolokia = new Jolokia(url);
    var plugins = jolokia.getAttribute("hawtio:type=plugin,name=*", null);
    // ------------------

    // keep track of when scripts are loaded so we can execute the callback
    var loaded = $.map(plugins, function(n, i) { return i; }).length;

    var scriptLoaded = function() {
      loaded = loaded - 1;
      if (loaded == 0) {
        callback();
      }
    };

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
  };

  $.plugin_loader.getModules = function() {
    return $.plugin_loader.modules;
  };

  $.plugin_loader.addModule = function(module) {
    $.plugin_loader.modules.push(module);
  };

})(jQuery);


