"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, TrendingUp, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { PriceHistoryModal } from "./price-history-modal";

interface InvoiceTableProps {
  invoices: any;
  onViewInvoice: (invoice: any) => void;
  onDeleteInvoice: (id: string) => void;
}

export function InvoiceTable({
  invoices,
  onViewInvoice,
  onDeleteInvoice,
}: InvoiceTableProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<any>();
  const [isPriceHistoryOpen, setIsPriceHistoryOpen] = useState(false);

  const hasObservationHistory = (invoice: any): boolean => {
    return (
      Array.isArray(invoice.observation_history) &&
      invoice.observation_history.length > 0
    );
  };

  const handleViewPriceHistory = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsPriceHistoryOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Notas Fiscais ({invoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Alertas</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice: any) => (
                  <TableRow key={invoice._id}>
                    <TableCell className="font-medium">
                      {invoice.numeroNota}
                    </TableCell>
                    <TableCell>{invoice.fornecedor?.nome}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {invoice.fornecedor?.cnpj}
                    </TableCell>
                    <TableCell>
                      {invoice?.dataEmissao
                        ? format(new Date(invoice.dataEmissao), "dd/MM/yyyy", {
                            locale: ptBR,
                          })
                        : "-"}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(invoice.valores?.vNF ?? 0)}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] space-y-2">
                        {invoice.produtos
                          .slice(0, 2)
                          .map((product: any, index: number) => (
                            <div key={index} className="text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium truncate">
                                  {product.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant="outline" className="text-xs">
                                  {product.code}
                                </Badge>
                                <span>Qtd: {product.quantity}</span>
                              </div>
                            </div>
                          ))}
                        {invoice.produtos.length > 2 && (
                          <p className="text-xs text-muted-foreground">
                            +{invoice.produtos.length - 2} produto(s)
                            adicional(is)
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {invoice.produtos.length} produto(s) total
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {hasObservationHistory(invoice) && (
                          <Badge
                            variant="destructive"
                            className="text-xs w-fit"
                          >
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Variação
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewInvoice(invoice)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {hasObservationHistory(invoice) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewPriceHistory(invoice)}
                            title="Ver histórico de preços"
                          >
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => onDeleteInvoice(invoice._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <PriceHistoryModal
        invoice={selectedInvoice}
        isOpen={isPriceHistoryOpen}
        onClose={() => {
          setIsPriceHistoryOpen(false);
          setSelectedInvoice(null);
        }}
      />
    </>
  );
}
