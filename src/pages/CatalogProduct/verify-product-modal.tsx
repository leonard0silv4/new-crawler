"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type CatalogProduct } from "@/hooks/useCatalogProduct";
import {
  CheckCircle2,
  XCircle,
  Package,
  Ruler,
  Weight,
  Hash,
  Calculator,
} from "lucide-react";

interface VerifyProductModalProps {
  product: CatalogProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

/** Margem de tolerância para divergência de peso (ex: 0.05 = 5%) */
const MARGEM_PESO = 0.05;

interface VerifyResult {
  cubadoCaixa: number;
  cubadoPorUnidade: number;
  aprovado: boolean;
  qtdUsada: number;
  pesoInformado: number;
  pesoEsperado: number;
  pesoDivergente: boolean;
  diferencaPeso: number;
  diferencaPercent: number;
}

export function VerifyProductModal({
  product,
  isOpen,
  onClose,
}: VerifyProductModalProps) {
  const [qtd, setQtd] = useState("");
  const [largura, setLargura] = useState("");
  const [comprimento, setComprimento] = useState("");
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);

  const qtdRef = useRef<HTMLInputElement>(null);
  const larguraRef = useRef<HTMLInputElement>(null);
  const comprimentoRef = useRef<HTMLInputElement>(null);
  const alturaRef = useRef<HTMLInputElement>(null);
  const pesoRef = useRef<HTMLInputElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const reset = useCallback(() => {
    setQtd("");
    setLargura("");
    setComprimento("");
    setAltura("");
    setPeso("");
    setResult(null);
  }, []);

  useEffect(() => {
    if (isOpen) {
      reset();
      setTimeout(() => qtdRef.current?.focus(), 80);
    }
  }, [isOpen, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  // Enter em cada input avança para o próximo campo
  const handleEnterNext = (
    e: React.KeyboardEvent<HTMLInputElement>,
    next: React.RefObject<HTMLInputElement | HTMLButtonElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      next.current?.focus();
    }
  };

  const camposVazios = [qtd, largura, comprimento, altura, peso].some(
    (v) => !v.trim()
  );

  const handleConferir = useCallback(() => {
    if (!product) return;

    const l = parseFloat(largura.replace(",", ".")) || 0;
    const c = parseFloat(comprimento.replace(",", ".")) || 0;
    const a = parseFloat(altura.replace(",", ".")) || 0;
    const q = parseFloat(qtd.replace(",", ".")) || 1;
    const p = parseFloat(peso.replace(",", ".")) || 0;

    const cubadoCaixa = (l * c * a) / 5900;
    const cubadoPorUnidade = cubadoCaixa / q;
    const aprovado = cubadoPorUnidade < product.pesoCubico;

    const pesoEsperado = product.peso * q;
    const diferencaPeso = p - pesoEsperado;
    const diferencaPercent = pesoEsperado > 0 ? Math.abs(diferencaPeso) / pesoEsperado : 0;
    const pesoDivergente = product.peso > 0 && p > 0 && diferencaPercent > MARGEM_PESO;

    setResult({
      cubadoCaixa,
      cubadoPorUnidade,
      aprovado,
      qtdUsada: q,
      pesoInformado: p,
      pesoEsperado,
      pesoDivergente,
      diferencaPeso,
      diferencaPercent,
    });
  }, [product, largura, comprimento, altura, qtd, peso]);

  const handleBtnKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleConferir();
    }
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5" />
            Conferência de Produto
          </DialogTitle>
        </DialogHeader>

