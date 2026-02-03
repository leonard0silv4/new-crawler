"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Scan, Loader, PackageOpen, CheckCircle2, Package, Filter, CalendarIcon } from "lucide-react";
import instance from "@/config/axios";
import { toast } from "sonner";
import { format, parseISO, startOfDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/** Job retornado por GET /jobs/received-today (faccionistaId populado) */
interface JobReceivedToday {
  _id: string;
  lote: string;
  recebidoConferido: boolean;
  dataRecebidoConferido?: string;
  recebido?: boolean;
  dataRecebido?: string;
  dischargedByQrCode?: boolean;
  dataDischargedByQrCode?: string;
  faccionistaId?:
    | string
    | { _id: string; username?: string; lastName?: string };
  [key: string]: unknown;
}

/**
 * Extrai o id do lote (e do faccionista) de uma URL do QR.
 * Aceita formatos com /, & ou > como separadores.
 * Ex.: http://localhost:5173/confirm/ID_FACC/ID_LOTE
 * Ex.: http>&&localhost>5173&confirm&686da3cb637e44bbf795e787&697e0b3e7a45edcc4dda1692
 * Retorna apenas o que importa para descarregamento: idLote (e idFaccionista se precisar validar).
 */
function parseConfirmUrl(value: string): { idFaccionista: string; idLote: string } | null {
  const trimmed = value.trim();
  // Após "confirm", captura dois IDs (24 hex = ObjectId): separadores podem ser / \ & >
  const match = trimmed.match(/confirm[^a-fA-F0-9]*([a-fA-F0-9]{24})[^a-fA-F0-9]+([a-fA-F0-9]{24})/i);
  if (match) {
    return { idFaccionista: match[1], idLote: match[2] };
  }
  return null;
}

/** Nome do faccionista (backend devolve faccionistaId populado em /jobs/received-today) */
function getFaccionistaNome(
  faccionistaId?: string | { _id: string; username?: string; lastName?: string }
): string {
  if (!faccionistaId) return "—";
  if (typeof faccionistaId === "string") return "—";
  const parts = [faccionistaId.username, faccionistaId.lastName].filter(Boolean);
  return parts.join(" ").trim() || "—";
}

type FilterRecebido = "todos" | "recebidos" | "nao_recebidos";
type FilterDescarregado = "todos" | "descarregados" | "nao_descarregados";

export default function DescarregamentoLotes() {
  const [lotes, setLotes] = useState<JobReceivedToday[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrInput, setQrInput] = useState("");
  const [processingQr, setProcessingQr] = useState(false);
  const [filterRecebido, setFilterRecebido] = useState<FilterRecebido>("todos");
  const [filterDescarregado, setFilterDescarregado] = useState<FilterDescarregado>("todos");
  const [filterFaccionistaId, setFilterFaccionistaId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const inputQrRef = useRef<HTMLInputElement>(null);
  const today = useMemo(() => startOfDay(new Date()), []);

  /** Lista única de faccionistas presentes nos lotes */
  const faccionistasOptions = useMemo(() => {
    const map = new Map<string, string>();
    lotes.forEach((l) => {
      const f = l.faccionistaId;
      if (!f) return;
      const id = typeof f === "string" ? f : f._id;
      const name = getFaccionistaNome(f);
      if (!map.has(id)) map.set(id, name);
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [lotes]);

  /** Lotes após aplicar filtros */
  const lotesFiltrados = useMemo(() => {
    return lotes.filter((l) => {
      if (filterRecebido === "recebidos" && !l.recebido) return false;
      if (filterRecebido === "nao_recebidos" && l.recebido) return false;
      if (filterDescarregado === "descarregados" && !l.dischargedByQrCode) return false;
      if (filterDescarregado === "nao_descarregados" && l.dischargedByQrCode) return false;
      const fid = typeof l.faccionistaId === "string" ? l.faccionistaId : l.faccionistaId?._id;
      if (filterFaccionistaId && fid !== filterFaccionistaId) return false;
      return true;
    });
  }, [lotes, filterRecebido, filterDescarregado, filterFaccionistaId]);

  /** GET /jobs/received-today?date=YYYY-MM-DD — axios já retorna o body (array) direto */
  const carregarDados = useCallback(async (date: Date) => {
    setLoading(true);
    try {
      const params = { date: format(startOfDay(date), "yyyy-MM-dd") };
      const jobs = (await instance.get("jobs/received-today", { params })) as JobReceivedToday[];
      setLotes(Array.isArray(jobs) ? jobs : []);
    } catch (err) {
      console.error("Erro ao carregar lotes:", err);
      toast.error("Erro ao carregar lotes recebidos.");
      setLotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarDados(selectedDate);
  }, [selectedDate, carregarDados]);

  // Auto-focus no input ao montar e a cada 2s (mantém pronto para leitura de QR)
  useEffect(() => {
    inputQrRef.current?.focus();
    const interval = setInterval(() => {
      inputQrRef.current?.focus();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const marcarDescarregado = useCallback(
    async (idLote: string) => {
      const lote = lotes.find((l) => l._id === idLote);
      if (lote?.dischargedByQrCode) {
        toast.info("Lote já estava marcado como descarregado.");
        return;
      }
      setProcessingQr(true);
      try {
        const res = await instance.put<{ job?: { dataDischargedByQrCode?: string } }>(`job/${idLote}`, { field: "dischargedByQrCode" });
        const dataFromBackend = (res as any)?.job?.dataDischargedByQrCode ?? new Date().toISOString();
        setLotes((prev) =>
          prev.map((l) =>
            l._id === idLote
              ? { ...l, dischargedByQrCode: true, dataDischargedByQrCode: dataFromBackend }
              : l
          )
        );
        const nomeLote = lote?.lote ?? idLote;
        toast.success(`Lote ${nomeLote} marcado como descarregado.`);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string }; message?: string }; message?: string })
            ?.response?.data?.message ||
          (err as { message?: string })?.message ||
          "Erro ao marcar lote como descarregado.";
        toast.error(msg);
      } finally {
        setProcessingQr(false);
      }
    },
    [lotes]
  );

  const processarQr = useCallback(
    (value: string) => {
      const parsed = parseConfirmUrl(value);
      if (!parsed) {
        toast.error("QR inválido. Use o código do lote (confirm/faccionista/lote).");
        return;
      }
      const { idLote } = parsed;
      const existe = lotes.some((l) => l._id === idLote);
      if (!existe) {
        toast.error("Lote não encontrado na lista de recebidos de hoje.");
        return;
      }
      marcarDescarregado(idLote);
    },
    [lotes, marcarDescarregado]
  );

  const handleQrKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!qrInput.trim()) return;
      processarQr(qrInput);
      setQrInput("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <PackageOpen className="h-8 w-8 text-blue-600" />
            Descarregamento de Lotes
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Lotes recebidos e conferidos hoje. Leia o QR do lote para marcar como descarregado.
          </p>
        </div>

        {/* Área de leitura QR - sempre ativa */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-base">
              <Scan className="h-5 w-5 text-blue-600" />
              Leitura de QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Aponte o leitor de QR aqui 
            </Label>
            <div className="mt-2 relative">
              <Input
                ref={inputQrRef}
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                onKeyDown={handleQrKeyDown}
                placeholder="Ex: .../confirm/ID_FACCIONISTA/ID_LOTE"
                disabled={processingQr}
                className="h-12 text-base font-mono border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                autoComplete="off"
              />
              {processingQr && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader className="h-5 w-5 animate-spin text-blue-600" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2 text-base">
              <Filter className="h-5 w-5 text-blue-600" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Data
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {isSameDay(selectedDate, today)
                        ? "Hoje"
                        : format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(d: Date | undefined) => d && setSelectedDate(startOfDay(d))}
                      locale={ptBR}
                      className="rounded-md border"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recebidos
                </Label>
                <Select
                  value={filterRecebido}
                  onValueChange={(v) => setFilterRecebido(v as FilterRecebido)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="recebidos">Recebidos</SelectItem>
                    <SelectItem value="nao_recebidos">Não recebidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descarregados
                </Label>
                <Select
                  value={filterDescarregado}
                  onValueChange={(v) => setFilterDescarregado(v as FilterDescarregado)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="descarregados">Descarregados</SelectItem>
                    <SelectItem value="nao_descarregados">Não descarregados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Faccionista
                </Label>
                <Select
                  value={filterFaccionistaId || "todos"}
                  onValueChange={(v) => setFilterFaccionistaId(v === "todos" ? "" : v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {faccionistasOptions.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de lotes */}
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="h-5 w-5" />
              {isSameDay(selectedDate, today)
                ? "Lotes recebidos hoje"
                : `Lotes recebidos em ${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}`}
              {" "}
              ({lotesFiltrados.length}
              {lotesFiltrados.length !== lotes.length && ` de ${lotes.length}`})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-10 w-10 animate-spin text-blue-600" />
              </div>
            ) : lotes.length === 0 ? (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                Nenhum lote coletado hoje.
              </div>
            ) : lotesFiltrados.length === 0 ? (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                Nenhum lote corresponde aos filtros.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {lotesFiltrados.map((lote) => (
                  <li
                    key={lote._id}
                    className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        Lote {lote.lote}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {getFaccionistaNome(lote.faccionistaId)}
                      </span>
                      {(lote.dataRecebidoConferido ?? lote.dataRecebido) && (
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {format(
                            parseISO(
                              (lote.dataRecebidoConferido ?? lote.dataRecebido) as string
                            ),
                            "dd/MM/yyyy HH:mm",
                            { locale: ptBR }
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {lote.dischargedByQrCode ? (
                        <div className="flex flex-col items-end gap-0.5">
                          <Badge className="bg-emerald-600 text-white gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Descarregado
                          </Badge>
                          {lote.dataDischargedByQrCode && (
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              {format(parseISO(lote.dataDischargedByQrCode), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          Aguardando descarregamento
                        </Badge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
