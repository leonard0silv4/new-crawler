"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bell,
  RefreshCw,
  Loader,
  PlusCircle,
  Package,
  Store,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { formatDistance } from "date-fns";
import { ptBR } from "date-fns/locale";

import SellerSidebar, { type Seller } from "@/components/seller-sidebar";
import ProductList, { type SellerProduct } from "@/components/product-list";
import AlertList, { type SellerAlertItem } from "@/components/alert-list";
import instance from "@/config/axios";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtAgo = (dateStr: string | null) => {
  if (!dateStr) return "Nunca";
  try {
    return formatDistance(new Date(dateStr), new Date(), {
      addSuffix: true,
      locale: ptBR,
    });
  } catch {
    return dateStr;
  }
};

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SellerMonitorPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "alerts">("products");
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [alerts, setAlerts] = useState<SellerAlertItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  const [runningId, setRunningId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [sellerSearch, setSellerSearch] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Refs para o polling — evitam closures stale
  const selectedIdRef = useRef<string | null>(null);
  const prevSellersRef = useRef<Map<string, Seller>>(new Map());
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  selectedIdRef.current = selectedId;

  // ── Fetch inicial ─────────────────────────────────────────────────────────

  const fetchSellers = useCallback(async () => {
    setLoading(true);
    try {
      const data: Seller[] = await instance.get("/seller-monitor");
      setSellers(data);
      prevSellersRef.current = new Map(data.map((s) => [s._id, s]));
    } catch {
      toast.error("Erro ao carregar sellers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  // ── Carrega produtos e alertas de um seller ───────────────────────────────

  const loadProducts = useCallback(async (sellerId: string) => {
    setLoadingProducts(true);
    setProducts([]);
    try {
      const data: SellerProduct[] = await instance.get(
        `/seller-monitor/${sellerId}/products`
      );
      setProducts(data);
    } catch {
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const loadAlerts = useCallback(async (sellerId: string) => {
    setLoadingAlerts(true);
    setAlerts([]);
    try {
      const data: SellerAlertItem[] = await instance.get(
        `/seller-monitor/${sellerId}/alerts`
      );
      setAlerts(data);
    } catch {
      toast.error("Erro ao carregar alertas");
    } finally {
      setLoadingAlerts(false);
    }
  }, []);

  // ── Polling silencioso ────────────────────────────────────────────────────
  // Intervalo dinâmico: 4 s quando há scraping ativo, 30 s como heartbeat.
  // Detecta automaticamente:
  //   - Scraping manual concluído (scraping: true → false)
  //   - Atualizações do cron diário (lastRunAt mudou)

  const silentPoll = useCallback(async () => {
    try {
      const data: Seller[] = await instance.get("/seller-monitor");
      const prev = prevSellersRef.current;
      const currSelectedId = selectedIdRef.current;

      let needReloadProducts = false;
      let needReloadAlerts = false;

      data.forEach((seller) => {
        const was = prev.get(seller._id);
        if (!was) return;

        const justFinished = was.scraping && !seller.scraping;
        const cronUpdated =
          !was.scraping &&
          !seller.scraping &&
          was.lastRunAt !== seller.lastRunAt;

        if (justFinished) {
          toast.success(
            `Scraping de "${seller.name || "seller"}" concluído! ✓`,
            { duration: 4000 }
          );
          setRunningId(null);
        }

        if ((justFinished || cronUpdated) && seller._id === currSelectedId) {
          needReloadProducts = true;
          needReloadAlerts = true;
          if (cronUpdated) {
            toast.info("Dados atualizados automaticamente.", { duration: 3000 });
          }
        }
      });

      setSellers(data);
      prevSellersRef.current = new Map(data.map((s) => [s._id, s]));

      // Garante que runningId é limpo se o seller não está mais em scraping,
      // mesmo que a transição scraping: true → false não tenha sido capturada
      setRunningId((current) => {
        if (!current) return null;
        const runningSeller = data.find((s) => s._id === current);
        if (runningSeller && !runningSeller.scraping) return null;
        return current;
      });

      if (needReloadProducts && currSelectedId) loadProducts(currSelectedId);
      if (needReloadAlerts && currSelectedId) loadAlerts(currSelectedId);
    } catch {
      // Falha silenciosa — não mostra erro para o usuário durante o polling
    }
  }, [loadProducts, loadAlerts]);

  // Agenda o próximo tick do polling com intervalo dinâmico
  useEffect(() => {
    const hasActiveScraping = sellers.some((s) => s.scraping);
    const interval = hasActiveScraping ? 4_000 : 30_000;

    pollTimerRef.current = setTimeout(async () => {
      await silentPoll();
    }, interval);

    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  // Re-agenda sempre que sellers muda (novo tick após cada resultado do poll)
  }, [sellers, silentPoll]);

  // ── Seleciona seller ──────────────────────────────────────────────────────

  const handleSelectSeller = (seller: Seller) => {
    if (selectedId === seller._id) return;
    setSelectedId(seller._id);
    setActiveTab("products");
    loadProducts(seller._id);
    loadAlerts(seller._id);
    setMobileSidebarOpen(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) {
      toast.error("URL é obrigatória");
      return;
    }
    try {
      new URL(newUrl);
    } catch {
      toast.error("URL inválida");
      return;
    }
    setAdding(true);
    try {
      const seller: Seller = await instance.post("/seller-monitor", {
        url: newUrl.trim(),
        name: newName.trim(),
      });
      setSellers((prev) => [
        { ...seller, totalProducts: 0, unreadAlerts: 0 },
        ...prev,
      ]);
      setNewUrl("");
      setNewName("");
      setAddDialogOpen(false);
      toast.success("Seller cadastrado! O scraping inicial foi iniciado.");
    } catch {
      toast.error("Erro ao cadastrar seller");
    } finally {
      setAdding(false);
    }
  };

  const handleRun = async (seller: Seller) => {
    setRunningId(seller._id);
    try {
      // Backend retorna 202 imediatamente — o scraper roda em background.
      // O polling detecta o término e atualiza a UI automaticamente.
      await instance.post(`/seller-monitor/${seller._id}/run`);
      // Marca localmente como scraping até o próximo poll confirmar
      setSellers((prev) =>
        prev.map((s) =>
          s._id === seller._id ? { ...s, scraping: true } : s
        )
      );
      toast.info(
        `Scraping iniciado para "${seller.name || "seller"}". A tela atualiza automaticamente ao concluir.`,
        { duration: 5000 }
      );
    } catch (err: any) {
      if (err?.response?.status === 409) {
        toast.warning("Scraping já em andamento para este seller.");
      } else {
        toast.error("Erro ao iniciar scraping");
      }
      setRunningId(null);
    }
    // Nota: setRunningId(null) é chamado pelo polling quando scraping: false
  };

  const handleDelete = async (seller: Seller) => {
    setDeletingId(seller._id);
    try {
      await instance.delete(`/seller-monitor/${seller._id}`);
      setSellers((prev) => prev.filter((s) => s._id !== seller._id));
      if (selectedId === seller._id) {
        setSelectedId(null);
        setProducts([]);
        setAlerts([]);
      }
      toast.success("Seller removido");
    } catch {
      toast.error("Erro ao remover seller");
    } finally {
      setDeletingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (!selectedId) return;
    try {
      await instance.put(`/seller-monitor/${selectedId}/alerts/read-all`);
      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
      setSellers((prev) =>
        prev.map((s) =>
          s._id === selectedId ? { ...s, unreadAlerts: 0 } : s
        )
      );
    } catch {
      toast.error("Erro ao marcar alertas");
    }
  };

  const handleMarkRead = useCallback(async (alertId: string) => {
    try {
      await instance.put(`/seller-monitor/alerts/${alertId}/read`);
      setAlerts((prev) =>
        prev.map((a) => (a._id === alertId ? { ...a, read: true } : a))
      );
      setSellers((prev) =>
        prev.map((s) =>
          s._id === selectedId
            ? { ...s, unreadAlerts: Math.max(0, s.unreadAlerts - 1) }
            : s
        )
      );
    } catch {
      toast.error("Erro ao marcar alerta");
    }
  }, [selectedId]);

  const unreadTotal = sellers.reduce((acc, s) => acc + s.unreadAlerts, 0);
  const selectedSeller = sellers.find((s) => s._id === selectedId);

  const sidebarContent = (
    <SellerSidebar
      sellers={sellers}
      selectedId={selectedId}
      sellerSearch={sellerSearch}
      onSellerSearchChange={setSellerSearch}
      onSelectSeller={handleSelectSeller}
      onRunScrape={handleRun}
      onDeleteSeller={handleDelete}
      onOpenAddDialog={() => setAddDialogOpen(true)}
      runningId={runningId}
      deletingId={deletingId}
      fmtAgo={fmtAgo}
    />
  );

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        <div className="hidden md:flex w-[300px] shrink-0 overflow-hidden">
          {loading ? (
            <div className="flex flex-1 items-center justify-center bg-card border-r border-border">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            sidebarContent
          )}
        </div>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="flex items-center gap-3 px-4 md:px-6 h-14 border-b border-border bg-card shrink-0">
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Sellers</SheetTitle>
                </SheetHeader>
                {loading ? (
                  <div className="flex flex-1 items-center justify-center h-full">
                    <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  sidebarContent
                )}
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              <h1 className="text-base font-semibold text-foreground">
                Seller Monitor
              </h1>
            </div>

            {unreadTotal > 0 && (
              <Badge className="bg-destructive text-destructive-foreground text-xs">
                <Bell className="h-3 w-3 mr-1" />
                {unreadTotal}
              </Badge>
            )}

            <div className="flex-1" />

            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={fetchSellers}
              disabled={loading}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
          </header>

          <div className="flex-1 min-h-0 overflow-auto">
            {!selectedId ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary mb-4">
                  <Package className="h-8 w-8 opacity-50" />
                </div>
                <p className="text-base font-medium text-foreground">
                  {sellers.length === 0
                    ? "Nenhum seller cadastrado"
                    : "Selecione um seller"}
                </p>
                <p className="text-sm mt-1.5 text-center max-w-sm text-balance">
                  {sellers.length === 0
                    ? "Cadastre seu primeiro seller para começar a monitorar preços e produtos do Mercado Livre."
                    : "Escolha um seller na barra lateral para visualizar seus produtos e alertas."}
                </p>
                {sellers.length === 0 && (
                  <Button className="mt-4" onClick={() => setAddDialogOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Novo Seller
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-border bg-card/50">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Store className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold text-foreground truncate">
                      {selectedSeller?.name || "Seller"}
                    </h2>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {selectedSeller?.url}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Package className="h-3.5 w-3.5" />
                      {selectedSeller?.totalProducts} produtos
                    </span>
                    <span>
                      Atualizado {fmtAgo(selectedSeller?.lastRunAt || null)}
                    </span>
                  </div>
                </div>

                <Tabs
                  value={activeTab}
                  onValueChange={(v) =>
                    setActiveTab(v as "products" | "alerts")
                  }
                  className="flex flex-col flex-1 min-h-0"
                >
                  <div className="px-4 md:px-6 border-b border-border bg-card">
                    <TabsList className="h-10 bg-transparent p-0 gap-4">
                      <TabsTrigger
                        value="products"
                        className="relative h-10 rounded-none border-b-2 border-transparent px-0 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent"
                      >
                        Produtos
                        {products.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-2 h-5 px-1.5 text-[10px]"
                          >
                            {products.length}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger
                        value="alerts"
                        className="relative h-10 rounded-none border-b-2 border-transparent px-0 pb-3 pt-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none bg-transparent"
                      >
                        Alertas
                        {alerts.filter((a) => !a.read).length > 0 && (
                          <Badge className="ml-2 h-5 px-1.5 text-[10px] bg-destructive text-destructive-foreground">
                            {alerts.filter((a) => !a.read).length}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent
                    value="products"
                    className="flex-1 min-h-0 mt-0"
                  >
                    <ProductList products={products} loading={loadingProducts} />
                  </TabsContent>
                  <TabsContent value="alerts" className="flex-1 min-h-0 mt-0">
                    <AlertList
                      alerts={alerts}
                      loading={loadingAlerts}
                      onMarkRead={handleMarkRead}
                      onMarkAllRead={handleMarkAllRead}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </main>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cadastrar Seller</DialogTitle>
            <DialogDescription>
              Informe a URL da página de listagem do seller no Mercado Livre.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                URL da listagem *
              </label>
              <Input
                placeholder="https://lista.mercadolivre.com.br/pagina/..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="bg-secondary border-0 focus-visible:ring-1"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Nome do seller 
              </label>
              <Input
                placeholder="Ex: Azul Verde Garden"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-secondary border-0 focus-visible:ring-1"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={adding}>
                {adding && (
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                )}
                Cadastrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
