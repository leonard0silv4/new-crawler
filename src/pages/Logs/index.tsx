"use client";

import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  Filter,
  Search,
  X,
  RefreshCw,
  Clock,
  FileText,
  FilePlus2,
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
    // isRefetching,
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
        return "✨";
      case "update":
        return "✏️";
      case "delete":
        return "🗑️";
      default:
        return "📝";
    }
  };

  const hasActiveFilters = searchIdLote || range?.from || range?.to;

  const clearFilters = () => {
    setSearchIdLote("");
    setRange(undefined);
    refetch();
  };

  const LogSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-48 bg-muted rounded" />
              </div>
              <div className="h-6 w-16 bg-muted rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-3/4 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const EmptyState = () => (
    <Card className="text-center py-12">
      <CardContent>
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <FileText className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhum log encontrado</h3>
        <p className="text-muted-foreground mb-4">
          {hasActiveFilters
            ? "Tente ajustar os filtros para encontrar os logs desejados."
            : "Não há logs disponíveis no momento."}
        </p>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Limpar filtros
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Logs do Sistema
            </h1>
            <p className="text-muted-foreground mt-2">
              Acompanhe todas as atividades e alterações do sistema
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="shadow-sm border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
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
                className="sm:hidden"
              >
                {isFiltersOpen ? "Ocultar" : "Mostrar"}
              </Button>
            </div>
          </CardHeader>
          <CardContent
            className={`space-y-4 ${!isFiltersOpen ? "hidden sm:block" : ""}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
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
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Período</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !range ? "text-muted-foreground" : ""
                      }`}
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

              <div className="flex items-end gap-2">
                <Button onClick={() => refetch()} className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
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
            <div className="flex items-center gap-2">
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
                  className="shadow-sm hover:shadow-md transition-shadow duration-200 border-0 bg-white dark:bg-slate-800"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="text-xl ">
                          {log.field == "isArchived" ? (
                            <>{getActionIcon("delete")}</>
                          ) : (
                            <>{getActionIcon(log.action)}</>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-muted-foreground">
                              Operador:
                            </span>
                            <span className="font-medium">{log.username}</span>
                            <div className="w-px h-3 bg-border" />
                            <span className="font-medium text-muted-foreground">
                              Faccionista:
                            </span>
                            <span className="truncate">
                              {log.faccionistaId_userName}{" "}
                              {log.faccionistaId_lastName !== "N/A" &&
                                log.faccionistaId_lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
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
                        className="capitalize"
                      >
                        {log.action.toLowerCase()}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Lote:</span>
                        <Badge variant="outline">{log.jobIdLote}</Badge>
                        {log.field && (
                          <>
                            <div className="w-px h-4 bg-border" />
                            <span className="text-sm font-medium">Campo:</span>
                            <span className="text-sm">{log.field}</span>
                          </>
                        )}
                      </div>

                      {log.action.toLowerCase() !== "create" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                          <div>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Valor Anterior
                            </span>
                            <p className="text-sm mt-1 font-mono bg-background p-2 rounded border">
                              {String(log.oldValue) || "-"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Novo Valor
                            </span>
                            <p className="text-sm mt-1 font-mono bg-background p-2 rounded border">
                              {String(log.newValue) || "-"}
                            </p>
                          </div>
                        </div>
                      )}

                      {log.action.toLowerCase() === "create" && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="text-sm text-green-800 dark:text-green-200">
                            <FilePlus2 className="w-4 h-4 inline-block mr-2" />{" "}
                            Novo lote criado no sistema
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Load More Trigger */}
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Carregando mais registros...
                  </div>
                )}
                {!hasNextPage && logs.length > 0 && (
                  <p className="text-muted-foreground text-sm">
                    Todos os registros foram carregados
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
