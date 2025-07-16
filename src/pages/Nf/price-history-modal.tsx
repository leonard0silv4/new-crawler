import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Search,
} from "lucide-react";

interface UnifiedPriceHistoryModalProps {
  invoice: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PriceHistoryModal({
  invoice,
  isOpen,
  onClose,
}: UnifiedPriceHistoryModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const produtos = invoice?.produtos || [];
  const observacoes = invoice?.observation_history || [];

  const productsWithHistory = useMemo(() => {
    return produtos.map((produto: any) => {
      const history = observacoes
        .filter((obs: any) => obs.code === produto.code)
        .map((obs: any) => ({
          date: new Date(obs.dataNotaAnterior),
          invoiceNumber: obs.numeroNotaAnterior,
          supplier: obs.fornecedorAnterior,
          price: obs.unitValueAnterior,
          quantity: null,
          previousPrice: null,
          variation:
            ((obs.unitValueAtual - obs.unitValueAnterior) /
              obs.unitValueAnterior) *
            100,
        }))
        .concat([
          {
            date: new Date(invoice.dataEmissao),
            invoiceNumber: invoice.numeroNota,
            supplier: invoice.fornecedor?.nome,
            price: produto.unitValue,
            quantity: produto.quantity,
            previousPrice: null,
            variation: null,
          },
        ])
        .sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

      return {
        ...produto,
        history,
        hasSignificantVariation: history.some((h: any, i: any, arr: any) => {
          const next = arr[i + 1];
          if (!next) return false;
          const v = ((h.price - next.price) / next.price) * 100;
          return Math.abs(v) > 5;
        }),
      };
    });
  }, [produtos, observacoes, invoice]);

  const filteredProducts = productsWithHistory.filter((p: any) =>
    `${p.name} ${p.code}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allHistoryEntries = productsWithHistory
    .flatMap((p: any) =>
      p.history.map((h: any) => ({
        ...h,
        productName: p.name,
        productCode: p.code,
      }))
    )
    .sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  const productsWithVariations = productsWithHistory.filter(
    (p: any) => p.hasSignificantVariation
  );

  const getPriceIcon = (variation: number) => {
    if (variation > 0) return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (variation < 0)
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getVariationBadge = (variation: number) => {
    if (variation === null || Math.abs(variation) < 1) return null;
    const variant = variation > 0 ? "destructive" : "default";
    const sign = variation > 0 ? "+" : "";
    return (
      <Badge variant={variant} className="text-xs">
        {sign}
        {variation.toFixed(1)}%
      </Badge>
    );
  };

  const averagePrice = (history: any[]) => {
    return (
      history.reduce((sum, entry) => sum + entry.price, 0) / history.length
    );
  };

  const minPrice = (history: any[]) => {
    return Math.min(...history.map((entry) => entry.price));
  };

  const maxPrice = (history: any[]) => {
    return Math.max(...history.map((entry) => entry.price));
  };

  if (!invoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Preços Completo</DialogTitle>
          <DialogDescription>
            Análise de alterações de preço na nota fiscal #{invoice.numeroNota}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="products">Por Produto</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
            <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Resumo por Produto</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Preço Atual</TableHead>
                      <TableHead>Preço Médio</TableHead>
                      <TableHead>Menor Preço</TableHead>
                      <TableHead>Maior Preço</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productsWithHistory
                      .slice(0, 10)
                      .map((product: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="max-w-[300px]">
                              <p
                                className="font-medium truncate"
                                title={product.name}
                              >
                                {product.name}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {product.code}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(product.unitValue)}
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(averagePrice(product.history))}
                          </TableCell>
                          <TableCell className="text-green-600">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(minPrice(product.history))}
                          </TableCell>
                          <TableCell className="text-red-600">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(maxPrice(product.history))}
                          </TableCell>
                          <TableCell>
                            {product.hasSignificantVariation ? (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Variação
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Estável
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                {productsWithHistory.length > 10 && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Mostrando 10 de {productsWithHistory.length} produtos
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produto por nome ou SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            {filteredProducts.map((product: any, index: number) => (
              <Card key={index} className="mb-4">
                <CardHeader>
                  <CardTitle>{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Nota Fiscal</TableHead>
                        <TableHead>Fornecedor</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead>Variação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.history.map((entry: any, i: number) => {
                        const next = product.history[i + 1];
                        const variation = next
                          ? ((entry.price - next.price) / next.price) * 100
                          : null;
                        return (
                          <TableRow key={i}>
                            <TableCell>
                              {format(entry.date, "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </TableCell>
                            <TableCell>{entry.invoiceNumber}</TableCell>
                            <TableCell>{entry.supplier}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(entry.price)}
                            </TableCell>
                            <TableCell className="flex gap-2 items-center">
                              {variation !== null && getPriceIcon(variation)}
                              {variation !== null &&
                                getVariationBadge(variation)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Produtos com Variações Significativas (
                  {productsWithVariations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {productsWithVariations.length > 0 ? (
                  <div className="space-y-4">
                    {productsWithVariations.map(
                      (product: any, index: number) => (
                        <div
                          key={index}
                          className="border rounded-lg p-4 bg-orange-50 border-orange-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-lg leading-tight break-words mb-2">
                                {product.name}
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                SKU: {product.code}
                              </Badge>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-sm text-muted-foreground">
                                Preço Atual
                              </p>
                              <p className="text-xl font-bold text-green-600">
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(product.unitValue)}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h5 className="font-medium text-sm text-muted-foreground">
                              Últimas Variações:
                            </h5>
                            {product.history
                              .slice(0, 3)
                              .map((history: any, histIndex: number) => {
                                const variation =
                                  histIndex < product.history.length - 1
                                    ? ((history.price -
                                        product.history[histIndex + 1].price) /
                                        product.history[histIndex + 1].price) *
                                      100
                                    : 0;

                                return (
                                  <div
                                    key={histIndex}
                                    className="flex items-center justify-between text-sm bg-white p-2 rounded"
                                  >
                                    <div className="flex items-center gap-2">
                                      {histIndex < product.history.length - 1 &&
                                        getPriceIcon(variation)}
                                      <span>
                                        {format(history.date, "dd/MM/yyyy", {
                                          locale: ptBR,
                                        })}
                                      </span>
                                      <span className="text-muted-foreground">
                                        NF: {history.invoiceNumber}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span>
                                        {new Intl.NumberFormat("pt-BR", {
                                          style: "currency",
                                          currency: "BRL",
                                        }).format(history.price)}
                                      </span>
                                      {histIndex < product.history.length - 1 &&
                                        getVariationBadge(variation)}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum produto com variações significativas encontrado.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Linha do Tempo Completa</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Histórico cronológico de todas as variações de preços
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Nota Fiscal</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Variação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allHistoryEntries
                      .slice(0, 20)
                      .map((entry: any, index: number) => {
                        const previousEntry = allHistoryEntries.find(
                          (e: any, i: any) =>
                            i > index && e.productCode === entry.productCode
                        );
                        const variation = previousEntry
                          ? ((entry.price - previousEntry.price) /
                              previousEntry.price) *
                            100
                          : 0;

                        return (
                          <TableRow key={index}>
                            <TableCell>
                              {format(entry.date, "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[230px]">
                                <p
                                  title={entry.productName}
                                  className="truncate"
                                >
                                  {entry.productName}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{entry.productCode}</TableCell>
                            <TableCell>{entry.invoiceNumber}</TableCell>
                            <TableCell>{entry.supplier}</TableCell>
                            <TableCell>
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(entry.price)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {previousEntry && getPriceIcon(variation)}
                                {previousEntry && getVariationBadge(variation)}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
