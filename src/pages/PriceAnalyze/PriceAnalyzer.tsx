"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import type { ProductGroup } from "@/lib/xml-parser";
import { MY_STORES } from "@/lib/xml-parser";
import { ChevronDown, ExternalLink, Filter, X, AlertCircle, TrendingUp, TriangleAlert, Trophy } from "lucide-react";
import { ProductDetailsModal } from "./ProductDetailsModal";

interface PriceAnalyzerProps {
    productGroups: ProductGroup[];
    extractionDate: string | null;
}

type FilterType = "withAlert" | "competitorWinning" | "noCompetitors";

interface FilterOption {
    id: FilterType;
    label: string;
    description: string;
    icon: React.ReactNode;
}

export function PriceAnalyzer({ productGroups, extractionDate }: PriceAnalyzerProps) {
    const [selectedProduct, setSelectedProduct] = useState<ProductGroup | null>(null);
    const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(new Set());
    const [selectedStore, setSelectedStore] = useState<string | null>(null);

    const filterOptions: FilterOption[] = [
        {
            id: "withAlert",
            label: "Com Alerta",
            description: "Produtos com diferença significativa de preço",
            icon: <AlertCircle className="w-4 h-4" />,
        },
        {
            id: "competitorWinning",
            label: "Concorrente Vencedor",
            description: "Produtos onde concorrente tem melhor preço",
            icon: <TrendingUp className="w-4 h-4" />,
        },
        {
            id: "noCompetitors",
            label: "Sem Concorrentes",
            description: "Produtos só com seus anúncios",
            icon: <Filter className="w-4 h-4" />,
        },
    ];

    const toggleFilter = (filter: FilterType) => {
        setActiveFilters((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(filter)) {
                newSet.delete(filter);
            } else {
                newSet.add(filter);
            }
            return newSet;
        });
    };

    const filteredGroups = useMemo(() => {
        let filtered = productGroups;

        // Apply store filter
        if (selectedStore) {
            filtered = filtered.map((group) => ({
                ...group,
                products: group.products.filter((p) => p.vendedor.toUpperCase().includes(selectedStore.toUpperCase())),
            })).filter((group) => group.products.length > 0);
        }

        // Apply other filters
        if (activeFilters.size === 0) {
            return filtered;
        }

        return filtered.filter((group) => {
            const sortedProducts = [...group.products].sort((a, b) => a.preco - b.preco);
            const bestProduct = sortedProducts[0];
            const hasCompetitors = sortedProducts.some((p) => !p.isMyStore);

            let matchesAllFilters = true;

            if (activeFilters.has("withAlert")) {
                matchesAllFilters = matchesAllFilters && !!group.recommendation;
            }

            if (activeFilters.has("competitorWinning")) {
                matchesAllFilters = matchesAllFilters && !bestProduct.isMyStore;
            }

            if (activeFilters.has("noCompetitors")) {
                matchesAllFilters = matchesAllFilters && !hasCompetitors;
            }

            return matchesAllFilters;
        });
    }, [productGroups, activeFilters, selectedStore]);

    const uniqueStores = useMemo(() => {
        const stores = new Set<string>();
        productGroups.forEach((group) => {
            group.products.forEach((p) => {
                stores.add(p.vendedor);
            });
        });
        return Array.from(stores).sort();
    }, [productGroups]);

    const stats = useMemo(() => {
        const withAlerts = productGroups.filter((g) => g.recommendation).length;
        const competitorWinning = productGroups.filter((g) => {
            const sortedProducts = [...g.products].sort((a, b) => a.preco - b.preco);
            return !sortedProducts[0].isMyStore;
        }).length;
        const noCompetitors = productGroups.filter((g) => !g.products.some((p) => !p.isMyStore)).length;

        return { withAlerts, competitorWinning, noCompetitors };
    }, [productGroups]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white">Análise de Preços</h1>
                                <p className="text-blue-100 mt-1">Monitor de anúncios e concorrentes </p>
                            </div>
                            {extractionDate && (
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-right">
                                    <p className="text-xs text-blue-100">Atualizado em</p>
                                    <p className="text-sm font-semibold text-white">
                                        {new Date(extractionDate).toLocaleString("pt-BR", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
                            <p className="text-sm text-amber-700 font-medium">Com Alerta</p>
                            <p className="text-3xl font-bold text-amber-900 mt-1">{stats.withAlerts}</p>
                            <p className="text-xs text-amber-600 mt-1">Diferença significativa</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                            <p className="text-sm text-red-700 font-medium">Concorrente Vencedor</p>
                            <p className="text-3xl font-bold text-red-900 mt-1">{stats.competitorWinning}</p>
                            <p className="text-xs text-red-600 mt-1">Precisa revisar</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                            <p className="text-sm text-purple-700 font-medium">Sem Concorrentes</p>
                            <p className="text-3xl font-bold text-purple-900 mt-1">{stats.noCompetitors}</p>
                            <p className="text-xs text-purple-600 mt-1">Monopólio</p>
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="mb-4">
                        <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            Filtros Avançados
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {/* Filter Buttons */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {filterOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => toggleFilter(option.id)}
                                    className={`p-4 rounded-lg border-2 transition-all text-left ${activeFilters.has(option.id)
                                        ? "border-blue-500 bg-blue-50"
                                        : "border-slate-200 bg-white hover:border-slate-300"
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span
                                            className={`p-2 rounded-lg ${activeFilters.has(option.id)
                                                ? "bg-blue-100 text-blue-600"
                                                : "bg-slate-100 text-slate-600"
                                                }`}
                                        >
                                            {option.icon}
                                        </span>
                                        {activeFilters.has(option.id) && (
                                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                    <p className={`text-sm font-medium ${activeFilters.has(option.id) ? "text-blue-900" : "text-slate-900"}`}>
                                        {option.label}
                                    </p>
                                    <p className="text-xs text-slate-600 mt-1">{option.description}</p>
                                </button>
                            ))}
                        </div>

                        {/* Store Filter */}
                        <div>
                            <p className="text-sm font-medium text-slate-700 mb-3">Filtrar por Vendedor:</p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedStore(null)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedStore === null
                                        ? "bg-blue-500 text-white"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                        }`}
                                >
                                    Todos
                                </button>
                                {uniqueStores.map((store) => (
                                    <button
                                        key={store}
                                        onClick={() => setSelectedStore(store)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${selectedStore === store
                                            ? "bg-blue-500 text-white"
                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                            }`}
                                    >
                                        {store}
                                        {MY_STORES.includes(store.toUpperCase()) && (
                                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Clear Filters */}
                        {(activeFilters.size > 0 || selectedStore) && (
                            <button
                                onClick={() => {
                                    setActiveFilters(new Set());
                                    setSelectedStore(null);
                                }}
                                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors mt-2"
                            >
                                <X className="w-4 h-4" />
                                Limpar todos os filtros
                            </button>
                        )}
                    </div>
                </div>

                {/* Results Count */}
                <div className="text-sm text-slate-600">
                    Exibindo <span className="font-semibold text-slate-900">{filteredGroups.length}</span> de{" "}
                    <span className="font-semibold text-slate-900">{productGroups.length}</span> produtos
                </div>

                {/* Tabela de Produtos */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Produto</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Melhor Preço</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Vendedor</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">+3 Concorrentes</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredGroups.length > 0 ? (
                                    filteredGroups.map((group) => {
                                        const sortedProducts = [...group.products].sort((a, b) => a.preco - b.preco);
                                        const bestProduct = sortedProducts[0];
                                        const top4 = sortedProducts.slice(0, 4);
                                        const hasCompetitors = sortedProducts.some((p) => !p.isMyStore);

                                        return (
                                            <tr key={group.grupo} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="max-w-xs">
                                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                            {!hasCompetitors && (
                                                                <Badge className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300 text-xs font-semibold">
                                                                    <Trophy className="w-4 h-4 mr-2 !text-yellow-500" />  Sem concorrentes
                                                                </Badge>
                                                            )}
                                                            {group.recommendation && (
                                                                <Badge className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300 text-xs font-semibold">
                                                                    <TriangleAlert className="w-4 h-4 mr-2 !text-orange-600" /> Alerta
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {bestProduct.urlOriginal ? (
                                                            <a
                                                                href={bestProduct.urlOriginal}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-sm font-medium text-slate-900 break-words whitespace-normal hover:text-blue-600 hover:underline"
                                                            >
                                                                {group.nome}
                                                            </a>
                                                        ) : (
                                                            <p className="text-sm font-medium text-slate-900 break-words whitespace-normal">{group.nome}</p>
                                                        )}
                                                        {group.recommendation && (
                                                            <p className="text-xs text-amber-700 mt-2 line-clamp-2 bg-amber-50 rounded px-2 py-1">
                                                                {group.recommendation}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-baseline gap-2 flex-col">
                                                        <span className="text-xs text-slate-500 ">
                                                            {bestProduct.isMyStore ? "✓ Meu preço" : `${bestProduct.vendedor}`}
                                                        </span>
                                                        <span className="text-xl font-bold text-green-600">R$ {bestProduct.preco.toFixed(2)}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {bestProduct.urlOriginal ? (
                                                        <a href={bestProduct.urlOriginal} target="_blank" rel="noopener noreferrer" className="inline-block">
                                                            <Badge
                                                                className={`cursor-pointer transition-all hover:shadow-md ${bestProduct.isMyStore
                                                                    ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300"
                                                                    : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300"
                                                                    }`}
                                                            >
                                                                {bestProduct.vendedor}
                                                                <ExternalLink className="w-3 h-3 ml-1 inline-block" />
                                                            </Badge>
                                                        </a>
                                                    ) : (
                                                        <Badge
                                                            className={
                                                                bestProduct.isMyStore
                                                                    ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300"
                                                                    : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300"
                                                            }
                                                        >
                                                            {bestProduct.vendedor}
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-2">
                                                        {top4.slice(1, 4).map((product, idx) => (
                                                            <div key={product.id} className="text-xs flex items-center gap-2 bg-slate-50 rounded px-2 py-1">
                                                                <span className="text-slate-500 font-medium">#{idx + 2}</span>
                                                                <span className="font-semibold text-slate-700">R$ {product.preco.toFixed(2)}</span>
                                                                {product.url ? (
                                                                    <a
                                                                        href={product.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 ml-auto"
                                                                    >
                                                                        {product.vendedor}
                                                                        <ExternalLink className="w-3 h-3" />
                                                                    </a>
                                                                ) : (
                                                                    <span className="text-slate-600 ml-auto">{product.vendedor}</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => setSelectedProduct(group)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                                                    >
                                                        Detalhes
                                                        <ChevronDown className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-600">
                                            <p className="font-medium mb-1">Nenhum produto encontrado</p>
                                            <p className="text-sm">Tente ajustar seus filtros</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal de Detalhes */}
                <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
            </div>
        </div>
    );
}

