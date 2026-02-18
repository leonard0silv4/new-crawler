"use client";

import { memo, type ComponentType, type CSSProperties } from "react";
import { FixedSizeList } from "react-window";
import {
  Bell,
  BellOff,
  CheckCheck,
  ShoppingBag,
  Tag,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

export interface SellerAlertItem {
  _id: string;
  productId: string;
  productName: string;
  type: "price_change" | "new_product";
  oldPrice: number;
  newPrice: number;
  read: boolean;
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

const ALERT_ROW_H = 68;

const AlertRow = memo(function AlertRow({
  alert,
  style,
  onMarkRead,
}: {
  alert: SellerAlertItem;
  style?: React.CSSProperties;
  onMarkRead: (id: string) => void;
}) {
  return (
    <div
      style={style}
      className={`flex items-center gap-3 px-4 border-b border-border/50 transition-colors ${
        alert.read
          ? "opacity-50 bg-muted/30"
          : "bg-card hover:bg-accent/30"
      }`}
    >
      <div className="shrink-0">
        {alert.type === "new_product" ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.72_0.17_162/0.12)]">
            <ShoppingBag className="h-4 w-4 text-[oklch(0.55_0.2_162)]" />
          </div>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[oklch(0.75_0.15_60/0.15)]">
            <Tag className="h-4 w-4 text-[oklch(0.6_0.17_60)]" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {alert.productName}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {alert.type === "new_product" ? (
            <>
              Novo produto ·{" "}
              <span className="font-medium text-foreground">
                {fmtPrice(alert.newPrice)}
              </span>
            </>
          ) : (
            <>
              {fmtPrice(alert.oldPrice)}
              <span className="mx-1 text-muted-foreground">→</span>
              <span className="font-medium text-foreground">
                {fmtPrice(alert.newPrice)}
              </span>
              <span
                className={`ml-1.5 font-medium ${
                  alert.newPrice > alert.oldPrice
                    ? "text-destructive"
                    : "text-[oklch(0.55_0.2_162)]"
                }`}
              >
                (
                {alert.oldPrice > 0
                  ? `${(
                      ((alert.newPrice - alert.oldPrice) / alert.oldPrice) *
                      100
                    ).toFixed(1)}%`
                  : "—"}
                )
              </span>
            </>
          )}
        </p>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">
          {fmtAgo(alert.createdAt)}
        </span>
        {!alert.read && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-primary"
            title="Marcar como lido"
            onClick={() => onMarkRead(alert._id)}
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
});

export interface AlertListProps {
  alerts: SellerAlertItem[];
  loading: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export default function AlertList({
  alerts,
  loading,
  onMarkRead,
  onMarkAllRead,
}: AlertListProps) {
  const unreadCount = alerts.filter((a) => !a.read).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground mt-3">
          Carregando alertas...
        </p>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Bell className="h-12 w-12 mb-3 opacity-40" />
        <p className="text-sm font-medium">Nenhum alerta gerado</p>
        <p className="text-xs mt-1">
          Alertas aparecerão quando houver mudanças de preço ou novos produtos.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Alertas</h3>
          {unreadCount > 0 && (
            <Badge className="h-5 px-1.5 text-[10px] bg-destructive text-destructive-foreground">
              {unreadCount} não lido{unreadCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={onMarkAllRead}
          disabled={alerts.every((a) => a.read)}
        >
          <BellOff className="h-3 w-3 mr-1.5" />
          Marcar todos como lidos
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        <List
          height={Math.min(alerts.length * ALERT_ROW_H, 600)}
          itemCount={alerts.length}
          itemSize={ALERT_ROW_H}
          width="100%"
          overscanCount={8}
        >
          {({ index, style }) => (
            <AlertRow
              alert={alerts[index]}
              style={style}
              onMarkRead={onMarkRead}
            />
          )}
        </List>
      </div>
    </div>
  );
}
