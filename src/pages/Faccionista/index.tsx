"use client";
// import { Loader2 } from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Switch } from "@/components/ui/switch";
import instance from "@/config/axios";
import { Input } from "@/components/ui/input";
import { Badge, CircleCheck, CircleX, Loader, Search } from "lucide-react";
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

  const formatValue = (value: any) =>
    value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

  const sumMetr = (jobs: any) => {
    return jobs
      .filter((item: any) => item.totMetros)
      .reduce((sum: number, item: any) => sum + item.totMetros, 0);
  };

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
              {(factionistUser as any)?.evaluationScore != 0 && (
                <p>
                  <b>QoS:</b> {(factionistUser as any)?.evaluationScore}
                </p>
              )}
            </CardHeader>

            <CardContent>
              <hr className="mb-5" />
              {factionistUser[0]?.advanceMoney &&
              factionistUser[0]?.advanceMoney != 0 ? (
                <div className="flex items-center text-md font-normal text-gray-900 dark:text-white mb-3">
                  Adiantamentos pendentes
                  <b className="ml-2 capitalize">
                    R${factionistUser[0]?.advanceMoney.toFixed(2)}
                  </b>
                </div>
              ) : null}

              <div className="flex items-center text-md font-normal text-gray-900 dark:text-white mb-3">
                Valores à receber:{" "}
                <b className="ml-2">
                  R$
                  {totalNotPaid.toFixed(2) >
                  factionistUser[0]?.advanceMoney.toFixed(2)
                    ? totalNotPaid.toFixed(2) -
                      factionistUser[0]?.advanceMoney.toFixed(2)
                    : totalNotPaid.toFixed(2)}
                </b>
              </div>

              <hr className="my-5" />

              <div className="flex items-center text-md font-normal text-gray-900 dark:text-white mb-3">
                Total metros:
                <b className="ml-2">{sumMetr(registers).toFixed(2)}</b>
              </div>

              <div className="flex items-center text-md font-normal text-gray-900 dark:text-white mb-3">
                Total valores pagos
                <b className="ml-2 capitalize">
                  R$
                  {totalPaid -
                    (factionistUser as any)?.totalAdvancedMoney.toFixed(2)}
                </b>
              </div>

              {/* {(factionistUser as any)?.totalAdvancedMoney &&
              (factionistUser as any)?.updateLastWeek &&
              (factionistUser as any)?.totalAdvancedMoney != 0 ? (
                <p className="text-red-700 text-md font-normal my-2">
                  Descontos de adiantamento R$
                  {(factionistUser as any)?.totalAdvancedMoney.toFixed(2)}
                </p>
              ) : null} */}

              {/* <div className="flex items-center text-md font-normal text-gray-900 dark:text-white mb-3">
                Total recebido: <br />
                <b className="ml-2">
                  {" "}
                  R$
                  {(factionistUser as any)?.jobSummary.totalOrcamentos.toFixed(
                    2
                  )}
                </b>
              </div> */}

              {(factionistUser as any)?.recentLotes.length != 0 && (
                <>
                  <hr className="my-5" />
                  <div className="flex items-center flex-col text-md font-normal text-gray-900 dark:text-white mt-3">
                    <h4 className="font-bold">Apuração QoS</h4>
                    <p>
                      Pontuação das ultimas{" "}
                      {(factionistUser as any)?.recentLotes.length == 10
                        ? (factionistUser as any)?.recentLotes.length
                        : "0" +
                          (factionistUser as any)?.recentLotes.length}{" "}
                      entregas
                    </p>

                    <ul>
                      {(factionistUser as any)?.recentLotes.map((jobR: any) => {
                        return (
                          <li>{`Lote ${jobR.lote} - ${jobR.rateLote} pts`}</li>
                        );
                      })}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredRegisters.map((register: any) => (
              <Card key={register.id} className="w-full ">
                <div className="flex">
                  <p className="block w-full p-3 text-center font-bold text-gray-500">
                    {format(register.data, "P HH:mm", { locale: ptBR })}
                  </p>
                  {register.rateLote && (
                    <span className="relative top-2 right-2">
                      <Badge className="w-12 h-12 text-yellow-300"></Badge>
                      <span className="text-md font-bold absolute top-0 flex-1 right-0 w-full h-full text-center flex pt-3 justify-center">
                        {register.rateLote}
                      </span>
                    </span>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="flex text-lg flex-column justify-center	">
                    LOTE: {register.lote} -
                    <div className="flex items-center justify-between ml-1">
                      <span className="text-md font-medium text-gray-900 dark:text-white me-3">
                        Recebido
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
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center flex-col text-xl font-semibold text-gray-600 dark:text-white me-3">
                    <p>
                      {register.qtd} Tela{register.qtd > 1 ? "s" : ""} -{" "}
                      {formatValue(register.larg)} X{" "}
                      {formatValue(register.compr)}
                    </p>
                    <p className="text-base mt-3">
                      {`${formatValue(register.totMetros)} mts - ${
                        register.qtdRolo ? register.qtdRolo + " Fita(s) -" : ""
                      }  R$${register.orcamento.toFixed(2)}`}
                    </p>
                    {/* {register.advancedMoneyPayment &&
                    register.advancedMoneyPayment != 0 ? (
                      <p className="text-red-700 text-sm my-2">
                        Desconto de adiantamento R$
                        {register.advancedMoneyPayment.toFixed(2)}
                      </p>
                    ) : null} */}
                  </div>

                  <div className=" flex items-center justify-center  text-md font-semibold text-gray-600 dark:text-white  ">
                    Emenda: {register.emenda ? "Sim" : "Não"}
                  </div>

                  <div className="flex items-center justify-center py-5">
                    <span className="text-md font-medium  text-gray-900 dark:text-white me-3">
                      Pronto para retirada
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
                    <span className="flex items-center justify-center text-sm font-bold text-gray-600 dark:text-white me-3">
                      <span
                        className={`${
                          register.recebido ? "bg-teal-500" : "bg-red-500 "
                        } flex w-2.5 h-2.5  rounded-full me-1.5 flex-shrink-0`}
                      ></span>
                      {register.recebido
                        ? "Lote entregue"
                        : "Aguardando recebimento do lote"}
                    </span>
                  </div>

                  <div>
                    <span className="flex items-center justify-center text-sm font-bold text-gray-600 dark:text-white me-3">
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
                        ? "Aguardando análise de qualidade"
                        : register.aprovado
                        ? "Aprovado com qualidade " + register.rateLote
                        : "Aprovado: Não"}
                    </span>
                  </div>
                </CardContent>
                {register.dataPgto ? (
                  <CardFooter className="flex flex-col my-3 gap-2">
                    <CircleCheck className="w-10 h-10 text-green-500" />
                    <p>{`Lote ${register.lote} `}</p>
                    {`Pago  ${format(register.data, "PP HH:mm", {
                      locale: ptBR,
                    })}`}
                  </CardFooter>
                ) : (
                  <CardFooter className="flex flex-col my-3 gap-2">
                    <CircleX className="w-10 h-10 text-red-500" />
                    <p>{`Lote ${register.lote} Pgto não realizado`}</p>
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
