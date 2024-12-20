import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import PIX from "react-qrcode-pix";
import { useModal } from "../../context/ModalContext"; // Importe o useModal

const now = new Date().getTime().toString();

interface PixProps {
  pixKey: string;
  price: number;
  username: string;
  onMarkAsPaid: () => void;
}

export default function Pix({
  pixKey,
  price,
  username = "",
  onMarkAsPaid,
}: PixProps) {
  const [fullPIX, setFullPIX] = useState("");
  console.log(fullPIX);
  const { closeModal } = useModal(); // Acessando o contexto para fechar a modal

  const handleMarkAsPaid = () => {
    onMarkAsPaid(); // Marque como pago
    closeModal(); // Feche a modal após a ação
  };

  const addPrefixIfPhone = (pixKey: string) => {
    // Expressões regulares fornecidas para validação de CPF, CNPJ, Telefone, Email e Random
    const cpfRegex = /^[0-9]{11}$/;
    const phoneRegex = /^[0-9]{10,11}$/; // Ajustado para aceitar apenas números

    // Se for telefone sem o prefixo +55, adiciona
    if (phoneRegex.test(pixKey) && !cpfRegex.test(pixKey)) {
      return "+55" + pixKey; // Adiciona o prefixo +55
    }

    // Se não for telefone, retorna a chave original sem modificações
    return pixKey;
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="leading-6">
          Pagamento para <span className="capitalize block">{username}</span>
          Valor de R$ {price?.toFixed(2)}
        </DialogTitle>
        <DialogDescription>
          Confira com cautela os dados do destinatário e valor antes de efetuar
          transferencia.
        </DialogDescription>
      </DialogHeader>

      <div className="sm:justify-center flex">
        {!pixKey || !price ? (
          "Usuário sem chave Pix cadastrada ou sem valores a pagar"
        ) : (
          <PIX
            pixkey={addPrefixIfPhone(pixKey)}
            merchant="JARDINOGARDEM"
            city="Londrina"
            cep=""
            code={"RQP" + now}
            amount={price}
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

      {/* <DialogFooter> */}
      <div className=" flex flex-col justify-center">
        <Button onClick={handleMarkAsPaid} type="button">
          Marcar como pago
        </Button>

        <small className="mt-3 text-center text-red-700">
          Ação marcar como pago não poderá ser desfeita
        </small>
      </div>
      {/* </DialogFooter> */}
    </>
  );
}
