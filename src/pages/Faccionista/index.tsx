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
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

const ListFaccionista = () => {
  const [registers, setRegisters] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [factionistUser, setFactionistUser] = useState<any[]>([]);
  const [showNotConf, setShowNotConf] = useState(false);
  const [load, setLoad] = useState(true);
  const [showNotReady, setShowNotReady] = useState(false);
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

  const applyFilters = (registers: any) => {
    return registers?.filter((register: any) => {
      const matchesSearchTerm = Object.values(register).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesRecebidoConferido = showNotConf
        ? !register.recebidoConferido
        : true;

      const matchesLotePronto = showNotReady ? !register.lotePronto : true;

      return matchesSearchTerm && matchesRecebidoConferido && matchesLotePronto;
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

  // Função para verificar se uma data está na semana corrente
  const isCurrentWeek = (date: Date | string | any) => {
    if (!date) return false;
    
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Segunda-feira como início da semana
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    
    // Lidar com formato MongoDB Extended JSON: {"$date": "..."}
    let itemDate: Date;
    if (typeof date === "object" && date.$date) {
      itemDate = new Date(date.$date);
    } else if (typeof date === "string") {
      itemDate = new Date(date);
    } else if (date instanceof Date) {
      itemDate = date;
    } else {
      return false;
    }
    
    // Verificar se a data é válida
    if (isNaN(itemDate.getTime())) return false;
    
    return isWithinInterval(itemDate, { start: weekStart, end: weekEnd });
  };

  // Calcular metragem da semana corrente
  const weekMetragem = useMemo(() => {
    return registers
      .filter((item: any) => item.data && isCurrentWeek(item.data))
      .reduce((sum: number, item: any) => sum + (item.totMetros || 0), 0);
  }, [registers]);

  // Calcular valor da semana corrente
  const weekValor = useMemo(() => {
    return registers
      .filter((item: any) => item.data && isCurrentWeek(item.data))
      .reduce((sum: number, item: any) => sum + (item.orcamento || 0), 0);
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

          <div className="flex gap-2 align-middle justify-center flex-col lg:flex-row">
            <Button
              onClick={() => setShowNotConf(!showNotConf)}
              variant={`${showNotConf ? "default" : "outline"}`}
            >
              Não conferidos
            </Button>

            <Button
              onClick={() => setShowNotReady(!showNotReady)}
              variant={`${showNotReady ? "default" : "outline"}`}
            >
              Não prontos
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
              <hr className="mb-4 dark:border-gray-700" />

              {/* Informações da Semana Corrente */}
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Semana Corrente
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg border border-purple-200 dark:border-purple-900/30">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Metragem da Semana
                    </p>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {weekMetragem.toFixed(2)} m²
                    </p>
                  </div>
                  <div className="bg-indigo-50 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-900/30">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Valor da Semana
                    </p>
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      R$ {weekValor.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resumo reorganizado em grid colorido */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {factionistUser[0]?.advanceMoney &&
                factionistUser[0]?.advanceMoney != 0 ? (
                  <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-900/30">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Adiantamentos
                    </p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
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
                    {sumMetr(registers).toFixed(2)} m²
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
