import { useListAlerts, useMarkAlertRead, useDismissAlert } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldAlert, TrendingDown, FileWarning, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

export default function Alerts() {
  const { data: alerts, isLoading, refetch } = useListAlerts();
  const markRead = useMarkAlertRead();
  const dismiss = useDismissAlert();

  const handleMarkRead = (id: string) => {
    markRead.mutate({ id }, { onSuccess: () => refetch() });
  };

  const handleDismiss = (id: string) => {
    dismiss.mutate({ id }, { 
      onSuccess: () => {
        toast.success("Alert dismissed");
        refetch();
      } 
    });
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'high_risk_supplier': return <ShieldAlert className="h-5 w-5 text-destructive" />;
      case 'price_spike': return <TrendingDown className="h-5 w-5 text-primary" />;
      case 'contract_expiring': return <FileWarning className="h-5 w-5 text-amber-500" />;
      default: return <ShieldAlert className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch(severity) {
      case 'critical': return <Badge variant="destructive" className="uppercase text-[10px]">Critical</Badge>;
      case 'warning': return <Badge variant="warning" className="uppercase text-[10px]">Warning</Badge>;
      case 'error': return <Badge variant="destructive" className="uppercase text-[10px]">Error</Badge>;
      default: return <Badge variant="secondary" className="uppercase text-[10px]">Info</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto py-6">
      <div className="flex justify-between items-end border-b border-border/10 pb-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Smart Alerts</h1>
          <p className="text-muted-foreground">Proactive notifications from the VendorIQ agent network.</p>
        </div>
        <Button variant="outline" size="sm">Mark all as read</Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1,2,3,4].map(i => <div key={i} className="h-24 bg-muted/20 animate-pulse rounded-xl" />)
        ) : alerts?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">All caught up! No active alerts.</div>
        ) : (
          alerts?.map(alert => (
            <Card key={alert.id} className={`bg-card/50 backdrop-blur transition-all ${!alert.isRead ? 'border-primary/50 shadow-[0_0_15px_rgba(133,79,108,0.1)]' : 'border-border/10 opacity-70'}`}>
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {!alert.isRead && <div className="w-1 bg-primary rounded-l-xl" />}
                  <div className="flex-1 p-5 flex gap-4">
                    <div className="shrink-0 mt-1">{getIcon(alert.type)}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${!alert.isRead ? 'text-foreground' : 'text-foreground/80'}`}>{alert.title}</h3>
                          {getSeverityBadge(alert.severity)}
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(alert.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                      {alert.supplierName && (
                        <div className="text-xs font-medium text-foreground bg-muted/50 inline-block px-2 py-1 rounded">
                          Target: {alert.supplierName}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 justify-start shrink-0 ml-4 border-l border-border/10 pl-4">
                      {!alert.isRead && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleMarkRead(alert.id)}>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDismiss(alert.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
