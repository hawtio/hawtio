// https://github.com/jquery/jquery/issues/2432#issuecomment-403761229
// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
jQuery.ajaxPrefilter(function (s) {
  if (s.crossDomain) {
    s.contents.script = false;
  }
});
console.debug("jQuery ajax prefilter applied");
