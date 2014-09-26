module ForceGraph {

    /**
     * GraphBuilder
     *
     * @class GraphBuilder
     */
    export class GraphBuilder {

        private nodes = {};
        private links = [];
        private linkTypes = {};

      /**
       * Adds a node to this graph
       * @method addNode
       * @param {Object} node
       */
        public addNode(node) {
            if(!this.nodes[node.id]) {
                this.nodes[node.id] = node;
            }
        }

        public getNode(id) {
            return this.nodes[id];
        }

        public hasLinks(id) {

            var result = false;

            this.links.forEach( (link) => {
                if (
                    link.source.id == id || link.target.id == id) {
                    result = result || (this.nodes[link.source.id] != null && this.nodes[link.target.id] != null);
                }
            })
            return result;
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

        nodeIndex(id, nodes) {
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
        }

        public filterNodes( filter ) {
            var filteredNodes = {};
            var newLinks = [];

            d3.values(this.nodes).forEach( (node) => {
                if (filter(node)) {
                    filteredNodes[node.id] = node;
                }
            })

            this.links.forEach( (link) => {
                if (filteredNodes[link.source.id] && filteredNodes[link.target.id]) {
                    newLinks.push(link);
                }
            })

            this.nodes = filteredNodes;
            this.links = newLinks;
        }

        public buildGraph() {

            var graphNodes = [];
            var linktypes  = d3.keys(this.linkTypes);
            var graphLinks = [];

            d3.values(this.nodes).forEach( (node) => {
                if (node.includeInGraph == null || node.includeInGraph) {
                    node.includeInGraph = true;
                    graphNodes.push(node);
                }
            })

            this.links.forEach((link) => {
               if (
                   this.nodes[link.source.id] != null
                   && this.nodes[link.target.id] != null
                   && this.nodes[link.source.id].includeInGraph
                   && this.nodes[link.target.id].includeInGraph) {
                   graphLinks.push({
                       source: this.nodeIndex(link.source.id, graphNodes),
                       target: this.nodeIndex(link.target.id, graphNodes),
                       type: link.type
                   });
               }
            });

            return {
                nodes: graphNodes,
                links: graphLinks,
                linktypes: linktypes
            }
        }
    }
}
