"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Product } from "./";

interface ProductFormData {
  nome: string;
  sku: string;
  descricao: string;
  preco: number;
}

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void;
  initialData?: Product | null;
  title: string;
}

export function ProductForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>();

  useEffect(() => {
    if (initialData) {
      reset({
        nome: initialData.nome,
        sku: initialData.sku,
        descricao: initialData.descricao,
        preco: initialData.preco,
      });
    } else {
      reset({
        nome: "",
        sku: "",
        descricao: "",
        preco: 0,
      });
    }
  }, [initialData, reset]);

  const onSubmitForm = (data: ProductFormData) => {
    onSubmit(data);
    reset();
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Preencha os dados do produto abaixo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Produto</Label>
            <Input
              id="nome"
              placeholder="Digite o nome do produto"
              {...register("nome", {
                required: "Nome é obrigatório",
                minLength: { value: 1, message: "Nome é obrigatório" },
              })}
            />
            {errors.nome && (
              <p className="text-sm text-red-500">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              placeholder="Digite o código SKU"
              {...register("sku", {
                required: "SKU é obrigatório",
                minLength: { value: 1, message: "SKU é obrigatório" },
              })}
            />
            {errors.sku && (
              <p className="text-sm text-red-500">{errors.sku.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <textarea
              id="descricao"
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 p-2 text-sm bg-white/80 dark:bg-slate-800/80"
              placeholder="Digite a descrição do produto"
              rows={2}
              {...register("descricao")}
            />
            {errors.descricao && (
              <p className="text-sm text-red-500">{errors.descricao.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="preco">Preço (R$)</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              {...register("preco", {
                required: "Preço é obrigatório",
                min: { value: 0.01, message: "Deve ser maior que zero" },
                valueAsNumber: true,
              })}
            />
            {errors.preco && (
              <p className="text-sm text-red-500">{errors.preco.message}</p>
            )}
          </div>

          <DialogFooter className="gap-3 pt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
