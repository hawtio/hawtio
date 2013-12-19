/**
 * @module UI
 */
module UI {

  export function Editor($parse) {

    return {

      restrict: 'A',
      replace: true,

      templateUrl: UI.templatePath + "editor.html",

      scope: {
        text: '=hawtioEditor',
        mode:  '=',
        dirty: '=',
        outputEditor: '@',
        name: '@'
      },

      controller: ($scope, $element, $attrs) => {

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
                $scope.dirty = !$scope.doc.isClean();
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

        $scope.$watch('text', function(oldValue, newValue) {
          if ($scope.codeMirror && $scope.doc) {
            if (!$scope.codeMirror.hasFocus()) {
              $scope.doc.setValue($scope.text || "");
            }
          }
        });

      },

      link: ($scope, $element, $attrs) => {

        var config = Object.extended($attrs).clone();

        delete config['$$element']
        delete config['$attr'];
        delete config['class'];
        delete config['hawtioEditor'];
        delete config['mode'];
        delete config['dirty'];
        delete config['outputEditor'];

        if ('onChange' in $attrs) {
          var onChange = $attrs['onChange'];
          delete config['onChange'];
          $scope.options.push({
            onChange: (codeMirror) => {
              var func = $parse(onChange);
              if (func) {
                func($scope.$parent, { codeMirror:codeMirror });
              }
            }
          });
        }

        angular.forEach(config, function(value, key) {
          $scope.options.push({
            key: key,
            'value': value
          });
        });

        $scope.$watch('mode', () => {
          if ($scope.mode) {
            if (!$scope.codeMirror) {
              $scope.options.push({
                key: 'mode',
                'value': $scope.mode
              });
            } else {
              $scope.codeMirror.setOption('mode', $scope.mode);
            }
          }
        });

        $scope.$watch('dirty', () => {
          if ($scope.dirty && !$scope.doc.isClean()) {
            $scope.doc.markClean();
          }
        });

        $scope.$watch('text', function() {
          if (!$scope.codeMirror) {

            var options:any = {
              value: $scope.text
            };

            options = CodeEditor.createEditorSettings(options);
            $scope.codeMirror = CodeMirror.fromTextArea($element.find('textarea').get(0), options);
            var outputEditor = $scope.outputEditor;
            if (outputEditor) {
              var outputScope = $scope.$parent || $scope;
              Core.pathSet(outputScope, outputEditor, $scope.codeMirror);
            }
            $scope.applyOptions();
          }
        });
      }

    };
  }
}
