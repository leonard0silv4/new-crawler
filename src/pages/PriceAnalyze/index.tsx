"use client";

import { useEffect, useState } from "react";
import { PriceAnalyzer } from "./PriceAnalyzer";
import { parseXML, type ProductGroup } from "@/lib/xml-parser";
import instance from "@/config/axios";

export default function PriceAnalyze() {
    const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
    const [extractionDate, setExtractionDate] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAndParseXML = async () => {
            try {
                setLoading(true);
                setError(null);

                const apiEndpoint = import.meta.env.VITE_APP_XML_API_URL || "/xml/download";

                const xmlText: string = await instance.get(apiEndpoint, {
                    responseType: "text",
                });

                const parsed = parseXML(xmlText);
                setProductGroups(parsed.productGroups);
                setExtractionDate(parsed.extractionDate);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erro ao processar XML");
                console.error("[PriceAnalyze] Error fetching/parsing XML:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAndParseXML();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Carregando dados...</p>
                    <p className="text-slate-500 text-sm mt-1">Analisando produtos e preços</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center max-w-md">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">❌</span>
                    </div>
                    <p className="text-red-600 font-bold mb-2">Erro ao carregar dados</p>
                    <p className="text-slate-600 text-sm mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        )
    }

    return <PriceAnalyzer productGroups={productGroups} extractionDate={extractionDate} />;
}

