"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Upload,
  Edit,
  Trash2,
  Search,
  Loader2,
  Box,
} from "lucide-react";
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
import { CatalogProductForm } from "./catalog-product-form";
import { ImportCatalog } from "./import-catalog";
import { VerifyProductModal } from "./verify-product-modal";
import {
  useCatalogProductService,
  type CatalogProduct,
} from "@/hooks/useCatalogProduct";
import { useDebounce } from "@/hooks/useDebounce";
import { usePermission } from "@/hooks/usePermissions";

export default function CatalogProductPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const { can } = usePermission();
  const canEdit = can("catalog_product_edit");

  const { catalogQuery, createProduct, updateProduct, deleteProduct } =
    useCatalogProductService({ searchTerm: debouncedSearch });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = catalogQuery;

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

  const allProducts: CatalogProduct[] =
    data?.pages.flatMap((page: any) => page.data) || [];

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(
    null
  );
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [verifyProduct, setVerifyProduct] = useState<CatalogProduct | null>(null);

  const openEditForm = (product: CatalogProduct) => {
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

  const handleDelete = (id: string) => {
    setHiddenIds((prev) => new Set(prev).add(id));
    deleteProduct.mutate(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <div className="container mx-auto p-6 max-w-7xl space-y-8">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                <Box className="h-7 w-7" />
                Catálogo de Produtos e medidas
              </h1>
              <p className="text-muted-foreground">
                Cadastre e consulte produtos com dimensões e peso cúbico
              </p>
            </div>

            {canEdit && (
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
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="relative w-80">
              <Input
                type="text"
                placeholder="Buscar por SKU , medidas ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-xl">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Produtos Cadastrados
              </CardTitle>
              <Badge variant="secondary">
                {allProducts.length} produto(s)
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200 dark:border-slate-700">
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                      SKUs
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                      Produto
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                      Medidas
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300 hidden lg:table-cell">
                      L × C × A (cm)
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                      Peso (kg)
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                      P. Cúbico (kg)
                    </TableHead>
                    {canEdit && (
                      <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                        Ações
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={canEdit ? 7 : 6} className="text-center py-12">
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
                    allProducts
                      .filter((p) => !hiddenIds.has(p._id))
                      .map((product) => (
                        <TableRow
                          key={product._id}
                          className="border-slate-200 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                          onClick={() => setVerifyProduct(product)}
                        >
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <Badge
                                variant="outline"
                                className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 font-mono text-xs w-fit"
                              >
                                {product.sku1}
                              </Badge>
                              {product.sku2 && (
                                <Badge
                                  variant="outline"
                                  className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 font-mono text-xs w-fit"
                                >
                                  {product.sku2}
                                </Badge>
                              )}
                              {product.sku3 && (
                                <Badge
                                  variant="outline"
                                  className="bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600 font-mono text-xs w-fit"
                                >
                                  {product.sku3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-slate-900 dark:text-slate-100 max-w-[280px]">
                            {product.produto}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700">
                              {product.medidas}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-slate-600 dark:text-slate-400 text-sm">
                            {product.largura} × {product.comprimento} ×{" "}
                            {product.altura}
                          </TableCell>
                          <TableCell className="text-slate-700 dark:text-slate-300">
                            {product.peso > 0
                              ? product.peso.toFixed(2).replace(".", ",")
                              : "—"}
                          </TableCell>
                          <TableCell className="font-semibold text-blue-600 dark:text-blue-400">
                            {product.pesoCubico > 0
                              ? product.pesoCubico.toFixed(3).replace(".", ",")
                              : "—"}
                          </TableCell>
                          {canEdit && (
                            <TableCell
                              className="text-right"
                              onClick={(e) => e.stopPropagation()}
                            >
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
                                  onClick={() => handleDelete(product._id)}
                                  className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div ref={loadMoreRef} className="py-6 flex justify-center">
          {isFetchingNextPage && <Loader2 className="animate-spin" />}
        </div>

        <CatalogProductForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
          onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
          initialData={editingProduct}
          title={editingProduct ? "Editar Produto" : "Novo Produto"}
        />

        <ImportCatalog
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
        />

        <VerifyProductModal
          product={verifyProduct}
          isOpen={!!verifyProduct}
          onClose={() => setVerifyProduct(null)}
        />
      </div>
    </div>
  );
}
