import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader,
  Trash2Icon,
  ArrowUpFromDot,
  ArrowDownToDot,
} from "lucide-react";
import { Product } from ".";
import { Link, ContainerLine } from "./DashboardStyles";
import moment from "moment";
import instance from "@/config/axios";

interface TableRowProps {
  onDeleteItem: (sku: string | number) => void;
  load: string | number;
  product: Product;
  keyUsage?: any;
  updated?: boolean;
  style?: any;
  hasFiltred?: boolean;
  setNewPrice?: (newPrice: number, idP: string, f: boolean) => void;
}

const TableRowComponent = ({
  product,
  onDeleteItem,
  load,
  keyUsage,
  updated,
  style,
  setNewPrice,
  hasFiltred = false,
}: TableRowProps) => {
  const diffPercent = (oldValue: number, newValue: number) => {
    if (oldValue == 0 || newValue == 0) return;

    var diff = newValue - oldValue;
    var diffPercente = (diff / Math.abs(oldValue)) * 100;
    return `(${parseFloat(diffPercente.toFixed(2))}%)`;
  };

  const singleUpdate = async (ev: any, prod: Product) => {
    const price = parseFloat(ev.currentTarget.textContent);
    if (price != prod.myPrice) {
      await instance.put("/links", {
        id: prod._id,
        myPrice: price,
      });
      setNewPrice ? setNewPrice(price, prod._id, hasFiltred) : "";
    }
  };

  return (
    <ContainerLine
      style={style}
      className={updated ? "updated" : ""}
      key={keyUsage}
    >
      <span>
        <img
          alt={product?.name}
          title={product?.name}
          style={{
            width: "50px",
            height: "50px",
            objectFit: "scale-down",
          }}
          src={product?.image}
        />
      </span>
      <span>
        <Link href={product.link}>{product.name}</Link>
        <i>
          Vendido por: <b>{product.seller}</b>
        </i>
        <p>
          Data anúncio :{" "}
          {product.dateMl ? (
            <Badge>{moment().diff(moment(product.dateMl), "days")} dias</Badge>
          ) : (
            <Badge>Novo</Badge>
          )}
        </p>
      </span>
      <span>
        {product.myPrice > product.nowPrice ? (
          <ArrowUpFromDot className="text-red-600	 w-4 h-4 mr-2 icon" />
        ) : (
          <ArrowDownToDot className="text-green-600		 w-4 h-4 mr-2 icon" />
        )}
        R$
        <span
          onBlur={(e) => {
            singleUpdate(e, product);
          }}
          contentEditable
          suppressContentEditableWarning={true}
        >
          {product.myPrice}
        </span>
      </span>
      <span> {`R$ ${product.nowPrice}`}</span>
      <span> {`R$ ${product.lastPrice}`}</span>
      <span>
        R$
        {product.lastPrice !== product.nowPrice
          ? (product.nowPrice - product.lastPrice).toFixed(2)
          : 0}
        {diffPercent(product.lastPrice, product.nowPrice)}
      </span>
      <span>
        {product?.status == "http://schema.org/InStock" ? (
          <Badge>ON</Badge>
        ) : (
          <Badge variant="destructive">OFF</Badge>
        )}
      </span>
      <span>
        <Button variant="destructive" onClick={() => onDeleteItem(product.sku)}>
          {load == product.sku ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2Icon className="w-4 cursor-pointer" />
          )}
        </Button>
      </span>
    </ContainerLine>
  );
};

export default TableRowComponent;
