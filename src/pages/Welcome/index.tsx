"use client";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePermission } from "@/hooks/usePermissions";
import { useDashboardSalesData } from "@/hooks/useDashboardSalesData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  Package,
  Users,
  UserCog,
  FileText,
  Settings,
  Activity,
  Store,
  Loader2,
  PackageSearch,
  Truck,
  Scan,
} from "lucide-react";
import instance from "@/config/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ResumeCard } from "./resumeCard";
import { cn } from "@/lib/utils";

export default function WelcomePageNew() {
  const navigate = useNavigate();
  const { can, isOwner, canAny } = usePermission();
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    hoje,
    ontem,
    ontem2,
    mediaDiaria,
    previsaoMes,
    isLoading,
    refetchAll,
    lastMonth,
    // hourlySalesHoje,
  } = useDashboardSalesData();

  const handleClick = async () => {
    setIsProcessing(true);
    try {
      await instance.post("/orders/summary/clear-cache");
      await refetchAll();
      toast.success("Cache limpo com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao limpar cache.");
    } finally {
      setIsProcessing(false);
    }
  };

  const production =
    typeof window !== "undefined" &&
    localStorage.getItem("productionBrowser") === "yes";

  const shortcuts = [
    {
      title: "Mercado Livre",
      icon: <ShoppingCart />,
      path: "/dashboard",
      show: !production && can("view_links"),
      status: "online",
      count: null,
      label: "Produtos",
    },
    {
      title: "Shopee",
      icon: <Store />,
      path: "/shopee",
      show: !production && can("view_links"),
      status: "online",
      count: null,
      label: "Itens",
    },
    {
      title: "Estoque ML",
      icon: <Package />,
      path: "/account/products",
      show: !production && can("manage_meli_products"),
      status: "warning",
      count: null,
      label: "Estoque",
    },
    {
      title: "Faccionistas",
      icon: <Users />,
      path: "/users",
      show: canAny("manage_faccionistas", "view_production"),
      status: "online",
      count: null,
      label: "Ativos",
    },
    {
      title: "Usuários",
      icon: <UserCog />,
      path: "/manage-users",
      show: !production && can("control_users"),
      status: "online",
      count: null,
      label: "Usuários",
    },
    {
      title: "Logs",
      icon: <Activity />,
      path: "/logs",
      show: !production && can("view_logs"),
      status: "info",
      count: null,
      label: "Hoje",
    },
    {
      title: "Notas Fiscais",
      icon: <FileText />,
      path: "/nf",
      show: !production && can("view_nf"),
      status: "online",
      count: null,
      label: "Disponíveis",
    },
    {
      title: "Catálogo de produtos",
      icon: <PackageSearch />,
      path: "/products-catalog",
      show: !production && can("manage_products_catalog"),
      status: "online",
      count: null,
      label: "Catálogo",
    },
    {
      title: "Configurações",
      icon: <Settings />,
      path: "/config",
      show: !production && isOwner,
      status: "online",
      count: null,
      label: "geral",
    },
    {
      title: "Expedição",
      icon: <Scan />,
      path: "/expedicao",
      show: !production && (isOwner || canAny("view_production")),
      status: "online",
      count: null,
      label: "Leitura",
    },
    {
      title: "Dashboard Expedição",
      icon: <Truck />,
      path: "/dashboard-expedicao",
      show: !production && (isOwner || canAny("view_production")),
      status: "online",
      count: null,
      label: "Monitoramento",
    },
  ];

  const availableShortcuts = shortcuts.filter((s) => s.show);

  const handleNavigation = (path: string) => navigate(path);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto p-6 max-w-screen-2xl space-y-8">
        {" "}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600 font-medium">
                Sistema Online
              </span>
            </div>
            <Badge
              variant="outline"
              className="bg-white text-gray-700 border-gray-300"
            >
              {availableShortcuts.length} Módulos Ativos
            </Badge>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Resumo de Vendas
          </h2>
          {isLoading || isProcessing ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {" "}
              <div className="hidden">
                <ResumeCard title="Hoje" data={hoje} showOrdersCount={true} />
              </div>
              <ResumeCard title="Ontem" data={ontem} showOrdersCount={true} />
              <ResumeCard
                title="Anteontem"
                data={ontem2}
                showOrdersCount={true}
              />
              <ResumeCard
                title="Média"
                data={mediaDiaria}
                showOrdersCount={false}
              />
              <ResumeCard
                title="Previsão Mês"
                data={previsaoMes}
                showOrdersCount={false}
              />
              <ResumeCard
                title="Mês passado"
                data={lastMonth}
                showOrdersCount={false}
              />
            </div>
          )}
          <Button
            variant="default"
            onClick={handleClick}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Limpar Cache e Recalcular"
            )}
          </Button>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Acesso Rápido</h2>
          {availableShortcuts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {availableShortcuts.map((shortcut, index) => (
                <Card
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => handleNavigation(shortcut.path)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {React.cloneElement(shortcut.icon, {
                          className: "h-5 w-5 text-gray-600",
                        })}
                        <span className="font-semibold text-gray-900 text-lg">
                          {shortcut.title}
                        </span>
                      </div>
                      {/* Dynamic status indicator */}
                      {shortcut.status === "online" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      )}
                      {shortcut.status === "warning" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      )}
                      {shortcut.status === "info" && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        {shortcut.count !== null ? (
                          <>
                            <span className="text-2xl font-bold text-gray-900">
                              {shortcut.count}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              {shortcut.label}
                            </span>
                          </>
                        ) : (
                          <span className="text-base font-medium text-gray-500">
                            {shortcut.label}
                          </span>
                        )}
                      </div>
                      {/* Dynamic Badge based on status */}
                      {shortcut.status && (
                        <Badge
                          className={cn(
                            "text-xs font-medium",
                            shortcut.status === "online" &&
                              "bg-green-100 text-green-700",
                            shortcut.status === "warning" &&
                              "bg-yellow-100 text-yellow-700",
                            shortcut.status === "info" &&
                              "bg-blue-100 text-blue-700"
                          )}
                        >
                          {shortcut.status === "online" && "Ativo"}
                          {shortcut.status === "warning" && "Atenção"}
                          {shortcut.status === "info" && "Info"}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white rounded-xl border border-gray-200">
              <CardContent className="p-8 text-center">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum módulo disponível
                </h3>
                <p className="text-gray-600">
                  Entre em contato com o administrador para configurar suas
                  permissões.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
