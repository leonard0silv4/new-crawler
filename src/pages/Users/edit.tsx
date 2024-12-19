import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import instance from "@/config/axios";
import { useState } from "react";
import { toast } from "sonner";

interface EditFaccionistaProps {
  user: any;
  onClose: () => void;
  updateUserState: (updatedUser: any) => void;
}

const EditFaccionista = ({
  user,
  onClose,
  updateUserState,
}: EditFaccionistaProps) => {
  const [username, setUserName] = useState(user?.username);
  const [lastName, setLastName] = useState(user?.lastName);
  const [address, setAddress] = useState("");
  const [pixKey, setPixKey] = useState(user?.pixKey);
  const [userId] = useState(user?._id);
  const [password, setPassword] = useState("");

  const handleSave = async (e: any) => {
    e.preventDefault();

    try {
      const response = await instance.put(`factionist/${userId}`, {
        username,
        lastName,
        address,
        pixKey,
        password,
      });

      updateUserState(response);
      onClose();
      toast.success("Usuário atualizado com sucesso!", {
        position: "top-center",
      });
    } catch (error) {
      toast.error("Erro ao atualizar usuário", {
        position: "top-center",
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Faccionista</DialogTitle>
          <DialogDescription>
            Atualize os dados do faccionista
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 items-center text-left">
            <Input
              onChange={(e) => setUserName(e.target.value)}
              value={username}
              type="text"
              className="block w-full rounded-md pr-60"
              placeholder="Nome do faccionista"
            />
          </div>

          <div className="grid grid-cols-1 items-center text-left">
            <Input
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
              type="text"
              className="block w-full rounded-md pr-60"
              placeholder="Sobrenome"
            />
          </div>

          <div className="grid grid-cols-1 items-center text-left">
            <Input
              onChange={(e) => setAddress(e.target.value)}
              value={address}
              type="text"
              className="block w-full rounded-md pr-60"
              placeholder="Endereço"
            />
          </div>

          <div className="grid grid-cols-1 items-center text-left">
            <Input
              onChange={(e) => setPixKey(e.target.value)}
              value={pixKey}
              type="text"
              className="block w-full rounded-md pr-60"
              placeholder="Chave Pix"
            />
          </div>

          <div className="grid grid-cols-1 items-center text-left">
            <Input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="text"
              className="block w-full rounded-md"
              placeholder="Senha"
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFaccionista;
