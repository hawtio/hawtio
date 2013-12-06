module IDE {

  var log:Logging.Logger = Logger.get("IDE");

  export class OpenInIdeDirective {

    public restrict = 'E';
    public replace = true;
    public transclude = false;

    public scope = {
      fileName: '@',
      className: '@',
      line: '@',
      column: '@'
    };

    constructor(public localStorage, public workspace, public jolokia) {
    }

    public link = ($scope, $element, $attrs) => {
      var workspace = this.workspace;
      var jolokia = this.jolokia;

      var mbean = IDE.getIdeMBean(workspace);
      var fileName = $scope.fileName;
      if (mbean && fileName) {
        var className = $scope.className;
        var line = $scope.line;
        var col = $scope.col;
        if (!angular.isDefined(line) || line === null) line = 0;
        if (!angular.isDefined(col) || col === null) col = 0;


        if (IDE.isOpenInIdeaSupported(workspace, localStorage)) {
          var ideaButton = $('<button class="btn btn-mini"><img src="app/ide/img/intellijidea.png" width="16" height="16"></button>');

          function onResult(absoluteName) {
            if (!absoluteName) {
              log.info("Could not find file in source code: " + fileName + " class: " + className);
              ideaButton.attr("title", "Could not find source file: " + fileName);
            } else {
              ideaButton.attr("title", "Opening in IDEA: " + absoluteName);
              IDE.ideaOpenAndNavigate(mbean, jolokia, absoluteName, line, col);
            }
          }

          ideaButton.on( "click", function() {
            log.info("Finding local file name: " + fileName + " className: " + className);
            IDE.findClassAbsoluteFileName(mbean, jolokia, localStorage, fileName, className, onResult);
          });
          $element.append(ideaButton);
        }
      }
    };
  }
}
