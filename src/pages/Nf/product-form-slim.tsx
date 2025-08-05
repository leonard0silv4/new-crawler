"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";
import { ProductAutocomplete } from "./subcomponents/product-autocomplete";
import type { Product } from "./types";

interface ProductFormProps {
  products: Product[];
  onProductsChange: (products: Product[]) => void;
}

export function ProductFormSlim({
  products,
  onProductsChange,
}: ProductFormProps) {
  const addProduct = () => {
    onProductsChange([
      ...products,
      {
        code: "",
        name: "",
        box: 1,
        quantity: 0,
        boxValue: 0,
        qtdBox: 1,
        unitValue: 0,
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
    const isNumericField: (keyof Product)[] = [
      "box",
      "quantity",
      "boxValue",
      "qtdBox",
      "unitValue",
      "totalValue",
    ];

    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: isNumericField.includes(field)
        ? Number.parseFloat(value as string) || 0
        : value,
    };

    const box = updatedProducts[index].box ?? 0;
    const boxValue = updatedProducts[index].boxValue ?? 0;
    const qtdBox = updatedProducts[index].qtdBox ?? 0;
    const unitValue = qtdBox > 0 ? boxValue / qtdBox : 0;
    const totalValue = box * boxValue;

    updatedProducts[index].unitValue = Number.parseFloat(unitValue.toFixed(2));
    updatedProducts[index].totalValue = Number.parseFloat(
      totalValue.toFixed(2)
    );

    onProductsChange(updatedProducts);
  };

  const handleProductSelect = (index: number, name: string, sku?: string) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      name: name,
      ...(sku && { code: sku }),
    };
    onProductsChange(updatedProducts);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Produtos</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addProduct}
          className="flex items-center gap-2 bg-transparent"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </div>

      <div className="space-y-4">
        {products.map((product, index) => (
          <Card key={index} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-10 gap-4 items-end">
              <div className="space-y-1">
                <Label htmlFor={`product-code-${index}`}>SKU</Label>
                <Input
                  id={`product-code-${index}`}
                  value={product.code}
                  onChange={(e) => updateProduct(index, "code", e.target.value)}
                  placeholder="SKU"
                />
              </div>

              <div className="space-y-1  md:col-span-4">
                <Label htmlFor={`product-name-${index}`}>Nome</Label>
                <ProductAutocomplete
                  value={product.name}
                  onValueChange={(name) => handleProductSelect(index, name)}
                  onSelect={(name, sku) =>
                    handleProductSelect(index, name, sku)
                  }
                  placeholder="Digite ou selecione um produto..."
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`product-box-${index}`}>Caixas</Label>
                <Input
                  id={`product-box-${index}`}
                  type="number"
                  min="0"
                  step="1"
                  value={product.box}
                  onChange={(e) => updateProduct(index, "box", e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`product-quantity-${index}`}>Quantidade</Label>
                <Input
                  id={`product-quantity-${index}`}
                  type="number"
                  min="0"
                  step="1"
                  value={product.quantity}
                  onChange={(e) =>
                    updateProduct(index, "quantity", e.target.value)
                  }
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`product-box-value-${index}`}>
                  Valor Caixa
                </Label>
                <Input
                  id={`product-box-value-${index}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={product.boxValue}
                  onChange={(e) =>
                    updateProduct(index, "boxValue", e.target.value)
                  }
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor={`product-qtd-box-${index}`}>Qtd/Caixa</Label>
                <Input
                  id={`product-qtd-box-${index}`}
                  type="number"
                  min="1"
                  step="1"
                  value={product.qtdBox}
                  onChange={(e) =>
                    updateProduct(index, "qtdBox", e.target.value)
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeProduct(index)}
                  disabled={products.length <= 1}
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
              <div className="space-y-1">
                <Label>Valor Unitário</Label>
                <div className="text-sm font-medium text-muted-foreground">
                  R$ {product.unitValue.toFixed(2)}
                </div>
              </div>
              <div className="space-y-1">
                <Label>Valor Total</Label>
                <div className="text-sm font-medium text-muted-foreground">
                  R$ {product.totalValue.toFixed(2)}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
