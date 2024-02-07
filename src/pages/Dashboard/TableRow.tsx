import {
  TableRow,
  TableCell,
  TableHeader,
  TableHead,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader, Trash2Icon } from "lucide-react";
import { Product } from ".";
import { Link } from "./DashboardStyles";

interface TableRowProps {
  onDeleteItem: (sku: string | number) => void;
  load: string | number;
  product: Product;
  keyUsage?: any;
  updated?: boolean;
}

export const TableMain = () => {
  return (
    <TableHeader>
      <TableHead>Imagem</TableHead>
      <TableHead>Nome</TableHead>
      <TableHead>Preço Atual</TableHead>
      <TableHead>Ultimo Preço</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Variação</TableHead>
      <TableHead></TableHead>
    </TableHeader>
  );
};

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

  const formatDate = (d: Date) => {
    if (!d) return;
    return new Date(d).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });
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
        <p> Ultima atualização : {formatDate(product?.updatedAt)}</p>
        <Link href={product.link}>{product.name}</Link>
      </TableCell>
      <TableCell> {`R$ ${product.nowPrice}`}</TableCell>
      <TableCell> {`R$ ${product.lastPrice}`}</TableCell>
      <TableCell>
        {product?.status?.indexOf("InStock") != -1 || product.nowPrice != 0 ? (
          <Badge>ON</Badge>
        ) : (
          <Badge variant="destructive">OFF</Badge>
        )}
      </TableCell>
      <TableCell>
        R$
        {product.lastPrice !== product.nowPrice
          ? (product.nowPrice - product.lastPrice).toFixed(2)
          : 0}
        {diffPercent(product.lastPrice, product.nowPrice)}
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
