"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { normalizeToXml } from "@/utils/xml";
import { Button } from "@/components/ui/button";
import { FileDown, Printer } from "lucide-react";
import instance from "@/config/axios";
import { toast } from "sonner";
import { useInvoicesService } from "@/hooks/useInvoiceService";

interface InvoiceViewModalProps {
  invoice: any;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceViewModal({
  invoice,
  isOpen,
  onClose,
}: InvoiceViewModalProps) {
  if (!invoice) return null;

  const { updateInvoice } = useInvoicesService();

  const handleDownloadXml = () => {
    const xmlString = normalizeToXml(invoice);
    const blob = new Blob([xmlString], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `NF-${invoice.numeroNota || "sem-numero"}.xml`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadNotaPdf = async (
    invoiceId: string,
    numeroNota?: string
  ) => {
    try {
      const response: any = await instance.post(
        "/nfe/pdf",
        { id: invoiceId },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `nota-${numeroNota || "sem-numero"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Erro ao gerar PDF da nota fiscal!");
      console.error(err);
    }
  };

  const updateFieldInvoice = (
    ev: React.FocusEvent<HTMLElement>,
    field: string,
    id: string
  ) => {
    const newValue = ev.currentTarget.textContent?.trim();
    if (!newValue) return;

    let currentValue;

    if (["nome", "cnpj", "telefone", "endereco"].includes(field)) {
      currentValue = invoice.fornecedor?.[field]?.toString().trim() || "";
    } else {
      currentValue = invoice?.[field]?.toString().trim() || "";
    }

    if (newValue === currentValue) return; // ⛔️ Sem mudanças, não atualiza

    const payload =
      field === "nome" ||
      field === "cnpj" ||
      field === "telefone" ||
      field === "endereco"
        ? { fornecedor: { [field]: newValue } }
        : { [field]: newValue };

    updateInvoice.mutate({ id, payload });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto ">
        <DialogHeader className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Detalhes da Nota Fiscal</DialogTitle>
              <DialogDescription>
                Visualização completa da nota fiscal #{invoice.numeroNota}
              </DialogDescription>
            </div>
            <div className="hidden md:flex gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  handleDownloadNotaPdf(invoice._id, invoice.numeroNota)
                }
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              <Button variant="outline" onClick={handleDownloadXml}>
                <FileDown className="w-4 h-4 mr-2" />
                Baixar XML
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div id="printable" className="space-y-6 ">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Informações da Nota Fiscal
              </CardTitle>
              {invoice.accessKey && (
                <div className="hidden md:block text-sm text-muted-foreground">
                  <span className="font-medium">Chave de acesso:</span>{" "}
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {invoice.accessKey}
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Número da NF
                  </p>
                  <p
                    onBlur={(e) => {
                      updateFieldInvoice(e, "numeroNota", invoice._id);
                    }}
                    contentEditable
                    suppressContentEditableWarning={true}
                    className="text-xl font-bold"
                  >
                    {invoice.numeroNota || "Não informado"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Data de Emissão
                  </p>
                  <p className="text-lg">
                    {invoice.dataEmissao
                      ? format(invoice.dataEmissao, "dd/MM/yyyy", {
                          locale: ptBR,
                        })
                      : "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Qtd. Produtos
                  </p>
                  <p className="text-lg font-semibold">
                    {invoice.produtos.length}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Valor Total
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(invoice.valores.vNF)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados do Fornecedor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Nome
                  </p>
                  <p
                    onBlur={(e) => {
                      updateFieldInvoice(e, "nome", invoice._id);
                    }}
                    contentEditable
                    suppressContentEditableWarning={true}
                    className="text-lg font-medium"
                  >
                    {invoice.fornecedor.nome || "Não informado"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    CNPJ
                  </p>
                  <p
                    onBlur={(e) => {
                      updateFieldInvoice(e, "cnpj", invoice._id);
                    }}
                    contentEditable
                    suppressContentEditableWarning={true}
                    className="text-lg font-mono"
                  >
                    {invoice.fornecedor.cnpj || "Não informado"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Telefone
                  </p>
                  <p
                    onBlur={(e) => {
                      updateFieldInvoice(e, "telefone", invoice._id);
                    }}
                    contentEditable
                    suppressContentEditableWarning={true}
                    className="text-lg"
                  >
                    {invoice.fornecedor.telefone || "Não informado"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Endereço
                  </p>
                  <p
                    onBlur={(e) => {
                      updateFieldInvoice(e, "endereco", invoice._id);
                    }}
                    contentEditable
                    suppressContentEditableWarning={true}
                    className="text-lg font-medium"
                  >
                    {invoice.fornecedor.endereco || "Não informado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Lista de Produtos ({invoice.produtos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoice.produtos.map((product: any, index: number) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 bg-muted/30"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg leading-tight mb-1 break-words">
                          {product.name}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            SKU: {product.code}
                          </Badge>
                          {product.ean && (
                            <Badge variant="outline" className="text-xs">
                              EAN: {product.ean}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            NCM: {product.ncm}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm text-muted-foreground">
                          Total do Item
                        </p>
                        <p className="text-xl font-bold text-green-600">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(product.totalValue)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-4 text-sm">
                      {product.box !== undefined && (
                        <div className="space-y-1">
                          <span className="font-medium text-muted-foreground">
                            Caixas
                          </span>
                          <p className="text-base font-semibold">
                            {product.box}
                          </p>
                        </div>
                      )}
                      {product.boxValue !== undefined && (
                        <div className="space-y-1">
                          <span className="font-medium text-muted-foreground">
                            Valor por Caixa
                          </span>
                          <p className="text-base font-semibold">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(product.boxValue)}
                          </p>
                        </div>
                      )}
                      {product.qtdBox !== undefined && (
                        <div className="space-y-1">
                          <span className="font-medium text-muted-foreground">
                            Qtd por Caixa
                          </span>
                          <p className="text-base font-semibold">
                            {product.qtdBox}
                          </p>
                        </div>
                      )}

                      {/* Quantidade */}
                      {product.quantity !== undefined && (
                        <div className="space-y-1">
                          <span className="font-medium text-muted-foreground">
                            Quantidade
                          </span>
                          <p className="text-base font-semibold">
                            {product.quantity}
                          </p>
                        </div>
                      )}

                      {/* Valor Unitário */}
                      <div className="space-y-1">
                        <span className="font-medium text-muted-foreground">
                          Valor Unitário
                        </span>
                        <p className="text-base font-semibold">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(product.unitValue)}
                        </p>
                      </div>

                      {/* ICMS */}
                      <div className="space-y-1">
                        <span className="font-medium text-muted-foreground">
                          ICMS
                        </span>
                        <p className="text-base">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(product.icmsValue || 0)}
                        </p>
                      </div>

                      {/* IPI */}
                      <div className="space-y-1">
                        <span className="font-medium text-muted-foreground">
                          IPI
                        </span>
                        <p className="text-base">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(product.ipiValue || 0)}
                        </p>
                      </div>

                      {/* Subtotal */}
                      <div className="space-y-1">
                        <span className="font-medium text-muted-foreground">
                          Subtotal
                        </span>
                        <p className="text-base font-bold">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(product.totalValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Valor dos Produtos
                    </p>
                    <p className="text-lg font-bold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(invoice.valores.vProd)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Valor do Frete
                    </p>
                    <p className="text-lg font-bold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(invoice.valores.vFrete)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total ICMS</p>
                    <p className="text-lg font-bold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(invoice.valores.vICMS)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total IPI</p>
                    <p className="text-lg font-bold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(invoice.valores.vIPI)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-lg text-muted-foreground mb-1">
                    Valor Total da Nota Fiscal
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(invoice.valores.vNF)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {invoice.observations && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {invoice.observations}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
