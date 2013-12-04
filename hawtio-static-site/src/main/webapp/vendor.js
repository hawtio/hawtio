// lets disable jolokia

// enable the Site plugin
(function (Site) {
  Site.sitePluginEnabled = true;
})(Site || {});

// default the perspective
(function (Perspective) {
  Perspective.defaultPerspective = "website";
  Perspective.defaultPageLocation = "#/site";
})(Perspective || {});


