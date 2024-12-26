import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import instance from "@/config/axios";
import { useState } from "react";
import { toast } from "sonner";

interface AddFaccionist {
  addUserState: (user: any) => void;
}
const AddFaccionista = ({ addUserState }: AddFaccionist) => {
  const [username, setUserName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pixKey, setPixKey] = useState("");

  const addUser = (e: any) => {
    e.preventDefault();
    if (!username) {
      toast.error("Ocorreu um erro ", {
        description: "Nome não pode ser vazio",
        position: "top-right",
      });
      return;
    }

    if (!password) {
      toast.error("Ocorreu um erro ", {
        description: "Senha não pode ser vazio",
        position: "top-right",
      });
      return;
    }

    instance
      .post("factionist", {
        username,
        lastName,
        address,
        pixKey,
        password,
      })
      .then((response) => {
        addUserState(response);
        setUserName("");
        setPassword("");
        setLastName("");
        setAddress("");
        setPixKey("");
        document.getElementById("closeDialog")?.click();
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="w-4 h-4 mr-2" />
          Novo faccionista
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Faccionista</DialogTitle>
          <DialogDescription>
            Adiciona um novo usuário faccionista
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => addUser(e)} className="space-y-6">
          <div className="grid grid-cols-1 items-center text-left">
            <Input
              onChange={(e) => setUserName(e.target.value)}
              value={username}
              type="text"
              required
              id="nome"
              className="block w-full rounded-md pr-60 col-span-4"
              placeholder="Nome do faccionista"
            />
            <p className="w-full mt-2 text-sm	text-gray-500">
              Sem espaço nem caracteres especiais esse será o login
            </p>
          </div>

          <div className="grid grid-cols-4 items-center text-left">
            <Input
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
              type="text"
              id="sobreNome"
              className="block w-full rounded-md pr-60 col-span-4"
              placeholder="Sobrenome"
            />
          </div>

          <div className="grid grid-cols-4 items-center text-left">
            <Input
              onChange={(e) => setAddress(e.target.value)}
              value={address}
              type="text"
              id="address"
              className="block w-full rounded-md pr-60 col-span-4"
              placeholder="Endereço"
            />
          </div>

          <div className="grid grid-cols-1 items-center text-left">
            <Input
              onChange={(e) => setPixKey(e.target.value)}
              value={pixKey}
              type="text"
              id="pix"
              className="block w-full rounded-md pr-60 col-span-4"
              placeholder="Chave Pix"
            />
            <p className="w-full mt-2 text-sm	text-gray-500">
              Sem pontuação no caso de CPF/CNPJ ex: 12345678900 <br />
              Email sem caixa alta por ex: abc@gmail.com
            </p>
          </div>

          <div className="grid grid-cols-1 items-center text-left">
            <Input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              id="password"
              required
              className="col-span-4"
              placeholder="Senha de acesso"
            />
          </div>

          <DialogFooter className="gap-3">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button onClick={(e) => addUser(e)} type="submit">
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFaccionista;
