import { useGetGraph } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ReactFlow, Background, Controls, MiniMap, Node, Edge, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMemo } from "react";
import { Network } from "lucide-react";

export default function Graph() {
  const { data, isLoading } = useGetGraph();

  const { nodes, edges } = useMemo(() => {
    if (!data) return { nodes: [], edges: [] };

    // Map API graph data to ReactFlow format
    const rfNodes: Node[] = data.nodes.map(node => {
      // Determine color based on node type
      let bgColor = 'hsl(var(--card))';
      let borderColor = 'hsl(var(--border))';
      let color = 'hsl(var(--foreground))';

      switch(node.type) {
        case 'supplier': 
          bgColor = 'hsl(var(--accent))';
          color = 'hsl(var(--accent-foreground))';
          break;
        case 'country':
          bgColor = 'hsl(var(--secondary))';
          color = 'hsl(var(--secondary-foreground))';
          break;
        case 'product':
          bgColor = 'hsl(var(--primary))';
          color = 'hsl(var(--primary-foreground))';
          break;
        case 'risk_factor':
          bgColor = 'hsl(var(--destructive))';
          color = 'hsl(var(--destructive-foreground))';
          break;
        case 'news_event':
          bgColor = 'hsl(var(--muted))';
          break;
      }

      // Simple layout logic since API doesn't return x,y (in a real app, use dagre/elkjs)
      // We'll just scatter them randomly for the demo, centered around 400, 300
      const x = 400 + (Math.random() - 0.5) * 600;
      const y = 300 + (Math.random() - 0.5) * 400;

      return {
        id: node.id,
        position: { x, y },
        data: { label: node.label },
        style: {
          background: bgColor,
          color: color,
          border: `1px solid ${borderColor}`,
          borderRadius: '8px',
          padding: '10px 15px',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          width: 150,
          textAlign: 'center'
        }
      };
    });

    const rfEdges: Edge[] = data.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label || undefined,
      animated: edge.type === 'impacts',
      style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: edge.weight || 1 },
      labelStyle: { fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 600 },
      labelBgStyle: { fill: 'hsl(var(--background))', fillOpacity: 0.8 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'hsl(var(--muted-foreground))',
      },
    }));

    return { nodes: rfNodes, edges: rfEdges };
  }, [data]);

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Knowledge Graph</h1>
        <p className="text-muted-foreground">Explore hidden relationships between entities, risks, and world events.</p>
      </div>

      <Card className="flex-1 bg-card/50 backdrop-blur border-border/10 overflow-hidden relative">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
           <div className="bg-background/80 backdrop-blur p-2 rounded border border-border/20 text-xs flex gap-4 shadow-sm">
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-accent"></div> Supplier</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-secondary"></div> Country</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary"></div> Product</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive"></div> Risk Factor</div>
           </div>
        </div>
        <CardContent className="p-0 h-full">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground flex-col">
              <Network className="h-10 w-10 mb-4 animate-pulse" />
              <p>Constructing graph topology...</p>
            </div>
          ) : (
            <ReactFlow 
              nodes={nodes} 
              edges={edges}
              fitView
              minZoom={0.2}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="hsl(var(--muted-foreground))" gap={16} size={1} />
              <Controls className="bg-background border-border/20 shadow-md fill-foreground" />
              <MiniMap 
                nodeColor={(n) => n.style?.background as string || 'hsl(var(--muted))'}
                maskColor="hsl(var(--background) / 0.7)"
                className="bg-background border border-border/20 shadow-md"
              />
            </ReactFlow>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
