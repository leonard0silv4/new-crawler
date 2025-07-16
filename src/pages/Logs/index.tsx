import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  Search,
  X,
  RefreshCw,
  Clock,
  FileText,
  FilePlus2,
  Activity,
  ChevronDown,
  Eye,
} from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import instance from "@/config/axios";

const LIMIT = 20;

interface LogEntry {
  username: string;
  faccionistaId_userName: string;
  faccionistaId_lastName: string;
  action: string;
  jobIdLote: string;
  field?: string;
  oldValue: any;
  newValue: any;
  createdAt: string;
}

export default function LogsPage() {
  const [searchIdLote, setSearchIdLote] = useState("");
  const [range, setRange] = useState<DateRange | undefined>();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<LogEntry[]>({
    queryKey: ["logs", searchIdLote, range],
    queryFn: async ({ pageParam = 0 }) => {
      const params: any = {
        skip: pageParam,
        limit: LIMIT,
      };

      if (searchIdLote) params.idLote = searchIdLote;
      if (range?.from) params.startDate = startOfDay(range.from).toISOString();
      if (range?.to) params.endDate = endOfDay(range.to).toISOString();

      const res = await instance.get("/logs", { params });
      return (res as any) ?? [];
    },
    getNextPageParam: (lastPage, allPages) =>
      Array.isArray(lastPage) && lastPage.length < LIMIT
        ? undefined
        : allPages.length * LIMIT,
    initialPageParam: 0,
  });

  const logs = data?.pages.flat() || [];
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "100px" }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getActionBadgeVariant = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return "default";
      case "update":
        return "secondary";
      case "delete":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return <FilePlus2 className="h-4 w-4" />;
      case "update":
        return <Eye className="h-4 w-4" />;
      case "delete":
        return <X className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950";
      case "update":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950";
      case "delete":
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950";
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950";
    }
  };

  const hasActiveFilters = searchIdLote || range?.from || range?.to;

  const clearFilters = () => {
    setSearchIdLote("");
    setRange(undefined);
    refetch();
  };

  const LogSkeleton = () => (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="animate-pulse">
              <div className="h-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20" />
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="h-3 w-48 bg-muted rounded" />
                      </div>
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-muted rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-3/4 bg-muted rounded" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const EmptyState = () => (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
          <FileText className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Nenhum log encontrado</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          {hasActiveFilters
            ? "Tente ajustar os filtros para encontrar os logs desejados."
            : "Não há logs disponíveis no momento."}
        </p>
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="gap-2 bg-transparent"
          >
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-3xl font-bold ">Logs do Sistema</h1>
                <p className="text-muted-foreground">
                  Acompanhe todas as atividades e alterações do sistema
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-lg">
                Filtros
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {
                      [searchIdLote, range?.from, range?.to].filter(Boolean)
                        .length
                    }
                  </Badge>
                )}
              </CardTitle>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="lg:hidden gap-2"
              >
                {isFiltersOpen ? "Ocultar" : "Mostrar"}

                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isFiltersOpen && "rotate-180"
                  )}
                />
              </Button>
            </div>
          </CardHeader>

          <CardContent
            className={cn("space-y-6", !isFiltersOpen && "hidden lg:block")}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-2">
                <label htmlFor="idLote" className="block text-sm font-medium">
                  ID do Lote
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="idLote"
                    placeholder="Digite o ID do lote..."
                    value={searchIdLote}
                    onChange={(e) => setSearchIdLote(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="lg:col-span-5 space-y-2">
                <label className="block text-sm font-medium">Período</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-11",
                        !range && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {range?.from ? (
                        range.to ? (
                          <>
                            {format(range.from, "dd/MM/yyyy", { locale: ptBR })}{" "}
                            - {format(range.to, "dd/MM/yyyy", { locale: ptBR })}
                          </>
                        ) : (
                          format(range.from, "dd/MM/yyyy", { locale: ptBR })
                        )
                      ) : (
                        "Selecione o período"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="range"
                      selected={range}
                      onSelect={setRange}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="lg:col-span-3 flex items-end gap-2">
                <Button onClick={() => refetch()} className="flex-1 h-11 gap-2">
                  <Search className="h-4 w-4" />
                  Buscar
                </Button>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    size="icon"
                    className="h-11 w-11 bg-transparent"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Registros</h2>
              <Badge variant="outline" className="text-sm">
                {logs.length} {logs.length === 1 ? "registro" : "registros"}
              </Badge>
            </div>
          </div>

          {isLoading ? (
            <LogSkeleton />
          ) : logs.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {logs.map((log, idx) => (
                <Card
                  key={idx}
                  className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-800 overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
                            log.field === "isArchived"
                              ? getActionColor("delete")
                              : getActionColor(log.action)
                          )}
                        >
                          {log.field === "isArchived"
                            ? getActionIcon("delete")
                            : getActionIcon(log.action)}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                Operador:
                              </span>
                              <Badge variant="outline" className="font-medium">
                                {log.username}
                              </Badge>
                            </div>

                            <Separator orientation="vertical" className="h-4" />

                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-muted-foreground">
                                Faccionista:
                              </span>
                              <span className="font-medium">
                                {log.faccionistaId_userName}{" "}
                                {log.faccionistaId_lastName !== "N/A" &&
                                  log.faccionistaId_lastName}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {format(
                              new Date(log.createdAt),
                              "dd/MM/yyyy 'às' HH:mm",
                              {
                                locale: ptBR,
                              }
                            )}
                          </div>
                        </div>
                      </div>

                      <Badge
                        variant={getActionBadgeVariant(log.action)}
                        className="capitalize font-medium"
                      >
                        {log.action.toLowerCase()}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Lote:</span>
                          <Badge variant="secondary" className="font-mono">
                            {log.jobIdLote}
                          </Badge>
                        </div>

                        {log.field && (
                          <>
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                Campo:
                              </span>
                              <Badge variant="outline" className="font-mono">
                                {log.field}
                              </Badge>
                            </div>
                          </>
                        )}
                      </div>

                      {log.action.toLowerCase() !== "create" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border">
                          <div className="space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Valor Anterior
                            </span>
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border font-mono text-sm break-all">
                              {String(log.oldValue) || "-"}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Novo Valor
                            </span>
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border font-mono text-sm break-all">
                              {String(log.newValue) || "-"}
                            </div>
                          </div>
                        </div>
                      )}

                      {log.action.toLowerCase() === "create" && (
                        <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 rounded-xl border border-emerald-200 dark:border-emerald-800">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                              <FilePlus2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                              Novo lote criado no sistema
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Load More Trigger */}
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span className="font-medium">
                      Carregando mais registros...
                    </span>
                  </div>
                )}
                {!hasNextPage && logs.length > 0 && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
                      <div className="h-2 w-2 bg-muted-foreground/50 rounded-full" />
                      <p className="text-muted-foreground text-sm font-medium">
                        Todos os registros foram carregados
                      </p>
                      <div className="h-2 w-2 bg-muted-foreground/50 rounded-full" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
