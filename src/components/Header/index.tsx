"use client";

import { Bolt, LogOut, Users, Menu, Home, Gauge } from "lucide-react";
import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePermission } from "@/hooks/usePermissions";

interface HeaderProps {
  handleAuthentication?: (authenticated: boolean) => void;
}

export default function Header({ handleAuthentication }: HeaderProps) {
  const { can, isOwner, canAny } = usePermission();
  const [production] = useState(
    typeof window !== "undefined" &&
      localStorage.getItem("productionBrowser") === "yes"
  );
  const navigate = useNavigate();
  const location = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    setIsSheetOpen(false);
  }, [location]);

  const logout = () => {
    handleAuthentication && handleAuthentication(false);
    localStorage.removeItem("userToken");
    localStorage.removeItem("role");
    localStorage.removeItem("permissions");
    navigate("/login");
  };

  const navItems = [
    {
      title: "Início",
      href: isOwner || can("view_sales") ? "/v2" : "/",
      icon: isOwner || can("view_sales") ? Gauge : Home,
      condition: true,
      isIconLink: true,
    },
    {
      title: "Mercado livre",
      href: "/dashboard",
      condition: !production && can("view_links"),
    },
    {
      title: "Shopee",
      href: "/shopee",
      condition: !production && can("view_links"),
    },
    {
      title: "Estoque Mercado Livre",
      href: "/account/products",
      condition: !production && can("manage_meli_products"),
    },
    {
      title: "Gerenciar usuários",
      href: "/manage-users",
      condition: !production && can("control_users"),
    },
    {
      title: "Logs",
      href: "/logs",
      condition: !production && can("view_logs"),
    },
    {
      title: "Notas fiscais",
      href: "/nf",
      condition: !production && can("view_nf"),
    },
    // {
    //   title: "Produtos",
    //   href: "/products-catalog",
    //   condition: !production && can("manage_products_catalog"),
    // },
  ];

  const iconActions = [
    {
      title: "Faccionistas",
      href: "/users",
      icon: Users,
      condition: canAny("manage_faccionistas", "view_production"),
    },
    {
      title: "Configurações",
      href: "/config",
      icon: Bolt,
      condition: !production && isOwner,
    },
  ];

  return (
    <TooltipProvider>
      <header className="bg-zinc-800">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex lg:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-50"
                >
                  <span className="sr-only">Abrir menu</span>
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-full sm:max-w-xs bg-white p-6"
              >
                <div className="mt-6 flow-root">
                  <div className="-my-6 divide-y divide-gray-500/10">
                    <div className="space-y-2 py-6">
                      {navItems.map(
                        (item) =>
                          item.condition && (
                            <NavLink
                              key={item.title}
                              to={item.href}
                              className={({ isActive }) =>
                                `-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 cursor-pointer ${
                                  isActive ? "underline" : ""
                                } ${
                                  item.isIconLink
                                    ? "flex items-center gap-x-2"
                                    : ""
                                }`
                              }
                              onClick={() => setIsSheetOpen(false)}
                            >
                              {item.isIconLink && item.icon && (
                                <item.icon className="h-6 w-6" />
                              )}
                              {item.title}
                            </NavLink>
                          )
                      )}
                      {iconActions.map(
                        (action) =>
                          action.condition && (
                            <NavLink
                              key={action.title}
                              to={action.href}
                              className={({ isActive }) =>
                                `-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 cursor-pointer ${
                                  isActive ? "underline" : ""
                                }`
                              }
                              onClick={() => setIsSheetOpen(false)}
                            >
                              {action.title}
                            </NavLink>
                          )
                      )}
                    </div>
                    <div className="py-6">
                      <a
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 cursor-pointer"
                        onClick={logout}
                      >
                        Sair
                      </a>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden lg:flex lg:gap-x-12">
            {navItems.map(
              (item) =>
                item.condition && (
                  <NavLink
                    key={item.title}
                    to={item.href}
                    className={({ isActive }) =>
                      `text-sm font-semibold leading-6 text-zinc-200 cursor-pointer ${
                        isActive ? "underline" : ""
                      } ${item.isIconLink ? "flex items-center gap-x-1" : ""}`
                    }
                  >
                    {item.isIconLink && item.icon && (
                      <item.icon className="h-5 w-5" />
                    )}
                    {item.isIconLink ? "" : item.title}
                  </NavLink>
                )
            )}
          </div>

          <div className="hidden lg:flex lg:flex-3 lg:justify-end items-center gap-6">
            {iconActions.map(
              (action) =>
                action.condition && (
                  <Tooltip key={action.title}>
                    <TooltipTrigger asChild>
                      <NavLink to={action.href} className="text-zinc-200">
                        <action.icon className="h-6 w-6" />
                        <span className="sr-only">{action.title}</span>
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{action.title}</p>
                    </TooltipContent>
                  </Tooltip>
                )
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <a className="text-zinc-200 cursor-pointer" onClick={logout}>
                  <LogOut className="h-6 w-6" />
                  <span className="sr-only">Sair</span>
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sair</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </nav>
      </header>
    </TooltipProvider>
  );
}
