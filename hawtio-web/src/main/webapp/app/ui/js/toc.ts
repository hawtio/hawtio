/**
 * @module UI
 */
module UI {

  export function HawtioTocDisplay(marked, $location, $anchorScroll, $compile) {
    var log:Logging.Logger = Logger.get("UI");

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
        var previousHtml = null;
        var html = $element;
        var contentDiv = $("#toc-content");
        if (!contentDiv || !contentDiv.length) {
          contentDiv = $element;
        }

        var linkFilter = $attrs["linkFilter"] || "[hawtio-toc]";
        var htmlName = $attrs["html"];
        if (htmlName) {
          var ownerScope = $scope.$parent || $scope;
          ownerScope.$watch(htmlName, () => {
            var htmlText = ownerScope[htmlName];
            if (htmlText && htmlText !== previousHtml) {
              previousHtml = htmlText;
              var markup = $compile(htmlText)(ownerScope);
              $element.children().remove();
              $element.append(markup);
              loadChapters();
            }
          })
        } else {
          loadChapters();
        }

        // make the link active for the first panel on the view
        $(window).scroll(setFirstChapterActive);

        function setFirstChapterActive() {
          // lets find the first panel which is visible...
          var cutoff = $(window).scrollTop();
          $element.find("li a").removeClass("active");
          $('.panel-body').each(function () {
            var offset = $(this).offset();
            if (offset && offset.top >= cutoff) {
              // lets make the related TOC link active
              var id = $(this).attr("id");
              if (id) {
                var link = html.find("a[chapter-id='" + id + "']");
                link.addClass("active");
                // stop iterating and just make first one active
                return false;
              }
            }
          });
        }

        function loadChapters() {
          if (!html.get(0).id) {
            html.get(0).id = 'toc';
          }
          $scope.tocId = '#' + html.get(0).id;
          $scope.remaining = html.find('a').filter(linkFilter).length;
          html.find('a').filter(linkFilter).each((index, a) => {
            log.debug("Found: ", a);
            var filename = $scope.getFilename(a.href, a.getAttribute('file-extension'));
            var item = {
              filename: filename,
              title: a.textContent,
              link: a
            };
            $scope.addChapter(item);
          });

          // TODO this doesn't seem to have any effect ;)
          setTimeout(() => {
            setFirstChapterActive();
          }, 100);
        }

        $scope.$watch('render', (newValue, oldValue) => {
          if (newValue !== oldValue) {
            if (newValue) {
              if (!contentDiv.next('.hawtio-toc').length) {
                var div = $('<div class="hawtio-toc"></div>');
                div.appendTo(contentDiv);

                $scope.chapters.forEach((chapter, index) => {
                  log.debug("index:", index);
                  var panel = $('<div></div>');
                  var panelHeader:any = null;

                  var chapterId = $scope.getTarget(chapter['filename']);
                  var link = chapter["link"];
                  if (link) {
                    link.setAttribute("chapter-id", chapterId);
                  }
                  if (index > 0) {
                    panelHeader = $('<div class="panel-title"><a class="toc-back" href="">Back to Contents</a></div>');
                  }
                  var panelBody = $('<div class="panel-body" id="' + chapterId + '">' + chapter['text'] + '</div>');
                  if (panelHeader) {
                    panel.append(panelHeader).append(panelBody);
                  } else {
                    panel.append(panelBody);
                  }
                  panel.hide().appendTo(div).fadeIn(1000);
                });

                var pageTop = contentDiv.offset().top - offsetTop;

                div.find('a.toc-back').each((index, a) => {
                  $(a).click((e) => {
                    e.preventDefault();
                    $('body').animate({
                      scrollTop: pageTop
                    }, 2000);
                  })
                });
                // TODO should this be html or contentDiv?
                html.find('a').filter(linkFilter).each((index, a) => {
                  var filename = $scope.getFilename(a.href, a.getAttribute('file-extension'));
                  $(a).click((e) => {
                    e.preventDefault();
                    var target = '#' + $scope.getTarget(filename);
                    var top = 0;
                    var offset = $(target).offset();
                    if (offset) {
                      top = offset.top - offsetTop;
                    }
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
