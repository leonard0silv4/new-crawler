"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import PIX from "react-qrcode-pix";
import { useModal } from "../../context/ModalContext";
import instance from "@/config/axios";
import { Loader2, Copy, Check, TriangleAlert } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const now = new Date().getTime().toString();

interface PixProps {
  pixKey: string;
  price: number;
  username: string;
  advancedMoney?: number;
  faccionistId?: string;
  onMarkAsPaid: () => void;
  updateAdvancedMoney?: (value: number) => void;
  updateValueAdvancedJob?: (jobsResponse: any) => void;
  jobIds: string[];
}

export default function Pix({
  pixKey,
  price,
  username = "",
  faccionistId = "",
  advancedMoney = 0,
  onMarkAsPaid,
  updateAdvancedMoney,
  updateValueAdvancedJob,
  jobIds,
}: PixProps) {
  const [fullPIX, setFullPIX] = useState("");
  const [priceI, setPriceI] = useState(price);
  const [advancedRemove, setAdvancedRemove] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const { closeModal } = useModal();
  const { toast } = useToast();

  const handleMarkAsPaid = async () => {
    setIsLoading(true);

    try {
      // Se o preço foi alterado (houve desconto do adiantamento)
      if (priceI !== price && advancedRemove > 0) {
        // Atualizar jobs com valor do adiantamento dividido
        const jobsResponse = await instance.put(`jobs/splitAdvancedMoney`, {
          ids: jobIds,
          value: Number((advancedRemove / jobIds.length).toFixed(2)),
        });

        if (updateValueAdvancedJob) {
          updateValueAdvancedJob(jobsResponse.data.jobs);
        }

        // Atualizar adiantamento do facionista
        const faccionistResponse = await instance.put(
          `factionist/${faccionistId}`,
          {
            advanceMoney: advancedMoney - advancedRemove,
          }
        );

        if (updateAdvancedMoney) {
          updateAdvancedMoney(faccionistResponse.data.advanceMoney);
        }
      }

      onMarkAsPaid();
      closeModal();

      toast({
        title: "Pagamento marcado como pago",
        description: "O pagamento foi processado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao marcar como pago:", error);
      toast({
        title: "Erro",
        description:
          "Ocorreu um erro ao processar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onChangeValueAdvanced = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newAdvancedRemove = Number.parseFloat(e.target.value) || 0;

    // Validações
    if (newAdvancedRemove < 0) {
      newAdvancedRemove = 0;
    } else if (newAdvancedRemove > price) {
      newAdvancedRemove = Number.parseFloat((price - 0.01).toFixed(2));
    } else if (newAdvancedRemove > advancedMoney) {
      newAdvancedRemove = Number.parseFloat(advancedMoney.toFixed(2));
    }

    setAdvancedRemove(newAdvancedRemove);
    setPriceI(price - newAdvancedRemove);
  };

  const addPrefixIfPhone = (pixKey: string): string => {
    const cpfRegex = /^[0-9]{11}$/;
    const phoneRegex = /^[0-9]{10,11}$/;

    if (phoneRegex.test(pixKey) && !cpfRegex.test(pixKey)) {
      return "+55" + pixKey;
    }
    return pixKey;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullPIX);
      setIsCopied(true);

      toast({
        title: "Código copiado",
        description: "O código PIX foi copiado para a área de transferência.",
      });

      // Reset do ícone após 2 segundos
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const hasValidPixData = pixKey && price > 0;
  const hasAdvancedMoney = advancedMoney && advancedMoney !== 0;
  const remainingAdvanced = advancedMoney - (advancedRemove || 0);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="leading-6">
          Pagamento para <span className="capitalize">{username}</span> - Valor
          de R$ {priceI?.toFixed(2)}
        </DialogTitle>
        <DialogDescription>
          Confira com cautela os dados do destinatário e valor antes de efetuar
          a transferência.
        </DialogDescription>

        {hasAdvancedMoney ? (
          <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-600 text-center text-sm">
              Possui um adiantamento no valor de R$ {advancedMoney.toFixed(2)}
              {remainingAdvanced > 0 &&
                ` (restante: R$ ${remainingAdvanced.toFixed(2)})`}
              <br />
              Você gostaria de abater algum valor deste pagamento?
            </p>
            <div className="space-y-2">
              <Input
                id="advancedRemove"
                name="advancedRemove"
                type="number"
                step="0.01"
                min="0"
                max={Math.min(price, advancedMoney)}
                placeholder="Valor a ser abatido"
                value={advancedRemove || ""}
                onChange={onChangeValueAdvanced}
                className="text-center"
              />
              <p className="text-xs text-gray-500 text-center">
                Máximo: R$ {Math.min(price, advancedMoney).toFixed(2)}
              </p>
            </div>
          </div>
        ) : null}
      </DialogHeader>

      <div className="flex justify-center py-4">
        {!hasValidPixData ? (
          <div className="text-center p-8 text-gray-500">
            <p>Usuário sem chave PIX cadastrada ou sem valores a pagar</p>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <PIX
              pixkey={addPrefixIfPhone(pixKey)}
              merchant="JARDINOGARDEM"
              city="Londrina"
              cep=""
              code={"RQP" + now}
              amount={priceI}
              onLoad={setFullPIX}
              resize={284}
              variant="fluid"
              padding={20}
              color="#000"
              bgColor="#FFF"
              bgRounded
              divider
            />
          </div>
        )}
      </div>

      {hasValidPixData && (
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleCopy}
            type="button"
            variant="outline"
            disabled={!fullPIX}
            className="flex items-center gap-2 bg-transparent"
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar código PIX
              </>
            )}
          </Button>

          <Button
            onClick={handleMarkAsPaid}
            type="button"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Marcar como pago"
            )}
          </Button>

          <small className="text-center text-red-600 text-xs flex gap-2 justify-center">
            <TriangleAlert className="h-4 w-4" />A ação "marcar como pago" não
            poderá ser desfeita
          </small>
        </div>
      )}
    </>
  );
}
