"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";
import type { Product } from "./types";

interface ProductFormProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
}

export function ProductForm({ products, onProductsChange }: ProductFormProps) {
  const addProduct = () => {
    onProductsChange([
      ...products,
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
  };

  const removeProduct = (index: number) => {
    if (products.length > 1) {
      onProductsChange(products.filter((_, i) => i !== index));
    }
  };

  const updateProduct = (
    index: number,
    field: keyof Product,
    value: string | number
  ) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };

    // Recalcular total da linha quando quantidade ou valor unitário mudar
    if (field === "quantity" || field === "unitValue") {
      updatedProducts[index].totalValue =
        updatedProducts[index].quantity * updatedProducts[index].unitValue;
    }

    onProductsChange(updatedProducts);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Produtos</Label>
        <Button type="button" variant="outline" size="sm" onClick={addProduct}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Produto
        </Button>
      </div>

      <div className="space-y-4">
        {products.map((product, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-4">
              {/* Primeira linha - Informações básicas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`product-code-${index}`}>Código/SKU *</Label>
                  <Input
                    id={`product-code-${index}`}
                    placeholder="Código do produto"
                    value={product.code}
                    onChange={(e) =>
                      updateProduct(index, "code", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`product-name-${index}`}>
                    Nome do Produto *
                  </Label>
                  <Input
                    id={`product-name-${index}`}
                    placeholder="Nome do produto"
                    value={product.name}
                    onChange={(e) =>
                      updateProduct(index, "name", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`product-ean-${index}`}>
                    Código EAN/GTIN
                  </Label>
                  <Input
                    id={`product-ean-${index}`}
                    placeholder="Código de barras"
                    value={product.ean || ""}
                    onChange={(e) =>
                      updateProduct(index, "ean", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Segunda linha - NCM e valores */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`product-ncm-${index}`}>NCM *</Label>
                  <Input
                    id={`product-ncm-${index}`}
                    placeholder="00000000"
                    value={product.ncm}
                    onChange={(e) =>
                      updateProduct(index, "ncm", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`product-quantity-${index}`}>
                    Quantidade *
                  </Label>
                  <Input
                    id={`product-quantity-${index}`}
                    type="number"
                    min="0"
                    step="0.001"
                    placeholder="1"
                    value={product.quantity}
                    onChange={(e) =>
                      updateProduct(
                        index,
                        "quantity",
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`product-unit-value-${index}`}>
                    Valor Unitário *
                  </Label>
                  <Input
                    id={`product-unit-value-${index}`}
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={product.unitValue}
                    onChange={(e) =>
                      updateProduct(
                        index,
                        "unitValue",
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total da Linha</Label>
                  <Input
                    type="text"
                    value={new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(product.totalValue)}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              {/* Terceira linha - Impostos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`product-icms-${index}`}>Valor ICMS</Label>
                  <Input
                    id={`product-icms-${index}`}
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={product.icmsValue || 0}
                    onChange={(e) =>
                      updateProduct(
                        index,
                        "icmsValue",
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`product-ipi-${index}`}>Valor IPI</Label>
                  <Input
                    id={`product-ipi-${index}`}
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={product.ipiValue || 0}
                    onChange={(e) =>
                      updateProduct(
                        index,
                        "ipiValue",
                        Number.parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="flex items-end">
                  {products.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeProduct(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Minus className="w-4 h-4 mr-2" />
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
