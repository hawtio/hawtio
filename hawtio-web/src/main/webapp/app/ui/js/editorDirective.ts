module UI {

  export class Editor {

    public restrict = 'A';
    public replace = true;

    public templateUrl = UI.templatePath + "editor.html";

    public scope = {
      text: '=hawtioEditor',
      mode: '@',
      name: '@',
      readonly: '@',
      id: '@'
    };

    public controller = ($scope, $element, $attrs) => {

      $scope.codeMirror = null;
      $scope.options = [];

      observe($scope, $attrs, 'name', 'editor');
      observe($scope, $attrs, 'mode', 'text');
      observe($scope, $attrs, 'readonly', 'false');

      $scope.applyOptions = () => {
        if ($scope.codeMirror) {
          $scope.options.each(function(option) {
            $scope.codeMirror.setOption(option.key, option['value']);
          });
          $scope.options = [];
        }
      }

    };

    public link = ($scope, $element, $attrs) => {

      $scope.$watch('options.length', $scope.applyOptions);

      $scope.$watch('text', function() {
        if (!$scope.codeMirror) {

          var options:any = {
            value: $scope.text
          };

          options = CodeEditor.createEditorSettings(options);
          $scope.codeMirror = CodeMirror.fromTextArea($element.find('textarea').get(0), options);
          $scope.applyOptions();
          $scope.doc = $scope.codeMirror.getDoc();
          $scope.codeMirror.on('change', function(changeObj) {
            $scope.text = $scope.doc.getValue();
            $scope.$apply();
          });

          setTimeout(function() {
            $scope.codeEditor.refresh();
          }, 10);

        }
      });

      $scope.$watch('mode', function() {
        if ($scope.mode) {
          $scope.options.push({
            key: 'mode',
            'value': $scope.mode
          });
        }
      });

      $scope.$watch('readonly', function() {
        $scope.options.push({
          key: 'readonly',
          'value': $scope.readonly
        });
      });
    };


  }
}
