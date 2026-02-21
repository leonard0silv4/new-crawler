"use client";

import { memo } from "react";
import {
  Search,
  Package,
  ExternalLink,
  RefreshCw,
  Trash2,
  Loader,
  PlusCircle,
  Store,
  Sparkles,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface Seller {
  _id: string;
  url: string;
  name: string;
  active: boolean;
  scraping: boolean;
  scrapingStartedAt: string | null;
  lastRunAt: string | null;
  totalProducts: number;
  unreadAlerts: number;
  createdAt: string;
}

const STUCK_THRESHOLD_MS = 20 * 60 * 1000; // 20 minutos

function isScrapingStuck(seller: Seller): boolean {
  if (!seller.scraping || !seller.scrapingStartedAt) return false;
  return Date.now() - new Date(seller.scrapingStartedAt).getTime() > STUCK_THRESHOLD_MS;
}

export interface SellerSidebarProps {
  sellers: Seller[];
  selectedId: string | null;
  sellerSearch: string;
  onSellerSearchChange: (v: string) => void;
  onSelectSeller: (seller: Seller) => void;
  onRunScrape: (seller: Seller) => void;
  onDeleteSeller: (seller: Seller) => void;
  onOpenAddDialog: () => void;
  onForceReset: (seller: Seller) => void;
  runningId: string | null;
  deletingId: string | null;
  resettingId: string | null;
  fmtAgo: (d: string | null) => string;
}

const SellerCard = memo(function SellerCard({
  seller,
  isSelected,
  isRunning,
  isDeleting,
  isResetting,
  onSelect,
  onRun,
  onDelete,
  onForceReset,
  fmtAgo,
}: {
  seller: Seller;
  isSelected: boolean;
  isRunning: boolean;
  isDeleting: boolean;
  isResetting: boolean;
  onSelect: () => void;
  onRun: () => void;
  onDelete: () => void;
  onForceReset: () => void;
  fmtAgo: (d: string | null) => string;
}) {
  const stuck = isScrapingStuck(seller);
  return (
    <div
      className={cn(
        "group relative rounded-lg border p-3 cursor-pointer transition-all",
        isSelected
          ? "border-primary bg-secondary shadow-sm"
          : "border-transparent bg-card hover:border-border hover:shadow-sm"
      )}
      onClick={onSelect}
    >
        <div className="flex items-start gap-3 min-w-0">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
            isSelected
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          )}
        >
          {seller.scraping ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Store className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm font-semibold text-foreground">
              {(() => {
                const name = seller.name || seller.url.split("/")[4] || seller.url || "Sem nome";
                return name.length > 17 ? name.substring(0, 17) + "..." : name;
              })()}
            </span>
            {!seller.scraping && seller.unreadAlerts > 0 && (
              <Badge className="h-5 px-1.5 text-[10px] bg-destructive text-destructive-foreground">
                {seller.unreadAlerts}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              {seller.totalProducts}
            </span>
            <span>{fmtAgo(seller.lastRunAt)}</span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-1 mt-2 pt-2 border-t border-border/50",
          !isSelected && "opacity-0 group-hover:opacity-100 transition-opacity"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {seller.name && (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={seller.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom">Abrir URL</TooltipContent>
          </Tooltip>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              disabled={isRunning || seller.scraping}
              onClick={onRun}
            >
              {isRunning || seller.scraping ? (
                <Loader className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {seller.scraping ? "Scraping em andamento..." : "Executar scraping"}
          </TooltipContent>
        </Tooltip>

        {seller.scraping && !stuck && (
          <Badge className="h-5 px-1.5 text-[10px] bg-blue-500 text-white animate-pulse">
            <Sparkles className="h-2.5 w-2.5 mr-1" />
            scraping
          </Badge>
        )}

        {stuck && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className="h-5 px-1.5 text-[10px] bg-amber-500 text-white animate-pulse">
                <AlertTriangle className="h-2.5 w-2.5 mr-1" />
                travado
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Scraping parado há mais de 20 min. Clique em Resetar para liberar.
            </TooltipContent>
          </Tooltip>
        )}

        {stuck && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                disabled={isResetting}
                onClick={(e) => { e.stopPropagation(); onForceReset(); }}
              >
                {isResetting ? (
                  <Loader className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Resetar scraping travado</TooltipContent>
          </Tooltip>
        )}

        <div className="flex-1" />

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover seller?</AlertDialogTitle>
              <AlertDialogDescription>
                Todos os produtos e alertas de{" "}
                <strong>{seller.name || seller.url}</strong> serão removidos
                permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button variant="destructive" onClick={onDelete}>
                  Sim, remover
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
});

export default function SellerSidebar({
  sellers,
  selectedId,
  sellerSearch,
  onSellerSearchChange,
  onSelectSeller,
  onRunScrape,
  onDeleteSeller,
  onOpenAddDialog,
  onForceReset,
  runningId,
  deletingId,
  resettingId,
  fmtAgo,
}: SellerSidebarProps) {
  const filteredSellers = sellers.filter(
    (s) =>
      s.name.toLowerCase().includes(sellerSearch.toLowerCase()) ||
      s.url.toLowerCase().includes(sellerSearch.toLowerCase())
  );

  return (
    <aside className="flex flex-col h-full w-full overflow-hidden bg-card border-r border-border">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">
            Sellers
          </h2>
          <Badge variant="secondary" className="text-xs font-medium">
            {sellers.length}
          </Badge>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-8 h-8 text-xs bg-secondary border-0 focus-visible:ring-1"
            placeholder="Buscar seller..."
            value={sellerSearch}
            onChange={(e) => onSellerSearchChange(e.target.value)}
          />
        </div>

        <Button className="w-full h-8 text-xs" onClick={onOpenAddDialog}>
          <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
          Novo Seller
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1.5">
          {filteredSellers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Store className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">Nenhum seller encontrado</p>
            </div>
          ) : (
            filteredSellers.map((seller) => (
              <SellerCard
                key={seller._id}
                seller={seller}
                isSelected={selectedId === seller._id}
                isRunning={runningId === seller._id}
                isDeleting={deletingId === seller._id}
                isResetting={resettingId === seller._id}
                onSelect={() => onSelectSeller(seller)}
                onRun={() => onRunScrape(seller)}
                onDelete={() => onDeleteSeller(seller)}
                onForceReset={() => onForceReset(seller)}
                fmtAgo={fmtAgo}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
