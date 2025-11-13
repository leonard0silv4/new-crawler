"use client";

import type { ProductGroup } from "@/lib/xml-parser";
import { MY_STORES, PRICE_DIFF_THRESHOLD } from "@/lib/xml-parser";
import { X, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";

interface ProductDetailsModalProps {
    product: ProductGroup | null;
    onClose: () => void;
}

export function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
    if (!product) return null;

    const sortedProducts = [...product.products].sort((a, b) => a.preco - b.preco);
    const bestPrice = sortedProducts[0].preco;
    const myProducts = sortedProducts.filter((p) => p.isMyStore);

    const analyzePrice = (price: number) => {
        const diff = price - bestPrice;
        const diffPercent = (diff / bestPrice) * 100;
        return { diff, diffPercent };
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{product.nome}</h2>
                        <p className="text-sm text-gray-600 mt-1">Grupo: {product.grupo}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="p-6 space-y-6">
                    {/* Resumo */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <p className="text-sm text-gray-600 mb-1">Melhor Preço</p>
                            <p className="text-2xl font-bold text-green-600">R$ {bestPrice.toFixed(2)}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <p className="text-sm text-gray-600 mb-1">Maior Preço</p>
                            <p className="text-2xl font-bold text-blue-600">R$ {product.maxPrice.toFixed(2)}</p>
                        </div>
                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                            <p className="text-sm text-gray-600 mb-1">Diferença</p>
                            <p className="text-2xl font-bold text-orange-600">R$ {(product.maxPrice - bestPrice).toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Seus Anúncios */}
                    {myProducts.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Seus Anúncios</h3>
                            <div className="space-y-2">
                                {myProducts.map((p) => {
                                    const { diffPercent } = analyzePrice(p.preco);
                                    const isWinning = p.preco === bestPrice;
                                    const shouldAnalyze = Math.abs(diffPercent) > PRICE_DIFF_THRESHOLD;

                                    return (
                                        <div key={p.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="font-medium text-gray-900">{p.vendedor}</p>
                                                    <a
                                                        href={p.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                                                    >
                                                        Ver anúncio <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-gray-900">R$ {p.preco.toFixed(2)}</p>
                                                    {isWinning && (
                                                        <span className="inline-block mt-1 px-2 py-1 bg-green-200 text-green-800 text-xs font-semibold rounded">
                                                            Melhor Preço
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {shouldAnalyze && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    {diffPercent > 0 ? (
                                                        <>
                                                            <TrendingUp className="w-4 h-4 text-red-500" />
                                                            <span className="text-red-600">
                                                                {diffPercent.toFixed(1)}% acima do melhor preço - Considere reduzir
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <TrendingDown className="w-4 h-4 text-green-500" />
                                                            <span className="text-green-600">
                                                                {Math.abs(diffPercent).toFixed(1)}% abaixo da média - Você está competitivo!
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Todos os Produtos */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Todos os Anúncios</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {sortedProducts.map((p) => {
                                const { diff, diffPercent } = analyzePrice(p.preco);
                                const isMyStore = MY_STORES.includes(p.vendedor.toUpperCase());
                                const isBestPrice = p.preco === bestPrice;
                                const isCompetitorSignificant = !isMyStore && Math.abs(diffPercent) > PRICE_DIFF_THRESHOLD;

                                return (
                                    <div
                                        key={p.id}
                                        className={`rounded-lg p-3 border ${isMyStore ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-medium text-gray-900">{p.vendedor}</span>
                                                    {isMyStore && (
                                                        <span className="inline-block px-2 py-0.5 bg-green-200 text-green-800 text-xs font-semibold rounded">
                                                            Minha Loja
                                                        </span>
                                                    )}
                                                    {isBestPrice && (
                                                        <span className="inline-block px-2 py-0.5 bg-blue-200 text-blue-800 text-xs font-semibold rounded">
                                                            Melhor
                                                        </span>
                                                    )}
                                                </div>
                                                <a
                                                    href={p.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                >
                                                    Ver anúncio <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">R$ {p.preco.toFixed(2)}</p>
                                                {diff !== 0 && (
                                                    <p className={`text-xs font-medium ${diff > 0 ? "text-red-600" : "text-green-600"}`}>
                                                        {diff > 0 ? "+" : ""}
                                                        {diff.toFixed(2)} ({diffPercent > 0 ? "+" : ""}
                                                        {diffPercent.toFixed(1)}%)
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {isCompetitorSignificant && (
                                            <div className="mt-2 text-xs text-amber-700 flex items-start gap-1">
                                                <span className="font-semibold">⚠️ Diferença significante:</span>
                                                <span>
                                                    {diffPercent > 0
                                                        ? `${diffPercent.toFixed(1)}% acima do mercado`
                                                        : `${Math.abs(diffPercent).toFixed(1)}% abaixo da média`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

