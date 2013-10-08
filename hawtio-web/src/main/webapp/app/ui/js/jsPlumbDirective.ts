module UI {

  export class JSPlumb {
    public restrict = 'A';

    public link = ($scope, $element, $attrs) => {

      $element.bind('DOMNodeInserted', (event) => {
        // TODO - handle added nodes here, like from ng-repeat for example
      });

      setTimeout(() => {
        $scope.jsPlumb = jsPlumb.getInstance({
          Container: $element
        });

        $scope.jsPlumb.importDefaults({
          DragOptions : { cursor: "pointer", zIndex:2000 }
        });

        var nodes = [];
        var transitions = [];

        var nodeEls = $element.find('.jsplumb-node');
        angular.forEach(nodeEls, (node) => {

          var el = $(node);

          nodes.push({
            el: el,
            width: el.width(),
            height: el.height()
          });
          $scope.jsPlumb.addEndpoint(el);
          $scope.jsPlumb.draggable(el, {
            containment: $element
          });
        });

        angular.forEach(nodes, (node) => {
          var targets:any = node.el.attr('connect-to');
          if (targets) {
            targets = targets.split(',');
            angular.forEach(targets, (target) => {
              var targetEl = $element.find(target);
              var transition = {
                source: node.el,
                target: targetEl
              };
              $scope.jsPlumb.connect(transition);
              transitions.push(transition);
            });
          }
        });

        $scope.jsPlumbNodes = nodes;
        $scope.jsPlumbTransitions = transitions;

        setTimeout(() => {
          $scope.layout = dagre.layout()
              .nodeSep(100)
              .edgeSep(10)
              .rankSep(50)
              .nodes(nodes)
              .transitions(transitions)
              .debugLevel(1)
              .run();
          Core.$apply($scope);
        }, 50);
      }, 50);


    };
  }

  export class JSPlumbConnection {
    public restrict = 'A';

    public link = ($scope, $element, $attrs) => {
      if (!angular.isDefined($scope.jsPlumb)) {
        return;
      }

      console.log("here!");

      var targets = $attrs['connectTo'].split(',');

      angular.forEach(targets, (target) => {

        var targetEl = $element.parent().find(target);

        $scope.jsPlumb.connect({
          source: $element,
          target: targetEl
        });
      });

    };
  }
}
