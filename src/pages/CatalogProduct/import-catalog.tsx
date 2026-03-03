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
import { useCatalogProductService } from "@/hooks/useCatalogProduct";

interface ImportCatalogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportCatalog({ isOpen, onClose }: ImportCatalogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { importProducts } = useCatalogProductService();

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
    }
  };

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
      setSuccess(
        `${result.imported} produto(s) importado(s), ${result.skipped} ignorado(s).`
      );
      setTimeout(() => handleClose(), 2000);
    } catch (err) {
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
    setIsUploading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">
            Importar Catálogo do Excel
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Faça upload de um arquivo Excel (.xlsx ou .xls) com os dados dos
            produtos. O peso cúbico será calculado automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="file">Arquivo Excel</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isUploading}
              className="bg-white/80 dark:bg-slate-800/80"
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
                • <strong>SKU-1</strong>: Código SKU primário
              </li>
              <li>
                • <strong>SKU-2</strong>: Código SKU secundário
              </li>
              <li>
                • <strong>SKU-3</strong>: Código SKU alternativo (opcional)
              </li>
              <li>
                • <strong>PRODUTO</strong>: Nome do produto
              </li>
              <li>
                • <strong>MEDIDAS</strong>: Medidas (ex: 2X3)
              </li>
              <li>
                • <strong>LARG</strong>: Largura em cm
              </li>
              <li>
                • <strong>COMP</strong>: Comprimento em cm
              </li>
              <li>
                • <strong>ALTURA</strong>: Altura em cm
              </li>
              <li>
                • <strong>KG</strong>: Peso real em kg
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
