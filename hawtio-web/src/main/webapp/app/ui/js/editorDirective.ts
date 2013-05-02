module UI {

  export class Editor {

    public restrict = 'A';
    public replace = true;

    public templateUrl = UI.templatePath + "editor.html";

    public scope = {
      text: '=hawtioEditor',
      selectedLine: '@',
      name: '@'
    };

    public controller = ($scope, $element, $attrs) => {

      $scope.codeMirror = null;
      $scope.doc = null;
      $scope.options = [];
      $scope.actions = [];

      observe($scope, $attrs, 'name', 'editor');

      $scope.applyOptions = () => {
        if ($scope.codeMirror) {
          $scope.options.each(function(option) {
            $scope.codeMirror.setOption(option.key, option['value']);
          });
          $scope.options = [];
        }
      };

      $scope.actions.push({
         doc: () => {
           $scope.codeMirror.on('change', function(changeObj) {
             var phase = $scope.$parent.$$phase;
             if (!phase) {
               $scope.text = $scope.doc.getValue();
               Core.$applyNowOrLater($scope);
             }
           });
         }
      });

      $scope.$watch('doc', () => {
        if ($scope.doc) {
          $scope.actions = executeActions('doc', $scope.actions);
        }
      });

      $scope.actions.push({
        editor: () => {
          $scope.doc = $scope.codeMirror.getDoc();
        }
      });

      $scope.actions.push({
        editor: () => {
          $scope.applyOptions();
        }
      });

      $scope.$watch('codeMirror', () => {
        if ($scope.codeMirror) {
          $scope.actions = executeActions('editor', $scope.actions);
        }
      });

      $scope.$watch('text', function() {
        if ($scope.codeMirror && $scope.doc) {
          if (!$scope.codeMirror.hasFocus()) {
            $scope.doc.setValue($scope.text);
          }
        }
      });

      $scope.$watch('selectedLine', function() {

        var setLine = () => {
          if ($scope.selectedLine < $scope.codeMirror.lineCount()) {
            var lineText = $scope.doc.getLine($scope.selectedLine);
            var endChar = (lineText) ? lineText.length : 1000;
            var start = {line: $scope.selectedLine, ch: 0};
            var end = {line: $scope.selectedLine, ch: endChar};
            $scope.codeMirror.scrollIntoView(start);
            $scope.codeMirror.setSelection(start, end);
            $scope.codeMirror.refresh();
          }
        }

        if ($scope.codeMirror && $scope.doc) {
          setLine();
        } else {
          $scope.actions.push( { doc: setLine });
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
        }
      });

    };

  }
}
