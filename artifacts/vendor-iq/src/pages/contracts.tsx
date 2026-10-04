import {
  useListContracts,
  useGetContract,
  useGetContractClauses,
} from "@workspace/api-client-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  FileText,
  Upload,
  AlertCircle,
  FileCheck2,
  ArrowRight,
  Loader2,
  X,
} from "lucide-react";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";


type ContractAnalysisClause = {
  clauseType: string;
  text: string;
  riskLevel: string;
  explanation: string;
  recommendation?: string;
};


type CreatedContract = {
  id: string;
  supplierId: string;
  supplierName: string;
  title: string;
  status: string;
  value: number;
  expiresAt: string;
};


export default function Contracts() {
  const {
    data: contractsResponse,
    isLoading: isContractsLoading,
  } = useListContracts();


  const contracts = Array.isArray(contractsResponse)
    ? contractsResponse
    : [];


  const [activeContractId, setActiveContractId] =
    useState<string | null>(null);

  const [showAnalyzer, setShowAnalyzer] =
    useState(false);

  const [contractTitle, setContractTitle] =
    useState("");

  const [contractContent, setContractContent] =
    useState("");

  const [contractValue, setContractValue] =
    useState("");

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [analysisError, setAnalysisError] =
    useState<string | null>(null);


  const {
    data: detail,
    isLoading: isDetailLoading,
  } = useGetContract(activeContractId as string, {
    query: {
      queryKey: ["contract", activeContractId],
      enabled: !!activeContractId,
    },
  });


  const {
    data: clausesResponse,
    isLoading: isClausesLoading,
  } = useGetContractClauses(activeContractId as string, {
    query: {
      queryKey: ["contract-clauses", activeContractId],
      enabled: !!activeContractId,
    },
  });


  const clauses = Array.isArray(clausesResponse)
    ? clausesResponse
    : [];


  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";

      case "expiring":
        return "warning";

      case "expired":
        return "destructive";

      case "under_review":
        return "info";

      default:
        return "default";
    }
  };


  const handleAnalyze = async () => {
    setAnalysisError(null);

    if (!contractTitle.trim()) {
      setAnalysisError(
        "Please enter a contract title.",
      );
      return;
    }

    if (!contractContent.trim()) {
      setAnalysisError(
        "Please paste the contract content.",
      );
      return;
    }


    setIsAnalyzing(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/contracts",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            supplierId: "s-002",
            supplierName: "Samsung Electronics",
            title: contractTitle.trim(),
            content: contractContent.trim(),
            value:
              Number(contractValue) || 0,
            expiresAt:
              new Date(
                Date.now() +
                  365 * 86400000,
              ).toISOString(),
          }),
        },
      );


      const data =
        (await response.json()) as
          | CreatedContract
          | { error?: string };


      if (!response.ok) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Contract analysis failed.",
        );
      }


      if ("id" in data) {
        setActiveContractId(data.id);
      }

      setShowAnalyzer(false);

      setContractTitle("");
      setContractContent("");
      setContractValue("");

    } catch (error) {
      setAnalysisError(
        error instanceof Error
          ? error.message
          : "Contract analysis failed.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Contract Intelligence
          </h1>

          <p className="text-muted-foreground">
            AI-assisted contract analysis, clause extraction,
            compliance checks, and risk identification.
          </p>
        </div>


        <Button
          onClick={() => {
            setShowAnalyzer(true);
            setAnalysisError(null);
          }}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload & Analyze
        </Button>

      </div>


      {showAnalyzer && (
        <Card className="bg-card/50 backdrop-blur border-primary/20">

          <CardHeader>
            <div className="flex items-center justify-between">

              <div>
                <CardTitle>
                  Analyze New Contract
                </CardTitle>

                <CardDescription>
                  Paste the contract text below. VendorIQ will
                  analyze clauses, risks, compliance issues,
                  and missing standard terms using the local
                  NLP model.
                </CardDescription>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowAnalyzer(false);
                  setAnalysisError(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>

            </div>
          </CardHeader>


          <CardContent className="space-y-4">

            <div>
              <label className="text-sm font-medium">
                Contract Title
              </label>

              <input
                value={contractTitle}
                onChange={(event) =>
                  setContractTitle(event.target.value)
                }
                placeholder="e.g. Supplier Manufacturing Agreement"
                className="mt-1 w-full rounded-md border border-border/20 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>


            <div>
              <label className="text-sm font-medium">
                Contract Value
              </label>

              <input
                type="number"
                value={contractValue}
                onChange={(event) =>
                  setContractValue(event.target.value)
                }
                placeholder="Enter contract value"
                className="mt-1 w-full rounded-md border border-border/20 bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>


            <div>
              <label className="text-sm font-medium">
                Contract Content
              </label>

              <textarea
                value={contractContent}
                onChange={(event) =>
                  setContractContent(event.target.value)
                }
                placeholder="Paste the full contract text here..."
                rows={12}
                className="mt-1 w-full resize-y rounded-md border border-border/20 bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary"
              />
            </div>


            {analysisError && (
              <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                {analysisError}
              </div>
            )}


            <div className="flex justify-end gap-3">

              <Button
                variant="outline"
                onClick={() => {
                  setShowAnalyzer(false);
                  setAnalysisError(null);
                }}
                disabled={isAnalyzing}
              >
                Cancel
              </Button>


              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Contract...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Analyze Contract
                  </>
                )}
              </Button>

            </div>

          </CardContent>
        </Card>
      )}


      <div className="grid gap-6 lg:grid-cols-3">

        <Card className="lg:col-span-1 bg-card/50 backdrop-blur border-border/10 h-[800px] flex flex-col">

          <CardHeader className="pb-3 border-b border-border/10">
            <CardTitle>
              Document Repository
            </CardTitle>
          </CardHeader>


          <div className="flex-1 overflow-auto">

            {isContractsLoading ? (

              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="h-20 bg-muted/20 animate-pulse rounded-md"
                  />
                ))}
              </div>

            ) : contracts.length === 0 ? (

              <div className="p-6 text-center text-sm text-muted-foreground">
                No contracts available.
              </div>

            ) : (

              <div className="divide-y divide-border/10">

                {contracts.map((contract) => (

                  <div
                    key={contract.id}
                    onClick={() =>
                      setActiveContractId(
                        contract.id,
                      )
                    }
                    className={`p-4 cursor-pointer transition-colors ${
                      activeContractId === contract.id
                        ? "bg-primary/10 border-l-2 border-primary"
                        : "hover:bg-muted/30 border-l-2 border-transparent"
                    }`}
                  >

                    <div className="flex justify-between items-start mb-2">

                      <div className="font-medium text-sm truncate pr-2">
                        {contract.title}
                      </div>

                      <Badge
                        variant={
                          getStatusColor(
                            contract.status,
                          ) as any
                        }
                        className="text-[10px] whitespace-nowrap"
                      >
                        {contract.status
                          .replace("_", " ")
                          .toUpperCase()}
                      </Badge>

                    </div>


                    <div className="text-xs text-muted-foreground mb-2">
                      {contract.supplierName}
                    </div>


                    <div className="flex justify-between items-center text-xs">

                      <span className="font-mono text-foreground/80">
                        {formatCurrency(
                          contract.value,
                        )}
                      </span>


                      <div className="flex items-center gap-1">

                        {contract.riskyClauseCount! > 0 && (
                          <AlertCircle className="h-3 w-3 text-destructive" />
                        )}

                        <span
                          className={
                            contract.riskyClauseCount! > 0
                              ? "text-destructive font-bold"
                              : "text-muted-foreground"
                          }
                        >
                          {contract.riskyClauseCount ?? 0} flags
                        </span>

                      </div>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        </Card>


        <div className="lg:col-span-2 space-y-6">

          {!activeContractId ? (

            <Card className="bg-card/50 backdrop-blur border-border/10 h-[800px] flex items-center justify-center">

              <div className="text-center text-muted-foreground">

                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />

                <p>
                  Select a contract to view details
                </p>

                <p className="text-xs mt-2">
                  Or use "Upload & Analyze" to analyze a new contract.
                </p>

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

                      <CardTitle className="text-xl font-display">
                        {detail?.title}
                      </CardTitle>

                      <CardDescription className="text-base mt-1">
                        {detail?.supplierName}
                      </CardDescription>

                    </div>


                    <div className="flex gap-2">

                      <Badge
                        variant={
                          getStatusColor(
                            detail?.status || "",
                          ) as any
                        }
                      >
                        {detail?.status
                          ?.replace("_", " ")
                          .toUpperCase()}
                      </Badge>


                      <Badge
                        variant={
                          (detail?.riskScore ?? 0) > 75
                            ? "destructive"
                            : (detail?.riskScore ?? 0) > 50
                              ? "warning"
                              : "success"
                        }
                      >
                        RISK SCORE:{" "}
                        {detail?.riskScore ?? 0}
                      </Badge>

                    </div>

                  </div>

                </CardHeader>


                <CardContent>

                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/20 rounded-lg border border-border/10">

                    <div>
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                        Value
                      </div>

                      <div className="font-mono font-medium">
                        {formatCurrency(
                          detail?.value || 0,
                        )}
                      </div>
                    </div>


                    <div>
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                        Expires
                      </div>

                      <div className="font-medium">
                        {detail?.expiresAt
                          ? new Date(
                              detail.expiresAt,
                            ).toLocaleDateString()
                          : "Not specified"}
                      </div>
                    </div>


                    <div>
                      <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                        Status
                      </div>

                      <div className="font-medium flex items-center text-emerald-500">
                        <FileCheck2 className="h-4 w-4 mr-1" />

                        {detail?.status === "expired"
                          ? "Expired"
                          : detail?.status === "expiring"
                            ? "Expiring"
                            : detail?.status === "under_review"
                              ? "Under Review"
                              : "Valid"}
                      </div>
                    </div>

                  </div>


                  <div>

                    <h3 className="text-sm font-semibold mb-2">
                      Contract Summary
                    </h3>

                    <p className="text-sm text-foreground/80 leading-relaxed bg-background p-4 rounded border border-border/10">
                      {detail?.summary ||
                        "No contract summary available."}
                    </p>

                  </div>


                  {(
                    detail?.missingClauses?.length ??
                    0
                  ) > 0 ||
                  (
                    detail?.complianceIssues?.length ??
                    0
                  ) > 0 ? (

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

                      {(detail?.missingClauses?.length ?? 0) > 0 && (

                        <div className="p-4 rounded border border-destructive/20 bg-destructive/5">

                          <h4 className="text-xs font-bold text-destructive uppercase tracking-wider mb-2 flex items-center">

                            <AlertCircle className="h-3 w-3 mr-1" />

                            Missing Standard Clauses

                          </h4>


                          <ul className="list-disc pl-4 text-sm text-foreground/80 space-y-1">

                            {detail?.missingClauses?.map(
                              (item, index) => (
                                <li key={index}>
                                  {item}
                                </li>
                              ),
                            )}

                          </ul>

                        </div>

                      )}


                      {(detail?.complianceIssues?.length ?? 0) > 0 && (

                        <div className="p-4 rounded border border-amber-500/20 bg-amber-500/5">

                          <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center">

                            <AlertCircle className="h-3 w-3 mr-1" />

                            Compliance Flags

                          </h4>


                          <ul className="list-disc pl-4 text-sm text-foreground/80 space-y-1">

                            {detail?.complianceIssues?.map(
                              (item, index) => (
                                <li key={index}>
                                  {item}
                                </li>
                              ),
                            )}

                          </ul>

                        </div>

                      )}

                    </div>

                  ) : null}

                </CardContent>

              </Card>


              <Card className="bg-card/50 backdrop-blur border-border/10">

                <CardHeader>

                  <CardTitle className="text-lg">
                    Extracted Clauses & Risk Analysis
                  </CardTitle>

                </CardHeader>


                <CardContent className="p-0">

                  <Table>

                    <TableHeader>

                      <TableRow>

                        <TableHead className="w-[150px]">
                          Clause Type
                        </TableHead>

                        <TableHead>
                          Excerpt
                        </TableHead>

                        <TableHead className="w-[100px]">
                          Risk
                        </TableHead>

                      </TableRow>

                    </TableHeader>


                    <TableBody>

                      {isClausesLoading ? (

                        <TableRow>

                          <TableCell
                            colSpan={3}
                            className="h-24 text-center"
                          >
                            Loading clauses...
                          </TableCell>

                        </TableRow>

                      ) : clauses.length === 0 ? (

                        <TableRow>

                          <TableCell
                            colSpan={3}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No extracted clauses available.
                          </TableCell>

                        </TableRow>

                      ) : (

                        clauses.map((clause) => (

                          <TableRow
                            key={clause.id}
                            className="group"
                          >

                            <TableCell className="font-medium text-xs align-top">

                              {clause.clauseType
                                .replace(/_/g, " ")
                                .toUpperCase()}

                            </TableCell>


                            <TableCell className="align-top">

                              <p className="text-sm font-serif italic text-muted-foreground border-l-2 border-border/30 pl-3 py-1 mb-3">
                                "{clause.text}"
                              </p>


                              <div className="text-xs text-foreground/80 mb-2">

                                <span className="font-semibold">
                                  Analysis:
                                </span>{" "}

                                {clause.explanation}

                              </div>


                              {clause.recommendation && (

                                <div className="text-xs text-primary bg-primary/10 p-2 rounded flex items-start mt-2">

                                  <ArrowRight className="h-3 w-3 mr-1 mt-0.5 shrink-0" />

                                  <span>
                                    {clause.recommendation}
                                  </span>

                                </div>

                              )}

                            </TableCell>


                            <TableCell className="align-top">

                              <Badge
                                variant={
                                  clause.riskLevel === "high"
                                    ? "destructive"
                                    : clause.riskLevel === "medium"
                                      ? "warning"
                                      : "outline"
                                }
                                className="text-[10px]"
                              >
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