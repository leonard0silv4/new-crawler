export interface Supplier {
    name?: string // xNome
    nome?: string // xNome
    cnpj: string // CNPJ
    phone?: string // fone
}

export interface Product {
    code: string // cProd - SKU/Código do Produto
    name: string // xProd - Nome do Produto
    ean?: string // cEAN - Código EAN (GTIN)
    ncm: string // NCM - Nomenclatura Comum do Mercosul
    quantity: number // qCom - Quantidade
    unitValue: number // vUnCom - Valor Unitário
    icmsValue?: number // vICMS - Valor do ICMS do Item
    ipiValue?: number // vIPI - Valor do IPI do Item
    totalValue: number // vProd - Total da Linha
}

export interface InvoiceTotals {
    productsValue: number // vProd - Valor Líquido (Produtos)
    freightValue: number // vFrete - Valor do Frete
    icmsTotal: number // vICMS - Valor Total do ICMS
    ipiTotal: number // vIPI - Valor Total do IPI
    totalValue: number // vNF - Valor Total da Nota
}

export interface Invoice {
    id: string
    number: string // nNF - Número da NF
    issueDate: Date // dhEmi - Data de Emissão
    supplier: Supplier
    products: Product[]
    totals: InvoiceTotals
    observations?: string
    xmlFile?: string
}
