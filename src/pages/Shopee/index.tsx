import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, RefreshCcw, Loader, Variable } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { useEffect, useRef, useState } from "react";
import instance, { errorFn } from "@/config/axios";
import moment from "moment";

import { toast } from "sonner";
import Header from "@/components/Header";
import TableRowComponent from "../Dashboard/TableRow";
import { EventSourcePolyfill } from "event-source-polyfill";

import * as S from "../Dashboard/DashboardStyles";

export interface Product {
  sku: string;
  link: string;
  name: string;
  seller: string;
  dateMl: any;
  status: string;
  nowPrice: number;
  lastPrice: number;
  myPrice: number;
  image: string;
  created_at: any;
  updatedAt: any;
  _id?: any;
}

export default function Shopee() {
  const [onUpdate, setOnUpdate] = useState(false);
  const [percent, setPercent] = useState("");
  const isMounted = useRef(false);
  const [link, setLink] = useState("");
  const [myPrice, setMyPrice] = useState("");
  const [load, setLoad] = useState("");
  const [filterName, setFilterName] = useState("");
  const [skusUpdated, setSkusUpdated] = useState<any>([]);

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;
    fetchData();
  }, []);

  const fetchData = async () => {
    await instance
      .get("shopee/links", {
        params: {
          page: 1,
          perPage: 5000,
        },
      })
      .then(({ data: response }: any) => {
        setProducts(response);
      })
      .catch((err) => console.log(err))
      .finally(() => {});
  };

  const AddLink = (e: any) => {
    e.preventDefault();
    try {
      Boolean(new URL(link));
    } catch (e) {
      toast.error("Ocorreu um erro ", {
        description: "URL inválida",
        position: "top-right",
      });
      return;
    }

    if (!parseFloat(myPrice)) {
      toast.error("Ocorreu um erro ", {
        description: "Informe um valor válido para o preço atual",
        position: "top-right",
      });
      return;
    }

    setLoad("addLink");
    instance
      .post(link.includes("lista") ? "list/shopee" : "links", {
        link: link,
        myPrice: parseFloat(myPrice),
      })
      .then(() => {
        fetchData();
        setLink("");
      })
      .catch(() => {
        toast.error("Ocorreu um erro ", {
          description: "Verifique se o produto esta disponível",
          position: "top-right",
        });
      })
      .finally(() => {
        setLoad("");
        dialogClose();
      });
  };

  const dialogClose = () => {
    document.getElementById("closeDialog")?.click();
  };

  const deleteItem = (sku: any) => {
    setLoad(sku);
    instance
      .delete(`shopee/links/${sku}`)
      .then(() => {
        setProducts((data) => data.filter((item) => item.sku != sku));
      })
      .catch((error) => {
        console.log("Error :", error);
      })
      .finally(() => setLoad(""));
  };

  const updateAll = () => {
    var eventSource = new EventSourcePolyfill(
      `${import.meta.env.VITE_APP_BASE_URL}shopee/links/update`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
      }
    );

    setOnUpdate(true);
    setPercent("0");

    eventSource.onmessage = (event) => {
      const progress = event.data;
      if (progress.indexOf("%") != -1) {
        setPercent(progress);
      } else {
        const productAtt = JSON.parse(event.data);
        setSkusUpdated((skusUpdated: any) => [...skusUpdated, productAtt.sku]);
        console.log(productAtt);
        updateAnExist(productAtt);
        toast.success(productAtt.name, {
          description: "Atualizado",
          position: "top-right",
        });
      }
    };

    eventSource.onerror = (error) => {
      console.error("Erro na conexão SSE:", error);
      errorFn(error);
      eventSource.close();
      setOnUpdate(false);
    };
  };

  const updateAnExist = (newProduct: Product) => {
    const refreshedProducts = products.map((product) => {
      if (product.sku === newProduct.sku) {
        return {
          ...product,
          nowPrice: newProduct?.nowPrice,
          lastPrice: newProduct.lastPrice,
          updatedAt: new Date(),
        };
      }
      return product;
    });
    setProducts(refreshedProducts);
  };

  const sortProducts = () => {
    const sortedProducts = products.map((product) => {
      return {
        ...product,
        priceDifferencePercentage:
          ((product.nowPrice - product.lastPrice) / product.lastPrice) * 100,
      };
    });

    sortedProducts.sort((a, b) => {
      if (
        a.priceDifferencePercentage === 0 &&
        b.priceDifferencePercentage === 0
      ) {
        return 0;
      } else if (a.priceDifferencePercentage === 0) {
        return 1;
      } else if (b.priceDifferencePercentage === 0) {
        return -1;
      } else {
        return b.priceDifferencePercentage - a.priceDifferencePercentage;
      }
    });
    setProducts(sortedProducts);
  };

  const FiltredResults = () => {
    if (filterName?.length > 2) {
      const filtredProducts = products.filter((prd) =>
        prd.name.toLocaleLowerCase().includes(filterName.toLocaleLowerCase())
      );

      if (!filtredProducts?.length) return;

      return (
        <div className="border rounded-lg p-2 ">
          <h2 className="text-2xl font-bold p-3">Filtrados</h2>
          <Table>
            <TableHeader>
              <TableHead>Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Meu preço</TableHead>
              <TableHead>Preço Atual</TableHead>
              <TableHead>Ultimo Preço</TableHead>
              <TableHead>Variação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableHeader>

            <TableBody>
              {filtredProducts.map((product) => {
                return (
                  <TableRowComponent
                    key={`t-${product.sku}`}
                    load={load}
                    product={product}
                    onDeleteItem={deleteItem}
                    keyUsage={`f-${product.sku}`}
                    updated={skusUpdated.includes(product.sku) ? true : false}
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>
      );
    }

    return;
  };

  const clearAllRates = async () => {
    instance.post("links/clearRates").then(() => {
      fetchData();
      setSkusUpdated([]);
    });
  };

  const ClearVariations = () => {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="ml-2 mb-4 lg:mb-0">
            <Variable className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza ?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação Limpará todas variações e não podera ser desfeita !
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => clearAllRates()}>
              Limpar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return (
    <>
      <Header />

      <S.Main className="p-6 max-w-7xl mx-auto space-y-4">
        {onUpdate && <Progress value={Number(percent.replace("%", ""))} />}

        <h1 className="text-3xl font-bold">Produtos</h1>

        <div className="md:flex md:items-center md:justify-between">
          <form className="md:flex md:items-center md:gap-2">
            <Input
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              name="name"
              placeholder="Buscar por nome"
              className="w-auto"
            />
            <Button className="hidden lg:flex" type="submit" variant="link">
              <Search className="w-4 h-4 mr-2" />
              Filtrar resultados
            </Button>
          </form>

          <br className="block lg:hidden" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  disabled={onUpdate}
                  onClick={() => updateAll()}
                  variant="outline"
                  className="ml-auto mr-5 mb-4 lg:mb-0"
                >
                  <RefreshCcw
                    className={`w-4 h-4 mr-2 ${onUpdate ? "animate-spin" : ""}`}
                  />
                  {onUpdate ? `Atualizando` : "Atualizar"} lista
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                <p>
                  Ultima atualização:{" "}
                  <b>
                    {moment(products?.[0]?.updatedAt).format(
                      "DD/MM/YY h:mm:ss"
                    )}
                  </b>
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo produto</DialogTitle>
                <DialogDescription>
                  Criar um novo acompanhamento de produto(s)
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={(e) => AddLink(e)} className="space-y-6">
                <div>
                  <div className="relative mt-2 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-900 sm:text-sm">R$</span>
                    </div>
                    <S.InputCustom>
                      <Input
                        onChange={(e) => setMyPrice(e.target.value)}
                        value={myPrice}
                        type="number"
                        id="link"
                        className="block w-full rounded-md  pl-10 pr-60 col-span-4 my-price"
                        placeholder="Seu preço atual"
                      />
                    </S.InputCustom>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center text-left">
                  <Input
                    onChange={(e) => setLink(e.target.value)}
                    value={link}
                    id="link"
                    className="col-span-4"
                    placeholder="URL"
                  />
                </div>

                <DialogFooter className="gap-3">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button
                    disabled={load == "addLink"}
                    onClick={(e) => AddLink(e)}
                    type="submit"
                  >
                    {load === "addLink" && (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Salvar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <ClearVariations />
        </div>

        <FiltredResults />

        <div className="border rounded-lg p-2">
          <Table>
            <TableHeader>
              <TableHead>Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Meu preço</TableHead>
              <TableHead>Preço Atual</TableHead>
              <TableHead>Ultimo Preço</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => sortProducts()}
              >
                Variação
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableHeader>

            <TableBody>
              {products?.map((product) => {
                return (
                  <TableRowComponent
                    key={`b-${product.sku}`}
                    load={load}
                    product={product}
                    onDeleteItem={deleteItem}
                    keyUsage={product.sku}
                    updated={skusUpdated.includes(product.sku) ? true : false}
                  />
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={7}>Total : {products?.length}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </S.Main>
    </>
  );
}
