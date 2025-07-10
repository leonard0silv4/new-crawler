import { useEffect, useState } from "react";
import instance from "@/config/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface UserEditModalProps {
  user: any;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export default function UserEditModal({
  user,
  open,
  onClose,
  onUpdated,
}: UserEditModalProps) {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);
  const [form, setForm] = useState({ username: "", password: "" });
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);

  const isCreatingNewRole = selectedRoleId === "new";

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        password: "",
      });
      setSelectedRoleId(user.roleId || "");
      instance.get("/roles").then((res) => {
        const rolesData = res as any;
        setRoles(rolesData);

        // Só seta o roleId após garantir que as roles foram carregadas
        const userRoleId = user.roleId || "";
        const foundRole = rolesData.find((r: any) => r._id === userRoleId);
        if (foundRole) {
          setSelectedRoleId(userRoleId);
        }
      });
      instance.get("/permissions").then((res) => setPermissions(res as any));
    }
  }, [user]);

  useEffect(() => {
    if (selectedRoleId && selectedRoleId !== "new") {
      instance
        .get(`/roles/${selectedRoleId}`)
        .then((res) => setRolePermissions(res as any));
    } else {
      setRolePermissions([]);
    }
  }, [selectedRoleId]);

  const toggleNewRolePermission = (id: string) => {
    setNewRolePermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    try {
      let roleId = selectedRoleId;

      if (isCreatingNewRole) {
        if (!newRoleName || newRolePermissions.length === 0) {
          toast.error("Informe nome da role e selecione permissões", {
            position: "top-right",
          });
          return;
        }
        const newRole: any = await instance.post("/roles", {
          name: newRoleName,
          permissions: newRolePermissions,
        });
        roleId = newRole._id;
      }

      await instance.put(`/users/${user._id}`, {
        username: form.username,
        password: form.password || undefined,
        roleId,
      });

      toast.success("Usuário atualizado com sucesso!", {
        position: "top-right",
      });
      onClose();
      onUpdated();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar o usuário", {
        position: "top-right",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Nome de usuário"
            value={form.username}
            onChange={(e) =>
              setForm((f) => ({ ...f, username: e.target.value }))
            }
          />

          <Input
            placeholder="Nova senha (opcional)"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
          />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Esquema de permissões
            </label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um esquema" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role._id} value={role._id}>
                    {role.name}
                  </SelectItem>
                ))}
                <SelectItem value="new">+ Criar novo esquema</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isCreatingNewRole && (
            <>
              <Input
                placeholder="Nome da nova role"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
              <div>
                <label className="font-semibold block mb-2">
                  Permissões do novo esquema:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {permissions.map((perm) => (
                    <label key={perm._id} className="flex items-center gap-2">
                      <Checkbox
                        checked={newRolePermissions.includes(perm._id)}
                        onCheckedChange={() =>
                          toggleNewRolePermission(perm._id)
                        }
                      />
                      {perm.description} -
                      <span className="text-gray-500 text-sm">{perm.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {!isCreatingNewRole && rolePermissions.length > 0 && (
            <div className="mt-4 border p-4 rounded bg-gray-50">
              <h3 className="font-semibold mb-2">Permissões do esquema:</h3>
              <ul className="list-disc list-inside text-sm text-gray-700">
                {rolePermissions.map((p) => (
                  <li key={p._id}>
                    <strong>{p.description}</strong>: {p.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
