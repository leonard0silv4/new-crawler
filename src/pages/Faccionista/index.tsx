// import { Loader2 } from "lucide-react";

import { useEffect, useState } from "react";
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

const ListFaccionista = () => {
  const [registers, setRegisters] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotConf, setShowNotConf] = useState(false);
  const [showNotReady, setShowNotReady] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<{
    open: boolean;
    _id: string | null;
    field: "recebidoConferido" | "lotePronto" | null;
  }>({
    open: false,
    _id: null,
    field: null,
  });

  useEffect(() => {
    instance.get(`job/`).then((response: any) => {
      setRegisters(response);
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
    field: "recebidoConferido" | "lotePronto"
  ) => {
    setConfirmationModal({ open: true, _id, field });
  };

  const handleConfirm = () => {
    if (confirmationModal._id && confirmationModal.field) {
      handleStatusChange(confirmationModal._id, confirmationModal.field);
    }
    setConfirmationModal({ open: false, _id: null, field: null });
  };

  const handleCancel = () => {
    setConfirmationModal({ open: false, _id: null, field: null });
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

          <div className="flex gap-2 align-middle justify-center">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRegisters.map((register: any) => (
              <Card key={register.id} className="w-full">
                <CardHeader>
                  <CardTitle>LOTE: {register.lote}</CardTitle>
                  <CardDescription></CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-md font-medium text-gray-900 dark:text-white me-3">
                    Quantidade: {register.qtd}
                  </div>
                  <div className="flex items-center text-md font-medium text-gray-900 dark:text-white me-3">
                    Largura: {register.larg}
                  </div>
                  <div className="flex items-center text-md font-medium text-gray-900 dark:text-white me-3">
                    Comprimento: {register.compr}
                  </div>
                  <div className="flex items-center text-md font-medium text-gray-900 dark:text-white me-3">
                    Emenda: {register.emenda ? "Sim" : "Não"}
                  </div>
                  <div>
                    <span className="flex items-center text-md font-medium text-gray-900 dark:text-white me-3">
                      <span
                        className={`${
                          register.aprovado ? "bg-teal-500" : "bg-red-500 "
                        } flex w-2.5 h-2.5  rounded-full me-1.5 flex-shrink-0`}
                      ></span>
                      Aprovado: {register.aprovado ? "Sim" : "Não"}
                    </span>
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
                  <div className="flex items-center justify-between">
                    <span className="text-md font-medium text-gray-900 dark:text-white me-3">
                      RECEBIDO/CONFERIDO
                    </span>
                    <Switch
                      checked={register.recebidoConferido}
                      onCheckedChange={() => {
                        if (register.recebidoConferido) return;
                        handleOpenModal(register._id, "recebidoConferido");
                        // handleStatusChange(register._id, "recebidoConferido");
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-md font-medium text-gray-900 dark:text-white me-3">
                      LOTE PRONTO
                    </span>
                    <Switch
                      checked={register.lotePronto}
                      onCheckedChange={() => {
                        if (register.lotePronto) return;
                        handleOpenModal(register._id, "lotePronto");
                        // handleStatusChange(register._id, "lotePronto");
                      }}
                    />
                  </div>
                </CardContent>
                <CardFooter></CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={confirmationModal.open} onOpenChange={handleCancel}>
        <DialogContent>
          <DialogTitle>Confirmar alteração</DialogTitle>
          <DialogDescription className="mb-5">
            Tem certeza de que deseja alterar este status?
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
