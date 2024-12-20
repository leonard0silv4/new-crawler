import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader,
  Trash2Icon,
  ArrowUpFromDot,
  ArrowDownToDot,
  Tag,
  X,
  Gavel,
} from "lucide-react";
import { Product } from ".";
import { Link, ContainerLine } from "./DashboardStyles";
import { formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";

import instance from "@/config/axios";
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
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import full from "./full.png";
import { ProductDrawer } from "./ProductDrawer";

interface TableRowProps {
  onDeleteItem?: (sku: string | number) => void;
  load?: string | number;
  product: Product;
  keyUsage?: any;
  updated?: boolean;
  style?: any;
  setNewPrice?: (newPrice: number, idP: string) => void;
  updateTags?: (product: Product, tags: string) => void;
  deleteTag?: (id: string, tag: string) => void;
}

interface AddTagProps {
  product: Product;
}

const TableRowComponent = ({
  product,
  onDeleteItem,
  load,
  keyUsage,
  updated,
  style,
  setNewPrice,
  updateTags,
  deleteTag,
}: TableRowProps) => {
  const [activeProduct, setActiveProduct] = useState<number | null>(null);

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
      setNewPrice && setNewPrice(price, prod._id);
    }
  };

  const updateTagInternal = (prod: Product, tag: string) => {
    updateTags && updateTags(prod, tag);
  };

  const deleteTagInternal = (id: string, tag: string) => {
    deleteTag && deleteTag(id, tag);
  };

  const handleOpenDrawer = (id: number) => {
    setActiveProduct(id);
  };

  const handleCloseDrawer = () => {
    setActiveProduct(null);
  };

  const AddTag: React.FC<AddTagProps> = React.memo(({ product }) => {
    const [newTag, setNewTag] = React.useState("");

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="mt-2" variant="default">
            <Tag className=" h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{product.name}</AlertDialogTitle>
            <AlertDialogDescription>
              <Input
                onChange={(e) => setNewTag(e.target.value)}
                value={newTag}
                type="text"
                className="block w-full rounded-md mt-5 pl-5 pr-5 col-span-4 my-price"
                placeholder="Adicionar tag"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                updateTagInternal(product, newTag);
              }}
            >
              Salvar tag
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  });

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
          onClick={() => handleOpenDrawer(product._id)}
          src={product?.image}
        />
      </span>
      <span>
        <Link href={product.link}>
          {product.full ? (
            <img
              style={{ display: "inline-block" }}
              width={43}
              src={full}
              alt="img"
            />
          ) : (
            ""
          )}
          {product.catalog ? (
            <Gavel className="w-4 h-4 mr-2 icon inline text-blue-800	" />
          ) : (
            ""
          )}
          {product.name}
        </Link>
        <ProductDrawer
          isOpen={activeProduct === product._id}
          onClose={handleCloseDrawer}
          product={product}
        />
        <i>
          Vendido por: <b>{product.seller}</b>
        </i>
        <p>
          Data anúncio:{"  "}
          {product.dateMl
            ? `${formatDistance(new Date(), product.dateMl, { locale: ptBR })}`
            : "Novo"}
        </p>
        {product?.tags?.map((tag) => {
          return (
            <Badge className="mr-2" variant="secondary">
              <X
                onClick={() => deleteTagInternal(product._id, tag)}
                className="text-red-600	w-4 h-4 cursor-pointer"
              />
              {tag}
            </Badge>
          );
        })}
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
        {product?.status == "https://schema.org/InStock" ? (
          <Badge>ON</Badge>
        ) : (
          <Badge variant="destructive">OFF</Badge>
        )}
      </span>
      <span>
        <Button
          variant="destructive"
          onClick={() => onDeleteItem && onDeleteItem(product.sku)}
        >
          {load == product.sku ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2Icon className="w-4 cursor-pointer" />
          )}
        </Button>
        <AddTag product={product} />
      </span>
    </ContainerLine>
  );
};

export default TableRowComponent;
