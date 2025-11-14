"use client";

import type { ProductGroup } from "@/lib/xml-parser";
import { MY_STORES, PRICE_DIFF_THRESHOLD } from "@/lib/xml-parser";
import { ExternalLink, AlertCircle, Trophy, Eye, X } from "lucide-react";
// import { ExternalLink, TrendingUp, TrendingDown, AlertCircle, Trophy, Eye, X } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(price);
    };

    return (
        <Dialog open={!!product} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 [&>button]:hidden">
                <DialogHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-6 rounded-t-lg relative">
                    <DialogTitle className="text-2xl font-bold text-white pr-10">{product.nome}</DialogTitle>
                    <DialogDescription className="text-blue-100">
                        Categoria: {product.grupo}
                    </DialogDescription>
                    <DialogClose asChild>
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </DialogClose>
                </DialogHeader>

                <div className="overflow-y-auto flex-1 max-h-[calc(90vh-180px)]">
                    <div className="p-6 space-y-6">
                        {/* Cards de resumo */}
                        <div className="grid grid-cols-3 gap-4">
                            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Melhor Preço</p>
                                        <Trophy className="w-4 h-4 text-green-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-green-700">{formatPrice(bestPrice)}</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Maior Preço</p>
                                        <Eye className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-blue-700">{formatPrice(product.maxPrice)}</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Diferença</p>
                                        <AlertCircle className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-amber-700">{formatPrice(product.maxPrice - bestPrice)}</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Contagem de anúncios */}
                        <div className="flex gap-2 ">
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 px-3 py-1.5">
                                Total de anúncios: {sortedProducts.length}
                            </Badge>
                            {myProducts.length > 0 && (
                                <Badge variant="secondary" className="bg-green-50 text-green-700 px-3 py-1.5">
                                    Seus anúncios: {myProducts.length}
                                </Badge>
                            )}
                        </div>

                        {/* Seus Anúncios */}
                        {/* {myProducts.length > 0 && (
                            <div className="space-y-3 ">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-6 bg-green-600 rounded"></div>
                                    <h3 className="text-lg font-bold">Seus Anúncios</h3>
                                </div>
                                <div className="space-y-2">
                                    {myProducts.map((p) => {
                                        const { diffPercent } = analyzePrice(p.preco);
                                        const isWinning = p.preco === bestPrice;
                                        const shouldAnalyze = Math.abs(diffPercent) > PRICE_DIFF_THRESHOLD;

                                        return (
                                            <Card key={p.id} className="bg-green-50 border-2 border-green-200 hover:border-green-300">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="font-semibold">{p.vendedor}</p>
                                                                {isWinning && (
                                                                    <Badge className="bg-green-200 text-green-800">
                                                                        <Trophy className="w-3 h-3 mr-1" /> Melhor Preço
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <a
                                                                href={p.urlOriginal || p.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 mt-1"
                                                            >
                                                                Ver anúncio completo <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold text-green-700">{formatPrice(p.preco)}</p>
                                                        </div>
                                                    </div>
                                                    {shouldAnalyze && (
                                                        <div className={`flex items-start gap-2 text-sm p-2 rounded-lg ${diffPercent > 0 ? "bg-red-50 text-red-700" : "bg-green-100 text-green-700"
                                                            }`}>
                                                            {diffPercent > 0 ? (
                                                                <>
                                                                    <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                                    <span className="font-medium">{diffPercent.toFixed(1)}% acima do melhor preço. Reduza para ser mais competitivo.</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <TrendingDown className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                                    <span className="font-medium">{Math.abs(diffPercent).toFixed(1)}% abaixo da média. Você está em boa posição!</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        )} */}

                        {/* Análise de Concorrentes */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-6 bg-blue-600 rounded"></div>
                                <h3 className="text-lg font-bold">Análise de Concorrentes</h3>
                            </div>
                            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                {sortedProducts.map((p) => {
                                    const { diff, diffPercent } = analyzePrice(p.preco);
                                    const isMyStore = MY_STORES.includes(p.vendedor.toUpperCase());
                                    const isBestPrice = p.preco === bestPrice;
                                    const isCompetitorSignificant = !isMyStore && Math.abs(diffPercent) > PRICE_DIFF_THRESHOLD;

                                    return (
                                        <Card
                                            key={p.id}
                                            className={`border-2 ${isMyStore
                                                ? "bg-green-50 border-green-200 hover:border-green-300"
                                                : "bg-gray-50 border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                                            <span className="font-semibold">{p.vendedor}</span>
                                                            {isMyStore && (
                                                                <Badge className="bg-green-200 text-green-800">
                                                                    Sua Loja
                                                                </Badge>
                                                            )}
                                                            {isBestPrice && (
                                                                <Badge className="bg-blue-200 text-blue-800">
                                                                    <Trophy className="w-3 h-3 mr-1" /> Melhor
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <a
                                                            href={p.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                                        >
                                                            Ver no Mercado Livre <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-bold">{formatPrice(p.preco)}</p>
                                                        {diff !== 0 && (
                                                            <p className={`text-xs font-semibold mt-1 ${diff > 0 ? "text-red-600" : "text-green-600"}`}>
                                                                {diff > 0 ? "+" : ""}{formatPrice(diff)} ({diffPercent > 0 ? "+" : ""}
                                                                {diffPercent.toFixed(1)}%)
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {isCompetitorSignificant && (
                                                    <div className="mt-3 flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
                                                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                                        <span className="font-semibold">
                                                            Diferença significante: {Math.abs(diffPercent).toFixed(1)}% {diffPercent > 0 ? "acima" : "abaixo"} do mercado
                                                        </span>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
