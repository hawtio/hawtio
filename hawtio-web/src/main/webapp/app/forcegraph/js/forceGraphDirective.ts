module ForceGraph {

    export class ForceGraphDirective {

        public restrict = 'A';
        public replace = true;
        public transclude = false;

        public scope = {
          graph : '=graph',
          nodesize : '@',
          linkDistance : '@',
          charge : '@'
        };


        public link = ($scope, $element, $attrs) => {

            $scope.trans = [0,0];
            $scope.scale = 1;

            $scope.$watch('graph', (oldVal, newVal) => {
                updateGraph();
            });

            $scope.redraw = () => {
                $scope.trans = d3.event.translate;
                $scope.scale = d3.event.scale;

                $scope.svg.attr("transform", "translate(" + $scope.trans + ")" + " scale(" + $scope.scale + ")");
            };

            var updateGraph = () => {

                var canvas = $($element);

                // TODO: determine the canvas size dynamically
                var h = 800;
                var w = 1024;

                canvas.children("svg").remove();

                $scope.svg = d3.select(canvas[0]).append("svg")
                    .attr("width", w)
                    .attr("height", h)
                    .attr("pointer-events", "all");

                $scope.svg.append("svg:defs").selectAll("marker")
                    .data($scope.graph.linktypes)
                    .enter().append("svg:marker")
                    .attr("id", String)
                    .attr("viewBox", "0 -5 10 10")
                    .attr("refX", 15)
                    .attr("refY", -1.5)
                    .attr("markerWidth", 6)
                    .attr("markerHeight", 6)
                    .attr("orient", "auto")
                    .append("svg:path")
                    .attr("d", "M0,-5L10,0L0,5");

                $scope.svg.append("svg:g")
                    .append("svg:rect")
                    .attr("class", "graphbox")
                    .attr('width', w)
                    .attr('height', h);

                if ($scope.graph) {

                    if ($scope.force) {
                        $scope.force.stop();
                    }

                    var tick = () => {
                        path.attr("d", (d) => {
                            var dx = d.target.x - d.source.x,
                                dy = d.target.y - d.source.y,
                                dr = Math.sqrt(dx * dx + dy * dy);
                            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
                        });

                        circle.attr("transform", function(d) {
                            return "translate(" + d.x + "," + d.y + ")";
                        });

                        text.attr("transform", function(d) {
                            return "translate(" + d.x + "," + d.y + ")";
                        });
                    };

                    $scope.force = d3.layout.force()
                        .nodes($scope.graph.nodes)
                        .links($scope.graph.links)
                        .size([w, h])
                        .linkDistance($scope.linkDistance)
                        .charge($scope.charge)
                        .on("tick", tick);

                    $scope.force.start();

                    var path = $scope.svg.append("svg:g").selectAll("path")
                        .data($scope.force.links())
                        .enter().append("svg:path")
                        .attr("class", (d) => { return "link " + d.type; })
                        .attr("marker-end", (d) => { return "url(#" + d.type + ")"; });

                    var circle = $scope.svg.append("svg:g").selectAll("circle")
                        .data($scope.force.nodes())
                        .enter()
                        .append("a")
                        .attr("xlink:href", (d) => { return d.navUrl; });

                    // Add the images if they are set
                    circle.filter((d) => { return d.image != null; })
                        .append("image")
                        .attr("xlink:href", (d) => { return d.image.url; })
                        .attr("x", (d) => { return -(d.image.width / 2); })
                        .attr("y", (d) => { return -(d.image.height / 2); })
                        .attr("width", (d) => { return d.image.width; })
                        .attr("height", (d) => { return d.image.height; });

                    // if we don't have an image add a circle
                    circle.filter((d) => { return d.image == null; })
                        .append("circle")
                        .attr("class", (d) => { return d.type; })
                        .attr("r", $scope.nodesize);

                    // circle.call($scope.force.drag);

                    var text = $scope.svg.append("svg:g").selectAll("g")
                        .data($scope.force.nodes())
                        .enter().append("svg:g");

                    // A copy of the text with a thick white stroke for legibility.
                    text.append("svg:text")
                        .attr("x", 8)
                        .attr("y", ".31em")
                        .attr("class", "shadow")
                        .text(function(d) { return d.name; });

                    text.append("svg:text")
                        .attr("x", 8)
                        .attr("y", ".31em")
                        .text(function(d) { return d.name; });
                }
            }

        };

    };
}