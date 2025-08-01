"use client";

import { useState } from "react";
import { Plus, Upload, Edit, Trash2, Search, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ProductForm } from "./product-form";
import { ImportProducts } from "./import-products";
import { useProductsService } from "@/hooks/useProduct";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { DeleteAllModal } from "./delete-modal";

export interface Product {
  id: string;
  _id: string;
  nome: string;
  sku: string;
  descricao: string;
  preco: number;
}

export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const { productsQuery, createProduct, updateProduct, deleteProduct } =
    useProductsService({ searchTerm });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    productsQuery;

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const allProducts = data?.pages.flatMap((page: any) => page.data) || [];

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleAddProduct = async (productData: any) => {
    await createProduct.mutateAsync(productData);
    setIsFormOpen(false);
  };

  const handleEditProduct = async (productData: any) => {
    if (editingProduct) {
      await updateProduct.mutateAsync({
        id: editingProduct._id,
        update: productData,
      });
      setIsFormOpen(false);
      setEditingProduct(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br ">
      <div className="container mx-auto p-6 max-w-7xl space-y-8">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Catálogo de produtos
              </h1>
              <p className="text-muted-foreground">
                Cadastre, edite e importe produtos para seu catálogo
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                onClick={() => setIsImportOpen(true)}
                variant="outline"
                className="w-full sm:w-auto bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
              >
                <Upload className="mr-2 h-4 w-4" />
                Importar Excel
              </Button>
              <Button onClick={openAddForm}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Button>
              {allProducts.length != 0 && (
                <Button onClick={() => setIsModalDeleteOpen(true)} className="">
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  Deletar todos produtos
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Procurar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Products Card */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Produtos Cadastrados
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-slate-700">
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                      Nome
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                      SKU
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">
                      Descrição
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                      Preço
                    </TableHead>
                    <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                            <Search className="h-8 w-8 text-slate-400" />
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Nenhum produto encontrado
                          </p>
                          <p className="text-sm text-slate-400 dark:text-slate-500">
                            Tente ajustar sua busca ou adicione um novo produto
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    allProducts.map((product) => (
                      <TableRow
                        key={product._id || product.id}
                        className="border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                          {product.nome}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600"
                          >
                            {product.sku}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                          {product.descricao}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600 dark:text-green-400">
                          R$ {product.preco.toFixed(2).replace(".", ",")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditForm(product)}
                              className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteProduct.mutate(product._id)}
                              className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              <div ref={loadMoreRef} className="py-6 flex justify-center">
                {isFetchingNextPage && <Loader2 className="animate-spin" />}
              </div>
            </div>
          </CardContent>
        </Card>

        <ProductForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
          onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
          initialData={editingProduct}
          title={editingProduct ? "Editar Produto" : "Novo Produto"}
        />

        <ImportProducts
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
        />
        <DeleteAllModal
          isOpen={isModalDeleteOpen}
          onClose={() => setIsModalDeleteOpen(false)}
        />
      </div>
    </div>
  );
}
