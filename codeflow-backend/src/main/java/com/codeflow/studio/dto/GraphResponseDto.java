package com.codeflow.studio.dto;

import java.util.List;
import java.util.Map;

public class GraphResponseDto {

    private List<ReactFlowNode> nodes;
    private List<ReactFlowEdge> edges;

    public GraphResponseDto() {}

    public GraphResponseDto(List<ReactFlowNode> nodes, List<ReactFlowEdge> edges) {
        this.nodes = nodes;
        this.edges = edges;
    }

    public List<ReactFlowNode> getNodes() { return nodes; }
    public void setNodes(List<ReactFlowNode> nodes) { this.nodes = nodes; }

    public List<ReactFlowEdge> getEdges() { return edges; }
    public void setEdges(List<ReactFlowEdge> edges) { this.edges = edges; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private List<ReactFlowNode> nodes;
        private List<ReactFlowEdge> edges;

        public Builder nodes(List<ReactFlowNode> nodes) { this.nodes = nodes; return this; }
        public Builder edges(List<ReactFlowEdge> edges) { this.edges = edges; return this; }

        public GraphResponseDto build() {
            return new GraphResponseDto(nodes, edges);
        }
    }

    public static class ReactFlowNode {
        private String id;
        private String type;
        private Map<String, Object> data;
        private Position position;

        public ReactFlowNode() {}

        public ReactFlowNode(String id, String type, Map<String, Object> data, Position position) {
            this.id = id;
            this.type = type;
            this.data = data;
            this.position = position;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public Map<String, Object> getData() { return data; }
        public void setData(Map<String, Object> data) { this.data = data; }

        public Position getPosition() { return position; }
        public void setPosition(Position position) { this.position = position; }

        public static NodeBuilder builder() { return new NodeBuilder(); }

        public static class NodeBuilder {
            private String id;
            private String type;
            private Map<String, Object> data;
            private Position position;

            public NodeBuilder id(String id) { this.id = id; return this; }
            public NodeBuilder type(String type) { this.type = type; return this; }
            public NodeBuilder data(Map<String, Object> data) { this.data = data; return this; }
            public NodeBuilder position(Position position) { this.position = position; return this; }

            public ReactFlowNode build() {
                return new ReactFlowNode(id, type, data, position);
            }
        }
    }

    public static class Position {
        private double x;
        private double y;

        public Position() {}
        public Position(double x, double y) { this.x = x; this.y = y; }

        public double getX() { return x; }
        public void setX(double x) { this.x = x; }

        public double getY() { return y; }
        public void setY(double y) { this.y = y; }
    }

    public static class ReactFlowEdge {
        private String id;
        private String source;
        private String target;
        private String label;
        private boolean animated;
        private String type;

        public ReactFlowEdge() {}

        public ReactFlowEdge(String id, String source, String target, String label, boolean animated, String type) {
            this.id = id;
            this.source = source;
            this.target = target;
            this.label = label;
            this.animated = animated;
            this.type = type;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getSource() { return source; }
        public void setSource(String source) { this.source = source; }

        public String getTarget() { return target; }
        public void setTarget(String target) { this.target = target; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public boolean isAnimated() { return animated; }
        public void setAnimated(boolean animated) { this.animated = animated; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public static EdgeBuilder builder() { return new EdgeBuilder(); }

        public static class EdgeBuilder {
            private String id;
            private String source;
            private String target;
            private String label;
            private boolean animated;
            private String type;

            public EdgeBuilder id(String id) { this.id = id; return this; }
            public EdgeBuilder source(String source) { this.source = source; return this; }
            public EdgeBuilder target(String target) { this.target = target; return this; }
            public EdgeBuilder label(String label) { this.label = label; return this; }
            public EdgeBuilder animated(boolean animated) { this.animated = animated; return this; }
            public EdgeBuilder type(String type) { this.type = type; return this; }

            public ReactFlowEdge build() {
                return new ReactFlowEdge(id, source, target, label, animated, type);
            }
        }
    }
}
