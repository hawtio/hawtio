module UI {

  export function HawtioTocDisplay(marked, $location, $anchorScroll) {
    return {
      restrict: 'A',
      scope: {
        getContents: '&'
      },
      controller: ($scope, $element, $attrs) => {
        $scope.remaining = -1;
        $scope.render = false;
        $scope.chapters = [];

        $scope.addChapter = (item) => {
          console.log("Adding: ", item);
          $scope.chapters.push(item);
          if (!angular.isDefined(item['text'])) {
            $scope.fetchItemContent(item);
          }
        };

        $scope.getTarget = (id) => {
          if (!id) {
            return '';
          }
          return id.replace(".", "_");
        };

        $scope.getFilename = (href, ext) => {
          var filename = href.split('/').last();
          if (ext && !filename.endsWith(ext)) {
            filename = filename + '.' + ext;
          }
          return filename;
        };

        $scope.$watch('remaining', (newValue, oldValue) => {
          if (newValue !== oldValue) {
            if (newValue === 0) {
              $scope.render = true;
            }
          }
        });

        $scope.fetchItemContent = (item) => {
          var me = $scope;
          $scope.$eval((parent) => {
            parent.getContents({
              filename: item['filename'],
              cb: (data) => {
                if (data) {
                  if (item['filename'].endsWith(".md")) {
                    item['text'] = marked(data);
                  } else {
                    item['text'] = data;
                  }
                  $scope.remaining--;
                  Core.$apply(me);
                }
              }
            });
          });
        };
      },
      link: ($scope, $element, $attrs) => {
        var offsetTop = 0;
        var logbar = $('.logbar');
        if (logbar.length) {
          var offsetTop = logbar.height() + logbar.offset().top;
        }

        if (!$element.get(0).id) {
          $element.get(0).id = 'toc';
        }
        $scope.tocId = '#' + $element.get(0).id;
        $scope.remaining = $element.find('a').filter('[hawtio-toc]').length;
        $element.find('a').filter('[hawtio-toc]').each((index, a) => {
          log.debug("Found: ", a);
          var filename = $scope.getFilename(a.href, a.getAttribute('file-extension'));
          var item = {
            filename: filename,
            title: a.textContent
          };
          $scope.addChapter(item);
        });

        $scope.$watch('render', (newValue, oldValue) => {
          if (newValue !== oldValue) {
            if (newValue) {
              if (!$element.next('.hawtio-toc').length) {
                var div = $('<div class="hawtio-toc"></div>');
                div.appendTo($element);

                $scope.chapters.forEach((chapter, index) => {
                  log.debug("index:", index);
                  var panel = $('<div></div>');
                  var panelHeader:any = null;

                  if (index > 0) {
                    panelHeader = $('<div id="' + $scope.getTarget(chapter['filename']) + '"class="panel-title"><a class="toc-back" href="">Back to Contents</a></div>');
                  }
                  var panelBody = $('<div class="panel-body">' + chapter['text'] + '</div>');
                  if (panelHeader) {
                    panel.append(panelHeader).append(panelBody);
                  } else {
                    panel.append(panelBody);
                  }
                  panel.hide().appendTo(div).fadeIn(1000);
                });

                var pageTop = $element.offset().top - offsetTop;

                div.find('a.toc-back').each((index, a) => {
                  $(a).click((e) => {
                    e.preventDefault();
                    $('body').animate({
                      scrollTop: pageTop
                    }, 2000);
                  })
                });
                $element.find('a').filter('[hawtio-toc]').each((index, a) => {
                  var filename = $scope.getFilename(a.href, a.getAttribute('file-extension'));
                  $(a).click((e) => {
                    e.preventDefault();
                    var target = '#' + $scope.getTarget(filename);
                    var top = $(target).offset().top - offsetTop;
                    $('body').animate({
                      scrollTop: top
                    }, 2000);
                    return true;
                  });
                })
              }
            }
          }
        });
      }
    }
  }
}
