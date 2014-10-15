/// <reference path="uiPlugin.ts"/>
module UI {
  var hawtioFileDrop = _module.directive("hawtioFileDrop", [() => {
    return {
      restrict: 'A',
      replace: false,
      link: (scope, element, attr) => {
        var fileName = attr['hawtioFileDrop'];
        var downloadURL = attr['downloadUrl'];
        var mimeType = attr['mimeType'] || 'application/octet-stream';
        if (Core.isBlank(fileName) || Core.isBlank(downloadURL)) {
          return;
        }
        // DownloadURL needs an absolute URL
        if (!downloadURL.startsWith("http")) {
          var uri = new URI();
          downloadURL = uri.path(downloadURL).toString();
        }
        var fileDetails = mimeType + ":" + fileName + ":" + downloadURL;
        element.attr({
          draggable: true
        });
        element[0].addEventListener("dragstart", (event) => {
          if (event.dataTransfer) {
            log.debug("Drag started, event: ", event, "File details: ", fileDetails);
            event.dataTransfer.setData("DownloadURL", fileDetails);
          } else {
            log.debug("Drag event object doesn't contain data transfer: ", event);
          }
        });
      }
    };
  }]);
}
