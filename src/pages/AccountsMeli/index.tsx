"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import instance from "@/config/axios";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Loader, TriangleAlert /*, Unplug*/ } from "lucide-react";

import { Input } from "@/components/ui/input";
import { FixedSizeList as List } from "react-window";
import full from "../Dashboard/full.png";

export default function SellerProductsPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderBy, setOrderBy] = useState<string | null>(null);
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("desc");
  const [filterIsFull, setFilterIsFull] = useState<null | boolean>(null);

  const { data: accounts = [], isLoading: loadingAccounts } = useQuery<any>({
    queryKey: ["accounts"],
    queryFn: () => instance.get("accounts"),
  });

  useEffect(() => {
    if (accounts.length > 0 && !selectedUserId) {
      setSelectedUserId(accounts[0].user_id.toString());
    }
  }, [accounts]);

  const { data: products = [], isLoading } = useQuery<any>({
    queryKey: ["products", selectedUserId],
    enabled: !!selectedUserId,
    queryFn: async () => {
      const res = await instance.get("accounts/products", {
        params: { user_id: selectedUserId },
      });
      return res;
    },
  });

  const modalidadeMap: Record<string, string> = {
    gold_pro: "Premium",
    gold_special: "Clássico",
    bronze: "Grátis",
  };

  const sortedFilteredProducts = useMemo(() => {
    let processed = products.map((p: any) => {
      const estoqueHistory = [...(p.historySell || [])];

      const today = {
        sellQty: estoqueHistory.at(-4)?.sellQty ?? 0,
        costShipping: estoqueHistory.at(-1)?.shippingCost ?? 0,
      };
      const day1Ago = {
        sellQty: estoqueHistory.at(-1)?.sellQty ?? 0,
        costShipping: estoqueHistory.at(-2)?.shippingCost ?? 0,
      };
      const day2Ago = {
        sellQty: estoqueHistory.at(-2)?.sellQty ?? 0,
        costShipping: estoqueHistory.at(-3)?.shippingCost ?? 0,
      };
      const day3Ago = {
        sellQty: estoqueHistory.at(-3)?.sellQty ?? 0,
        costShipping: estoqueHistory.at(-4)?.shippingCost ?? 0,
      };
      const averageSellDay =
        (today.sellQty + day1Ago.sellQty + day2Ago.sellQty + day3Ago.sellQty) /
        4;

      const estoqueTotal = p.isFull ? p.estoque_full : p.available_quantity;

      return {
        ...p,
        averageSellDay,
        day1Ago,
        day2Ago,
        day3Ago,
        estoqueTotal,
        modalidade: modalidadeMap[p.listingTypeId] || p.listingTypeId,
      };
    });

    if (filterIsFull !== null) {
      processed = processed.filter((p: any) => p.isFull === filterIsFull);
    }

    if (searchTerm) {
      processed = processed.filter(
        (p: any) =>
          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (orderBy) {
      processed = processed.sort((a: any, b: any) => {
        const aVal = a[orderBy].sellQty ?? a[orderBy];
        const bVal = b[orderBy].sellQty ?? b[orderBy];
        return orderDirection === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    return processed;
  }, [products, searchTerm, orderBy, orderDirection, filterIsFull]);

  const toggleSort = (field: string) => {
    if (orderBy === field) {
      setOrderDirection(orderDirection === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(field);
      setOrderDirection("desc");
    }
  };

  const handleAuthRedirect = () => {
    const token = localStorage.getItem("userToken");
    if (token) {
      window.open(
        `${import.meta.env.VITE_APP_BASE_URL}auth?token=${token}`,
        "_blank"
      );
    } else {
      alert("Usuário não autenticado");
    }
  };

  // const disconnectAccount = () => {
  //   alert(selectedUserId);
  // };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex gap-4 mb-4">
        <Button onClick={handleAuthRedirect}>Conectar nova conta</Button>
      </div>

      <div className="flex gap-4 mb-4 items-center flex-wrap">
        {/* <div className="flex gap-4 ">
          <Button
            variant="destructive"
            title="Desconectar conta selecionada"
            onClick={disconnectAccount}
          >
            <Unplug className="w-4 h-4 0" />
          </Button>
        </div> */}
        <Select value={selectedUserId || ""} onValueChange={setSelectedUserId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Conta" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((acc: any) => (
              <SelectItem key={acc.user_id} value={acc.user_id.toString()}>
                {acc.nickname}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* <div className="flex items-center gap-2 hidden "> */}
        <div className=" items-center gap-3 flex ">
          <Button
            variant={filterIsFull === null ? "default" : "outline"}
            onClick={() => setFilterIsFull(null)}
          >
            Todos
          </Button>
          <Button
            variant={filterIsFull === true ? "default" : "outline"}
            onClick={() => setFilterIsFull(true)}
          >
            Full
          </Button>
          <Button
            variant={filterIsFull === false ? "default" : "outline"}
            onClick={() => setFilterIsFull(false)}
          >
            Normal
          </Button>
        </div>

        <Input
          placeholder="Buscar por nome ou id"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-[250px]"
        />
      </div>

      <div className="rounded-md border">
        {loadingAccounts || isLoading ? (
          <Loader className="w-10 h-10 animate-spin m-auto my-10" />
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_50px] gap-4 p-3 font-semibold text-sm border-b bg-background min-w-[1200px] sticky top-0 z- px-6 content-center ">
              <div className="py-5">Imagem</div>
              <div
                className="cursor-pointer py-5"
                onClick={() => toggleSort("title")}
              >
                Nome
              </div>
              <div
                className="text-center cursor-pointer py-5"
                onClick={() => toggleSort("nickname")}
              >
                Conta
              </div>
              <div
                className="text-center cursor-pointer py-5"
                onClick={() => toggleSort("sold_quantity")}
              >
                Vendidos
              </div>
              <div
                className="text-center cursor-pointer py-5"
                onClick={() => toggleSort("estoqueTotal")}
              >
                Estoque{" "}
                {orderBy === "estoqueTotal" ? `(${orderDirection})` : ""}
              </div>
              <div
                className="text-center cursor-pointer py-5"
                onClick={() => toggleSort("day1Ago")}
              >
                1 Dia atrás
              </div>
              <div
                className="text-center cursor-pointer py-5"
                onClick={() => toggleSort("day2Ago")}
              >
                2 Dias atrás
              </div>
              <div
                className="text-center cursor-pointer py-5"
                onClick={() => toggleSort("day3Ago")}
              >
                3 Dias atrás
              </div>
              <div
                className="text-center cursor-pointer py-5"
                onClick={() => toggleSort("averageSellDay")}
              >
                Média Vendas
              </div>
              <div></div>
            </div>

            <List
              height={600}
              itemCount={sortedFilteredProducts.length}
              itemSize={190}
              width="100%"
            >
              {({ index, style }) => {
                const product = sortedFilteredProducts[index];

                return (
                  <div
                    style={style}
                    key={product.id}
                    className="grid grid-cols-[80px_2fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr_50px] gap-4 p-2 px-6 items-center border-b min-w-[1200px]"
                  >
                    <div className="flex justify-center items-center align-middle flex-col">
                      {product.alertRuptura &&
                      product.alertRuptura !==
                        "Dados insuficientes para previsão" ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <TriangleAlert className="w-4 h-4 0 mb-3 text-red-800" />
                            </TooltipTrigger>
                            <TooltipContent
                              side="right"
                              align="end"
                              className="text-xs"
                            >
                              <p>{product.alertRuptura}</p>
                              <p>
                                Previsão de dias restantes :{" "}
                                {product.daysRestStock.toFixed(0) ?? 0}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : null}
                      <div className="w-16 h-16 rounded overflow-hidden">
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium truncate">
                        {product.isFull ? (
                          <img
                            style={{ display: "inline-block" }}
                            width={43}
                            src={full}
                            alt="img"
                          />
                        ) : (
                          ""
                        )}
                        ID: {product.id}
                      </p>
                      <p className="text-sm ">{product.title}</p>
                      <p className="text-sm font-medium truncate">
                        Preço: {`R$ ${product.price}`}
                      </p>
                      <p className="text-sm font-medium truncate">
                        Frete estimado: {`R$ ${product.shippingCost}`}
                      </p>

                      <p className="text-sm font-medium truncate">
                        Modalidade: {product.modalidade}
                      </p>
                      {product.variations.length > 0
                        ? product.variations.map((v: any, idx: number) => {
                            const atributos = v.attributes
                              ?.map((attr: any) => attr.value_name)
                              .filter(Boolean)
                              .join(", ");

                            return (
                              <p
                                key={idx}
                                className="text-sm font-medium truncate"
                              >
                                {atributos} : {v.available_quantity}
                              </p>
                            );
                          })
                        : null}
                    </div>
                    <div
                      title={product.nickname}
                      className="text-center text-sm"
                    >
                      {product.nickname.substr(0, 7)}...
                    </div>
                    <div className="text-center text-sm">
                      {product.sold_quantity}
                    </div>
                    <div className="text-center text-sm">
                      {product.estoqueTotal}
                    </div>
                    <div className="text-center text-sm">
                      <p className="font-bold">{product.day1Ago.sellQty}</p>
                      <p className="text-xs text-gray-700">
                        Frete : {product.day1Ago.costShipping}
                      </p>
                    </div>
                    <div className="text-center text-sm">
                      <p className="font-bold">{product.day2Ago.sellQty}</p>

                      <p className="text-xs text-gray-700">
                        Frete : {product.day2Ago.costShipping}
                      </p>
                    </div>
                    <div className="text-center text-sm">
                      <p className="font-bold">{product.day3Ago.sellQty}</p>

                      <p className="text-xs text-gray-700">
                        {" "}
                        Frete : {product.day3Ago.costShipping}
                      </p>
                    </div>
                    <div className="text-center text-sm">
                      {product.averageSellDay?.toFixed(2) ?? "-"}
                    </div>
                    <div className="text-center">
                      <a
                        href={product.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Ver produto</span>
                      </a>
                    </div>
                  </div>
                );
              }}
            </List>
          </div>
        )}
      </div>
    </div>
  );
}
