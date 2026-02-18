export const MY_STORES = ["NETVASOSJARDINAGEM", "LYRIAFLORES", "JARDINOGARDEN", "SOMBRITELA", "SOMBRETELA"];

// Threshold de diferença de preço para mostrar sugestões (-10% a +10%)
export const PRICE_DIFF_THRESHOLD = 10;

export interface Product {
    id: string;
    nome: string;
    preco: number;
    vendedor: string;
    url: string;
    urlOriginal: string;
    isMyStore: boolean;
    grupo: string;
}

export interface ProductGroup {
    grupo: string;
    nome: string;
    products: Product[];
    competitorPrices: number[];
    minPrice: number;
    maxPrice: number;
    recommendation?: string;
}

export interface ParseXMLResult {
    productGroups: ProductGroup[];
    extractionDate: string | null;
}

export function parseXML(xmlContent: string): ParseXMLResult {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

    if (xmlDoc.getElementsByTagName("parsererror").length) {
        throw new Error("Erro ao fazer parse do XML");
    }

    const produtosElement = xmlDoc.getElementsByTagName("produtos")[0];
    const extractionDate = produtosElement?.getAttribute("data_extracao") || null;

    const products: Product[] = [];
    const produtosElements = xmlDoc.getElementsByTagName("produto");

    for (let i = 0; i < produtosElements.length; i++) {
        const el = produtosElements[i];
        const nome = el.getElementsByTagName("nome")[0]?.textContent || "";
        const preco = Number.parseFloat(el.getElementsByTagName("preco")[0]?.textContent || "0");
        const vendedor = el.getElementsByTagName("vendedor")[0]?.textContent || "";
        const id_produto = el.getElementsByTagName("id_produto")[0]?.textContent || "";
        const url = el.getElementsByTagName("url")[0]?.textContent || "";
        const urlOriginal = el.getElementsByTagName("url_original")[0]?.textContent || "";
        const grupo = el.getAttribute("grupo") || "";

        products.push({
            id: id_produto,
            nome,
            preco,
            vendedor,
            url,
            urlOriginal,
            isMyStore: MY_STORES.includes(vendedor.toUpperCase()),
            grupo,
        });
    }

    // Agrupar produtos por grupo
    const groupMap = new Map<string, Product[]>();
    products.forEach((product) => {
        if (!groupMap.has(product.grupo)) {
            groupMap.set(product.grupo, []);
        }
        groupMap.get(product.grupo)!.push(product);
    });

    // Processar cada grupo
    const productGroups: ProductGroup[] = [];
    groupMap.forEach((groupProducts, grupo) => {
        if (groupProducts.length === 0) return;

        const nome = groupProducts[0].nome;

        // Pegar preços dos concorrentes (lojas que não são minhas)
        const competitorPrices = groupProducts.filter((p) => !p.isMyStore).map((p) => p.preco);

        const minPrice =
            competitorPrices.length > 0 ? Math.min(...competitorPrices) : Math.min(...groupProducts.map((p) => p.preco));

        const maxPrice =
            competitorPrices.length > 0 ? Math.max(...competitorPrices) : Math.max(...groupProducts.map((p) => p.preco));

        // Calcular recomendação apenas para meus produtos
        let recommendation: string | undefined;
        const myPrices = groupProducts.filter((p) => p.isMyStore).map((p) => p.preco);

        if (myPrices.length > 0 && competitorPrices.length > 0) {
            const avgMyPrice = myPrices.reduce((a, b) => a + b, 0) / myPrices.length;
            const bestCompetitorPriceOnly = Math.min(...competitorPrices); // Melhor preço apenas dos concorrentes
            const minMyPrice = Math.min(...myPrices); // Melhor preço dos meus produtos

            // Comparar com o melhor preço do mercado (se for de concorrente)
            if (bestCompetitorPriceOnly < minMyPrice) {
                // Sempre mostrar alerta se concorrente tem melhor preço
                const priceDiff = ((avgMyPrice - bestCompetitorPriceOnly) / bestCompetitorPriceOnly) * 100;
                recommendation = `Preço ${priceDiff.toFixed(1)}% acima do melhor concorrente (R$ ${bestCompetitorPriceOnly.toFixed(2)}). Considere reduzir.`;
            } else if (bestCompetitorPriceOnly < avgMyPrice) {
                // Concorrente tem preço melhor que minha média, mas não melhor que meu melhor preço
                const priceDiff = ((avgMyPrice - bestCompetitorPriceOnly) / bestCompetitorPriceOnly) * 100;
                if (priceDiff > PRICE_DIFF_THRESHOLD) {
                    recommendation = `Preço ${priceDiff.toFixed(1)}% acima do melhor concorrente. Considere reduzir.`;
                }
            } else {
                // Se meu preço é o melhor, verificar se está muito abaixo da média
                const avgCompetitorPrice = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length;
                const priceDiff = ((avgMyPrice - avgCompetitorPrice) / avgCompetitorPrice) * 100;

                if (Math.abs(priceDiff) > PRICE_DIFF_THRESHOLD && priceDiff < 0) {
                    recommendation = `Preço ${Math.abs(priceDiff).toFixed(1)}% abaixo da média. Você está competitivo!`;
                }
            }
        }

        productGroups.push({
            grupo,
            nome,
            products: groupProducts,
            competitorPrices,
            minPrice,
            maxPrice,
            recommendation,
        });
    });

    return {
        productGroups,
        extractionDate,
    };
}

export function getPriceStatus(price: number, minPrice: number, maxPrice: number): string {
    if (price === minPrice) return "melhor-preco";
    if (price === maxPrice) return "pior-preco";
    return "preco-medio";
}

