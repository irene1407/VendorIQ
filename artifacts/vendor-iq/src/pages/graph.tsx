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

    // Deterministic column layout, grouped by node type, so the graph never overlaps randomly.
    const TYPE_ORDER = ['country', 'supplier', 'product', 'risk_factor', 'news_event'];
    const TYPE_STYLE: Record<string, { bg: string; text: string }> = {
      supplier:    { bg: '#5B9BD5', text: '#0a1220' },
      country:     { bg: '#7ED6A5', text: '#0a1220' },
      product:     { bg: '#F4C95D', text: '#0a1220' },
      risk_factor: { bg: '#F26D6D', text: '#1a0a0a' },
      news_event:  { bg: '#C79DE0', text: '#0a1220' },
    };

    const COLUMN_WIDTH = 280;
    const ROW_HEIGHT = 90;

    const groups = new Map<string, typeof data.nodes>();
    for (const node of data.nodes) {
      const key = node.type;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(node);
    }

    const orderedTypes = [...TYPE_ORDER.filter(t => groups.has(t)), ...[...groups.keys()].filter(t => !TYPE_ORDER.includes(t))];

    const rfNodes: Node[] = [];
    orderedTypes.forEach((type, colIndex) => {
      const nodesInGroup = groups.get(type)!;
      const groupHeight = nodesInGroup.length * ROW_HEIGHT;
      nodesInGroup.forEach((node, rowIndex) => {
        const style = TYPE_STYLE[type] ?? { bg: '#9CA3AF', text: '#0a1220' };
        rfNodes.push({
          id: node.id,
          position: {
            x: colIndex * COLUMN_WIDTH,
            y: rowIndex * ROW_HEIGHT - groupHeight / 2,
          },
          data: { label: node.label },
          style: {
            background: style.bg,
            color: style.text,
            border: 'none',
            borderRadius: '8px',
            padding: '10px 15px',
            fontSize: '12px',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.25), 0 2px 4px -1px rgba(0, 0, 0, 0.15)',
            width: 160,
            textAlign: 'center',
          },
        });
      });
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
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#7ED6A5' }}></div> Country</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#5B9BD5' }}></div> Supplier</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#F4C95D' }}></div> Product</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#F26D6D' }}></div> Risk Factor</div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#C79DE0' }}></div> News Event</div>
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
