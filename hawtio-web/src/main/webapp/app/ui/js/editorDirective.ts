module UI {

  export class Editor {

    public restrict = 'A';
    public replace = true;

    public templateUrl = UI.templatePath + "editor.html";

    public scope = {
      text: '=hawtioEditor',
      name: '@',
    };

    public controller = ($scope, $element, $attrs) => {

      $scope.codeMirror = null;
      $scope.doc = null;
      $scope.options = [];

      observe($scope, $attrs, 'name', 'editor');

      $scope.applyOptions = () => {
        if ($scope.codeMirror) {
          $scope.options.each(function(option) {
            $scope.codeMirror.setOption(option.key, option['value']);
          });
          $scope.options = [];
        }
      };

      $scope.$watch('doc', () => {
        if ($scope.doc) {
          $scope.codeMirror.on('change', function(changeObj) {
            var phase = $scope.$parent.$$phase;
            if (!phase) {
              $scope.text = $scope.doc.getValue();
              Core.$applyNowOrLater($scope);
            }
          });
        }
      });

      $scope.$watch('codeMirror', () => {
        if ($scope.codeMirror) {
          $scope.doc = $scope.codeMirror.getDoc();
        }
      });

      $scope.$watch('text', function() {
        if ($scope.codeMirror && $scope.doc) {
          if (!$scope.codeMirror.hasFocus()) {
            $scope.doc.setValue($scope.text);
          }
        }
      });

    };

    public link = ($scope, $element, $attrs) => {

      var config = Object.extended($attrs).clone();

      delete config['$$element']
      delete config['$attr'];
      delete config['class'];
      delete config['hawtioEditor'];

      angular.forEach(config, function(value, key) {
        $scope.options.push({
          key: key,
          'value': value
        });
      });

      $scope.$watch('text', function() {
        if (!$scope.codeMirror) {

          var options:any = {
            value: $scope.text
          };

          options = CodeEditor.createEditorSettings(options);
          $scope.codeMirror = CodeMirror.fromTextArea($element.find('textarea').get(0), options);
          $scope.applyOptions();
        }
      });

    };

  }
}
