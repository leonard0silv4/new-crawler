"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

import { ExternalLink, Loader } from "lucide-react";
import instance from "@/config/axios";

interface Product {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
  sold_quantity: number;
  thumbnail: string;
  permalink: string;
  start_time: string;
  stop_time: string;
  expiration_time: string;
  status: string;
  estoque_full: number;
  qualidade: number;
  media_vendas_dia: number;
  health: number | null;
}

interface Seller {
  id: string;
  name: string;
}

export default function SellerProductsPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<string>("");

  useEffect(() => {
    const initialSellers = [
      { id: "6828c1b0a87cc735a1107c70", name: "LEO07VASP" },
      { id: "68275524a87cc735a1106a01", name: "SOMBRITELA_LONDRINA" },
    ];
    setSellers(initialSellers);

    if (!selectedSeller) {
      setSelectedSeller(initialSellers[0].id);
    }
  }, []);

  const { data: products = [], isLoading } = useQuery<any>({
    queryKey: ["products", selectedSeller],
    queryFn: async () => {
      if (!selectedSeller) return [];
      const data = await instance.get(`/account/${selectedSeller}/products`);
      return data;
    },
    enabled: !!selectedSeller,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Produtos por Vendedor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <label
              htmlFor="seller-select"
              className="block text-sm font-medium mb-2"
            >
              Selecione a conta
            </label>
            <Select value={selectedSeller} onValueChange={setSelectedSeller}>
              <SelectTrigger id="seller-select" className="w-full md:w-[350px]">
                <SelectValue placeholder="Selecione um vendedor" />
              </SelectTrigger>
              <SelectContent>
                {sellers.map((seller) => (
                  <SelectItem key={seller.id} value={seller.id}>
                    {seller.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-md border">
            {isLoading ? (
              <Loader className="w-10 h-10 animate-spin m-auto my-10" />
            ) : (
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table className="min-w-[900px]">
                    <TableHeader className="sticky top-0 z-10 bg-background">
                      <TableRow>
                        <TableHead className="w-[80px] sticky left-0 z-20 bg-background">
                          Imagem
                        </TableHead>
                        <TableHead className="min-w-[250px]">Título</TableHead>
                        <TableHead className="text-right">Preço</TableHead>
                        <TableHead className="text-center">
                          Disponível
                        </TableHead>
                        <TableHead className="text-center">Vendidos</TableHead>
                        <TableHead className="hidden">Data Início</TableHead>

                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">
                          Estoque Full
                        </TableHead>
                        <TableHead className="text-center">Health</TableHead>
                        <TableHead className="text-center">Qualidade</TableHead>
                        <TableHead className="text-center">
                          Media vendas/dia
                        </TableHead>
                        <TableHead className="w-[50px]">Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products?.map((product: Product) => (
                        <TableRow key={product.id}>
                          <TableCell className="sticky left-0 z-10 bg-background">
                            <div className="relative w-16 h-16 rounded overflow-hidden">
                              <img
                                src={product.thumbnail}
                                alt={product.title}
                                className="object-cover"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <p>ID : {product.id}</p>
                            {product.title}
                          </TableCell>
                          <TableCell className="text-right">
                            {product.price}
                          </TableCell>
                          <TableCell className="text-center">
                            {product.available_quantity}
                          </TableCell>
                          <TableCell className="text-center">
                            {product.sold_quantity}
                          </TableCell>

                          <TableCell className="text-center">
                            <Badge
                              variant={
                                product.status === "active"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {product.status === "active"
                                ? "Ativo"
                                : "Inativo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {product.estoque_full}
                          </TableCell>
                          <TableCell className="text-center">
                            {product.health}
                          </TableCell>
                          <TableCell className="text-center">
                            {product.qualidade}
                          </TableCell>
                          <TableCell className="text-center">
                            {product.media_vendas_dia}
                          </TableCell>
                          <TableCell>
                            <a
                              href={product.permalink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span className="sr-only">Ver produto</span>
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
