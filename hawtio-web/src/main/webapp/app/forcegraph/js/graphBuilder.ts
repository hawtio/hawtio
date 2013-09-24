module ForceGraph {

    export class GraphBuilder {

        private nodes = {};
        private links = [];

        public addNode(node) {
            if(!this.nodes[node.id]) {
                this.nodes[node.id] = node;
            }
        }

        public addLink (srcNode, targetNode, linkType) {
            this.addNode(srcNode);
            this.addNode(targetNode);

            this.links.push({
                source: srcNode,
                target: targetNode,
                type: linkType
            });
        }

        public buildGraph() {

            var graphNodes = d3.values(this.nodes);
            var graphLinks = [];

            var nodeIndex = (id, nodes) => {
                var result = -1;
                var index = 0;

                for(index = 0; index < nodes.length; index++) {
                    var node = nodes[index];
                    if (node.id == id) {
                        result = index;
                        break;
                    }
                }

                return result;
            };

            this.links.forEach((link) => {
               graphLinks.push({
                   source: nodeIndex(link.source.id, graphNodes),
                   target: nodeIndex(link.target.id, graphNodes),
                   type: link.type
               });
            });

            return {
                nodes: graphNodes,
                links: graphLinks
            }
        }
    }
}