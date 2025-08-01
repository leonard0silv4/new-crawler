"use client";

import type React from "react";

import { useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProductsService } from "@/hooks/useProduct";
import { useSse } from "@/hooks/useSse";

interface ImportProductsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportProducts({ isOpen, onClose }: ImportProductsProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<{
    processed: number;
    total: number;
    percent: number;
  } | null>(null);
  const { importProducts } = useProductsService();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");
    setSuccess("");

    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (
      !validTypes.includes(selectedFile.type) &&
      !selectedFile.name.match(/\.(xlsx|xls)$/i)
    ) {
      setError("Por favor, selecione um arquivo Excel (.xlsx ou .xls)");
      setFile(null);
      return;
    }
  };

  useSse({
    eventName: "importProgress",
    onEvent: (data) =>
      setProgress(
        data as { processed: number; total: number; percent: number }
      ),
    enabled: isUploading,
  });

  useSse({
    eventName: "importFinished",
    onEvent: (data) => {
      const { imported } = data as { imported: number };
      setSuccess(`${imported} produto(s) importado(s) com sucesso!`);
      setProgress(null);
      setIsUploading(false);
      setTimeout(() => handleClose(), 2000);
    },
    enabled: isUploading,
  });

  useSse({
    eventName: "importError",
    onEvent: (data) => {
      const { message } = data as { message: string };
      setError(message || "Erro ao importar produtos.");
      setProgress(null);
      setIsUploading(false);
    },
    enabled: isUploading,
  });

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor, selecione um arquivo");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      const result = await importProducts.mutateAsync(file);

      if (result?.produtos || result?.products) {
        const produtos = result.produtos || result.products;
        setSuccess(`${produtos.length} produto(s) importado(s) com sucesso!`);

        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        throw new Error("Formato de retorno inválido.");
      }
    } catch (err) {
      console.error("Erro ao fazer upload:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao fazer upload do arquivo"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError("");
    setSuccess("");
    setProgress(null);
    setIsUploading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold ">
            Importar Produtos do Excel
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Faça upload de um arquivo Excel (.xlsx ou .xls) com os dados dos
            produtos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label
              htmlFor="file"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Arquivo Excel
            </Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isUploading}
              className="bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {file && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Arquivo selecionado:{" "}
                <span className="font-medium">{file.name}</span>
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {progress && (
            <div className="w-full mt-4">
              <div className="bg-slate-200 dark:bg-slate-700 rounded h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 transition-all duration-300"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <p className="text-xs text-center text-slate-600 dark:text-slate-400 mt-1">
                Processando {progress.processed} de {progress.total} (
                {progress.percent}%)
              </p>
            </div>
          )}

          {success && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                {success}
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="font-medium mb-3 flex items-center text-slate-700 dark:text-slate-300">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Formato do arquivo Excel
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              O arquivo deve conter as seguintes colunas:
            </p>
            <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>
                • <strong>Descrição</strong>: Nome do produto
              </li>
              <li>
                • <strong>Código (SKU)</strong>: Código SKU do produto
              </li>
              <li>
                • <strong>Descrição complementar</strong>: Descrição do produto
              </li>
              <li>
                • <strong>Preço</strong>: Preço do produto
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
            className="flex-1 sm:flex-none"
          >
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Importar produtos
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
