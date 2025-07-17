import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import instance from "@/config/axios";
import { toast } from "sonner";

interface Permission {
  _id: string;
  name: string;
  description: string;
}

interface Role {
  _id: string;
  name: string;
  permissions: Permission[];
}

export function RoleEditModal({
  open,
  onClose,
  role,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  role: Role | null;
  onSaved: () => void;
}) {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (role) {
      setSelected(role.permissions.map((p) => p._id));
    }
  }, [role]);

  useEffect(() => {
    if (open) {
      instance.get("/permissions").then((res: any) => setAllPermissions(res));
    }
  }, [open]);

  const handleToggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!role) return;
    try {
      await instance.put(`/roles/${role._id}/permissions`, {
        permissions: selected,
      });
      toast.success("Permissões atualizadas com sucesso!");
      onSaved();
      onClose();
    } catch (err) {
      toast.error("Erro ao salvar permissões");
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Permissões - {role?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {allPermissions.map((perm) => (
            <label
              key={perm._id}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <Checkbox
                checked={selected.includes(perm._id)}
                onCheckedChange={() => handleToggle(perm._id)}
              />
              <span>{perm.description}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
