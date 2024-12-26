import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle } from "lucide-react";
import instance from "@/config/axios";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const AddJob = ({ addJob }: any) => {
  const { user } = useParams();

  const initial: Record<string, any> = {
    lote: "",
    qtd: undefined,
    larg: undefined,
    compr: undefined,
    emenda: false,
    totMetros: undefined,
    orcamento: undefined,
    recebidoConferido: false,
    lotePronto: false,
    recebido: false,
    aprovado: false,
    pago: false,
    dataPgto: undefined,
    faccionistaId: user,
    ownerId: "",
  };

  const friendlyFieldNames: Record<keyof typeof formData, string> = {
    lote: "Lote",
    qtd: "Quantidade",
    larg: "Largura",
    compr: "Comprimento",
    emenda: "Emenda",
    totMetros: "Total Metros",
    orcamento: "Orçamento",
    recebidoConferido: "Recebido e Conferido",
    lotePronto: "Lote Pronto",
    recebido: "Recebido",
    aprovado: "Aprovado",
    pago: "Pago",
    dataPgto: "Data de Pagamento",
    faccionistaId: "Faccionista",
    ownerId: "Proprietário",
  };

  const [formData, setFormData] = useState(initial);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const updatedValue = type === "number" ? parseFloat(value) : value;

    const updatedFormData = {
      ...formData,
      [name]: updatedValue,
    };

    const { qtd, larg, compr, emenda } = updatedFormData;
    if (qtd && larg && compr) {
      // Calcula total de metros com base na quantidade
      let totMetros = (larg * 2 + compr * 2) * qtd;

      const custoPorMetro = 0.6;
      let orcamento = totMetros * custoPorMetro;

      // Adiciona custo da emenda, se aplicável
      if (emenda) {
        orcamento += compr * qtd * custoPorMetro;
        totMetros = (larg * 2 + compr * 3) * qtd;
      }

      // Atualiza os valores
      updatedFormData.totMetros = parseFloat(totMetros.toFixed(2));
      updatedFormData.orcamento = parseFloat(orcamento.toFixed(2));
    }

    setFormData(updatedFormData);
  };

  const handleCheckboxChange = (name: string) => {
    const updatedFormData = {
      ...formData,
      [name]: !formData[name as keyof typeof formData],
    };

    const { qtd, larg, compr, emenda } = updatedFormData;
    if (qtd && larg && compr) {
      // Calcula total de metros com base na quantidade
      let totMetros = (larg * 2 + compr * 2) * qtd;

      const custoPorMetro = 0.6;
      let orcamento = totMetros * custoPorMetro;

      // Adiciona custo da emenda, se aplicável
      if (emenda) {
        orcamento += compr * qtd * custoPorMetro;
        totMetros = (larg * 2 + compr * 3) * qtd;
      }

      // Atualiza os valores
      updatedFormData.totMetros = parseFloat(totMetros.toFixed(2));
      updatedFormData.orcamento = parseFloat(orcamento.toFixed(2));
    }

    setFormData(updatedFormData);
  };

  const handleSubmit = async () => {
    const requiredFields: (keyof typeof formData)[] = [
      "lote",
      "qtd",
      "larg",
      "compr",
      "totMetros",
      "orcamento",
    ];

    const emptyFields = requiredFields.filter((field) => !formData[field]);

    if (emptyFields.length > 0) {
      const friendlyNames = emptyFields.map(
        (field) => friendlyFieldNames[field]
      );
      toast.error(
        `Os seguintes campos são obrigatórios: ${friendlyNames.join(", ")}`,
        {
          position: "top-right",
        }
      );
      return;
    }

    try {
      instance
        .post("/job", formData)
        .then((response) => {
          addJob(response);
          setFormData(initial);
          document.getElementById("closeDialog")?.click();
          toast.success("Novo trabalho adicionado!", {
            position: "bottom-right",
          });
        })
        .catch((err) => {
          toast.success("Problema ao adicionar trabalho!", {
            position: "top-right",
          });
          console.log(err);
        });
    } catch (error) {
      toast.success("Novo trabalho adicionado!", {
        position: "top-right",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="w-4 h-4 mr-2" />
          Novo lote
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar lote</DialogTitle>
          <DialogDescription>
            Preencha os dados para adicionar um novo lote.
          </DialogDescription>
        </DialogHeader>

        <form className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="lote"
                className="block text-sm font-medium text-gray-700"
              >
                Lote
              </label>
              <Input
                id="lote"
                name="lote"
                placeholder="Lote"
                required
                value={formData.lote}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="qtd"
                className="block text-sm font-medium text-gray-700"
              >
                Quantidade
              </label>
              <Input
                id="qtd"
                name="qtd"
                type="number"
                placeholder="Quantidade"
                value={formData.qtd}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="larg"
                className="block text-sm font-medium text-gray-700"
              >
                Largura
              </label>
              <Input
                id="larg"
                name="larg"
                type="number"
                placeholder="Largura"
                value={formData.larg}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="compr"
                className="block text-sm font-medium text-gray-700"
              >
                Comprimento
              </label>
              <Input
                id="compr"
                name="compr"
                type="number"
                placeholder="Comprimento"
                value={formData.compr}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-4 mt-5">
            <div className="flex items-center space-x-2 mt-2 mb-8">
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.emenda}
                  onCheckedChange={() => handleCheckboxChange("emenda")}
                />
                <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Emenda
                </span>
              </label>
            </div>

            <div>
              <label
                htmlFor="totMetros"
                className="block text-sm font-medium text-gray-700"
              >
                Total Metros
              </label>
              <Input
                id="totMetros"
                readOnly
                disabled
                name="totMetros"
                type="number"
                placeholder="Total Metros"
                value={formData.totMetros}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                htmlFor="orcamento"
                className="block text-sm font-medium text-gray-700"
              >
                Orçamento
              </label>
              <Input
                id="orcamento"
                readOnly
                disabled
                name="orcamento"
                type="number"
                placeholder="Orçamento"
                value={formData.orcamento}
                onChange={handleChange}
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddJob;
