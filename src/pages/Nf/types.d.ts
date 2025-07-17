export interface Supplier {
    name?: string // xNome
    nome?: string // xNome
    cnpj: string // CNPJ
    phone?: string // fone
    address?: string
}

export interface Product {
    code: string // cProd 
    name: string // xProd 
    ean?: string // cEAN 
    ncm?: string // NCM 
    quantity: number // qCom 
    unitValue: number // vUnCom 
    icmsValue?: number // vICMS 
    ipiValue?: number // vIPI 
    totalValue: number // vProd 
    box?: number
    boxValue?: number
    qtdBox?: number

}

export interface InvoiceTotals {
    productsValue: number // vProd 
    freightValue: number // vFrete 
    icmsTotal: number // vICMS 
    ipiTotal: number // vIPI 
    totalValue: number // vNF 
}

export interface Invoice {
    id: string
    number: string // nNF 
    issueDate: Date // dhEmi
    supplier: Supplier
    products: Product[]
    totals: InvoiceTotals
    observations?: string
    xmlFile?: string
}
