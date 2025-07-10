import { useEffect, useState } from "react";
import instance from "@/config/axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Role {
  _id: string;
  name: string;
  permissions: {
    _id: string;
    name: string;
    description: string;
  }[];
}

interface RoleManagerModalProps {
  open: boolean;
  onClose: () => void;
}

export default function RoleManagerModal({
  open,
  onClose,
}: RoleManagerModalProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await instance.get("/roles");
      setRoles(res as any);
    } catch (err) {
      toast.error("Erro ao carregar esquemas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await instance.delete(`/roles/${id}`);
      toast.success("Esquemas de permissão apagado com sucesso!");
      fetchRoles();
    } catch (err) {
      toast.error("Erro ao apagar role");
      console.error(err);
    }
  };

  useEffect(() => {
    if (open) fetchRoles();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Esquemas de permissão</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
            <span className="ml-2 text-sm text-gray-600">Carregando...</span>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {roles.map((role) => (
              <div
                key={role._id}
                className="border rounded p-3 flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold">{role.name}</div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-sm text-gray-600 cursor-help underline underline-offset-2">
                          {role.permissions?.length || 0} permissões
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs break-words">
                        {role.permissions?.length > 0 ? (
                          <ul className="text-xs text-gray-800 list-disc list-inside">
                            {role.permissions.map((p) => (
                              <li key={p._id}>
                                <strong>{p.description}</strong>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span>Nenhuma permissão</span>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {role.name != "faccionista" && role.name != "owner" ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(role._id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                ) : null}
              </div>
            ))}

            {roles.length === 0 && (
              <div className="text-sm text-gray-500 text-center mt-6">
                Nenhum esquema cadastrado
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
