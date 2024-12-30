import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import PIX from "react-qrcode-pix";
import { useModal } from "../../context/ModalContext"; // Importe o useModal
import { Input } from "@/components/ui/input";
import instance from "@/config/axios";

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

  const handleMarkAsPaid = async () => {
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
          Pagamento para <span className="capitalize">{username}</span> Valor de
          R$ {priceI?.toFixed(2)}
        </DialogTitle>
        <DialogDescription>
          Confira com cautela os dados do destinatário e valor antes de efetuar
          transferencia.
        </DialogDescription>

        {advancedMoney && advancedMoney != 0 ? (
          <>
            <p className="text-red-500 text-center">
              {`Possui um adiantamento no valor de R$ ${advancedMoney} (${(
                advancedMoney - (advancedRemove ?? 0)
              ).toFixed(2)})
            você gostaria de abater algum valor deste pagamento ?
            `}
            </p>
            <div>
              <Input
                id="qtd"
                name="qtd"
                type="text"
                placeholder="Valor a ser abatido"
                value={advancedRemove}
                onChange={(e) => onChangeValueAdvanced(e)}
              />
            </div>
          </>
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
          Marcar como pago
        </Button>

        <small className="text-center text-red-700">
          Ação marcar como pago não poderá ser desfeita
        </small>
      </div>
    </>
  );
}
