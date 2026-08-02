import { useGetGraph } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReactFlow, Background, Controls, MiniMap, Node, Edge, MarkerType, NodeMouseHandler } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMemo, useState, useCallback, useEffect } from "react";
import { Network, X, MapPin, Tag, TrendingUp, FileText, AlertTriangle, Newspaper, Link2, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GraphNodeRaw {
  id: string;
  type: string;
  label: string;
  riskScore: number | null;
  metadata: Record<string, unknown>;
}
interface GraphEdgeRaw {
  id: string;
  source: string;
  target: string;
  type: string;
  weight: number;
  label: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_ORDER = ['country', 'supplier', 'product', 'risk_factor', 'news_event', 'contract'];

const TYPE_STYLE: Record<string, { bg: string; text: string }> = {
  supplier:    { bg: '#5B9BD5', text: '#0a1220' },
  country:     { bg: '#7ED6A5', text: '#0a1220' },
  product:     { bg: '#F4C95D', text: '#0a1220' },
  risk_factor: { bg: '#F26D6D', text: '#1a0a0a' },
  news_event:  { bg: '#C79DE0', text: '#0a1220' },
  contract:    { bg: '#FB923C', text: '#1a0a0a' },
};

const RISK_LABEL = (score: number) =>
  score >= 70 ? { label: "High", color: "text-destructive" }
  : score >= 40 ? { label: "Medium", color: "text-yellow-400" }
  : { label: "Low", color: "text-emerald-400" };

const SENTIMENT_STYLE: Record<string, { label: string; color: string }> = {
  negative: { label: "Negative", color: "text-destructive" },
  positive: { label: "Positive", color: "text-emerald-400" },
  neutral:  { label: "Neutral",  color: "text-muted-foreground" },
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  supplier:    <TrendingUp className="h-3.5 w-3.5" />,
  country:     <MapPin className="h-3.5 w-3.5" />,
  product:     <Package className="h-3.5 w-3.5" />,
  risk_factor: <AlertTriangle className="h-3.5 w-3.5" />,
  news_event:  <Newspaper className="h-3.5 w-3.5" />,
  contract:    <FileText className="h-3.5 w-3.5" />,
};

// ─── Node Detail Panel ────────────────────────────────────────────────────────

function NodeDetailPanel({
  nodeId,
  allNodes,
  allEdges,
  onClose,
  onSelectNode,
}: {
  nodeId: string;
  allNodes: GraphNodeRaw[];
  allEdges: GraphEdgeRaw[];
  onClose: () => void;
  onSelectNode: (id: string) => void;
}) {
  const node = allNodes.find(n => n.id === nodeId);
  if (!node) return null;

  // Gather related nodes via edges
  const relatedEdges = allEdges.filter(e => e.source === nodeId || e.target === nodeId);
  const relatedNodes = relatedEdges.map(e => {
    const otherId = e.source === nodeId ? e.target : e.source;
    const other = allNodes.find(n => n.id === otherId);
    return other ? { node: other, edge: e, direction: e.source === nodeId ? "out" : "in" as const } : null;
  }).filter(Boolean) as { node: GraphNodeRaw; edge: GraphEdgeRaw; direction: "in" | "out" }[];

  const style = TYPE_STYLE[node.type] ?? { bg: '#9CA3AF', text: '#0a1220' };
  const meta = node.metadata;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="w-80 shrink-0 border-l border-border/10 bg-background/95 backdrop-blur flex flex-col h-full overflow-hidden animate-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-border/10" style={{ borderLeftColor: style.bg, borderLeftWidth: 3 }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span style={{ color: style.bg }}>{TYPE_ICON[node.type]}</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {node.type.replace("_", " ")}
            </span>
          </div>
          <h2 className="font-display font-bold text-base leading-snug">{node.label}</h2>
        </div>
        <button
          onClick={onClose}
          className="ml-2 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-card transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        {/* Risk Score */}
        {node.riskScore !== null && (
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">Risk Score</div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-display font-bold">{node.riskScore.toFixed(1)}</span>
              <span className={`text-sm font-semibold mb-1 ${RISK_LABEL(node.riskScore).color}`}>
                {RISK_LABEL(node.riskScore).label}
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-card overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${node.riskScore}%`,
                  background: node.riskScore >= 70 ? '#EF4444' : node.riskScore >= 40 ? '#F59E0B' : '#22C55E',
                }}
              />
            </div>
          </div>
        )}

        {/* Type-specific details */}
        {node.type === "supplier" && (
          <SupplierDetails meta={meta} />
        )}
        {node.type === "country" && (
          <CountryDetails meta={meta} />
        )}
        {node.type === "product" && (
          <ProductDetails meta={meta} />
        )}
        {node.type === "risk_factor" && (
          <RiskFactorDetails meta={meta} />
        )}
        {node.type === "news_event" && (
          <NewsEventDetails meta={meta} />
        )}
        {node.type === "contract" && (
          <ContractDetails meta={meta} />
        )}

        {/* Connections */}
        {relatedNodes.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Connections ({relatedNodes.length})
              </span>
            </div>
            <div className="space-y-1.5">
              {relatedNodes.map(({ node: rel, edge }) => {
                const relStyle = TYPE_STYLE[rel.type] ?? { bg: '#9CA3AF', text: '#0a1220' };
                return (
                  <button
                    key={rel.id}
                    onClick={() => onSelectNode(rel.id)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-md bg-card/40 hover:bg-card border border-border/10 hover:border-border/30 transition-colors text-left group"
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: relStyle.bg }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate group-hover:text-primary transition-colors">{rel.label}</div>
                      {edge.label && (
                        <div className="text-[10px] text-muted-foreground truncate">{edge.label}</div>
                      )}
                      {!edge.label && (
                        <div className="text-[10px] text-muted-foreground truncate">{edge.type.replace(/_/g, " ")}</div>
                      )}
                    </div>
                    {rel.riskScore !== null && (
                      <span className={`text-xs font-mono shrink-0 ${RISK_LABEL(rel.riskScore).color}`}>
                        {rel.riskScore.toFixed(0)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Type-specific detail sections ───────────────────────────────────────────

function DetailRow({ icon, label, value }: { icon?: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-1.5 text-muted-foreground text-xs shrink-0">{icon}{label}</div>
      <div className="text-xs font-medium text-right">{value}</div>
    </div>
  );
}

function DetailSection({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2.5 bg-card/30 rounded-lg p-3 border border-border/10">{children}</div>;
}

function SupplierDetails({ meta }: { meta: Record<string, unknown> }) {
  return (
    <DetailSection>
      {!!meta.country && <DetailRow icon={<MapPin className="h-3 w-3" />} label="Country" value={String(meta.country)} />}
      {!!meta.category && <DetailRow icon={<Tag className="h-3 w-3" />} label="Category" value={<Badge variant="outline" className="text-[10px] px-1.5 py-0">{String(meta.category)}</Badge>} />}
      {!!meta.spend && <DetailRow icon={<TrendingUp className="h-3 w-3" />} label="Annual Spend" value={formatCurrency(Number(meta.spend))} />}
      {!!meta.onTimeDelivery && <DetailRow label="On-time Delivery" value={`${String(meta.onTimeDelivery)}%`} />}
    </DetailSection>
  );
}

function CountryDetails({ meta }: { meta: Record<string, unknown> }) {
  return (
    <DetailSection>
      {meta.suppliers !== undefined && <DetailRow icon={<TrendingUp className="h-3 w-3" />} label="Active Suppliers" value={String(meta.suppliers)} />}
      {!!meta.region && <DetailRow icon={<MapPin className="h-3 w-3" />} label="Region" value={String(meta.region)} />}
    </DetailSection>
  );
}

function ProductDetails({ meta }: { meta: Record<string, unknown> }) {
  return (
    <DetailSection>
      {!!meta.category && <DetailRow icon={<Tag className="h-3 w-3" />} label="Category" value={<Badge variant="outline" className="text-[10px] px-1.5 py-0">{String(meta.category)}</Badge>} />}
      {!!meta.unit && <DetailRow label="Unit" value={String(meta.unit)} />}
    </DetailSection>
  );
}

function RiskFactorDetails({ meta }: { meta: Record<string, unknown> }) {
  return (
    <DetailSection>
      {!!meta.region && <DetailRow icon={<MapPin className="h-3 w-3" />} label="Region" value={String(meta.region)} />}
      {!!meta.category && <DetailRow icon={<Tag className="h-3 w-3" />} label="Category" value={String(meta.category)} />}
    </DetailSection>
  );
}

function NewsEventDetails({ meta }: { meta: Record<string, unknown> }) {
  const sentiment = String(meta.sentiment ?? "neutral");
  const sentStyle = SENTIMENT_STYLE[sentiment] ?? SENTIMENT_STYLE.neutral;
  return (
    <DetailSection>
      {!!meta.date && <DetailRow icon={<Newspaper className="h-3 w-3" />} label="Date" value={String(meta.date)} />}
      {!!meta.sentiment && (
        <DetailRow label="Sentiment" value={<span className={`font-semibold ${sentStyle.color}`}>{sentStyle.label}</span>} />
      )}
      {!!meta.impactLevel && (
        <DetailRow label="Impact" value={<Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">{String(meta.impactLevel)}</Badge>} />
      )}
    </DetailSection>
  );
}

function ContractDetails({ meta }: { meta: Record<string, unknown> }) {
  const statusColor: Record<string, string> = {
    active: "text-emerald-400",
    under_review: "text-yellow-400",
    expired: "text-destructive",
  };
  const status = String(meta.status ?? "");
  return (
    <DetailSection>
      {!!meta.value && <DetailRow icon={<FileText className="h-3 w-3" />} label="Contract Value" value={formatCurrency(Number(meta.value))} />}
      {!!meta.status && (
        <DetailRow label="Status" value={
          <span className={`font-semibold capitalize ${statusColor[status] ?? ""}`}>
            {status.replace("_", " ")}
          </span>
        } />
      )}
      {!!meta.expiry && <DetailRow label="Expires" value={String(meta.expiry)} />}
    </DetailSection>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Graph() {
  const { data, isLoading } = useGetGraph();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const rawNodes = (data?.nodes ?? []) as unknown as GraphNodeRaw[];
  const rawEdges = (data?.edges ?? []) as unknown as GraphEdgeRaw[];

  const { nodes, edges } = useMemo(() => {
    if (!rawNodes.length) return { nodes: [], edges: [] };

    const COLUMN_WIDTH = 280;
    const ROW_HEIGHT = 90;

    const groups = new Map<string, GraphNodeRaw[]>();
    for (const node of rawNodes) {
      if (!groups.has(node.type)) groups.set(node.type, []);
      groups.get(node.type)!.push(node);
    }

    const orderedTypes = [
      ...TYPE_ORDER.filter(t => groups.has(t)),
      ...[...groups.keys()].filter(t => !TYPE_ORDER.includes(t)),
    ];

    const rfNodes: Node[] = [];
    orderedTypes.forEach((type, colIndex) => {
      const nodesInGroup = groups.get(type)!;
      const groupHeight = nodesInGroup.length * ROW_HEIGHT;
      nodesInGroup.forEach((node, rowIndex) => {
        const isSelected = node.id === selectedNodeId;
        const style = TYPE_STYLE[type] ?? { bg: '#9CA3AF', text: '#0a1220' };
        rfNodes.push({
          id: node.id,
          position: {
            x: colIndex * COLUMN_WIDTH,
            y: rowIndex * ROW_HEIGHT - groupHeight / 2,
          },
          data: {
            label: node.label,
            nodeType: node.type,
            riskScore: node.riskScore,
            metadata: node.metadata,
          },
          style: {
            background: isSelected ? '#ffffff' : style.bg,
            color: isSelected ? '#0a1220' : style.text,
            border: isSelected ? `2px solid ${style.bg}` : 'none',
            borderRadius: '8px',
            padding: '10px 15px',
            fontSize: '12px',
            fontWeight: 'bold',
            boxShadow: isSelected
              ? `0 0 0 3px ${style.bg}55, 0 8px 24px rgba(0,0,0,0.35)`
              : '0 4px 6px -1px rgba(0,0,0,0.25)',
            width: 160,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          },
        });
      });
    });

    const rfEdges: Edge[] = rawEdges.map(edge => ({
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
  }, [rawNodes, rawEdges, selectedNodeId]);

  const handleNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNodeId(prev => prev === node.id ? null : node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">Knowledge Graph</h1>
        <p className="text-muted-foreground">
          Explore hidden relationships between entities, risks, and world events.{" "}
          <span className="text-primary/70">Click any node to inspect it.</span>
        </p>
      </div>

      <Card className="flex-1 bg-card/50 backdrop-blur border-border/10 overflow-hidden relative">
        {/* Legend */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-background/80 backdrop-blur p-2 rounded border border-border/20 text-xs flex gap-4 shadow-sm">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#7ED6A5' }} /> Country</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#5B9BD5' }} /> Supplier</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#F4C95D' }} /> Product</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#F26D6D' }} /> Risk Factor</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#C79DE0' }} /> News Event</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ background: '#FB923C' }} /> Contract</div>
          </div>
        </div>

        <CardContent className="p-0 h-full flex">
          {/* Graph */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground flex-col">
                <Network className="h-10 w-10 mb-4 animate-pulse" />
                <p>Constructing graph topology...</p>
              </div>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodeClick={handleNodeClick}
                onPaneClick={handlePaneClick}
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
          </div>

          {/* Detail panel */}
          {selectedNodeId && (
            <NodeDetailPanel
              nodeId={selectedNodeId}
              allNodes={rawNodes}
              allEdges={rawEdges}
              onClose={() => setSelectedNodeId(null)}
              onSelectNode={setSelectedNodeId}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
