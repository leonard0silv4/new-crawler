import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader, Trash2Icon } from "lucide-react";
import { Product } from ".";
import { Link } from "./DashboardStyles";
import moment from "moment";
import instance from "@/config/axios";

interface TableRowProps {
  onDeleteItem: (sku: string | number) => void;
  load: string | number;
  product: Product;
  keyUsage?: any;
  updated?: boolean;
}

const TableRowComponent = ({
  product,
  onDeleteItem,
  load,
  keyUsage,
  updated,
}: TableRowProps) => {
  const diffPercent = (oldValue: number, newValue: number) => {
    if (oldValue == 0 || newValue == 0) return;

    var diff = newValue - oldValue;
    var diffPercente = (diff / Math.abs(oldValue)) * 100;
    return `(${parseFloat(diffPercente.toFixed(2))}%)`;
  };

  const singleUpdate = (ev: any, prod: Product) => {
    if (parseFloat(ev.currentTarget.textContent) != prod.myPrice) {
      instance.put("/links", {
        id: prod._id,
        myPrice: parseFloat(ev.currentTarget.textContent),
      });
    }
  };

  return (
    <TableRow className={updated ? "updated" : ""} key={keyUsage}>
      <TableCell>
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
      </TableCell>
      <TableCell>
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
      </TableCell>
      <TableCell>
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
      </TableCell>
      <TableCell> {`R$ ${product.nowPrice}`}</TableCell>
      <TableCell> {`R$ ${product.lastPrice}`}</TableCell>
      <TableCell>
        R$
        {product.lastPrice !== product.nowPrice
          ? (product.nowPrice - product.lastPrice).toFixed(2)
          : 0}
        {diffPercent(product.lastPrice, product.nowPrice)}
      </TableCell>
      <TableCell>
        {product?.status == "http://schema.org/InStock" ? (
          <Badge>ON</Badge>
        ) : (
          <Badge variant="destructive">OFF</Badge>
        )}
      </TableCell>
      <TableCell>
        <Button variant="destructive" onClick={() => onDeleteItem(product.sku)}>
          {load == product.sku ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2Icon className="w-4 cursor-pointer" />
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default TableRowComponent;
