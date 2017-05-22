module IDE {

  var log:Logging.Logger = Logger.get("IDE");

  export interface SourceReference {
    fileName: string;
    className: string;
    line: string;
    column: string;
  }


  export class OpenInIdeDirective {

    public restrict = 'E';
    public replace = true;
    public transclude = false;

    public scope: SourceReference = {
      fileName: '@',
      className: '@',
      line: '@',
      column: '@'
    };

    public link: (scope, element, attrs) => any;

    constructor(public localStorage, public workspace, public jolokia) {
      // necessary to ensure 'this' is this object <sigh>
      this.link = (scope, element, attrs) => {
        return this.doLink(scope, element, attrs);
      }
    }

    public doLink($scope, $element, $attrs) {
      var workspace = this.workspace;
      var jolokia = this.jolokia;

      var mbean = IDE.getIdeMBean(workspace);
      var fileName = $scope.fileName;
      if (mbean && fileName) {
        if (IDE.isOpenInIdeaSupported(workspace, localStorage)) {
          var ideaButton = $('<button class="btn btn-mini"><img src="app/ide/img/intellijidea.png" width="16" height="16"></button>');
          ideaButton.on( "click", function() {
            log.info("Attempting to open source file for: " + $scope.className);
            IDE.ideaOpenAndNavigate(mbean, jolokia, $scope, (response) => {log.info("open file request completed.")});
          });
          $element.append(ideaButton);
        }
      }
    }
  }
}
