import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, RefreshCcw, Loader, Variable, Eraser } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Progress } from "@/components/ui/progress";
import { useEffect, useRef, useState } from "react";
import instance, { errorFn } from "@/config/axios";

import { toast } from "sonner";
import TableRowComponent from "./TableRow";
import { EventSourcePolyfill } from "event-source-polyfill";
import { FixedSizeList as List } from "react-window";

import * as S from "./DashboardStyles";
import FiltredProducts from "../FiltredProducts";

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
  storeName?: string;
  ratingSeller?: string;
  _id?: any;
  tags?: string[];
  full?: Boolean;
  catalog?: Boolean;
}

export default function Dashboard() {
  const [onUpdate, setOnUpdate] = useState(false);
  const [percent, setPercent] = useState("");
  const isMounted = useRef(false);
  const [link, setLink] = useState("");
  const [tagNew, setNewTag] = useState("");
  const [myPrice, setMyPrice] = useState("");

  const [load, setLoad] = useState("");
  const [filterName, setFilterName] = useState("");
  const [skusUpdated, setSkusUpdated] = useState<any>([]);
  const [uniqueTags, setUniqueTags] = useState<any>([]);
  const [selectedTag, setSelectedTag] = useState<any>("");
  const [loadingTags, setLoadingTags] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoad("initial");
    await instance
      .get("links", {
        params: {
          page: 1,
          perPage: 5000,
          storeName: "mercadolivre",
        },
      })
      .then(({ data: response }: any) => {
        setProducts(response);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setLoad("");
      });

    getTags();
  };

  const getTags = async () => {
    setLoadingTags(true);
    await instance.get("/tags").then((response) => {
      setUniqueTags(response);
    });
    setLoadingTags(false);
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
      .post(link.includes("lista") ? "/list/batch" : "links", {
        link: link,
        tag: tagNew,
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
      .delete(`links/${sku}`)
      .then(() => {
        setProducts((data) => data.filter((item) => item.sku != sku));
        console.log("apagado com sucesso");
      })
      .catch((error) => {
        console.log("Error :", error);
      })
      .finally(() => setLoad(""));
  };

  const updateAll = () => {
    var eventSource = new EventSourcePolyfill(
      `${import.meta.env.VITE_APP_BASE_URL}links/update/mercadolivre`,
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
      if (progress.indexOf("}") != -1) {
        const productAtt = JSON.parse(event.data);
        console.log("atualiza produto", productAtt);
        setSkusUpdated((skusUpdated: any) => [...skusUpdated, productAtt.sku]);
        updateAnExist(productAtt);
        toast.success(productAtt.name, {
          description: "Atualizado",
          position: "top-right",
        });
      } else {
        setPercent(progress);
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
    setProducts((prevProducts) => {
      return prevProducts.map((product) => {
        if (product.sku === newProduct.sku) {
          return {
            ...product,
            nowPrice: newProduct.nowPrice,
            seller: newProduct.seller,
            lastPrice: newProduct.lastPrice,
            ...(newProduct.myPrice != null && { myPrice: newProduct.myPrice }), // Só inclui myPrice se autoPrice não for null ou undefined
            updatedAt: new Date(),
          };
        }
        return product;
      });
    });
  };

  const setNewPrice = (newPrice: number, _id: string) => {
    const refreshedProducts = products.map((product) => {
      if (product._id === _id) {
        return {
          ...product,
          myPrice: newPrice,
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

  const sortByMyPrice = () => {
    const sortedProducts = [...products].sort((a, b) => {
      if (a.myPrice > a.nowPrice && b.myPrice <= b.nowPrice) return -1;
      if (a.myPrice <= a.nowPrice && b.myPrice > b.nowPrice) return 1;
      return 0;
    });

    setProducts(sortedProducts);
  };

  const clearAllRates = async () => {
    instance.post("links/clearRates/mercadolivre").then(() => {
      fetchData();
      setSkusUpdated([]);
    });
  };

  const deleteAllItems = async () => {
    await instance.delete("links/clearAll/mercadolivre");
    setProducts([]);
  };

  const deleteTag = async (id: string, tag: string) => {
    await instance.delete(`/links/tags/${id}/${tag}`);

    const refreshedProducts = products.map((product) => {
      if (product._id === id && product.tags) {
        return {
          ...product,
          tags: product.tags.filter((tagI) => tagI !== tag), // Remove a tag
        };
      }
      return product;
    });

    setProducts(refreshedProducts); // Atualiza o estado dos produtos
    getTags();
  };

  const updateTags = async (productUpdate: Product, newTag: string) => {
    const updatedTags = productUpdate.tags
      ? [...productUpdate.tags, newTag] // Adiciona a nova tag ao array existente
      : [newTag]; // Cria um novo array se não houver tags

    // Fazendo a requisição para atualizar o backend
    await instance.put("/links", {
      id: productUpdate._id,
      tags: updatedTags, // Enviando o array atualizado
    });

    // Atualizando os produtos localmente com as novas tags
    const refreshedProducts = products.map((product) => {
      if (product._id === productUpdate._id) {
        return {
          ...product,
          tags: updatedTags, // Atualizando as tags do produto correspondente
        };
      }
      return product;
    });

    setProducts(refreshedProducts); // Atualiza o estado dos produtos com o novo array
    getTags();
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
            <AlertDialogTitle>
              Esta ação Limpará todas variações, e não podera ser desfeita !
            </AlertDialogTitle>
            <AlertDialogDescription>Tem certeza ?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => clearAllRates()}>
              Sim, limpar variações
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  const DeleteAll = () => {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="ml-2 mb-4 lg:mb-0">
            <Eraser className="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Esta ação apagará todos os links({products?.length}) que você esta
              acompanhando, e não podera ser desfeita !
            </AlertDialogTitle>
            <AlertDialogDescription>Tem certeza ?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={() => deleteAllItems()}
                className="Button red"
              >
                Sim, apagar tudo
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  const handleClearFilters = () => {
    setSelectedTag(null);
    setFilterName("");
  };

  return (
    <>
      <S.Main className="p-6 max-w-7xl mx-auto space-y-4">
        {onUpdate && <Progress value={Number(percent.replace("%", ""))} />}
        <h1 className="text-3xl font-bold">
          Produtos {products?.length > 0 ? `(${products.length})` : ""}
        </h1>
        <div className="md:flex md:items-center md:justify-between">
          <form className="md:flex md:items-center md:gap-2">
            <Input
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              name="name"
              placeholder="Buscar por nome"
              className="w-auto"
            />
          </form>

          <form className="md:flex md:items-center md:gap-2">
            {uniqueTags ? (
              <Select
                disabled={loadingTags}
                value={selectedTag}
                onValueChange={(value) => setSelectedTag(value)}
              >
                <SelectTrigger className="w-[180px] ml-5">
                  <SelectValue
                    placeholder={loadingTags ? "Loading..." : "Tag"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {!loadingTags ? (
                    uniqueTags.map((t: string) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      Carregando...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            ) : (
              ""
            )}
          </form>
          <Button onClick={() => handleClearFilters()} className="ml-5">
            <Eraser className="w-4 h-4" />
          </Button>

          <br className="block lg:hidden" />

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

                <div className="grid grid-cols-4 items-center text-left">
                  <Input
                    onChange={(e) => setNewTag(e.target.value)}
                    value={tagNew}
                    id="tag"
                    className="col-span-4"
                    placeholder="Tag"
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
          <DeleteAll />
        </div>

        <FiltredProducts
          products={products}
          filterByText={filterName}
          filterByTag={selectedTag}
          updateTags={updateTags}
          deleteTag={deleteTag}
          load={load}
          onDeleteItem={deleteItem}
          onSetProducts={setProducts}
        />

        <div className="border rounded-lg p-2 ">
          <S.ContainerLine className="scrollAdjust">
            <span>Imagem</span>
            <span>Nome</span>
            <span className="cursor-pointer" onClick={() => sortByMyPrice()}>
              Meu preço
            </span>
            <span>Preço Atual</span>
            <span>Ultimo Preço</span>
            <span className="cursor-pointer" onClick={() => sortProducts()}>
              Variação
            </span>
            <span>Status</span>
            <span></span>
          </S.ContainerLine>
          {load == "initial" ? (
            <Loader className="w-10 h-10 animate-spin m-auto my-10" />
          ) : (
            <List
              itemData={products}
              height={740}
              itemCount={products.length}
              itemSize={170}
              width={1200}
            >
              {({ index, style }: any) => (
                <TableRowComponent
                  style={style}
                  key={`b-${products[index].sku}`}
                  load={load}
                  setNewPrice={setNewPrice}
                  updateTags={updateTags}
                  deleteTag={deleteTag}
                  product={products[index]}
                  onDeleteItem={deleteItem}
                  keyUsage={products[index].sku}
                  updated={
                    skusUpdated.includes(products[index].sku) ? true : false
                  }
                />
              )}
            </List>
          )}
        </div>
      </S.Main>
    </>
  );
}
