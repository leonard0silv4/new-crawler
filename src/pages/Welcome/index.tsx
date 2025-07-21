"use client";

import React from "react";
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
} from "lucide-react";

export default function WelcomePageNew() {
  const navigate = useNavigate();
  const { can, isOwner, canAny } = usePermission();
  const { hoje, ontem, mediaDiaria, previsaoMes, isLoading } =
    useDashboardSalesData();

  console.log({ hoje, ontem, mediaDiaria, previsaoMes, isLoading });

  const production =
    typeof window !== "undefined" &&
    localStorage.getItem("productionBrowser") === "yes";

  const shortcuts = [
    {
      title: "Mercado Livre",
      icon: <ShoppingCart className="h-5 w-5" />,
      path: "/dashboard",
      show: !production && can("view_links"),
      status: "online",
      count: null,
      label: "produtos",
    },
    {
      title: "Shopee",
      icon: <Store className="h-5 w-5" />,
      path: "/shopee",
      show: !production && can("view_links"),
      status: "online",
      count: null,
      label: "itens",
    },
    {
      title: "Estoque ML",
      icon: <Package className="h-5 w-5" />,
      path: "/account/products",
      show: !production && can("manage_meli_products"),
      status: "warning",
      count: null,
      label: "Estoque",
    },
    {
      title: "Faccionistas",
      icon: <Users className="h-5 w-5" />,
      path: "/users",
      show: canAny("manage_faccionistas", "view_production"),
      status: "online",
      count: null,
      label: "ativos",
    },
    {
      title: "Usuários",
      icon: <UserCog className="h-5 w-5" />,
      path: "/manage-users",
      show: !production && can("control_users"),
      status: "online",
      count: null,
      label: "usuários",
    },
    {
      title: "Logs",
      icon: <Activity className="h-5 w-5" />,
      path: "/logs",
      show: !production && can("view_logs"),
      status: "info",
      count: null,
      label: "hoje",
    },
    {
      title: "Notas Fiscais",
      icon: <FileText className="h-5 w-5" />,
      path: "/nf",
      show: !production && can("view_nf"),
      status: "online",
      count: null,
      label: "Disponíveis",
    },
    {
      title: "Configurações",
      icon: <Settings className="h-5 w-5" />,
      path: "/config",
      show: !production && isOwner,
      status: "online",
    },
  ];

  const availableShortcuts = shortcuts.filter((s) => s.show);
  const handleNavigation = (path: string) => navigate(path);

  const renderResumoCard = (title: string, data: any[]) => {
    const total = data.reduce((acc, l) => acc + (l.totalAmount || 0), 0);
    return (
      <Card key={title} className="bg-white rounded-xl border border-gray-200">
        <CardContent className="p-6 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {data.map((loja) => (
            <div
              key={loja.source}
              className="flex justify-between text-sm text-gray-700"
            >
              <span>{loja.source}</span>

              <span>
                R${" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(loja.totalAmount)}
              </span>
            </div>
          ))}
          <div className="mt-2 font-semibold text-gray-900">
            Total:{" "}
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(total)}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto p-6 max-w-7xl space-y-8">
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
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderResumoCard("Hoje", hoje)}
              {renderResumoCard("Ontem", ontem)}
              {renderResumoCard("Média 5 dias", mediaDiaria)}
              {renderResumoCard("Previsão Mês", previsaoMes)}
            </div>
          )}
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
                        <span className="font-medium text-gray-900 text-base">
                          {shortcut.title}
                        </span>
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-gray-900">
                          {shortcut.count}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          {shortcut.label}
                        </span>
                      </div>
                      <Badge className="text-xs font-medium bg-gray-100 text-green-700">
                        Ativo
                      </Badge>
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
