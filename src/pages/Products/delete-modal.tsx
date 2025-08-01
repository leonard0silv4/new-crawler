"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProductsService } from "@/hooks/useProduct"; // ajuste o path se necessário
import { useState } from "react";

interface DeleteAllModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAllModal = ({ isOpen, onClose }: DeleteAllModalProps) => {
  const { deleteAllProducts } = useProductsService();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteAllProducts.mutateAsync();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Tem certeza que deseja deletar todos os produtos?
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Essa ação é irreversível e removerá todos os produtos cadastrados no
          sistema.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deletando..." : "Deletar todos"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
