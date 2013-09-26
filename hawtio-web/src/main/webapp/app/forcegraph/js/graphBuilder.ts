module ForceGraph {

    export class GraphBuilder {

        private nodes = {};
        private links = [];
        private linkTypes = {};

        public addNode(node) {
            if(!this.nodes[node.id]) {
                this.nodes[node.id] = node;
            }
        }

        public addLink (srcId, targetId, linkType) {

            if ((this.nodes[srcId] != null) && (this.nodes[targetId] != null)) {
                this.links.push({
                    source: this.nodes[srcId],
                    target: this.nodes[targetId],
                    type: linkType
                });

                if (!this.linkTypes[linkType]) {
                    this.linkTypes[linkType] = {
                        used: true
                    }
                };
            }
        }

        public buildGraph() {

            var graphNodes = d3.values(this.nodes);
            var linktypes  = d3.keys(this.linkTypes);
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
                links: graphLinks,
                linktypes: linktypes
            }
        }
    }
}