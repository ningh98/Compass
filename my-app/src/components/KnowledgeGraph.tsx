'use client';
import ForceGraph2D from 'react-force-graph-2d';
import { useRef, useEffect } from 'react';

interface Node {
  id: string;
  label: string;
  type: string;
  roadmap_id: number | null;
  group: number | null;
}

interface Edge {
  source: string;
  target: string;
  weight: number;
  relationship: string;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

interface KnowledgeGraphProps {
  graphData: GraphData | null;
}

const KnowledgeGraph = ({ graphData }: KnowledgeGraphProps) => {
  const fgRef = useRef<any>();

  // Colors for different groups (roadmaps)
  const groupColors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Orange
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange-red
    '#84CC16', // Lime
  ];

  useEffect(() => {
    // Zoom to fit when data changes
    if (fgRef.current && graphData && graphData.nodes.length > 0) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 20);
      }, 500);
    }
  }, [graphData]);

  if (!graphData || graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">🧠</div>
          <div>No knowledge graph data available</div>
          <div className="text-sm mt-1">Create some roadmaps to see connections</div>
        </div>
      </div>
    );
  }

  // Transform data for react-force-graph-2d
  const transformedData = {
    nodes: graphData.nodes.map(node => ({
      id: node.id,
      label: node.label,
      type: node.type,
      group: node.group || 0,
      roadmap_id: node.roadmap_id
    })),
    links: graphData.edges.map(edge => ({
      source: edge.source,
      target: edge.target,
      value: edge.weight,
      relationship: edge.relationship
    }))
  };

  return (
    <div>
      {/* Legend */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-800 mb-2">Graph Legend</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 border-2 border-white rounded-full"></div>
            <span>Large circles = Topics</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            <span>Small circles = Titles</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">(Colors distinguish different roadmaps)</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          <strong>Edge types:</strong> contains (topic→title), prerequisite (required before), complementary (builds on), conceptual (similar concepts), transfer (cross-domain)
        </div>
      </div>

      {/* Graph */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <ForceGraph2D
          ref={fgRef}
          graphData={transformedData}
          width={1200}
          height={700}
          backgroundColor="#f8f9fa"

          // Node styling
          nodeColor={(node: any) => {
            const group = node.group || 0;
            return groupColors[group % groupColors.length];
          }}
          nodeVal={(node: any) => node.type === 'topic' ? 8 : 4} // Size based on type
          nodeLabel={(node: any) => {
            const type = node.type === 'topic' ? 'TOPIC' : 'TITLE';
            return `<div style="background: rgba(255,255,255,0.9); padding: 8px; border-radius: 4px; border: 1px solid #ccc;">
              <strong style="color: #333;">${node.label}</strong><br/>
              <small style="color: #666;">${type}</small>
            </div>`;
          }}

          // Link styling
          linkWidth={(link: any) => Math.max(0.5, link.value / 2)} // Thicker edges for stronger connections
          linkColor={(link: any) => {
            switch (link.relationship) {
              case 'contains': return '#6B7280'; // Gray
              case 'prerequisite': return '#EF4444'; // Red
              case 'complementary': return '#10B981'; // Green
              case 'conceptual': return '#3B82F6'; // Blue
              case 'transfer': return '#F59E0B'; // Orange
              default: return '#6B7280';
            }
          }}
          linkLabel={(link: any) => {
            const colors = {
              contains: 'text-gray-700',
              prerequisite: 'text-red-700',
              complementary: 'text-green-700',
              conceptual: 'text-blue-700',
              transfer: 'text-orange-700'
            };
            return `<div class="${colors[link.relationship as keyof typeof colors] || 'text-gray-700'} text-sm px-2 py-1 bg-white rounded border">
              ${link.relationship}
            </div>`;
          }}

          // Interactions
          onNodeClick={(node: any) => {
            // Center on clicked node
            fgRef.current.centerAt(node.x, node.y, 1000);
            fgRef.current.zoom(2, 2000);
          }}

          linkDirectionalArrowLength={3}
          linkDirectionalArrowRelPos={1}

          // Force simulation settings
          d3VelocityDecay={0.3}
          d3AlphaMin={0.05}

          // Hover effects
          onNodeHover={(node: any, prevNode: any) => {
            // Highlight connected nodes on hover (optional enhancement)
          }}

          enableNodeDrag={true}
          enablePanAndZoom={true}

          minZoom={0.1}
          maxZoom={5}
        />
      </div>

      {/* Statistics */}
      <div className="mt-4 text-sm text-gray-600">
        <div className="flex gap-6">
          <span><strong>Topics:</strong> {graphData.nodes.filter(n => n.type === 'topic').length}</span>
          <span><strong>Titles:</strong> {graphData.nodes.filter(n => n.type === 'title').length}</span>
          <span><strong>Connections:</strong> {graphData.edges.length}</span>
          <span><strong>Roadmaps:</strong> {new Set(graphData.nodes.map(n => n.roadmap_id)).size}</span>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraph;