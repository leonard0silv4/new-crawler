"use client";
// import { Loader2 } from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Switch } from "@/components/ui/switch";
import instance from "@/config/axios";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ListFaccionista = () => {
  const [registers, setRegisters] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [factionistUser, setFactionistUser] = useState<any[]>([]);
  const [showNotConf, setShowNotConf] = useState(false);
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
    instance.get(`job/`).then((response: any) => {
      setRegisters(response);
    });

    instance.get(`factionistUser/`).then((response: any) => {
      setFactionistUser(response);
    });
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
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 " />
          </div>

          <div className="flex gap-2 align-middle justify-center flex-col lg:flex-row">
            <Button
              onClick={() => setShowNotConf(!showNotConf)}
              variant={`${showNotConf ? "default" : "outline"}`}
            >
              Mostrar lotes não conferidos
            </Button>

            <Button
              onClick={() => setShowNotReady(!showNotReady)}
              variant={`${showNotReady ? "default" : "outline"}`}
            >
              Mostrar lotes não prontos
            </Button>
          </div>

          <Card className="relative block w-full p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 ">
            <CardHeader>
              <CardTitle className="capitalize">
                {factionistUser[0]?.username}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center text-md font-normal text-gray-900 dark:text-white mb-3">
                Valores pagos
                <b className="ml-2 capitalize">R${totalPaid.toFixed(2)}</b>
              </div>

              <div className="flex items-center text-md font-normal text-gray-900 dark:text-white mb-3">
                Valores a receber:{" "}
                <b className="ml-2">R${totalNotPaid.toFixed(2)}</b>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredRegisters.map((register: any) => (
              <Card key={register.id} className="w-full">
                <CardHeader>
                  <CardTitle>LOTE: {register.lote}</CardTitle>
                  <CardDescription></CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className=" flex items-center text-md font-medium text-gray-900 dark:text-white me-3">
                    Data de entrada:{" "}
                    {format(register.data, "P HH:mm", { locale: ptBR })}
                  </div>
                  <div className=" flex items-center text-md font-medium text-gray-900 dark:text-white me-3">
                    Quantidade: {register.qtd}
                  </div>
                  <div className=" flex items-center text-md font-medium text-gray-900 dark:text-white me-3">
                    Largura: {register.larg}
                  </div>
                  <div className=" flex items-center text-md font-medium text-gray-900 dark:text-white me-3">
                    Comprimento: {register.compr}
                  </div>
                  <div className=" flex items-center text-md font-medium text-gray-900 dark:text-white me-3">
                    Emenda: {register.emenda ? "Sim" : "Não"}
                  </div>
                  <div className=" flex items-center text-md font-medium text-gray-900 dark:text-white me-3">
                    Total Metros: {register.totMetros} M
                  </div>
                  <div className="flex items-center text-md font-medium text-gray-900 dark:text-white me-3">
                    Valor: R$ {register.orcamento.toFixed(2)}
                  </div>

                  <div className="flex items-center justify-between space-y-4">
                    <span className="text-md font-medium text-gray-900 dark:text-white me-3">
                      RECEBIDO/CONFERIDO
                    </span>
                    <Switch
                      checked={register.recebidoConferido}
                      onCheckedChange={() => {
                        if (register.recebidoConferido) return;
                        handleOpenModal(
                          register._id,
                          register.lote,
                          "recebidoConferido"
                        );
                        //handleStatusChange(register._id, "recebidoConferido");
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between space-y-4">
                    <span className="text-md font-medium text-gray-900 dark:text-white me-3">
                      LOTE PRONTO
                    </span>
                    <Switch
                      checked={register.lotePronto}
                      onCheckedChange={() => {
                        if (register.lotePronto) return;
                        handleOpenModal(
                          register._id,
                          register.lote,
                          "lotePronto"
                        );
                        //handleStatusChange(register._id, "lotePronto");
                      }}
                    />
                  </div>

                  <div>
                    <span className="flex items-center text-md font-medium text-gray-900 dark:text-white me-3">
                      <span
                        className={`${
                          register.recebido ? "bg-teal-500" : "bg-red-500 "
                        } flex w-2.5 h-2.5  rounded-full me-1.5 flex-shrink-0`}
                      ></span>
                      Recebido: {register.recebido ? "Sim" : "Não"}
                    </span>
                  </div>

                  <div>
                    <span className="flex items-center text-md font-medium text-gray-900 dark:text-white me-3">
                      <span
                        className={`${
                          register.emAnalise
                            ? "bg-blue-500"
                            : register.aprovado
                            ? "bg-teal-500"
                            : "bg-red-500"
                        } flex w-2.5 h-2.5 rounded-full me-1.5 flex-shrink-0`}
                      ></span>
                      {register.emAnalise
                        ? "Em análise"
                        : register.aprovado
                        ? "Aprovado"
                        : "Aprovado: Não"}
                    </span>
                  </div>
                </CardContent>
                {register.dataPgto && (
                  <CardFooter>
                    Lote pago em{" "}
                    {format(register.data, "PP HH:mm", { locale: ptBR })}
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={confirmationModal.open} onOpenChange={handleCancel}>
        <DialogContent>
          <DialogTitle>Confirmar alteração</DialogTitle>
          <DialogDescription className="mb-5 text-md">
            Tem certeza de que deseja alterar
            <b className="uppercase text-black block">
              Lote {confirmationModal.lote} para
              {confirmationModal.field == "recebidoConferido"
                ? " Recebido e conferido "
                : " Pronto para coleta"}
              ?
            </b>
            <b className="text-red-600 block">
              Após a confirmação esta ação não poderá ser desfeita.
            </b>
          </DialogDescription>
          <DialogFooter>
            <DialogClose className="flex ">
              <Button className="mb-3 w-full" variant="ghost">
                Cancelar
              </Button>
            </DialogClose>
            <Button className="mb-3" onClick={handleConfirm}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ListFaccionista;
