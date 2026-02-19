"use client";

import { Bolt, LogOut, Users, Menu, Home, Gauge, Package, ChevronDown, BarChart3, Scan, FileText, PackageOpen, TrendingUp, Store } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
  const [isExpedicaoDropdownOpen, setIsExpedicaoDropdownOpen] = useState(false);
  const [isFaccionistasDropdownOpen, setIsFaccionistasDropdownOpen] = useState(false);
  const [isMonitorDropdownOpen, setIsMonitorDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const faccionistasDropdownRef = useRef<HTMLDivElement>(null);
  const monitorDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsSheetOpen(false);
    setIsExpedicaoDropdownOpen(false);
    setIsFaccionistasDropdownOpen(false);
    setIsMonitorDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsExpedicaoDropdownOpen(false);
      }
      if (faccionistasDropdownRef.current && !faccionistasDropdownRef.current.contains(event.target as Node)) {
        setIsFaccionistasDropdownOpen(false);
      }
      if (monitorDropdownRef.current && !monitorDropdownRef.current.contains(event.target as Node)) {
        setIsMonitorDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    {
      title: "Produtos",
      href: "/products-catalog",
      condition: !production && can("manage_products_catalog"),
    },
  ];

  const iconActions = [
    {
      title: "Configurações",
      href: "/config",
      icon: Bolt,
      condition: !production && isOwner,
    },
  ];

  const showFaccionistasMenu = canAny("manage_faccionistas", "view_production", "expedition_discharge");
  const showMonitorMenu = !production && (isOwner || can("view_links") || can("view_nf") || can("seller_monitor"));

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
                className="w-full sm:max-w-xs bg-white p-6 overflow-y-auto"
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
                                `-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 cursor-pointer ${isActive ? "underline" : ""
                                } ${item.isIconLink
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
                      
                      {/* Expedição - Dropdown Mobile */}
                      {!production && canAny("expedition_entry", "view_expedition_dashboard", "expedition_report") && (
                        <div className="-mx-3 px-3 py-2">
                          <div className="text-base font-semibold leading-7 text-gray-900 mb-2 flex items-center gap-x-2">
                            <Package className="h-5 w-5" />
                            Expedição
                          </div>
                          <div className="ml-7 space-y-2">
                            {can("expedition_entry") && (
                              <NavLink
                                to="/expedicao"
                                className={({ isActive }) =>
                                  `block rounded-lg px-3 py-1.5 text-sm font-medium leading-6 text-gray-700 hover:bg-gray-50 cursor-pointer ${isActive ? "underline" : ""}`
                                }
                                onClick={() => setIsSheetOpen(false)}
                              >
                                <div className="flex items-center gap-x-2">
                                  <Scan className="h-4 w-4" />
                                  Leitura de Código
                                </div>
                              </NavLink>
                            )}
                            {can("view_expedition_dashboard") && (
                              <NavLink
                                to="/dashboard-expedicao"
                                className={({ isActive }) =>
                                  `block rounded-lg px-3 py-1.5 text-sm font-medium leading-6 text-gray-700 hover:bg-gray-50 cursor-pointer ${isActive ? "underline" : ""}`
                                }
                                onClick={() => setIsSheetOpen(false)}
                              >
                                <div className="flex items-center gap-x-2">
                                  <BarChart3 className="h-4 w-4" />
                                  Dashboard
                                </div>
                              </NavLink>
                            )}
                            {can("expedition_report") && (
                              <NavLink
                                to="/relatorio-expedicao"
                                className={({ isActive }) =>
                                  `block rounded-lg px-3 py-1.5 text-sm font-medium leading-6 text-gray-700 hover:bg-gray-50 cursor-pointer ${isActive ? "underline" : ""}`
                                }
                                onClick={() => setIsSheetOpen(false)}
                              >
                                <div className="flex items-center gap-x-2">
                                  <FileText className="h-4 w-4" />
                                  Relatório
                                </div>
                              </NavLink>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Monitor - Dropdown Mobile */}
                      {showMonitorMenu && (
                        <div className="-mx-3 px-3 py-2">
                          <div className="text-base font-semibold leading-7 text-gray-900 mb-2 flex items-center gap-x-2">
                            <TrendingUp className="h-5 w-5" />
                            Monitor
                          </div>
                          <div className="ml-7 space-y-2">
                            {(isOwner || can("view_links") || can("view_nf")) && (
                              <NavLink
                                to="/price-analyze"
                                className={({ isActive }) =>
                                  `block rounded-lg px-3 py-1.5 text-sm font-medium leading-6 text-gray-700 hover:bg-gray-50 cursor-pointer ${isActive ? "underline" : ""}`
                                }
                                onClick={() => setIsSheetOpen(false)}
                              >
                                <div className="flex items-center gap-x-2">
                                  <TrendingUp className="h-4 w-4" />
                                  Análise de preços
                                </div>
                              </NavLink>
                            )}
                            {can("seller_monitor") && (
                              <NavLink
                                to="/seller-monitor"
                                className={({ isActive }) =>
                                  `block rounded-lg px-3 py-1.5 text-sm font-medium leading-6 text-gray-700 hover:bg-gray-50 cursor-pointer ${isActive ? "underline" : ""}`
                                }
                                onClick={() => setIsSheetOpen(false)}
                              >
                                <div className="flex items-center gap-x-2">
                                  <Store className="h-4 w-4" />
                                  Análise de vendedores
                                </div>
                              </NavLink>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Faccionistas - Dropdown Mobile */}
                      {showFaccionistasMenu && (
                        <div className="-mx-3 px-3 py-2">
                          <div className="text-base font-semibold leading-7 text-gray-900 mb-2 flex items-center gap-x-2">
                            <Users className="h-5 w-5" />
                            Faccionistas
                          </div>
                          <div className="ml-7 space-y-2">
                            {(can("manage_faccionistas") || can("view_production")) && (
                              <NavLink
                                to="/users"
                                className={({ isActive }) =>
                                  `block rounded-lg px-3 py-1.5 text-sm font-medium leading-6 text-gray-700 hover:bg-gray-50 cursor-pointer ${isActive ? "underline" : ""}`
                                }
                                onClick={() => setIsSheetOpen(false)}
                              >
                                <div className="flex items-center gap-x-2">
                                  <Users className="h-4 w-4" />
                                  Faccionistas
                                </div>
                              </NavLink>
                            )}
                            {can("expedition_discharge") && (
                              <NavLink
                                to="/descarregamento-lotes"
                                className={({ isActive }) =>
                                  `block rounded-lg px-3 py-1.5 text-sm font-medium leading-6 text-gray-700 hover:bg-gray-50 cursor-pointer ${isActive ? "underline" : ""}`
                                }
                                onClick={() => setIsSheetOpen(false)}
                              >
                                <div className="flex items-center gap-x-2">
                                  <PackageOpen className="h-4 w-4" />
                                  Descarregamento lotes
                                </div>
                              </NavLink>
                            )}
                          </div>
                        </div>
                      )}

                      {iconActions.map(
                        (action) =>
                          action.condition && (
                            <NavLink
                              key={action.title}
                              to={action.href}
                              className={({ isActive }) =>
                                `-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 cursor-pointer ${isActive ? "underline" : ""
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

          <div className="hidden lg:flex lg:gap-x-6 lg:flex-nowrap lg:items-center">
            {navItems.map(
              (item) =>
                item.condition && (
                  <NavLink
                    key={item.title}
                    to={item.href}
                    className={({ isActive }) =>
                      `text-sm font-semibold leading-6 text-zinc-200 cursor-pointer whitespace-nowrap transition-colors duration-200 hover:text-white hover:opacity-90 ${isActive ? "underline" : ""
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
            
            {/* Expedição - Dropdown Desktop */}
            {!production && canAny("expedition_entry", "view_expedition_dashboard", "expedition_report") && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsExpedicaoDropdownOpen(!isExpedicaoDropdownOpen)}
                  className="text-sm font-semibold leading-6 text-zinc-200 cursor-pointer whitespace-nowrap transition-colors duration-200 hover:text-white hover:opacity-90 flex items-center gap-x-1"
                >
                  Expedição
                  <ChevronDown className={`h-4 w-4 transition-transform ${isExpedicaoDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isExpedicaoDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    {can("expedition_entry") && (
                      <NavLink
                        to="/expedicao"
                        className="flex items-center gap-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsExpedicaoDropdownOpen(false)}
                      >
                        <Scan className="h-4 w-4" />
                        <span>Leitura de Código</span>
                      </NavLink>
                    )}
                    {can("view_expedition_dashboard") && (
                      <NavLink
                        to="/dashboard-expedicao"
                        className="flex items-center gap-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsExpedicaoDropdownOpen(false)}
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span>Dashboard</span>
                      </NavLink>
                    )}
                    {can("expedition_report") && (
                      <NavLink
                        to="/relatorio-expedicao"
                        className="flex items-center gap-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsExpedicaoDropdownOpen(false)}
                      >
                        <FileText className="h-4 w-4" />
                        <span>Relatório</span>
                      </NavLink>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Monitor - Dropdown Desktop */}
            {showMonitorMenu && (
              <div className="relative" ref={monitorDropdownRef}>
                <button
                  onClick={() => setIsMonitorDropdownOpen(!isMonitorDropdownOpen)}
                  className="text-sm font-semibold leading-6 text-zinc-200 cursor-pointer whitespace-nowrap transition-colors duration-200 hover:text-white hover:opacity-90 flex items-center gap-x-1"
                >
                  Monitor
                  <ChevronDown className={`h-4 w-4 transition-transform ${isMonitorDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isMonitorDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    {(isOwner || can("view_links") || can("view_nf")) && (
                      <NavLink
                        to="/price-analyze"
                        className="flex items-center gap-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMonitorDropdownOpen(false)}
                      >
                        <TrendingUp className="h-4 w-4" />
                        <span>Análise de preços</span>
                      </NavLink>
                    )}
                    {can("seller_monitor") && (
                      <NavLink
                        to="/seller-monitor"
                        className="flex items-center gap-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMonitorDropdownOpen(false)}
                      >
                        <Store className="h-4 w-4" />
                        <span>Análise de vendedores</span>
                      </NavLink>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden lg:flex lg:flex-3 lg:justify-end items-center gap-6">
            {/* Faccionistas - Dropdown Desktop */}
            {showFaccionistasMenu && (
              <div className="relative" ref={faccionistasDropdownRef}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setIsFaccionistasDropdownOpen(!isFaccionistasDropdownOpen)}
                      className="text-zinc-200 transition-colors duration-200 hover:text-white hover:opacity-90 flex items-center"
                    >
                      <Users className="h-6 w-6" />
                      <ChevronDown className={`h-4 w-4 ml-0.5 transition-transform ${isFaccionistasDropdownOpen ? "rotate-180" : ""}`} />
                      <span className="sr-only">Faccionistas</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Faccionistas</p>
                  </TooltipContent>
                </Tooltip>
                {isFaccionistasDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    {(can("manage_faccionistas") || can("view_production")) && (
                      <NavLink
                        to="/users"
                        className="flex items-center gap-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsFaccionistasDropdownOpen(false)}
                      >
                        <Users className="h-4 w-4" />
                        <span>Faccionistas</span>
                      </NavLink>
                    )}
                    {can("expedition_discharge") && (
                      <NavLink
                        to="/descarregamento-lotes"
                        className="flex items-center gap-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setIsFaccionistasDropdownOpen(false)}
                      >
                        <PackageOpen className="h-4 w-4" />
                        <span>Descarregamento lotes</span>
                      </NavLink>
                    )}
                  </div>
                )}
              </div>
            )}

            {iconActions.map(
              (action) =>
                action.condition && (
                  <Tooltip key={action.title}>
                    <TooltipTrigger asChild>
                      <NavLink to={action.href} className="text-zinc-200 transition-colors duration-200 hover:text-white hover:opacity-90">
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
                <a className="text-zinc-200 cursor-pointer transition-colors duration-200 hover:text-white hover:opacity-90" onClick={logout}>
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
