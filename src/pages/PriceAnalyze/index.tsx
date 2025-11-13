"use client";

import { useEffect, useState } from "react";
import { PriceAnalyzer } from "./PriceAnalyzer";
import { parseXML, type ProductGroup } from "@/lib/xml-parser";
import instance from "@/config/axios";
import { Loader } from "lucide-react";

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

                // Usar a API da env ao invés do XML_URL hardcoded
                const apiEndpoint = import.meta.env.VITE_APP_XML_API_URL || "/xml/download";

                // O axios retorna response.data automaticamente devido ao interceptor
                // Para responseType: "text", o interceptor retorna response.data que já é a string
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
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Carregando dados...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center">
                    <p className="text-red-600 font-medium mb-2">Erro ao carregar dados</p>
                    <p className="text-gray-600 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return <PriceAnalyzer productGroups={productGroups} extractionDate={extractionDate} />;
}

