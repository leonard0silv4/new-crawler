import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import PIX from "react-qrcode-pix";
import { useModal } from "../../context/ModalContext";
import { Input } from "@/components/ui/input";
import instance from "@/config/axios";
import { Loader2 } from "lucide-react";

const now = new Date().getTime().toString();

interface PixProps {
  pixKey: string;
  price: number;
  username: string;
  advancedMoney?: number;
  faccionistId?: string;
  onMarkAsPaid: () => void;
  updateAdvancedMoney?: (n: any) => void;
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
  console.log(fullPIX);
  const [priceI, setPriceI] = useState(price);
  const [advancedRemove, setAdvancedRemove] = useState<number>();
  const { closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsPaid = async () => {
    setIsLoading(true);

    if (priceI != price) {
      await instance
        .put(`jobs/splitAdvancedMoney`, {
          ids: jobIds,
          value: Number((advancedRemove ?? 0) / jobIds.length),
        })
        .then((response: any) => {
          updateValueAdvancedJob && updateValueAdvancedJob(response.jobs);
        });

      instance
        .put(`factionist/${faccionistId}`, {
          advanceMoney: advancedMoney - (advancedRemove ?? 0),
        })
        .then((response: any) => {
          updateAdvancedMoney && updateAdvancedMoney(response.advanceMoney);
        });
    }
    onMarkAsPaid();
    closeModal();
    setIsLoading(false);
  };

  const onChangeValueAdvanced = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newAdvancedRemove = parseFloat(e.target.value) || 0;

    if (newAdvancedRemove < 0) {
      newAdvancedRemove = 0;
    } else if (newAdvancedRemove > price) {
      newAdvancedRemove = parseFloat((price - 0.01).toFixed(2));
    } else if (newAdvancedRemove > advancedMoney) {
      newAdvancedRemove = parseFloat(advancedMoney.toFixed(2));
    }

    setAdvancedRemove(newAdvancedRemove);
    setPriceI(price - newAdvancedRemove);
  };

  const addPrefixIfPhone = (pixKey: string) => {
    const cpfRegex = /^[0-9]{11}$/;
    const phoneRegex = /^[0-9]{10,11}$/;

    if (phoneRegex.test(pixKey) && !cpfRegex.test(pixKey)) {
      return "+55" + pixKey;
    }

    return pixKey;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fullPIX);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="leading-6">
          Pagamento para <span className="capitalize">{username ?? ""}</span>{" "}
          Valor de R$ {priceI?.toFixed(2)}
        </DialogTitle>
        <DialogDescription>
          Confira com cautela os dados do destinatário e valor antes de efetuar
          transferencia.
        </DialogDescription>

        {advancedMoney && advancedMoney != 0 ? (
          <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-600 text-center text-sm">
              {`Possui um adiantamento no valor de R$ ${advancedMoney} (${(
                advancedMoney - (advancedRemove ?? 0)
              ).toFixed(2)})
            você gostaria de abater algum valor deste pagamento ?
            `}
            </p>
            <div className="space-y-2">
              <div>
                <Input
                  id="qtd"
                  name="qtd"
                  type="text"
                  placeholder="Valor a ser abatido"
                  value={advancedRemove}
                  onChange={(e) => onChangeValueAdvanced(e)}
                  className="text-center"
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                Máximo: R$ {Math.min(price, advancedMoney).toFixed(2)}
              </p>
            </div>
          </div>
        ) : null}
      </DialogHeader>

      <div className="justify-center flex">
        {!pixKey || !price ? (
          "Usuário sem chave Pix cadastrada ou sem valores a pagar"
        ) : (
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
        )}
      </div>

      <div className=" flex flex-col gap-3 justify-center">
        <Button onClick={handleCopy} type="button">
          Copiar código
        </Button>

        <Button onClick={handleMarkAsPaid} type="button">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            "Marcar como pago"
          )}
        </Button>

        <small className="text-center text-red-700">
          Ação marcar como pago não poderá ser desfeita
        </small>
      </div>
    </>
  );
}
