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
import { ScrollArea } from "@/components/ui/scroll-area";
import { type CatalogProduct } from "@/hooks/useCatalogProduct";
import {
  CheckCircle2,
  XCircle,
  Package,
  Ruler,
  Weight,
  Calculator,
  Trash2,
} from "lucide-react";

/** Margem de tolerância para divergência de peso (ex: 0.05 = 5%) */
const MARGEM_PESO = 0.05;

export interface PackageItem {
  product: CatalogProduct;
  qty: string;
}

interface PackageResult {
  cubadoCaixa: number;
  cubadoLimiteTotal: number;
  cubadoAprovado: boolean;
  pesoInformado: number;
  pesoEsperado: number;
  diferencaPeso: number;
  diferencaPercent: number;
  pesoDivergente: boolean;
}

interface VerifyPackageModalProps {
  items: PackageItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem: (id: string) => void;
  onQtyChange: (id: string, qty: string) => void;
  onClear: () => void;
}

export function VerifyPackageModal({
  items,
  isOpen,
  onClose,
  onRemoveItem,
  onQtyChange,
  onClear,
}: VerifyPackageModalProps) {
  const [largura, setLargura] = useState("");
  const [comprimento, setComprimento] = useState("");
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [result, setResult] = useState<PackageResult | null>(null);

  const larguraRef = useRef<HTMLInputElement>(null);
  const comprimentoRef = useRef<HTMLInputElement>(null);
  const alturaRef = useRef<HTMLInputElement>(null);
  const pesoRef = useRef<HTMLInputElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setLargura("");
      setComprimento("");
      setAltura("");
      setPeso("");
      setResult(null);
      setTimeout(() => larguraRef.current?.focus(), 80);
    }
  }, [isOpen]);

  const handleEnterNext = (
    e: React.KeyboardEvent<HTMLInputElement>,
    next: React.RefObject<HTMLInputElement | HTMLButtonElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      next.current?.focus();
    }
  };

  const camposVazios =
    !largura.trim() || !comprimento.trim() || !altura.trim() || !peso.trim();

  const todosComQty = items.every((i) => i.qty.trim() !== "" && parseFloat(i.qty.replace(",", ".")) > 0);

  const handleConferir = useCallback(() => {
    const l = parseFloat(largura.replace(",", ".")) || 0;
    const c = parseFloat(comprimento.replace(",", ".")) || 0;
    const a = parseFloat(altura.replace(",", ".")) || 0;
    const p = parseFloat(peso.replace(",", ".")) || 0;

    const cubadoCaixa = (l * c * a) / 5900;

    const cubadoLimiteTotal = items.reduce((sum, item) => {
      const q = parseFloat(item.qty.replace(",", ".")) || 1;
      return sum + item.product.pesoCubico * q;
    }, 0);

    const cubadoAprovado = cubadoCaixa <= cubadoLimiteTotal;

    const pesoEsperado = items.reduce((sum, item) => {
      const q = parseFloat(item.qty.replace(",", ".")) || 1;
      return sum + item.product.peso * q;
    }, 0);

    const diferencaPeso = p - pesoEsperado;
    const diferencaPercent =
      pesoEsperado > 0 ? Math.abs(diferencaPeso) / pesoEsperado : 0;
    const pesoDivergente = pesoEsperado > 0 && diferencaPercent > MARGEM_PESO;

    setResult({
      cubadoCaixa,
      cubadoLimiteTotal,
      cubadoAprovado,
      pesoInformado: p,
      pesoEsperado,
      diferencaPeso,
      diferencaPercent,
      pesoDivergente,
    });
  }, [largura, comprimento, altura, peso, items]);

  const handleBtnKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleConferir();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-full max-w-2xl h-[90vh] flex flex-col p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5" />
              Verificar Pacote
              <Badge variant="secondary" className="ml-1">
                {items.length} produto{items.length !== 1 ? "s" : ""}
              </Badge>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-destructive gap-1.5 mr-6"
              onClick={() => { onClear(); onClose(); }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpar pacote
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 px-6 pb-6 pt-4">
          <div className="space-y-4">
            {/* Lista de produtos do pacote */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Produtos no pacote
              </p>
              {items.map((item) => (
                <div
                  key={item.product._id}
                  className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3 py-2"
                >
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-sm font-medium truncate">
                      {item.product.produto}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge
                        variant="outline"
                        className="font-mono text-xs px-1.5 py-0"
                      >
                        {item.product.sku1}
                      </Badge>
                      {item.product.sku2 && (
                        <Badge
                          variant="outline"
                          className="font-mono text-xs px-1.5 py-0"
                        >
                          {item.product.sku2}
                        </Badge>
                      )}
                                {item.product.sku3 && (
                        <Badge
                          variant="outline"
                          className="font-mono text-xs px-1.5 py-0"
                        >
                          {item.product.sku3}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        P.Cúb: {item.product.pesoCubico.toFixed(3)} kg · Peso:{" "}
                        {item.product.peso.toFixed(3)} kg
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-20">
                      <Input
                        value={item.qty}
                        onChange={(e) => {
                          onQtyChange(item.product._id, e.target.value);
                          setResult(null);
                        }}
                        placeholder="Qtd"
                        className="h-7 text-xs text-center"
                        inputMode="decimal"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveItem(item.product._id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Dimensões do pacote */}
            <div className="space-y-3 p-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Dimensões do pacote
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="pkg-largura"
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <Ruler className="h-3 w-3" />
                    Largura (cm)
                  </Label>
                  <Input
                    id="pkg-largura"
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
                  <Label
                    htmlFor="pkg-comprimento"
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <Ruler className="h-3 w-3 rotate-90" />
                    Comprimento (cm)
                  </Label>
                  <Input
                    id="pkg-comprimento"
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
                  <Label
                    htmlFor="pkg-altura"
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <Ruler className="h-3 w-3" />
                    Altura (cm)
                  </Label>
                  <Input
                    id="pkg-altura"
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
                <div className="space-y-1.5">
                  <Label
                    htmlFor="pkg-peso"
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <Weight className="h-3 w-3" />
                    Peso total (kg)
                  </Label>
                  <Input
                    id="pkg-peso"
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
            </div>

            {(camposVazios || !todosComQty) && (
              <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" />
                {!todosComQty
                  ? "Informe a quantidade de cada produto."
                  : "Preencha todas as dimensões e o peso do pacote."}
              </p>
            )}
            <div className="px-1">
            <Button
              ref={btnRef}
              className="w-full"
              onClick={handleConferir}
              onKeyDown={handleBtnKeyDown}
              disabled={camposVazios || !todosComQty}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Conferir Pacote
            </Button>
            </div>

            {/* Resultado */}
            {result && (
              <>
                <Separator />
                <div
                  className={`rounded-lg border p-4 space-y-3 ${
                    result.cubadoAprovado
                      ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30"
                      : "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {result.cubadoAprovado ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span
                      className={`text-base font-bold ${
                        result.cubadoAprovado
                          ? "text-green-700 dark:text-green-400"
                          : "text-red-700 dark:text-red-400"
                      }`}
                    >
                      {result.cubadoAprovado ? "APROVADO" : "REPROVADO"}
                    </span>
                    {result.pesoDivergente && (
                      <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                        · PESO DIVERGENTE
                      </span>
                    )}
                  </div>

                  {/* Cubado */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        Cubado do pacote
                      </p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {largura}×{comprimento}×{altura} ÷ 5900
                      </p>
                      <p
                        className={`text-base font-bold font-mono ${
                          result.cubadoAprovado
                            ? "text-green-700 dark:text-green-400"
                            : "text-red-700 dark:text-red-400"
                        }`}
                      >
                        {result.cubadoCaixa.toFixed(3)} kg
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground">
                        Limite total (Σ catálogo × qtd)
                      </p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {items
                          .map(
                            (i) =>
                              `${i.product.pesoCubico.toFixed(3)}×${i.qty || "1"}`
                          )
                          .join(" + ")}
                      </p>
                      <p className="text-base font-bold font-mono text-blue-600">
                        {result.cubadoLimiteTotal.toFixed(3)} kg
                      </p>
                    </div>
                  </div>

                  {/* Peso */}
                  <div
                    className={`rounded-md border p-3 space-y-1.5 ${
                      result.pesoDivergente
                        ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30"
                        : "border-green-200 bg-green-50/50 dark:border-green-800"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {result.pesoDivergente ? (
                        <XCircle className="h-3.5 w-3.5 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      )}
                      <span
                        className={`text-xs font-semibold ${
                          result.pesoDivergente
                            ? "text-amber-700 dark:text-amber-400"
                            : "text-green-700 dark:text-green-400"
                        }`}
                      >
                        Validação do peso
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Informado</p>
                        <p className="font-bold font-mono">
                          {result.pesoInformado.toFixed(3)} kg
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          Esperado (Σ catálogo)
                        </p>
                        <p className="font-bold font-mono text-blue-600">
                          {result.pesoEsperado.toFixed(3)} kg
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          Diferença (margem {(MARGEM_PESO * 100).toFixed(0)}%)
                        </p>
                        <p
                          className={`font-bold font-mono ${
                            result.pesoDivergente
                              ? "text-amber-600"
                              : "text-green-600"
                          }`}
                        >
                          {result.diferencaPeso > 0 ? "+" : ""}
                          {result.diferencaPeso.toFixed(3)} kg
                        </p>
                        <p
                          className={`text-xs font-mono ${
                            result.pesoDivergente
                              ? "text-amber-500"
                              : "text-green-500"
                          }`}
                        >
                          {result.diferencaPeso > 0 ? "+" : ""}
                          {(result.diferencaPercent * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
