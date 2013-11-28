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

                $scope.viewport.attr("transform", "translate(" + $scope.trans + ")" + " scale(" + $scope.scale + ")");
            };

            // This is a callback for the animation
            $scope.tick = () => {
                // provide curvy lines as curves are kind of hawt
                $scope.graphEdges.attr("d", (d) => {
                    var dx = d.target.x - d.source.x,
                        dy = d.target.y - d.source.y,
                        dr = Math.sqrt(dx * dx + dy * dy);
                    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
                });

                // apply the translates coming from the layouter
                $scope.graphNodes.attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

                $scope.graphLabels.attr("transform", function(d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
            };

            $scope.mover = (d) => {
                if (d.popup != null) {
                    $("#pop-up").fadeOut(100,function () {

                        // Popup content
                        if (d.popup.title != null) {
                            $("#pop-up-title").html(d.popup.title);
                        } else {
                            $("#pop-up-title").html("");
                        }

                        if (d.popup.content != null) {
                            $("#pop-up-content").html(d.popup.content);
                        } else {
                            $("#pop-up-content").html("");
                        }

                        // Popup position
                        var popLeft = (d.x * $scope.scale) + $scope.trans[0] + 20;
                        var popTop = (d.y * $scope.scale) + $scope.trans[1]+20;

                        $("#pop-up").css({"left":popLeft,"top":popTop});
                        $("#pop-up").fadeIn(100);
                    });
                }
            }

            $scope.mout = (d) => {
                $("#pop-up").fadeOut(50);
                //d3.select(this).attr("fill","url(#ten1)");
            }

            var updateGraph = () => {

                var canvas = $($element);

                // TODO: determine the canvas size dynamically
                var h = $($element).parent().height();
                var w = $($element).parent().width();
                var i = 0;

                canvas.children("svg").remove();

                // First we create the top level SVG object
                // TODO maybe pass in the width/height
                $scope.svg = d3.select(canvas[0]).append("svg")
                    .attr("width", w)
                    .attr("height", h);

              // The we add the markers for the arrow tips
              var linkTypes = null;
              if ($scope.graph) {
                linkTypes = $scope.graph.linktypes;
              }
              if (!linkTypes) {
                return;
              }
              $scope.svg.append("svg:defs").selectAll("marker")
                    .data(linkTypes)
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

                // The bounding box can't be zoomed or scaled at all
                $scope.svg.append("svg:g")
                    .append("svg:rect")
                    .attr("class", "graphbox.frame")
                    .attr('width', w)
                    .attr('height', h);

                $scope.viewport = $scope.svg.append("svg:g")
                    .call(d3.behavior.zoom().on("zoom", $scope.redraw))
                    .append("svg:g");

                $scope.viewport.append("svg:rect")
                    .attr("width", 1000000)
                    .attr("height", 1000000)
                    .attr("class", "graphbox")
                    .attr("transform", "translate(-50000, -500000)");

                // Only do this if we have a graph object
                if ($scope.graph) {

                    // kick off the d3 forced graph layout
                    $scope.force = d3.layout.force()
                        .nodes($scope.graph.nodes)
                        .links($scope.graph.links)
                        .size([w, h])
                        .linkDistance($scope.linkDistance)
                        .charge($scope.charge)
                        .on("tick", $scope.tick);

                    // Add all edges to the viewport
                    $scope.graphEdges = $scope.viewport.append("svg:g").selectAll("path")
                        .data($scope.force.links())
                        .enter().append("svg:path")
                        .attr("class", (d) => { return "link " + d.type; })
                        .attr("marker-end", (d) => { return "url(#" + d.type + ")"; });

                    // add all nodes to the viewport
                    $scope.graphNodes = $scope.viewport.append("svg:g").selectAll("circle")
                        .data($scope.force.nodes())
                        .enter()
                        .append("a")
                        .attr("xlink:href", (d) => { return d.navUrl; });

                    // Add the images if they are set
                    $scope.graphNodes.filter((d) => { return d.image != null; })
                        .append("image")
                        .attr("xlink:href", (d) => { return d.image.url; })
                        .attr("x", (d) => { return -(d.image.width / 2); })
                        .attr("y", (d) => { return -(d.image.height / 2); })
                        .attr("width", (d) => { return d.image.width; })
                        .attr("height", (d) => { return d.image.height; });

                    // if we don't have an image add a circle
                    $scope.graphNodes.filter((d) => { return d.image == null; })
                        .append("circle")
                        .attr("class", (d) => { return d.type; })
                        .attr("r", $scope.nodesize);

                    // Add the labels to the viewport
                    $scope.graphLabels = $scope.viewport.append("svg:g").selectAll("g")
                        .data($scope.force.nodes())
                        .enter().append("svg:g");

                    // A copy of the text with a thick white stroke for legibility.
                    $scope.graphLabels.append("svg:text")
                        .attr("x", 8)
                        .attr("y", ".31em")
                        .attr("class", "shadow")
                        .text(function(d) { return d.name; });

                    $scope.graphLabels.append("svg:text")
                        .attr("x", 8)
                        .attr("y", ".31em")
                        .text(function(d) { return d.name; });

                    // animate, then stop
                    $scope.force.start();

                    $scope.graphNodes
                        .call($scope.force.drag)
                        .on("mouseover", $scope.mover)
                        .on("mouseout", $scope.mout);

                }
            }

        };

    };
}
