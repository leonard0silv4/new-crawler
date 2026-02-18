"use client";

import {
  memo,
  useMemo,
  useState,
  useCallback,
  type ComponentType,
  type CSSProperties,
} from "react";
import { FixedSizeList } from "react-window";
import {
  Search,
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Loader,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VirtualListProps {
  height: number;
  itemCount: number;
  itemSize: number;
  width: string | number;
  overscanCount?: number;
  children: (props: {
    index: number;
    style: CSSProperties;
  }) => React.ReactNode;
}
const List = FixedSizeList as unknown as ComponentType<VirtualListProps>;

export interface PriceEntry {
  price: number;
  date: string;
}

export interface SellerProduct {
  _id: string;
  url: string;
  name: string;
  image: string;
  sku: string;
  currentPrice: number;
  priceHistory: PriceEntry[];
  isNew: boolean;
  priceChanged: boolean;
  updatedAt: string;
  createdAt: string;
}

const fmtPrice = (price: number) =>
  price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtAgo = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffH < 1) return "Agora";
    if (diffH < 24) return `${diffH}h atrás`;
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return "1 dia atrás";
    return `${diffD} dias atrás`;
  } catch {
    return dateStr;
  }
};

type SortKey = "name" | "price" | "date";
type SortDir = "asc" | "desc";
type FilterStatus = "all" | "new" | "changed";

const PRODUCT_ROW_H = 80;

const ProductRow = memo(function ProductRow({
  product,
  style,
}: {
  product: SellerProduct;
  style?: React.CSSProperties;
}) {
  const history = product.priceHistory;
  const trend =
    history.length >= 2
      ? history[history.length - 1].price > history[history.length - 2].price
        ? "up"
        : history[history.length - 1].price < history[history.length - 2].price
          ? "down"
          : "stable"
      : "stable";

  return (
    <div
      style={style}
      className="flex items-center gap-4 px-4 border-b border-border/50 bg-card hover:bg-accent/30 transition-colors"
    >
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0"
      >
        <div className="h-12 w-12 rounded-lg overflow-hidden bg-secondary border border-border">
          <img
            loading="lazy"
            src={product.image || "https://placehold.co/48x48?text=?"}
            alt={product.name}
            width={48}
            height={48}
            className="h-full w-full object-contain"
            crossOrigin="anonymous"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://placehold.co/48x48?text=?";
            }}
          />
        </div>
      </a>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-foreground hover:text-primary truncate transition-colors"
          >
            {product.name}
          </a>
          {product.isNew && (
            <Badge className="h-5 px-1.5 text-[10px] bg-[oklch(0.72_0.17_162)] text-card shrink-0">
              Novo
            </Badge>
          )}
          {product.priceChanged && !product.isNew && (
            <Badge className="h-5 px-1.5 text-[10px] bg-[oklch(0.75_0.15_60)] text-card shrink-0">
              Alterado
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-1.5 overflow-hidden">
          {history.slice(-5).map((entry, idx, arr) => (
            <span
              key={idx}
              title={entry.date}
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium cursor-default shrink-0 transition-colors ${
                idx === arr.length - 1
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {fmtPrice(entry.price)}
            </span>
          ))}
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="flex items-center justify-end gap-1.5">
          {trend === "up" && (
            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-destructive/10">
              <TrendingUp className="h-3 w-3 text-destructive" />
            </div>
          )}
          {trend === "down" && (
            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-[oklch(0.72_0.17_162/0.1)]">
              <TrendingDown className="h-3 w-3 text-[oklch(0.55_0.2_162)]" />
            </div>
          )}
          {trend === "stable" && (
            <div className="flex items-center justify-center h-5 w-5 rounded-full bg-muted">
              <Minus className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
          <span
            className={`font-semibold text-sm ${
              trend === "up"
                ? "text-destructive"
                : trend === "down"
                  ? "text-[oklch(0.55_0.2_162)]"
                  : "text-foreground"
            }`}
          >
            {fmtPrice(product.currentPrice)}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {fmtAgo(product.updatedAt)}
        </p>
      </div>
    </div>
  );
});

export interface ProductListProps {
  products: SellerProduct[];
  loading: boolean;
}

export default function ProductList({ products, loading }: ProductListProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const toggleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey]
  );

  const processed = useMemo(() => {
    let list = [...products];

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }

    if (filterStatus === "new") list = list.filter((p) => p.isNew);
    if (filterStatus === "changed")
      list = list.filter((p) => p.priceChanged && !p.isNew);

    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "price") cmp = a.currentPrice - b.currentPrice;
      else if (sortKey === "date")
        cmp =
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [products, search, sortKey, sortDir, filterStatus]);

  const SortIcon = ({ field }: { field: SortKey }) => {
    if (sortKey !== field)
      return <ArrowUpDown className="h-3 w-3 text-muted-foreground" />;
    return sortDir === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary" />
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-3">
          Carregando produtos...
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Package className="h-12 w-12 mb-3 opacity-40" />
        <p className="text-sm font-medium">Nenhum produto ainda</p>
        <p className="text-xs mt-1">
          Execute o scraping para carregar os produtos deste seller.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-2 p-4 border-b border-border bg-card">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8 h-8 text-xs bg-secondary border-0 focus-visible:ring-1"
            placeholder="Buscar por nome ou SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select
          value={filterStatus}
          onValueChange={(v) => setFilterStatus(v as FilterStatus)}
        >
          <SelectTrigger className="h-8 w-[140px] text-xs bg-secondary border-0">
            <Filter className="h-3 w-3 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="new">Novos</SelectItem>
            <SelectItem value="changed">Alterados</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center rounded-lg bg-secondary p-0.5">
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2.5 text-xs gap-1 rounded-md ${sortKey === "name" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
            onClick={() => toggleSort("name")}
          >
            Nome <SortIcon field="name" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2.5 text-xs gap-1 rounded-md ${sortKey === "price" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
            onClick={() => toggleSort("price")}
          >
            Preço <SortIcon field="price" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-7 px-2.5 text-xs gap-1 rounded-md ${sortKey === "date" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
            onClick={() => toggleSort("date")}
          >
            Data <SortIcon field="date" />
          </Button>
        </div>

        <Badge variant="secondary" className="text-xs font-normal">
          {processed.length}
          {processed.length !== products.length && ` / ${products.length}`}{" "}
          produtos
        </Badge>
      </div>

      <div className="flex items-center gap-4 px-4 py-2 text-[11px] text-muted-foreground border-b border-border/50 bg-card">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[oklch(0.72_0.17_162)]" />
          Novo
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[oklch(0.75_0.15_60)]" />
          Preço alterado
        </span>
      </div>

      <div className="flex-1 min-h-0">
        {processed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">Nenhum produto encontrado para a busca</p>
          </div>
        ) : (
          <List
            height={Math.min(processed.length * PRODUCT_ROW_H, 600)}
            itemCount={processed.length}
            itemSize={PRODUCT_ROW_H}
            width="100%"
            overscanCount={8}
          >
            {({ index, style }) => (
              <ProductRow product={processed[index]} style={style} />
            )}
          </List>
        )}
      </div>
    </div>
  );
}
