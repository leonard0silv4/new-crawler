import { Button } from "@/components/ui/button";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Search,
  PlusCircle,
  RefreshCcw,
  Trash2Icon,
  Loader,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { useEffect, useRef, useState } from "react";
import instance from "@/config/axios";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Product {
  sku: string;
  link: string;
  name: string;
  status: string;
  nowPrice: number;
  lastPrice: number;
  image: string;
}

export default function Dashboard() {
  const [onUpdate, setOnUpdate] = useState(false);
  const [percent, setPercent] = useState("");
  const isMounted = useRef(false);
  const [link, setLink] = useState("");
  const [load, setLoad] = useState("");
  const [filterName, setFilterName] = useState("");

  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isMounted.current) return;
    isMounted.current = true;
    fetchData();
  }, []);

  const fetchData = async () => {
    await instance
      .get("links", {
        params: {
          page: 1,
          perPage: 100,
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
      toast("Ocorreu um erro ", {
        description: "Verifique se o link esta disponivel",
      });
      return;
    }
    setLoad("addLink");
    instance
      .post("links", { link: link })
      .then(() => {
        fetchData();
        setLink("");
      })
      .catch((error: any) => {
        console.log(error);
        toast("Ocorreu um erro ", {
          description: "Verifique se o link esta disponivel",
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
      })
      .catch((error) => {
        console.log("Error :", error);
      })
      .finally(() => setLoad(""));
  };

  const updateAll = () => {
    const eventSource = new EventSource(
      `${import.meta.env.VITE_APP_BASE_URL}links/update`
    );

    setOnUpdate(true);
    setPercent("0");

    eventSource.onmessage = (event) => {
      const progress = event.data;
      if (progress.indexOf("%") != -1) {
        setPercent(progress);
      } else {
        const productAtt = JSON.parse(event.data);
        updateAnExist(productAtt);
        toast(productAtt.name, {
          description: "Atualizado",
        });
      }
    };

    eventSource.onerror = (error) => {
      console.error("Erro na conexão SSE:", error);
      eventSource.close();
      setOnUpdate(false);
    };
  };

  const diffPercent = (oldValue: number, newValue: number) => {
    var diff = newValue - oldValue;

    var diffPercente = (diff / Math.abs(oldValue)) * 100;

    return `${parseFloat(diffPercente.toFixed(2))}%`;
  };

  const updateAnExist = (newProduct: Product) => {
    setProducts((prevProducts) => {
      const refreshedProducts = prevProducts.map((product) => {
        if (product.sku === newProduct.sku) {
          return {
            ...product,
            nowPrice: newProduct.nowPrice,
            lastPrice: newProduct.lastPrice,
          };
        }
        return product;
      });
      return refreshedProducts;
    });
  };

  const FiltredResults = () => {
    console.log(filterName);
    if (filterName?.length > 2) {
      const filtredProducts = products.filter((prd) =>
        prd.name.toLocaleLowerCase().includes(filterName.toLocaleLowerCase())
      );

      if (!filtredProducts.length) return;

      return (
        <div className="border rounded-lg p-2 ">
          <h2 className="text-2xl font-bold p-3">Filtrados</h2>
          <Table>
            <TableHeader>
              <TableHead>Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Preço Atual</TableHead>
              <TableHead>Ultimo Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Variação</TableHead>
              <TableHead></TableHead>
            </TableHeader>

            <TableBody>
              {filtredProducts.map((product) => {
                return (
                  <TableRow key={product.sku}>
                    <TableCell>
                      <img
                        alt={product.name}
                        title={product.name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "scale-down",
                        }}
                        src={product.image}
                      />
                    </TableCell>
                    <TableCell>
                      <a target="_blank" href={product.link}>
                        {product.name.length > 30
                          ? `${product.name.slice(0, 30)}...`
                          : product.name}
                      </a>
                    </TableCell>
                    <TableCell> {`R$ ${product.nowPrice}`}</TableCell>
                    <TableCell> {`R$ ${product.lastPrice}`}</TableCell>
                    <TableCell>
                      {" "}
                      {product.status.indexOf("InStock") != -1 ||
                      product.nowPrice != 0 ? (
                        <Badge>ON</Badge>
                      ) : (
                        <Badge variant="destructive">OFF</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {" "}
                      R$
                      {product.lastPrice !== product.nowPrice
                        ? (product.nowPrice - product.lastPrice).toFixed(2)
                        : 0}
                      ({diffPercent(product.lastPrice, product.nowPrice)})
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        onClick={() => deleteItem(product.sku)}
                      >
                        {load == product.sku ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2Icon className="w-4 cursor-pointer" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      );
    }

    return;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {onUpdate && <Progress value={Number(percent.replace("%", ""))} />}

      <h1 className="text-3xl font-bold">Produtos</h1>

      <div className="flex items-center justify-between">
        <form className="flex items-center gap-2">
          <Input
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            name="name"
            placeholder="Buscar por nome"
            className="w-auto"
          />
          <Button type="submit" variant="link">
            <Search className="w-4 h-4 mr-2" />
            Filtrar resultados
          </Button>
        </form>

        <Button
          disabled={onUpdate}
          onClick={() => updateAll()}
          variant="outline"
          className="ml-auto mr-5"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Atualizar lista
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
                Criar um novo acompanhamento
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={(e) => AddLink(e)} className="space-y-6">
              <div className="grid grid-cols-4 items-center text-left ">
                <Input
                  onChange={(e) => setLink(e.target.value)}
                  value={link}
                  id="link"
                  className="col-span-4"
                  placeholder="URL"
                />
              </div>

              <DialogFooter>
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
      </div>

      <FiltredResults />
      <div className="border rounded-lg p-2">
        <Table>
          <TableHeader>
            <TableHead>Imagem</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Preço Atual</TableHead>
            <TableHead>Ultimo Preço</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Variação</TableHead>
            <TableHead></TableHead>
          </TableHeader>

          <TableBody>
            {products?.map((product, i) => {
              return (
                <TableRow key={i}>
                  <TableCell>
                    <img
                      alt={product.name}
                      title={product.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "scale-down",
                      }}
                      src={product.image}
                    />
                  </TableCell>
                  <TableCell>
                    <a target="_blank" href={product.link}>
                      {product.name.length > 30
                        ? `${product.name.slice(0, 30)}...`
                        : product.name}
                    </a>
                  </TableCell>
                  <TableCell> {`R$ ${product.nowPrice}`}</TableCell>
                  <TableCell> {`R$ ${product.lastPrice}`}</TableCell>
                  <TableCell>
                    {" "}
                    {product.status.indexOf("InStock") != -1 ||
                    product.nowPrice != 0 ? (
                      <Badge>ON</Badge>
                    ) : (
                      <Badge variant="destructive">OFF</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {" "}
                    R$
                    {product.lastPrice !== product.nowPrice
                      ? (product.nowPrice - product.lastPrice).toFixed(2)
                      : 0}
                    ({diffPercent(product.lastPrice, product.nowPrice)})
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      onClick={() => deleteItem(product.sku)}
                    >
                      {load == product.sku ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2Icon className="w-4 cursor-pointer" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
