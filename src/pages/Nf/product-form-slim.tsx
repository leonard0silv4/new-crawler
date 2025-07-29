"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";
import type { Product } from "./types";
import { ProductAutocompleteInput } from "./product-autocomplete-input";

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
        ean: "",
        ncm: "",
        icmsValue: 0,
        ipiValue: 0,
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
      "icmsValue",
      "ipiValue",
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
    const quantity = box * qtdBox;

    updatedProducts[index].unitValue = Number.parseFloat(unitValue.toFixed(2));
    updatedProducts[index].totalValue = Number.parseFloat(
      totalValue.toFixed(2)
    );
    updatedProducts[index].quantity = Number.parseFloat(quantity.toFixed(0));

    onProductsChange(updatedProducts);
  };

  const handleProductAutocompleteSelect = (
    index: number,
    selectedProduct: Pick<Product, "name" | "code">
  ) => {
    const newProducts = [...products];
    newProducts[index] = {
      ...newProducts[index],
      name: selectedProduct.name,
      code: selectedProduct.code,
    };

    onProductsChange(newProducts);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Produtos</Label>
      </div>
      <div className="space-y-4">
        {products.map((product, index) => (
          <Card key={index} className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div className="space-y-1 md:col-span-3">
                <Label htmlFor={`product-name-${index}`}>Nome</Label>

                <ProductAutocompleteInput
                  value={{ name: product.name, code: product.code }}
                  onSelect={(selected) => {
                    handleProductAutocompleteSelect(index, selected);
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`product-box-${index}`}>Caixas</Label>
                <Input
                  id={`product-box-${index}`}
                  type="number"
                  value={product.box ?? 0}
                  onChange={(e) => updateProduct(index, "box", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`product-boxValue-${index}`}>
                  Valor por Caixa
                </Label>
                <Input
                  id={`product-boxValue-${index}`}
                  type="number"
                  step="0.01"
                  value={product.boxValue ?? 0}
                  onChange={(e) =>
                    updateProduct(index, "boxValue", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`product-qtdBox-${index}`}>Qtd por Caixa</Label>
                <Input
                  id={`product-qtdBox-${index}`}
                  type="number"
                  value={product.qtdBox ?? 0}
                  onChange={(e) =>
                    updateProduct(index, "qtdBox", e.target.value)
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Valor Unitário</Label>
                <Input
                  type="text"
                  value={new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(product.unitValue ?? 0)}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-1">
                <Label>Valor Total</Label>
                <Input
                  type="text"
                  value={new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(product.totalValue ?? 0)}
                  disabled
                  className="bg-muted"
                />
              </div>
              {products.length > 1 && (
                <div className="mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProduct(index)}
                    className="text-destructive"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addProduct}>
          <Plus className="w-4 h-4 mr-2" /> Adicionar Produto
        </Button>
      </div>
    </div>
  );
}