        {/* Info do produto do catálogo */}
        <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight truncate">
                {product.produto}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className="font-mono text-xs">
                  {product.sku1}
                </Badge>
                {product.sku2 && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {product.sku2}
                  </Badge>
                )}
                {product.sku3 && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {product.sku3}
                  </Badge>
                )}
                {product.medidas && (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                    {product.medidas}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="space-y-0.5">
              <p className="text-muted-foreground">Catálogo L × C × A</p>
              <p className="font-medium">
                {product.largura} × {product.comprimento} × {product.altura} cm
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-muted-foreground">Peso real</p>
              <p className="font-medium">
                {product.peso > 0 ? `${product.peso.toFixed(2)} kg` : "—"}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-muted-foreground">Peso cúbico ref.</p>
              <p className="font-semibold text-blue-600">
                {product.pesoCubico > 0
                  ? `${product.pesoCubico.toFixed(3)} kg`
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Formulário de conferência */}
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Informe as medidas físicas do produto. Use{" "}
            <kbd className="px-1 py-0.5 rounded border text-xs font-mono">Tab</kbd>{" "}
            para avançar entre os campos e{" "}
            <kbd className="px-1 py-0.5 rounded border text-xs font-mono">Enter</kbd>{" "}
            ou{" "}
            <kbd className="px-1 py-0.5 rounded border text-xs font-mono">Espaço</kbd>{" "}
            no botão para conferir.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="v-qtd" className="flex items-center gap-1.5 text-xs">
                <Hash className="h-3 w-3" />
                Quantidade
              </Label>
              <Input
                id="v-qtd"
                ref={qtdRef}
                value={qtd}
                onChange={(e) => setQtd(e.target.value)}
                onKeyDown={(e) => handleEnterNext(e, larguraRef)}
                placeholder="0"
                className="h-9"
                inputMode="decimal"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="v-largura" className="flex items-center gap-1.5 text-xs">
                <Ruler className="h-3 w-3" />
                Largura (cm)
              </Label>
              <Input
                id="v-largura"
                ref={larguraRef}
                value={largura}
                onChange={(e) => {
                  setLargura(e.target.value);
                  setResult(null);
                }}
                onKeyDown={(e) => handleEnterNext(e, comprimentoRef)}
                placeholder="0"
                className="h-9"
                inputMode="decimal"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="v-comprimento" className="flex items-center gap-1.5 text-xs">
                <Ruler className="h-3 w-3 rotate-90" />
                Comprimento (cm)
              </Label>
              <Input
                id="v-comprimento"
                ref={comprimentoRef}
                value={comprimento}
                onChange={(e) => {
                  setComprimento(e.target.value);
                  setResult(null);
                }}
                onKeyDown={(e) => handleEnterNext(e, alturaRef)}
                placeholder="0"
                className="h-9"
                inputMode="decimal"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="v-altura" className="flex items-center gap-1.5 text-xs">
                <Ruler className="h-3 w-3" />
                Altura (cm)
              </Label>
              <Input
                id="v-altura"
                ref={alturaRef}
                value={altura}
                onChange={(e) => {
                  setAltura(e.target.value);
                  setResult(null);
                }}
                onKeyDown={(e) => handleEnterNext(e, pesoRef)}
                placeholder="0"
                className="h-9"
                inputMode="decimal"
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="v-peso" className="flex items-center gap-1.5 text-xs">
                <Weight className="h-3 w-3" />
                Peso (kg)
              </Label>
              <Input
                id="v-peso"
                ref={pesoRef}
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                onKeyDown={(e) => handleEnterNext(e, btnRef)}
                placeholder="0,000"
                className="h-9"
                inputMode="decimal"
              />
            </div>
          </div>

          {camposVazios && (
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5" />
              Preencha todos os campos antes de conferir.
            </p>
          )}
          <Button
            ref={btnRef}
            className="w-full"
            onClick={handleConferir}
            onKeyDown={handleBtnKeyDown}
            disabled={camposVazios}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Conferir
          </Button>
        </div>

        {/* Resultado */}
        {result && (
          <>
            <Separator />
            <div
              className={`rounded-lg border p-4 space-y-3 ${
                result.aprovado
                  ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30"
                  : "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30"
              }`}
            >
              {/* Status geral */}
              <div className="flex items-center gap-2">
                {result.aprovado ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span
                  className={`text-base font-bold ${
                    result.aprovado ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                  }`}
                >
                  {result.aprovado ? "APROVADO" : "REPROVADO"}
                </span>
                {result.pesoDivergente && (
                  <span className="ml-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
                    · PESO DIVERGENTE
                  </span>
                )}
              </div>

              {/* Cubado */}
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Cubado da caixa</p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {largura || "0"}×{comprimento || "0"}×{altura || "0"} ÷ 5900
                  </p>
                  <p className="text-base font-bold font-mono">
                    {result.cubadoCaixa.toFixed(3)} kg
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">
                    Por unidade ({result.qtdUsada} un.)
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    ÷ {result.qtdUsada}
                  </p>
                  <p
                    className={`text-base font-bold font-mono ${
                      result.aprovado
                        ? "text-green-700 dark:text-green-400"
                        : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {result.cubadoPorUnidade.toFixed(3)} kg
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs text-muted-foreground">Ref. catálogo</p>
                  <p className="text-xs font-mono text-muted-foreground">kg/m³ planilha</p>
                  <p className="text-base font-bold font-mono text-blue-600">
                    {product.pesoCubico.toFixed(3)} kg
                  </p>
                </div>
              </div>

              {/* Peso */}
              {result.pesoInformado > 0 && (
                <div
                  className={`rounded-md border p-3 space-y-1.5 ${
                    result.pesoDivergente
                      ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30"
                      : "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {result.pesoDivergente ? (
                      <XCircle className="h-3.5 w-3.5 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    )}
                    <span className={`text-xs font-semibold ${result.pesoDivergente ? "text-amber-700 dark:text-amber-400" : "text-green-700 dark:text-green-400"}`}>
                      Validação do peso
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Informado</p>
                      <p className="font-bold font-mono">{result.pesoInformado.toFixed(3)} kg</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Esperado ({result.qtdUsada} × {product.peso.toFixed(3)})</p>
                      <p className="font-bold font-mono text-blue-600">{result.pesoEsperado.toFixed(3)} kg</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        Diferença{" "}
                        <span className="text-muted-foreground/70">
                          (margem {(MARGEM_PESO * 100).toFixed(0)}%)
                        </span>
                      </p>
                      <p className={`font-bold font-mono ${result.pesoDivergente ? "text-amber-600" : "text-green-600"}`}>
                        {result.diferencaPeso > 0 ? "+" : ""}{result.diferencaPeso.toFixed(3)} kg
                      </p>
                      <p className={`text-xs font-mono ${result.pesoDivergente ? "text-amber-500" : "text-green-500"}`}>
                        {result.diferencaPercent > 0 ? (result.diferencaPeso > 0 ? "+" : "-") : ""}{(result.diferencaPercent * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
