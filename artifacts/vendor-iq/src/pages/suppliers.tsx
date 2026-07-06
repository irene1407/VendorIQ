import { useListSuppliers, SupplierRiskLevel } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Search, Plus, Filter, Map as MapIcon, Table as TableIcon } from "lucide-react";
import { useState } from "react";

export default function Suppliers() {
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'table' | 'map'>('table');
  const { data, isLoading } = useListSuppliers({ page, limit: 20 });

  const getRiskColor = (level: SupplierRiskLevel) => {
    switch(level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Supplier Registry</h1>
          <p className="text-muted-foreground">Manage and analyze your global supplier network.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted p-1 rounded-md">
            <Button variant={view === 'table' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('table')} className="h-8">
              <TableIcon className="h-4 w-4 mr-2" /> Table
            </Button>
            <Button variant={view === 'map' ? 'secondary' : 'ghost'} size="sm" onClick={() => setView('map')} className="h-8">
              <MapIcon className="h-4 w-4 mr-2" /> Map
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Supplier
          </Button>
        </div>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/10">
        <div className="p-4 border-b border-border/10 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, country, category..."
              className="h-9 w-full rounded-md border border-border/20 bg-background pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
            />
          </div>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Filter className="h-4 w-4 mr-2" /> Filters
          </Button>
        </div>

        {view === 'table' ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead className="text-right">Spend</TableHead>
                <TableHead className="text-right">OTD %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 w-32 bg-muted/20 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-muted/20 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-muted/20 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-5 w-16 bg-muted/20 animate-pulse rounded-full" /></TableCell>
                    <TableCell><div className="h-4 w-12 bg-muted/20 animate-pulse rounded" /></TableCell>
                    <TableCell className="text-right"><div className="h-4 w-20 bg-muted/20 animate-pulse rounded ml-auto" /></TableCell>
                    <TableCell className="text-right"><div className="h-4 w-12 bg-muted/20 animate-pulse rounded ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : data?.items?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No suppliers found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.items?.map((supplier) => (
                  <TableRow key={supplier.id} className="cursor-pointer hover:bg-muted/30">
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell className="text-muted-foreground">{supplier.category}</TableCell>
                    <TableCell>{supplier.country}</TableCell>
                    <TableCell>
                      <Badge variant={getRiskColor(supplier.riskLevel) as any}>
                        {supplier.riskLevel.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">{supplier.riskScore}</span>
                        <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${supplier.riskScore > 75 ? 'bg-destructive' : supplier.riskScore > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${supplier.riskScore}%` }} 
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatCurrency(supplier.spend)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatPercent(supplier.onTimeDelivery)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        ) : (
          <div className="h-[600px] flex items-center justify-center bg-muted/10 text-muted-foreground">
            Map view would render here. (Requires Leaflet MapContainer)
          </div>
        )}
        
        {view === 'table' && data && data.total > data.limit && (
          <div className="p-4 border-t border-border/10 flex items-center justify-between text-sm text-muted-foreground">
            <div>Showing {(page - 1) * data.limit + 1} to {Math.min(page * data.limit, data.total)} of {data.total} suppliers</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={page * data.limit >= data.total} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
