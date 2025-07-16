import { create } from "xmlbuilder2";

export function normalizeToXml(invoice: any): string {
  const productsXml = invoice.produtos.map((p: any, i: number) => ({
    det: {
      "@nItem": i + 1,
      prod: {
        cProd: p.code,
        xProd: p.name,
        cEAN: p.ean || "",
        NCM: p.ncm,
        qCom: p.quantity.toFixed(2),
        vUnCom: p.unitValue.toFixed(2),
        vProd: p.totalValue.toFixed(2),
      },
      imposto: {
        ICMS: {
          ICMS00: {
            vICMS: p.icmsValue?.toFixed(2) || "0.00",
          },
        },
        IPI: {
          IPITrib: {
            vIPI: p.ipiValue?.toFixed(2) || "0.00",
          },
        },
      },
    },
  }));

  const doc = create({ version: "1.0", encoding: "UTF-8" }).ele({
    nfeProc: {
      "@xmlns": "http://www.portalfiscal.inf.br/nfe",
      "@versao": "4.00",
      NFe: {
        infNFe: {
          "@Id": "",
          "@versao": "4.00",
          ide: {
            nNF: invoice.numeroNota,
            dhEmi: new Date(invoice.dataEmissao).toISOString(),
          },
          emit: {
            xNome: invoice.fornecedor.nome,
            CNPJ: invoice.fornecedor.cnpj,
            enderEmit: {
              fone: invoice.fornecedor.phone || "",
            },
          },
          det: productsXml.map((p: any) => p.det),
        },
      },
    },
  });

  return doc.end({ prettyPrint: true });
}
