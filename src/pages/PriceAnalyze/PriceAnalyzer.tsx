"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { ProductGroup } from "@/lib/xml-parser";
import { ChevronDown, ExternalLink } from "lucide-react";
import { ProductDetailsModal } from "./ProductDetailsModal";

interface PriceAnalyzerProps {
    productGroups: ProductGroup[];
    extractionDate: string | null;
}

export function PriceAnalyzer({ productGroups, extractionDate }: PriceAnalyzerProps) {
    const [selectedProduct, setSelectedProduct] = useState<ProductGroup | null>(null);

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">Análise de Preços</h1>
                        {extractionDate && (
                            <div className="text-sm text-gray-500">
                                <span className="font-medium">Data de extração:</span>{" "}
                                <span className="text-gray-700">
                                    {new Date(extractionDate).toLocaleString("pt-BR", {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-gray-600">Monitore seus produtos e concorrentes - {productGroups.length} produtos</p>
                </div>

                {/* Tabela de Produtos */}
                <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Produto</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Melhor Preço</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vendedor</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">+3 Concorrentes</th>
                                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {productGroups.map((group) => {
                                    const sortedProducts = [...group.products].sort((a, b) => a.preco - b.preco);
                                    const bestProduct = sortedProducts[0];
                                    const top4 = sortedProducts.slice(0, 4);
                                    const hasCompetitors = sortedProducts.some((p) => !p.isMyStore);

                                    return (
                                        <tr key={group.grupo} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="max-w-xs">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {!hasCompetitors && (
                                                            <Badge className="bg-purple-50 text-purple-700 text-xs border border-purple-200">
                                                                Sem concorrentes
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900 truncate">{group.nome}</p>
                                                    {group.recommendation && (
                                                        <p className="text-xs text-amber-600 mt-1 line-clamp-1">{group.recommendation}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-lg font-bold text-green-600">R$ {bestProduct.preco.toFixed(2)}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {bestProduct.isMyStore ? "(Meu preço)" : `(${bestProduct.vendedor})`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {bestProduct.url ? (
                                                    <a
                                                        href={bestProduct.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-block"
                                                    >
                                                        <Badge
                                                            className={
                                                                bestProduct.isMyStore
                                                                    ? "bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
                                                                    : "bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                                                            }
                                                        >
                                                            {bestProduct.vendedor}
                                                            <ExternalLink className="w-3 h-3 ml-1 inline-block" />
                                                        </Badge>
                                                    </a>
                                                ) : (
                                                    <Badge
                                                        className={
                                                            bestProduct.isMyStore
                                                                ? "bg-green-100 text-green-800"
                                                                : "bg-blue-100 text-blue-800"
                                                        }
                                                    >
                                                        {bestProduct.vendedor}
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="space-y-1">
                                                    {top4.slice(1, 4).map((product, idx) => (
                                                        <div key={product.id} className="text-xs flex items-center gap-2">
                                                            <span className="text-gray-500">+{idx + 1}</span>
                                                            <span className="font-medium text-gray-700">R$ {product.preco.toFixed(2)}</span>
                                                            {product.url ? (
                                                                <a
                                                                    href={product.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                                                >
                                                                    {product.vendedor}
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </a>
                                                            ) : (
                                                                <span className="text-gray-600">{product.vendedor}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => setSelectedProduct(group)}
                                                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    Detalhes
                                                    <ChevronDown className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
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

