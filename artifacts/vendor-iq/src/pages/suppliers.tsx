import {
  useListSuppliers,
  useCreateSupplier,
  useListRiskScores,
  SupplierRiskLevel,
  getListSuppliersQueryKey,
} from "@workspace/api-client-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  formatCurrency,
  formatPercent,
} from "@/lib/utils";

import {
  Search,
  Plus,
  Filter,
  Map as MapIcon,
  Table as TableIcon,
  Loader2,
  ShieldAlert,
} from "lucide-react";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const emptyForm = {
  name: "",
  country: "",
  category: "",
  website: "",
  contactEmail: "",
};

export default function Suppliers() {
  const [page, setPage] = useState(1);
  const [view, setView] =
    useState<"table" | "map">("table");
  const [search, setSearch] = useState("");

  const {
    data: suppliersResponse,
    isLoading,
  } = useListSuppliers({
    limit: 10,
    offset: (page - 1) * 10,
  } as any);

  const {
    data: riskResponse,
    isLoading: isRiskLoading,
  } = useListRiskScores();

  const data = {
    ...(suppliersResponse ?? {}),
    items: Array.isArray(
      suppliersResponse?.items,
    )
      ? suppliersResponse.items
      : [],
    total: suppliersResponse?.total ?? 0,
    limit: suppliersResponse?.limit ?? 10,
  };

  const displayedData = Array.isArray(
    data.items,
  )
    ? data.items
    : [];

  const riskScores = Array.isArray(
    riskResponse,
  )
    ? riskResponse
    : [];

  const queryClient = useQueryClient();

  const [addOpen, setAddOpen] =
    useState(false);

  const [form, setForm] =
    useState(emptyForm);

  const createMutation =
    useCreateSupplier();

  const handleCreate = () => {
    if (
      !form.name ||
      !form.country ||
      !form.category
    ) {
      return;
    }

    createMutation.mutate(
      {
        data: {
          name: form.name,
          country: form.country,
          category: form.category,
          website:
            form.website || null,
          contactEmail:
            form.contactEmail || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            `${form.name} added to supplier registry`,
          );

          queryClient.invalidateQueries({
            queryKey:
              getListSuppliersQueryKey(),
          });

          setForm(emptyForm);
          setAddOpen(false);
        },

        onError: () => {
          toast.error(
            "Failed to add supplier",
          );
        },
      },
    );
  };

  const getRiskColor = (
    level: SupplierRiskLevel | string,
  ) => {
    switch (level) {
      case "low":
        return "success";

      case "medium":
        return "warning";

      case "high":
      case "critical":
        return "destructive";

      default:
        return "default";
    }
  };

  const filteredSuppliers = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return displayedData;
    }

    return displayedData.filter(
      (supplier) =>
        supplier.name
          ?.toLowerCase()
          .includes(query) ||
        supplier.country
          ?.toLowerCase()
          .includes(query) ||
        supplier.category
          ?.toLowerCase()
          .includes(query),
    );
  }, [displayedData, search]);

  const getRealRisk = (
    supplier: (typeof displayedData)[number],
  ) => {
    const supplierRisk =
      riskScores.find(
        (risk) =>
          risk.supplierId ===
            supplier.id ||
          risk.supplierName
            ?.toLowerCase()
            .trim() ===
            supplier.name
              ?.toLowerCase()
              .trim(),
      );

    if (!supplierRisk) {
      return {
        score: Number(
          supplier.riskScore ?? 0,
        ),
        level:
          supplier.riskLevel ?? "low",
      };
    }

    return {
      score: Number(
        supplierRisk.score ?? 0,
      ),
      level:
        supplierRisk.riskLevel ?? "low",
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">
            Supplier Registry
          </h1>

          <p className="text-muted-foreground">
            Manage suppliers and monitor their ML-generated risk intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">

          <div className="flex bg-muted p-1 rounded-md">

            <Button
              variant={
                view === "table"
                  ? "secondary"
                  : "ghost"
              }
              size="sm"
              onClick={() =>
                setView("table")
              }
              className="h-8"
            >
              <TableIcon className="h-4 w-4 mr-2" />
              Table
            </Button>

            <Button
              variant={
                view === "map"
                  ? "secondary"
                  : "ghost"
              }
              size="sm"
              onClick={() =>
                setView("map")
              }
              className="h-8"
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Map
            </Button>

          </div>

          <Dialog
            open={addOpen}
            onOpenChange={(open) => {
              setAddOpen(open);

              if (!open) {
                setForm(emptyForm);
              }
            }}
          >

            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </DialogTrigger>

            <DialogContent>

              <DialogHeader>

                <DialogTitle>
                  Add Supplier
                </DialogTitle>

                <DialogDescription>
                  Onboard a new supplier into the registry for risk scoring and monitoring.
                </DialogDescription>

              </DialogHeader>

              <div className="space-y-4 py-2">

                <div className="space-y-2">

                  <Label htmlFor="supplier-name">
                    Supplier Name *
                  </Label>

                  <Input
                    id="supplier-name"
                    placeholder="e.g. Acme Manufacturing"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        name: e.target.value,
                      }))
                    }
                  />

                </div>

                <div className="grid grid-cols-2 gap-4">

                  <div className="space-y-2">

                    <Label htmlFor="supplier-country">
                      Country *
                    </Label>

                    <Input
                      id="supplier-country"
                      placeholder="e.g. Germany"
                      value={form.country}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          country:
                            e.target.value,
                        }))
                      }
                    />

                  </div>

                  <div className="space-y-2">

                    <Label htmlFor="supplier-category">
                      Category *
                    </Label>

                    <Input
                      id="supplier-category"
                      placeholder="e.g. Electronics"
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          category:
                            e.target.value,
                        }))
                      }
                    />

                  </div>

                </div>

                <div className="space-y-2">

                  <Label htmlFor="supplier-email">
                    Contact Email
                  </Label>

                  <Input
                    id="supplier-email"
                    type="email"
                    placeholder="procurement@supplier.com"
                    value={form.contactEmail}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        contactEmail:
                          e.target.value,
                      }))
                    }
                  />

                </div>

                <div className="space-y-2">

                  <Label htmlFor="supplier-website">
                    Website
                  </Label>

                  <Input
                    id="supplier-website"
                    placeholder="https://supplier.com"
                    value={form.website}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        website:
                          e.target.value,
                      }))
                    }
                  />

                </div>

              </div>

              <DialogFooter>

                <Button
                  variant="outline"
                  onClick={() =>
                    setAddOpen(false)
                  }
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleCreate}
                  disabled={
                    !form.name ||
                    !form.country ||
                    !form.category ||
                    createMutation.isPending
                  }
                >

                  {createMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}

                  Add Supplier

                </Button>

              </DialogFooter>

            </DialogContent>

          </Dialog>

        </div>

      </div>

      <Card className="bg-card/50 backdrop-blur border-border/10">

        <div className="p-4 border-b border-border/10 flex flex-col sm:flex-row items-center gap-4">

          <div className="relative flex-1 w-full max-w-sm">

            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

            <input
              type="text"
              placeholder="Search by name, country, category..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-md border border-border/20 bg-background pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground"
            />

          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>

        </div>

        {view === "table" ? (

          <Table>

            <TableHeader>

              <TableRow>

                <TableHead>
                  Supplier Name
                </TableHead>

                <TableHead>
                  Category
                </TableHead>

                <TableHead>
                  Country
                </TableHead>

                <TableHead>
                  Risk Level
                </TableHead>

                <TableHead>
                  ML Risk Score
                </TableHead>

                <TableHead className="text-right">
                  Spend
                </TableHead>

                <TableHead className="text-right">
                  OTD %
                </TableHead>

              </TableRow>

            </TableHeader>

            <TableBody>

              {isLoading ? (

                Array(5)
                  .fill(0)
                  .map((_, i) => (

                    <TableRow key={i}>

                      {Array(7)
                        .fill(0)
                        .map((_, cell) => (

                          <TableCell
                            key={cell}
                          >
                            <div
                              className={`h-4 ${
                                cell === 0
                                  ? "w-32"
                                  : "w-20"
                              } bg-muted/20 animate-pulse rounded`}
                            />
                          </TableCell>

                        ))}

                    </TableRow>

                  ))

              ) : filteredSuppliers.length === 0 ? (

                <TableRow>

                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No suppliers found.
                  </TableCell>

                </TableRow>

              ) : (

                filteredSuppliers.map(
                  (supplier) => {
                    const risk =
                      getRealRisk(
                        supplier,
                      );

                    return (
                      <TableRow
                        key={supplier.id}
                        className="cursor-pointer hover:bg-muted/30"
                      >

                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {risk.level ===
                              "high" ||
                            risk.level ===
                              "critical" ? (
                              <ShieldAlert className="h-4 w-4 text-destructive" />
                            ) : null}

                            {supplier.name}
                          </div>
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {supplier.category}
                        </TableCell>

                        <TableCell>
                          {supplier.country}
                        </TableCell>

                        <TableCell>

                          <Badge
                            variant={
                              getRiskColor(
                                risk.level,
                              ) as any
                            }
                          >
                            {risk.level.toUpperCase()}
                          </Badge>

                        </TableCell>

                        <TableCell>

                          <div className="flex items-center gap-2">

                            <span className="font-mono text-xs">
                              {risk.score.toFixed(
                                1,
                              )}
                            </span>

                            <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">

                              <div
                                className={`h-full ${
                                  risk.score >=
                                  60
                                    ? "bg-destructive"
                                    : risk.score >=
                                      30
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    Math.max(
                                      risk.score,
                                      0,
                                    ),
                                    100,
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>

                        </TableCell>

                        <TableCell className="text-right font-mono text-sm">
                          {formatCurrency(
                            supplier.spend,
                          )}
                        </TableCell>

                        <TableCell className="text-right font-mono text-sm">
                          {formatPercent(
                            supplier.onTimeDelivery,
                          )}
                        </TableCell>

                      </TableRow>
                    );
                  },
                )

              )}

            </TableBody>

          </Table>

        ) : (

          <div className="h-[600px] flex items-center justify-center bg-muted/10 text-muted-foreground">

            Map view is not connected to a geographic data provider yet.

          </div>

        )}

        {view === "table" &&
          data.total > data.limit && (
            <div className="p-4 border-t border-border/10 flex items-center justify-between text-sm text-muted-foreground">

              <div>
                Showing{" "}
                {(page - 1) *
                  data.limit +
                  1}{" "}
                to{" "}
                {Math.min(
                  page * data.limit,
                  data.total,
                )}{" "}
                of{" "}
                {data.total} suppliers
              </div>

              <div className="flex gap-2">

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() =>
                    setPage(
                      (p) => p - 1,
                    )
                  }
                >
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    page * data.limit >=
                    data.total
                  }
                  onClick={() =>
                    setPage(
                      (p) => p + 1,
                    )
                  }
                >
                  Next
                </Button>

              </div>

            </div>
          )}

      </Card>

      {isRiskLoading && (
        <p className="text-xs text-muted-foreground">
          Loading latest ML risk scores...
        </p>
      )}

    </div>
  );
}