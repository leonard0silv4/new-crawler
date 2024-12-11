import { useEffect, useState } from "react";
import { Product } from "../Dashboard";
import TableRowComponent from "../Dashboard/TableRow";
import { ContainerLine } from "../Dashboard/DashboardStyles";
import { FixedSizeList as List } from "react-window";
import { ArrowUp, ArrowDown } from "lucide-react";
import instance from "@/config/axios";
import { Checkbox } from "@/components/ui/checkbox";

interface propsFiltred {
  products: Product[];
  filterByText: any;
  filterByTag?: any;
  load: string | number;
  onDeleteItem: (sku: string | number) => void;
  onSetProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  updateTags?: (product: Product, tags: string) => void;
  deleteTag?: (id: string, tag: string) => void;
}

const FiltredProducts = ({
  products,
  filterByText,
  filterByTag,
  load,
  onDeleteItem,
  onSetProducts,
  updateTags,
  deleteTag,
}: propsFiltred) => {
  const [filtredProducts, setFiltredProducts] = useState<Product[]>([]);
  const [order, setOrder] = useState("");
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    let filtred = products;

    console.log(filterByText?.length);
    console.log(filterByTag);
    if (filterByText?.length > 2 && filterByTag) {
      filtred = products
        .filter((prd) =>
          prd.name
            .toLocaleLowerCase()
            .includes(filterByText.toLocaleLowerCase())
        )
        .filter(
          (product) => product.tags && product.tags.includes(filterByTag)
        );
      console.log("f1 name and tag");
      setFiltredProducts(filtred);
    }
    // Se houver apenas o texto, aplica o filtro de texto
    else if (filterByText?.length > 2) {
      filtred = products.filter((prd) =>
        prd.name.toLocaleLowerCase().includes(filterByText.toLocaleLowerCase())
      );
      console.log("f2 name");
      setFiltredProducts(filtred);
    }
    // Se houver apenas a tag, aplica o filtro de tag
    else if (filterByTag) {
      console.log(filterByTag);
      filtred = products.filter(
        (product) => product.tags && product.tags.includes(filterByTag)
      );
      console.log("f3 tag");
      setFiltredProducts(filtred);
    } else {
      // Se não houver filtros aplicados, mostra todos os produtos
      setFiltredProducts([]);
    }
  }, [filterByText, filterByTag, products]);

  const sort = () => {
    setOrder(order == "asc" ? "desc" : "asc");
    const filtredProductsByOrder =
      order == "asc"
        ? filtredProducts.sort((a, b) => b.nowPrice - a.nowPrice)
        : filtredProducts.sort((a, b) => a.nowPrice - b.nowPrice);
    setFiltredProducts(filtredProductsByOrder);
  };

  const sortByMyPrice = () => {
    const filtredProducts2 = [...filtredProducts].sort((a, b) => {
      if (a.myPrice > a.nowPrice && b.myPrice <= b.nowPrice) return -1;
      if (a.myPrice <= a.nowPrice && b.myPrice > b.nowPrice) return 1;
      return 0;
    });

    setFiltredProducts(filtredProducts2);
  };

  const setNewPrice = (newPrice: number, _id: string) => {
    let refreshedProducts: Product[];
    if (auto) {
      refreshedProducts = filtredProducts.map((product) => {
        if (product._id) {
          return {
            ...product,
            myPrice: newPrice,
          };
        }
        return product;
      });
      refreshedProducts.forEach((internalProduct: Product) => {
        instance.put("/links", {
          id: internalProduct._id,
          myPrice: newPrice,
        });
      });
    } else {
      refreshedProducts = filtredProducts.map((product) => {
        if (product._id === _id) {
          return {
            ...product,
            myPrice: newPrice,
          };
        }
        return product;
      });
    }
    setFiltredProducts(refreshedProducts);

    onSetProducts((prevProducts: Product[]) => {
      return prevProducts.map((product: Product) => {
        const updatedProduct = refreshedProducts.find(
          (p) => p._id === product._id
        );
        return updatedProduct || product;
      });
    });
  };

  if (filterByText?.length > 2 && !filtredProducts.length)
    return (
      <p>
        <b>Busca sem resultados</b>
      </p>
    );

  return (
    filtredProducts?.length > 0 && (
      <div className="border rounded-lg p-2 ">
        <div className="flex m-4">
          <h2 className="text-2xl font-bold p-3 left">
            Filtrados pelo termo: {filterByText} ({filtredProducts?.length})
          </h2>
          <div className="flex items-center space-x-2 p-5 ml-auto">
            <Checkbox
              checked={auto}
              onCheckedChange={() => setAuto(!auto)}
              id="auto"
            />
            <label
              htmlFor="auto"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Habilitar atualização multipla
            </label>
          </div>
        </div>

        <ContainerLine className="scrollAdjust">
          <span>Imagem</span>
          <span>Nome</span>
          <span className="cursor-pointer" onClick={() => sortByMyPrice()}>
            Meu preço
          </span>
          <span className="cursor-pointer" onClick={() => sort()}>
            {order == "desc" && <ArrowUp className="w-3 h-3 mr-2" />}
            {order == "asc" && <ArrowDown className="w-3 h-3 mr-2" />}
            Preço Atual
          </span>
          <span>Ultimo Preço</span>
          <span>Variação</span>
          <span>Status</span>
          <span></span>
        </ContainerLine>
        <List
          itemData={filtredProducts}
          height={740}
          itemCount={filtredProducts.length}
          itemSize={170}
          width={1200}
        >
          {({ index, style }: any) => (
            <TableRowComponent
              style={style}
              key={`b-${filtredProducts[index].sku}`}
              load={load}
              setNewPrice={setNewPrice}
              updateTags={updateTags}
              deleteTag={deleteTag}
              product={filtredProducts[index]}
              onDeleteItem={onDeleteItem}
              keyUsage={`f-${filtredProducts[index].sku}`}
              updated={false}
            />
          )}
        </List>
      </div>
    )
  );
};

export default FiltredProducts;
