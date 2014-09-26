/// <reference path="./wikiPlugin.ts"/>
module Wiki {

  _module.directive('wikiHrefAdjuster', ["$location", ($location) => {
    return {
      restrict: 'A',
      link: ($scope, $element, $attr) => {

        $element.bind('DOMNodeInserted', (event) => {
          var ays = $element.find('a');
          angular.forEach(ays, (a) => {
            if (a.hasAttribute('no-adjust')) {
              return;
            }
            a = $(a);
            var href = (a.attr('href') || "").trim();
            if (href) {
              var fileExtension = a.attr('file-extension');
              var newValue = Wiki.adjustHref($scope, $location, href, fileExtension);
              if (newValue) {
                a.attr('href', newValue);
              }
            }
          });
          var imgs = $element.find('img');
          angular.forEach(imgs, (a) => {
            if (a.hasAttribute('no-adjust')) {
              return;
            }
            a = $(a);
            var href = (a.attr('src') || "").trim();
            if (href) {
              if (href.startsWith("/")) {
                href = Core.url(href);
                a.attr('src', href);

                // lets avoid this element being reprocessed
                a.attr('no-adjust', 'true');
              }
            }
          });
        })
      }
    }
  }]);

  _module.directive('wikiTitleLinker', ["$location", ($location) => {
    return {
      restrict: 'A',
      link: ($scope, $element, $attr) => {
        var loaded = false;

        function offsetTop(elements) {
          if (elements) {
            var offset = elements.offset();
            if (offset) {
              return offset.top;
            }
          }
          return 0;
        }

        function scrollToHash() {
          var answer = false;
          var id = $location.search()["hash"];
          return scrollToId(id);
        }

        function scrollToId(id) {
          var answer = false;
          var id = $location.search()["hash"];
          if (id) {
            var selector = 'a[name="' + id + '"]';
            var targetElements = $element.find(selector);
            if (targetElements && targetElements.length) {
              var scrollDuration = 1;
              var delta = offsetTop($($element));
              var top = offsetTop(targetElements) - delta;
              if (top < 0) {
                top = 0;
              }
              //log.info("scrolling to hash: " + id + " top: " + top + " delta:" + delta);
              $('body,html').animate({
                scrollTop: top
              }, scrollDuration);
              answer = true;
            } else {
              //log.info("could find element for: " + selector);
            }
          }
          return answer;
        }

        function addLinks(event) {
          var headings = $element.find('h1,h2,h3,h4,h5,h6,h7');
          var updated = false;
          angular.forEach(headings, (he) => {
            var h1 = $(he);
            // now lets try find a child header
            var a = h1.parent("a");
            if (!a || !a.length) {
              var text = h1.text();
              if (text) {
                var target = text.replace(/ /g, "-");
                var pathWithHash = "#" + $location.path() + "?hash=" + target;
                var link = Core.createHref($location, pathWithHash, ['hash']);

                // lets wrap the heading in a link
                var newA = $('<a name="' + target + '" href="' + link + '" ng-click="onLinkClick()"></a>');
                newA.on("click", () => {
                  setTimeout(() => {
                    if (scrollToId(target)) {
                    }
                  }, 50);
                });

                newA.insertBefore(h1);
                h1.detach();
                newA.append(h1);
                updated = true;
              }
            }
          });
          if (updated && !loaded) {
            setTimeout(() => {
              if (scrollToHash()) {
                loaded = true;
              }
            }, 50);
          }
        }

        function onEventInserted(event) {
          // avoid any more events while we do our thing
          $element.unbind('DOMNodeInserted', onEventInserted);
          addLinks(event);
          $element.bind('DOMNodeInserted', onEventInserted);
        }

        $element.bind('DOMNodeInserted', onEventInserted);
      }
    };
  }]);

}
