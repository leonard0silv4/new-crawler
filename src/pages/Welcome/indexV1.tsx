"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ShoppingCart,
  Package,
  Users,
  UserCog,
  FileText,
  Settings,
  Activity,
  Store,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermission } from "@/hooks/usePermissions";

export default function WelcomePage() {
  const navigate = useNavigate();
  const { can, isOwner, canAny } = usePermission();
  const production = !!(
    window.localStorage !== undefined &&
    localStorage.getItem("productionBrowser") == "yes"
  );

  const shortcuts = [
    {
      title: "Mercado Livre",
      description: "Acompanhe links Mercado Livre",
      icon: <ShoppingCart className="h-8 w-8 text-yellow-600" />,
      path: "/dashboard",
      show: !production && can("view_links"),
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Shopee",
      description: "Acompanhe links Shopee",
      icon: <Store className="h-8 w-8 text-orange-600" />,
      path: "/shopee",
      show: !production && can("view_links"),
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Estoque ML",
      description: "Controle produtos Mercado Livre",
      icon: <Package className="h-8 w-8 text-blue-600" />,
      path: "/account/products",
      show: !production && can("manage_meli_products"),
      color: "from-blue-500 to-indigo-500",
    },
    {
      title: "Faccionistas",
      description: "Gestão de produção",
      icon: <Users className="h-8 w-8 text-green-600" />,
      path: "/users",
      show: canAny("manage_faccionistas", "view_production"),
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Usuários",
      description: "Gerenciar usuários do sistema",
      icon: <UserCog className="h-8 w-8 text-purple-600" />,
      path: "/manage-users",
      show: !production && can("control_users"),
      color: "from-purple-500 to-violet-500",
    },
    {
      title: "Logs",
      description: "Visualizar logs do sistema",
      icon: <Activity className="h-8 w-8 text-gray-600" />,
      path: "/logs",
      show: !production && can("view_logs"),
      color: "from-gray-500 to-slate-500",
    },
    {
      title: "Notas Fiscais",
      description: "Gestão de documentos fiscais",
      icon: <FileText className="h-8 w-8 text-teal-600" />,
      path: "/nf",
      show: !production && can("view_nf"),
      color: "from-teal-500 to-cyan-500",
    },
    {
      title: "Configurações",
      description: "Configurações do sistema",
      icon: <Settings className="h-8 w-8 text-red-600" />,
      path: "/config",
      show: !production && isOwner,
      color: "from-red-500 to-pink-500",
    },
  ];

  const availableShortcuts = shortcuts.filter((shortcut) => shortcut.show);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Bem-vindo! 👋
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Escolha uma das opções abaixo para começar a trabalhar
          </p>
        </div>

        {/* Shortcuts Grid */}
        {availableShortcuts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {availableShortcuts.map((shortcut, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-0 shadow-lg overflow-hidden"
                onClick={() => handleNavigation(shortcut.path)}
              >
                <div className={`h-2 bg-gradient-to-r ${shortcut.color}`} />
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors">
                      {shortcut.icon}
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">
                    {shortcut.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {shortcut.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Settings className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhuma funcionalidade disponível
              </h3>
              <p className="text-gray-600">
                Entre em contato com o administrador para obter acesso às
                funcionalidades do sistema.
              </p>
            </div>
          </div>
        )}

        {/* Footer Info */}
        {availableShortcuts.length > 0 && (
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-sm border">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">
                Sistema online • {availableShortcuts.length} funcionalidade
                {availableShortcuts.length !== 1 ? "s" : ""} disponível
                {availableShortcuts.length !== 1 ? "eis" : ""}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
