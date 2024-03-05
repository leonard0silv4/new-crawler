import { useEffect, useState } from "react";
import { Product } from "../Dashboard";
import TableRowComponent from "../Dashboard/TableRow";
import { ContainerLine } from "../Dashboard/DashboardStyles";
import { FixedSizeList as List } from "react-window";
import { ArrowUp, ArrowDown } from "lucide-react";

interface propsFiltred {
  products: Product[];
  filterByText: any;
  load: string | number;
  onDeleteItem: (sku: string | number) => void;
}

const FiltredProducts = ({
  products,
  filterByText,
  load,
  onDeleteItem,
}: propsFiltred) => {
  const [filtredProducts, setFiltredProducts] = useState<Product[]>([]);
  const [order, setOrder] = useState("");

  useEffect(() => {
    if (filterByText?.length > 2) {
      const filtredProducts = products.filter((prd) =>
        prd.name.toLocaleLowerCase().includes(filterByText.toLocaleLowerCase())
      );

      setFiltredProducts(filtredProducts);
    }
  }, [filterByText]);

  const sort = () => {
    setOrder(order == "asc" ? "desc" : "asc");
    const filtredProductsByOrder =
      order == "asc"
        ? filtredProducts.sort((a, b) => b.nowPrice - a.nowPrice)
        : filtredProducts.sort((a, b) => a.nowPrice - b.nowPrice);
    setFiltredProducts(filtredProductsByOrder);
  };

  const setNewPrice = (newPrice: number, _id: string) => {
    const refreshedProducts = filtredProducts.map((product) => {
      if (product._id === _id) {
        return {
          ...product,
          myPrice: newPrice,
        };
      }
      return product;
    });

    setFiltredProducts(refreshedProducts);
  };

  return (
    filtredProducts?.length > 0 &&
    filterByText?.length > 2 && (
      <div className="border rounded-lg p-2 ">
        <h2 className="text-2xl font-bold p-3">
          Filtrados pelo termo: {filterByText} ({filtredProducts?.length})
        </h2>

        <ContainerLine className="scrollAdjust">
          <span>Imagem</span>
          <span>Nome</span>
          <span>Meu preço</span>
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
          itemSize={150}
          width={1200}
        >
          {({ index, style }: any) => (
            <TableRowComponent
              style={style}
              key={`b-${filtredProducts[index].sku}`}
              load={load}
              setNewPrice={setNewPrice}
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
