"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
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
// import { Badge } from "@/components/ui/badge";
import { Box } from "lucide-react";
import type { CatalogProduct } from "@/hooks/useCatalogProduct";

export interface CatalogFormData {
  sku1: string;
  sku2: string;
  produto: string;
  medidas: string;
  largura: number;
  comprimento: number;
  altura: number;
  peso: number;
}

interface CatalogProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CatalogFormData) => void;
  initialData?: CatalogProduct | null;
  title: string;
}

function calcPesoCubico(l: number, c: number, a: number): number {
  if (l > 0 && c > 0 && a > 0) {
    return Math.round(((l * c * a) / 5900) * 1000) / 1000;
  }
  return 0;
}

export function CatalogProductForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
}: CatalogProductFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CatalogFormData>();

  const largura = useWatch({ control, name: "largura" }) || 0;
  const comprimento = useWatch({ control, name: "comprimento" }) || 0;
  const altura = useWatch({ control, name: "altura" }) || 0;
  const peso = useWatch({ control, name: "peso" }) || 0;
  const pesoCubicoPreview = calcPesoCubico(
    Number(largura),
    Number(comprimento),
    Number(altura)
  );

  useEffect(() => {
    if (initialData) {
      reset({
        sku1: initialData.sku1,
        sku2: initialData.sku2,
        produto: initialData.produto,
        medidas: initialData.medidas,
        largura: initialData.largura,
        comprimento: initialData.comprimento,
        altura: initialData.altura,
        peso: initialData.peso,
      });
    } else {
      reset({
        sku1: "",
        sku2: "",
        produto: "",
        medidas: "",
        largura: 0,
        comprimento: 0,
        altura: 0,
        peso: 0,
      });
    }
  }, [initialData, reset]);

  const onSubmitForm = (data: CatalogFormData) => {
    onSubmit(data);
    reset();
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">{title}</DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Preencha os dados do produto. O peso cúbico é calculado
            automaticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sku1">SKU-1</Label>
              <Input
                id="sku1"
                placeholder="Ex: SBAX80XPTX02X02"
                {...register("sku1", { required: "SKU-1 é obrigatório" })}
              />
              {errors.sku1 && (
                <p className="text-sm text-red-500">{errors.sku1.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku2">SKU-2</Label>
              <Input
                id="sku2"
                placeholder="Ex: SBISOMB8002002X1"
                {...register("sku2")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="produto">Produto</Label>
              <Input
                id="produto"
                placeholder="Nome do produto"
                {...register("produto", { required: "Produto é obrigatório" })}
              />
              {errors.produto && (
                <p className="text-sm text-red-500">{errors.produto.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="medidas">Medidas</Label>
              <Input
                id="medidas"
                placeholder="Ex: 2X3"
                {...register("medidas", { required: "Medidas é obrigatório" })}
              />
              {errors.medidas && (
                <p className="text-sm text-red-500">{errors.medidas.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="largura">Largura (cm)</Label>
              <Input
                id="largura"
                type="number"
                step="0.1"
                min="0"
                placeholder="0"
                {...register("largura", {
                  required: "Obrigatório",
                  valueAsNumber: true,
                })}
              />
              {errors.largura && (
                <p className="text-sm text-red-500">{errors.largura.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comprimento">Comprimento (cm)</Label>
              <Input
                id="comprimento"
                type="number"
                step="0.1"
                min="0"
                placeholder="0"
                {...register("comprimento", {
                  required: "Obrigatório",
                  valueAsNumber: true,
                })}
              />
              {errors.comprimento && (
                <p className="text-sm text-red-500">
                  {errors.comprimento.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="altura">Altura (cm)</Label>
              <Input
                id="altura"
                type="number"
                step="0.1"
                min="0"
                placeholder="0"
                {...register("altura", {
                  required: "Obrigatório",
                  valueAsNumber: true,
                })}
              />
              {errors.altura && (
                <p className="text-sm text-red-500">{errors.altura.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="peso">Peso Real (kg)</Label>
              <Input
                id="peso"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                {...register("peso", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label>Peso Cúbico (kg)</Label>
              <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <Box className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {pesoCubicoPreview.toFixed(3).replace(".", ",")} kg
                </span>
              </div>
              <p className="text-xs text-slate-500">
                (L × C × A) / 6000
              </p>
            </div>
          </div>

          {pesoCubicoPreview > 0 && Number(largura) > 0 && (
            <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Peso tarifado:</strong>{" "}
                {Math.max(pesoCubicoPreview, Number(peso) || 0)
                  .toFixed(3)
                  .replace(".", ",")}{" "}
                kg (maior entre real e cúbico)
              </p>
            </div>
          )}

          <DialogFooter className="gap-3 pt-4">
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
