"use client";

import React from "react";

import { useQuery } from "@tanstack/react-query";
import instance from "@/config/axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermission } from "@/hooks/usePermissions";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { can, isOwner, canAny } = usePermission();

  const production = !!(
    typeof window !== "undefined" &&
    localStorage.getItem("productionBrowser") == "yes"
  );

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const res = await instance.get("/dashboard/summary", {
        headers: {
          ownerId:
            typeof window !== "undefined"
              ? localStorage.getItem("ownerId") || ""
              : "",
        },
      });
      return res as any;
    },
  });

  const currentTime = new Date().toLocaleString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const shortcuts = [
    {
      title: "Mercado Livre",
      icon: <ShoppingCart className="h-5 w-5" />,
      path: "/dashboard",
      show: !production && can("view_links"),
      status: "online",
      count: data?.links?.mercadolivre,
      label: "produtos",
    },
    {
      title: "Shopee",
      icon: <Store className="h-5 w-5" />,
      path: "/shopee",
      show: !production && can("view_links"),
      status: "online",
      count: data?.links?.shopee,
      label: "itens",
    },
    {
      title: "Estoque ML",
      icon: <Package className="h-5 w-5" />,
      path: "/account/products",
      show: !production && can("manage_meli_products"),
      status: "warning",
      count: data?.meliAtivosQtd ?? 0,
      label: "Estoque",
    },
    {
      title: "Faccionistas",
      icon: <Users className="h-5 w-5" />,
      path: "/users",
      show: canAny("manage_faccionistas", "view_production"),
      status: "online",
      count: data?.faccionistasQtd ?? 0,
      label: "ativos",
    },
    {
      title: "Usuários",
      icon: <UserCog className="h-5 w-5" />,
      path: "/manage-users",
      show: !production && can("control_users"),
      status: "online",
      count: data?.usuariosQtd ?? 0,
      label: "usuários",
    },
    {
      title: "Logs",
      icon: <Activity className="h-5 w-5" />,
      path: "/logs",
      show: !production && can("view_logs"),
      status: "info",
      count: data?.logsHojeQtd ?? 0,
      label: "hoje",
    },
    {
      title: "Notas Fiscais",
      icon: <FileText className="h-5 w-5" />,
      path: "/nf",
      show: !production && can("view_nf"),
      status: "online",
      count: data?.notasFiscaisQtd ?? 0,
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

  const availableShortcuts = shortcuts.filter((shortcut) => shortcut.show);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "info":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadgeTextColor = (status: string) => {
    switch (status) {
      case "online":
        return "text-green-700";
      case "warning":
        return "text-yellow-700";
      case "info":
        return "text-blue-700";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto p-6 max-w-7xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2 text-sm">{currentTime}</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
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

        {isOwner && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Visão Geral</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-32" />
                      </div>
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white rounded-xl border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Vendas Ontem</p>
                        <p className="text-3xl font-bold text-gray-900">
                          R$ {data?.vendasOntemReais?.toFixed(2) ?? 0}
                        </p>
                      </div>
                      <TrendingUp className="h-10 w-10 text-gray-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white rounded-xl border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Pedidos ontem</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {data?.pedidosOntemQtd ?? 0}
                        </p>
                      </div>
                      <ShoppingCart className="h-10 w-10 text-gray-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white rounded-xl border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Estoque Baixo</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {data?.estoqueBaixoQtd ?? 0}
                        </p>
                      </div>
                      <AlertCircle className="h-10 w-10 text-gray-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white rounded-xl border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Uptime</p>
                        <p className="text-3xl font-bold text-gray-900">
                          99.8%
                        </p>
                      </div>
                      <Clock className="h-10 w-10 text-gray-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Acesso Rápido</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <Skeleton className="h-2.5 w-2.5 rounded-full" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </Card>
              ))}
            </div>
          ) : availableShortcuts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {availableShortcuts.map((shortcut, index) => (
                <Card
                  key={index}
                  className={`bg-white rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer`}
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
                        </span>{" "}
                      </div>

                      <div
                        className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(
                          shortcut.status
                        )}`}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-gray-900">
                          {shortcut.count}
                        </span>{" "}
                        <span className="text-sm text-gray-500 ml-1">
                          {shortcut.label}
                        </span>
                      </div>

                      <Badge
                        className={`text-xs font-medium bg-gray-100 ${getStatusBadgeTextColor(
                          shortcut.status
                        )}`}
                      >
                        {shortcut.status === "online"
                          ? "Ativo"
                          : shortcut.status === "warning"
                          ? "Alerta"
                          : "Info"}
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

        <Card className="bg-white rounded-xl border border-gray-200">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Servidor Principal
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">Base de Dados</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900">APIs Externas</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
