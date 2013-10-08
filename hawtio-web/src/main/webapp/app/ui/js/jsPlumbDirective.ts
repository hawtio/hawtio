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
        var nodesById = {};

        var nodeEls = $element.find('.jsplumb-node');

        angular.forEach(nodeEls, (nodeEl) => {

          var el = $(nodeEl);
          var id = el.attr('id')

          var node = {
            id: id,
            label: 'node ' + id,
            el: el,
            width: el.outerWidth(),
            height: el.outerHeight(),
            edges: []
          };
          console.log("Adding node: ", node);
          nodes.push(node);
          nodesById[id] = node;
        });

        angular.forEach(nodes, (sourceNode) => {
          var targets:any = sourceNode.el.attr('connect-to');
          if (targets) {
            targets = targets.split(',');
            angular.forEach(targets, (target) => {
              var targetNode = nodesById[target.trim()];
              if (targetNode) {
                var edge = {
                  source: sourceNode,
                  target: targetNode
                };
                transitions.push(edge);
                sourceNode.edges.push(edge);
                targetNode.edges.push(edge);
              }
            });
          }
        });

        $scope.jsPlumbNodes = nodes;
        $scope.jsPlumbTransitions = transitions;

        $scope.layout = dagre.layout()
            .nodeSep(50)
            .edgeSep(10)
            .rankSep(50)
            .nodes(nodes)
            .edges(transitions)
            .debugLevel(1)
            .run();

        angular.forEach($scope.jsPlumbNodes, (node) => {
          node.el.css({top: node.dagre.y, left: node.dagre.x});
          $scope.jsPlumb.addEndpoint(node.el);
          $scope.jsPlumb.draggable(node.el, {
            containment: $element
          });
        });

        angular.forEach($scope.jsPlumbTransitions, (edge) => {
          $scope.jsPlumb.connect({
            source: edge.source.el,
            target: edge.target.el
          });
        });

        Core.$apply($scope);
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
