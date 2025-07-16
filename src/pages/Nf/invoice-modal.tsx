"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, FileText, CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ProductForm } from "./product-form";
import type { Product, Supplier, InvoiceTotals } from "./types";

import { useInvoicesService } from "@/hooks/useInvoiceService";

import { toast } from "sonner";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceModal({ isOpen, onClose }: InvoiceModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [issueDate, setIssueDate] = useState<Date>();
  const [notaFromUpload, setNotaFromUpload] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceKeyAccess, setInvoiceKeyAccess] = useState("");
  const [invoiceObservations, setInvoiceObservations] = useState("");
  const [supplier, setSupplier] = useState<Supplier>({
    name: "",
    cnpj: "",
    phone: "",
  });
  const [products, setProducts] = useState<Product[]>([
    {
      code: "",
      name: "",
      ean: "",
      ncm: "",
      quantity: 1,
      unitValue: 0,
      icmsValue: 0,
      ipiValue: 0,
      totalValue: 0,
    },
  ]);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [tab, setTab] = useState<"upload" | "manual">("upload");

  const { parseXml, saveInvoice } = useInvoicesService();
  const { mutate: parseXmlMutate } = parseXml;
  const { mutate: saveNota, isPending: saving } = saveInvoice;

  const resetForm = () => {
    setDragActive(false);
    setIssueDate(undefined);
    setNotaFromUpload(false);
    setInvoiceNumber("");
    setInvoiceKeyAccess("");
    setInvoiceObservations("");
    setSupplier({
      name: "",
      cnpj: "",
      phone: "",
    });
    setProducts([
      {
        code: "",
        name: "",
        ean: "",
        ncm: "",
        quantity: 1,
        unitValue: 0,
        icmsValue: 0,
        ipiValue: 0,
        totalValue: 0,
      },
    ]);
    setSelectedFileName(null);
    setTab("upload");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleSaveNota = () => {
    const totals = calculateTotals();

    const nota = {
      fornecedor: {
        nome: supplier.name,
        cnpj: supplier.cnpj,
        telefone: supplier.phone,
      },
      accessKey: invoiceKeyAccess,
      numeroNota: invoiceNumber,
      observations: invoiceObservations,
      dataEmissao: issueDate,
      valores: {
        vProd: totals.productsValue,
        vFrete: totals.freightValue,
        vICMS: totals.icmsTotal,
        vIPI: totals.ipiTotal,
        vNF: totals.totalValue,
      },
      produtos: products,
      manual: notaFromUpload ? false : true,
    };

    saveNota(nota, {
      onSuccess: () => {
        toast.success("Nota salva com sucesso!");
        resetForm();
        onClose();
      },
      onError: (err: any) => {
        toast.error("Erro ao salvar nota", {
          description:
            err?.response?.data?.error || "Verifique os dados enviados",
        });
      },
    });
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (!file || !(file.type === "text/xml" || file.name.endsWith(".xml")))
      return;

    setSelectedFileName(file.name);
    setNotaFromUpload(true);

    parseXmlMutate(file, {
      onSuccess: (parsed: any) => {
        const nota = parsed?.nfeProc?.NFe?.infNFe;

        setInvoiceNumber(nota?.ide?.nNF || "");
        setInvoiceKeyAccess(nota?.Id || "");

        setSupplier({
          name: nota?.emit?.xNome || "",
          cnpj: nota?.emit?.CNPJ || "",
          phone: nota?.emit?.enderEmit?.fone || "",
        });

        setIssueDate(nota?.ide?.dhEmi ? new Date(nota.ide.dhEmi) : undefined);

        setProducts(
          (Array.isArray(nota?.det) ? nota.det : [nota.det]).map((p: any) => ({
            code: p?.prod?.cProd,
            name: p?.prod?.xProd,
            ean: p?.prod?.cEAN || "",
            ncm: p?.prod?.NCM || "",
            quantity: parseFloat(p?.prod?.qCom),
            unitValue: parseFloat(p?.prod?.vUnCom),
            totalValue: parseFloat(p?.prod?.vProd),
            icmsValue: parseFloat(
              p?.imposto?.ICMS?.[Object.keys(p.imposto.ICMS || {})[0]]?.vICMS ||
                0
            ),
            ipiValue: parseFloat(p?.imposto?.IPI?.IPITrib?.vIPI || 0),
          }))
        );

        setTab("manual");
      },
    });
  };

  const calculateTotals = (): InvoiceTotals => {
    const productsValue = products.reduce(
      (sum, product) => sum + product.totalValue,
      0
    );
    const icmsTotal = products.reduce(
      (sum, product) => sum + (product.icmsValue || 0),
      0
    );
    const ipiTotal = products.reduce(
      (sum, product) => sum + (product.ipiValue || 0),
      0
    );

    return {
      productsValue,
      freightValue: 0,
      icmsTotal,
      ipiTotal,
      totalValue: productsValue,
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Nota Fiscal</DialogTitle>
          <DialogDescription>
            Adicione uma nova nota fiscal via upload de XML ou inserção manual
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(val) => setTab(val as any)}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload XML</TabsTrigger>
            <TabsTrigger value="manual">Inserção Nf</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                Arraste e solte arquivos XML aqui
              </h3>
              <p className="text-muted-foreground mb-4">
                ou clique para selecionar arquivos
              </p>
              <input
                id="xml-upload"
                type="file"
                accept=".xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFiles(e.target.files);
                  }
                }}
              />
              <label htmlFor="xml-upload">
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">
                    <FileText className="w-4 h-4 mr-2" />
                    Selecionar Arquivos
                  </span>
                </Button>
              </label>

              {selectedFileName && (
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedFileName}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Formatos aceitos: .xml (máximo 10MB por arquivo)
              </p>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Informações da Nota Fiscal
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice-number">Número da NF *</Label>
                  <Input
                    id="invoice-number"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="000001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issue-date">Data de Emissão *</Label>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-transparent"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {issueDate
                          ? format(issueDate, "dd/MM/yyyy", { locale: ptBR })
                          : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={issueDate}
                        onSelect={(date) => {
                          setIssueDate(date);
                        }}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Dados do Fornecedor</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier-name">Nome do Fornecedor *</Label>
                  <Input
                    id="supplier-name"
                    placeholder="Nome do fornecedor"
                    value={supplier.name}
                    onChange={(e) =>
                      setSupplier({ ...supplier, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier-cnpj">CNPJ *</Label>
                  <Input
                    id="supplier-cnpj"
                    placeholder="00.000.000/0000-00"
                    value={supplier.cnpj}
                    onChange={(e) =>
                      setSupplier({ ...supplier, cnpj: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier-phone">Telefone</Label>
                  <Input
                    id="supplier-phone"
                    placeholder="(00) 0000-0000"
                    value={supplier.phone || ""}
                    onChange={(e) =>
                      setSupplier({ ...supplier, phone: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <ProductForm products={products} onProductsChange={setProducts} />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resumo Financeiro</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Valor dos Produtos</Label>
                  <Input
                    type="text"
                    value={new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(calculateTotals().productsValue)}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total ICMS</Label>
                  <Input
                    type="text"
                    value={new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(calculateTotals().icmsTotal)}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Total da Nota</Label>
                  <Input
                    type="text"
                    value={new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(calculateTotals().totalValue)}
                    disabled
                    className="bg-muted font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                placeholder="Observações adicionais (opcional)"
                rows={2}
                onChange={(e) => setInvoiceObservations(e.target.value)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                onClick={handleSaveNota}
                disabled={saving}
              >
                <Plus className="w-4 h-4 mr-2" />
                {saving ? "Salvando..." : "Salvar Nota Fiscal"}
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
