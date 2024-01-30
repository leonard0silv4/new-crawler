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

interface TableRowProps {
  onDeleteItem: (sku: string | number) => void;
  onDdiffPercent: (n1: number, n2: number) => any;
  load: string | number;
  product: Product;
  keyUsage?: any;
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
  onDdiffPercent,
  load,
  keyUsage,
}: TableRowProps) => {
  return (
    <TableRow key={keyUsage}>
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
        {product.status.indexOf("InStock") != -1 || product.nowPrice != 0 ? (
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
        ({onDdiffPercent(product.lastPrice, product.nowPrice)})
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
