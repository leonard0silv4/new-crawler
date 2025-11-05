"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import instance from "@/config/axios";
import { Input } from "@/components/ui/input";
import { Search, Loader, TriangleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoteCard } from "./lote-card";

// Função para formatar metros quadrados
const formatMetros = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const ListFaccionista = () => {
  const [registers, setRegisters] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [factionistUser, setFactionistUser] = useState<any[]>([]);
  const [load, setLoad] = useState(true);
  const [filters, setFilters] = useState<{
    pago: boolean;
    naoPago: boolean;
    pronto: boolean;
    entregue: boolean;
    naoPronto: boolean;
    naoEntregue: boolean;
  }>({
    pago: false,
    naoPago: false,
    pronto: false,
    entregue: false,
    naoPronto: false,
    naoEntregue: false,
  });
  const [confirmationModal, setConfirmationModal] = useState<{
    open: boolean;
    _id: string | null;
    lote: string | null;
    field: "recebidoConferido" | "lotePronto" | null;
  }>({
    open: false,
    _id: null,
    lote: null,
    field: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsResponse, factionistResponse]: any = await Promise.all([
          instance.get(`job/`),
          instance.get(`factionistUser/`),
        ]);

        setRegisters(jobsResponse);
        setFactionistUser(factionistResponse);
      } catch (error) {
        console.error("Erro ao buscar os dados:", error);
      } finally {
        setLoad(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (
    _id: string,
    field: "recebidoConferido" | "lotePronto"
  ) => {
    instance.put(`job/${_id}`, {
      field,
    });

    setRegisters(
      registers.map((register) =>
        register._id === _id
          ? { ...register, [field]: !register[field] }
          : register
      )
    );
  };

  const handleOpenModal = (
    _id: string,
    lote: string,
    field: "recebidoConferido" | "lotePronto"
  ) => {
    setConfirmationModal({ open: true, lote, _id, field });
  };

  const handleConfirm = () => {
    if (confirmationModal._id && confirmationModal.field) {
      handleStatusChange(confirmationModal._id, confirmationModal.field);
    }
    setConfirmationModal({ open: false, lote: null, _id: null, field: null });
  };

  const handleCancel = () => {
    setConfirmationModal({ open: false, lote: null, _id: null, field: null });
  };

  const toggleFilter = (filterKey: keyof typeof filters) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  const applyFilters = (registers: any) => {
    return registers?.filter((register: any) => {
      const matchesSearchTerm = Object.values(register).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Aplicar filtros múltiplos
      // Filtros de pagamento: se ambos opostos estiverem ativos, não filtrar
      const bothPagoFiltersActive = filters.pago && filters.naoPago;
      const matchesPagoFilter = bothPagoFiltersActive
        ? true
        : filters.pago
          ? register.pago === true
          : filters.naoPago
            ? register.pago === false
            : true;

      // Filtros de pronto: se ambos opostos estiverem ativos, não filtrar
      const bothProntoFiltersActive = filters.pronto && filters.naoPronto;
      const matchesProntoFilter = bothProntoFiltersActive
        ? true
        : filters.pronto
          ? register.lotePronto === true
          : filters.naoPronto
            ? register.lotePronto === false
            : true;

      // Filtros de entregue: se ambos opostos estiverem ativos, não filtrar
      const bothEntregueFiltersActive = filters.entregue && filters.naoEntregue;
      const matchesEntregueFilter = bothEntregueFiltersActive
        ? true
        : filters.entregue
          ? register.recebido === true
          : filters.naoEntregue
            ? register.recebido === false
            : true;

      return (
        matchesSearchTerm &&
        matchesPagoFilter &&
        matchesProntoFilter &&
        matchesEntregueFilter
      );
    });
  };

  const filteredRegisters = applyFilters(registers);

  const sumNotPayd = (jobs: any) => {
    return jobs
      .filter((item: any) => !item.pago && item.recebido)
      .reduce((sum: number, item: any) => sum + item.orcamento, 0);
  };

  const totalNotPaid = useMemo(() => {
    return sumNotPayd(registers);
  }, [registers]);

  const sumPayd = (jobs: any) => {
    return jobs
      .filter((item: any) => item.pago)
      .reduce((sum: number, item: any) => sum + item.orcamento, 0);
  };

  const totalPaid = useMemo(() => {
    return sumPayd(registers);
  }, [registers]);

  const sumMetr = (jobs: any) => {
    return jobs
      .filter((item: any) => item.totMetros && item.pago)
      .reduce((sum: number, item: any) => sum + item.totMetros, 0);
  };

  // Card 1: lotePronto = true E recebido = true E pago = false
  const metrosProntosNaoPagosEntregues = useMemo(() => {
    return registers
      .filter((item: any) => item.lotePronto && item.recebido && !item.pago)
      .reduce((sum: number, item: any) => sum + (item.totMetros || 0), 0);
  }, [registers]);

  // Card 2: lotePronto = true E recebido = false E pago = false
  const metrosProntosNaoPagos = useMemo(() => {
    return registers
      .filter((item: any) => item.lotePronto && !item.recebido && !item.pago)
      .reduce((sum: number, item: any) => sum + (item.totMetros || 0), 0);
  }, [registers]);

  // Card 3: a fazer (!lotePronto)
  const metrosAFazer = useMemo(() => {
    return registers
      .filter((item: any) => !item.lotePronto)
      .reduce((sum: number, item: any) => sum + (item.totMetros || 0), 0);
  }, [registers]);

  if (load) return <Loader className="w-10 h-10 animate-spin m-auto my-10" />;

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="space-y-4">
          <div className="relative w-full max-w-sm mx-auto">
            <Input
              type="text"
              placeholder="procurar por LOTE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="flex gap-2 align-middle justify-center flex-col lg:flex-row flex-wrap">
            <Button
              onClick={() => toggleFilter("pago")}
              variant={filters.pago ? "default" : "outline"}
            >
              {filters.pago ? "✓ " : ""}Pagos
            </Button>

            <Button
              onClick={() => toggleFilter("naoPago")}
              variant={filters.naoPago ? "default" : "outline"}
            >
              {filters.naoPago ? "✓ " : ""}Não Pagos
            </Button>

            <Button
              onClick={() => toggleFilter("pronto")}
              variant={filters.pronto ? "default" : "outline"}
            >
              {filters.pronto ? "✓ " : ""}Prontos
            </Button>

            <Button
              onClick={() => toggleFilter("naoPronto")}
              variant={filters.naoPronto ? "default" : "outline"}
            >
              {filters.naoPronto ? "✓ " : ""}Não Prontos
            </Button>

            <Button
              onClick={() => toggleFilter("entregue")}
              variant={filters.entregue ? "default" : "outline"}
            >
              {filters.entregue ? "✓ " : ""}Coletados
            </Button>

            <Button
              onClick={() => toggleFilter("naoEntregue")}
              variant={filters.naoEntregue ? "default" : "outline"}
            >
              {filters.naoEntregue ? "✓ " : ""}Aguardando Coleta
            </Button>
          </div>

          <Card className="relative block w-full p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="capitalize">
                {factionistUser[0]?.username}
              </CardTitle>
              {(factionistUser as any)?.evaluationScore != 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <b>Pontuação QoS:</b>{" "}
                  {(factionistUser as any)?.evaluationScore}
                </p>
              )}
            </CardHeader>

            <CardContent>
              {/* Informações de Metragem */}
              <div className="mb-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/30">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Pronto, Não Pago, Coletado
                    </p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {formatMetros(metrosProntosNaoPagosEntregues)} m²
                    </p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-900/30">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Pronto, Aguardando Coleta, Não Pago
                    </p>
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {formatMetros(metrosProntosNaoPagos)} m²
                    </p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-900/30">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Metros a Fazer
                    </p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {formatMetros(metrosAFazer)} m²
                    </p>
                  </div>
                </div>
              </div>

              {/* Resumo reorganizado em grid colorido */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {factionistUser[0]?.advanceMoney &&
                  factionistUser[0]?.advanceMoney != 0 ? (
                  <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Adiantamentos
                    </p>
                    <p className="text-lg font-bold text-red-600 dark:text-orange-400">
                      R${factionistUser[0]?.advanceMoney.toFixed(2)}
                    </p>
                  </div>
                ) : null}

                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-900/30">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    À Receber
                  </p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    R${totalNotPaid.toFixed(2)}
                  </p>
                </div>

                <div className="bg-teal-50 dark:bg-teal-950/20 p-3 rounded-lg border border-teal-200 dark:border-teal-900/30">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Metros Entregues
                  </p>
                  <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
                    {formatMetros(sumMetr(registers))} m²
                  </p>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/30">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Total Pago
                  </p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    R$ {totalPaid.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredRegisters.map((register: any) => (
              <LoteCard
                key={register._id}
                register={register}
                onRecebidoChange={handleOpenModal}
                onProntoChange={handleOpenModal}
              />
            ))}
          </div>
        </div>
      </div>

      <Dialog open={confirmationModal.open} onOpenChange={handleCancel}>
        <DialogContent>
          <DialogTitle>Confirmar alteração</DialogTitle>
          <DialogDescription className="mb-5 text-md">
            Tem certeza de que deseja alterar
            <b className="uppercase text-black dark:text-white block mt-2">
              Lote {confirmationModal.lote}
            </b>
            para
            <b className="block mt-1">
              {confirmationModal.field == "recebidoConferido"
                ? "Recebido e Conferido"
                : "Pronto para Coleta"}
              ?
            </b>
            <b className="text-red-600 dark:text-red-400 block mt-3 text-sm">
              <TriangleAlert className="inline-flex mr-3" /> Após a confirmação
              esta ação não poderá ser desfeita.
            </b>
          </DialogDescription>
          <DialogFooter>
            <DialogClose>
              <Button variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleConfirm}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ListFaccionista;
