module ForceGraph {

    export class ForceGraphDirective {

        public restrict = 'E';
        public template = '<div>Hi, <span ng-transclude></span> !</div>';
        public replace = true;
        public transclude = true;

        public controller = ($scope, $element, $attrs, jolokia, $location, $templateCache) => {

            var w = 900;
            var h = 600;

            var links = [
                {source: "Microsoft", target: "Amazon", type: "licensing"},
                {source: "Microsoft", target: "HTC", type: "licensing"},
                {source: "Samsung", target: "Apple", type: "suit"},
                {source: "Motorola", target: "Apple", type: "suit"},
                {source: "Nokia", target: "Apple", type: "resolved"},
                {source: "HTC", target: "Apple", type: "suit"},
                {source: "Kodak", target: "Apple", type: "suit"},
                {source: "Microsoft", target: "Barnes & Noble", type: "suit"},
                {source: "Microsoft", target: "Foxconn", type: "suit"},
                {source: "Oracle", target: "Google", type: "suit"},
                {source: "Apple", target: "HTC", type: "suit"},
                {source: "Microsoft", target: "Inventec", type: "suit"},
                {source: "Samsung", target: "Kodak", type: "resolved"},
                {source: "LG", target: "Kodak", type: "resolved"},
                {source: "RIM", target: "Kodak", type: "suit"},
                {source: "Sony", target: "LG", type: "suit"},
                {source: "Kodak", target: "LG", type: "resolved"},
                {source: "Apple", target: "Nokia", type: "resolved"},
                {source: "Qualcomm", target: "Nokia", type: "resolved"},
                {source: "Apple", target: "Motorola", type: "suit"},
                {source: "Microsoft", target: "Motorola", type: "suit"},
                {source: "Motorola", target: "Microsoft", type: "suit"},
                {source: "Huawei", target: "ZTE", type: "suit"},
                {source: "Ericsson", target: "ZTE", type: "suit"},
                {source: "Kodak", target: "Samsung", type: "resolved"},
                {source: "Apple", target: "Samsung", type: "suit"},
                {source: "Kodak", target: "RIM", type: "suit"},
                {source: "Nokia", target: "Qualcomm", type: "suit"}
            ];

            var nodes = {};

           // Compute the distinct nodes from the links.
            links.forEach(function(link) {
                link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
                link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
            });

            var canvasDiv = $($element);

            canvasDiv.children("svg").remove();

            var svg = d3.select(canvasDiv[0]).append("svg")
                .attr("width", w)
                .attr("height", h);

            var force = d3.layout.force()
                .nodes(d3.values(nodes))
                .links(links)
                .size([w, h])
                .linkDistance(60)
                .charge(-300)
                .on("tick", tick)
                .start();

            // Per-type markers, as they don't inherit styles.
            svg.append("svg:defs").selectAll("marker")
                .data(["suit", "licensing", "resolved"])
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

            var path = svg.append("svg:g").selectAll("path")
                .data(force.links())
                .enter().append("svg:path")
                .attr("class", function(d) { return "link " + d.type; })
                .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });

            var circle = svg.append("svg:g").selectAll("circle")
                .data(force.nodes())
                .enter().append("svg:circle")
                .attr("r", 6)
                .call(force.drag);

            var text = svg.append("svg:g").selectAll("g")
                .data(force.nodes())
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

// Use elliptical arc path segments to doubly-encode directionality.
            function tick() {
                path.attr("d", function(d) {
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
        }
    }
}