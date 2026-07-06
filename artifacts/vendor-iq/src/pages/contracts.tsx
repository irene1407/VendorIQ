import { useListContracts, useGetContract, useGetContractClauses } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Upload, AlertCircle, FileCheck2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

export default function Contracts() {
  const { data: contracts, isLoading: isContractsLoading } = useListContracts();
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  const activeContractId = selectedContractId || (contracts && contracts.length > 0 ? contracts[0].id : null);

  const { data: detail, isLoading: isDetailLoading } = useGetContract(activeContractId as string, { query: { enabled: !!activeContractId } });
  const { data: clauses, isLoading: isClausesLoading } = useGetContractClauses(activeContractId as string, { query: { enabled: !!activeContractId } });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'expiring': return 'warning';
      case 'expired': return 'destructive';
      case 'under_review': return 'info';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Contract Intelligence</h1>
          <p className="text-muted-foreground">NLP-powered contract parsing, clause extraction, and risk identification.</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" /> Upload & Analyze
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Contract List */}
        <Card className="lg:col-span-1 bg-card/50 backdrop-blur border-border/10 h-[800px] flex flex-col">
          <CardHeader className="pb-3 border-b border-border/10">
            <CardTitle>Document Repository</CardTitle>
          </CardHeader>
          <div className="flex-1 overflow-auto">
            {isContractsLoading ? (
              <div className="p-4 space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-md" />)}
              </div>
            ) : (
              <div className="divide-y divide-border/10">
                {contracts?.map(contract => (
                  <div 
                    key={contract.id} 
                    onClick={() => setSelectedContractId(contract.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      activeContractId === contract.id ? 'bg-primary/10 border-l-2 border-primary' : 'hover:bg-muted/30 border-l-2 border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm truncate pr-2">{contract.title}</div>
                      <Badge variant={getStatusColor(contract.status) as any} className="text-[10px] whitespace-nowrap">
                        {contract.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{contract.supplierName}</div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-foreground/80">{formatCurrency(contract.value)}</span>
                      <div className="flex items-center gap-1">
                        {contract.riskyClauseCount! > 0 && <AlertCircle className="h-3 w-3 text-destructive" />}
                        <span className={contract.riskyClauseCount! > 0 ? 'text-destructive font-bold' : 'text-muted-foreground'}>
                          {contract.riskyClauseCount} flags
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Right Column: Contract Detail */}
        <div className="lg:col-span-2 space-y-6">
          {!activeContractId ? (
            <Card className="bg-card/50 backdrop-blur border-border/10 h-[800px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Select a contract to view details</p>
              </div>
            </Card>
          ) : isDetailLoading ? (
            <Card className="bg-card/50 backdrop-blur border-border/10 h-[800px] animate-pulse" />
          ) : (
            <>
              <Card className="bg-card/50 backdrop-blur border-border/10">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-display">{detail?.title}</CardTitle>
                      <CardDescription className="text-base mt-1">{detail?.supplierName}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getStatusColor(detail?.status || '') as any}>{detail?.status.replace('_', ' ').toUpperCase()}</Badge>
                      <Badge variant={detail?.riskScore! > 75 ? 'destructive' : detail?.riskScore! > 50 ? 'warning' : 'success'}>
                        RISK SCORE: {detail?.riskScore}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/20 rounded-lg border border-border/10">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Value</div>
                      <div className="font-mono font-medium">{formatCurrency(detail?.value || 0)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Expires</div>
                      <div className="font-medium">{new Date(detail?.expiresAt || '').toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Status</div>
                      <div className="font-medium flex items-center text-emerald-500"><FileCheck2 className="h-4 w-4 mr-1"/> Valid</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold mb-2">AI Summary</h3>
                    <p className="text-sm text-foreground/80 leading-relaxed bg-background p-4 rounded border border-border/10">
                      {detail?.summary}
                    </p>
                  </div>
                  
                  {(detail?.missingClauses?.length! > 0 || detail?.complianceIssues?.length! > 0) && (
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      {detail?.missingClauses?.length! > 0 && (
                        <div className="p-4 rounded border border-destructive/20 bg-destructive/5">
                          <h4 className="text-xs font-bold text-destructive uppercase tracking-wider mb-2 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" /> Missing Standard Clauses
                          </h4>
                          <ul className="list-disc pl-4 text-sm text-foreground/80 space-y-1">
                            {detail?.missingClauses.map((c, i) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>
                      )}
                      {detail?.complianceIssues?.length! > 0 && (
                        <div className="p-4 rounded border border-amber-500/20 bg-amber-500/5">
                          <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" /> Compliance Flags
                          </h4>
                          <ul className="list-disc pl-4 text-sm text-foreground/80 space-y-1">
                            {detail?.complianceIssues.map((c, i) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-border/10">
                <CardHeader>
                  <CardTitle className="text-lg">Extracted Clauses & Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">Clause Type</TableHead>
                        <TableHead>Excerpt</TableHead>
                        <TableHead className="w-[100px]">Risk</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isClausesLoading ? (
                        <TableRow><TableCell colSpan={3} className="h-24 text-center">Loading clauses...</TableCell></TableRow>
                      ) : (
                        clauses?.map(clause => (
                          <TableRow key={clause.id} className="group">
                            <TableCell className="font-medium text-xs align-top">{clause.clauseType.replace(/_/g, ' ').toUpperCase()}</TableCell>
                            <TableCell className="align-top">
                              <p className="text-sm font-serif italic text-muted-foreground border-l-2 border-border/30 pl-3 py-1 mb-3">
                                "{clause.text}"
                              </p>
                              <div className="text-xs text-foreground/80 mb-2">
                                <span className="font-semibold">AI Analysis:</span> {clause.explanation}
                              </div>
                              {clause.recommendation && (
                                <div className="text-xs text-primary bg-primary/10 p-2 rounded flex items-start mt-2">
                                  <ArrowRight className="h-3 w-3 mr-1 mt-0.5 shrink-0" />
                                  <span>{clause.recommendation}</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="align-top">
                              <Badge variant={clause.riskLevel === 'high' ? 'destructive' : clause.riskLevel === 'medium' ? 'warning' : 'outline'} className="text-[10px]">
                                {clause.riskLevel.toUpperCase()}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
