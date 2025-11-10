import { createRoot } from "react-dom/client"
import React from "react"
import LabelPrint from "../LabelPrint"
import { LabelPrintSmall } from "../LabelPrintSmall"

interface LabelData {
  lote: number | string
  faccionistaNome: string
  quantidade: number | string
  largura: number | string
  comprimento: number | string
  emenda: boolean
  totalMetros: number
  qrCodeUrl: string
}

export const printLabel = (data: LabelData) => {
  const { lote, faccionistaNome, quantidade, largura, comprimento, emenda, totalMetros, qrCodeUrl } = data

  const tempContainer = document.createElement("div")
  tempContainer.style.position = "absolute"
  tempContainer.style.left = "-9999px"
  tempContainer.style.top = "-9999px"
  tempContainer.style.width = "190mm"
  tempContainer.style.height = "270mm"
  tempContainer.style.margin = "0"
  tempContainer.style.padding = "0"
  document.body.appendChild(tempContainer)

  const root = createRoot(tempContainer)

  const qtyNumber = Number(quantidade)
  // Adiciona simplesmente +2 à quantidade
  const totalSmallLabels = Number.isFinite(qtyNumber) && qtyNumber > 0 ? qtyNumber + 2 : 2

  return new Promise<void>((resolve, reject) => {
    root.render(
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "0",
            margin: "0",
            padding: "0",
          },
        },
        React.createElement(LabelPrint, {
          lote,
          faccionistaNome,
          quantidade,
          largura,
          comprimento,
          emenda,
          totalMetros,
          qrCodeUrl,
        }),
        React.createElement(LabelPrint, {
          lote,
          faccionistaNome,
          quantidade,
          largura,
          comprimento,
          emenda,
          totalMetros,
          qrCodeUrl,
        }),
        React.createElement(LabelPrint, {
          lote,
          faccionistaNome,
          quantidade,
          largura,
          comprimento,
          emenda,
          totalMetros,
          qrCodeUrl,
        }),
        // Cria páginas de 18 etiquetas cada (3 colunas x 6 linhas)
        Array.from({ length: Math.ceil(totalSmallLabels / 18) }).map((_, pageIndex) => {
          const startIndex = pageIndex * 18
          const endIndex = Math.min(startIndex + 18, totalSmallLabels)
          const labelsInPage = endIndex - startIndex

          return React.createElement(
            "div",
            {
              key: `small-page-${pageIndex}`,
              className: "small-labels-page",
              style: {
                marginTop: pageIndex === 0 ? "6mm" : "0",
                pageBreakBefore: pageIndex === 0 ? "always" : "always",
              },
            },
            Array.from({ length: labelsInPage }).map((_, labelIndex) => {
              const globalIndex = startIndex + labelIndex
              return React.createElement(LabelPrintSmall, {
                key: `small-label-${globalIndex}`,
                lote,
                faccionistaNome,
                largura,
                comprimento,
                qrCodeUrl,
              })
            })
          )
        })
      )
    )

    setTimeout(() => {
      try {
        const labelsHTML = tempContainer.innerHTML

        const printWindow = window.open("", "_blank")
        if (!printWindow) {
          throw new Error("Não foi possível abrir a janela de impressão. Por favor, permita pop-ups.")
        }

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Etiquetas - Lote ${lote}</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }

                @media print {
                  @page {
                    size: A4;
                    margin: 0;
                    padding: 0;
                  }
                  body {
                    margin: 0;
                    padding: 0;
                    width: 210mm;
                    min-height: 297mm;
                  }
                  .label-print {
                    page-break-inside: avoid;
                    break-inside: avoid;
                  }
                  .label-print-small {
                    page-break-inside: avoid;
                    break-inside: avoid;
                    width: 61mm !important;
                    height: 46mm !important;
                    flex: 0 0 61mm !important;
                  }
                  svg {
                    page-break-inside: avoid;
                    break-inside: avoid;
                  }
                  .small-labels-page {
                    page-break-before: always;
                    display: flex !important;
                    flex-wrap: wrap !important;
                    gap: 2mm !important;
                  }
                }

                html {
                  width: 210mm;
                  min-height: 297mm;
                }

                body {
                  margin: 0;
                  padding: 0;
                  font-family: "Arial", "Helvetica", sans-serif;
                  width: 210mm;
                  min-height: 297mm;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: flex-start;
                  background-color: #ffffff;
                }

                .labels-container {
                  display: flex;
                  flex-direction: column;
                  gap: 0;
                  width: 190mm;
                  margin: 0;
                  padding: 0;
                }

                .small-labels-page {
                  display: flex;
                  flex-direction: row;
                  flex-wrap: wrap;
                  gap: 2mm;
                  width: 190mm;
                  margin: 0 auto;
                  padding: 1mm;
                  align-content: flex-start;
                  min-height: 285mm;
                  box-sizing: border-box;
                }

                .label-print-small {
                  width: 61mm;
                  height: 46mm;
                  flex: 0 0 61mm;
                  box-sizing: border-box;
                }
              </style>
            </head>
            <body>
              <div class="labels-container">
                ${labelsHTML}
              </div>
              <script>
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    window.print();
                    window.addEventListener('afterprint', function() {
                      window.close();
                    });
                  }, 800);
                });
              </script>
            </body>
          </html>
        `)
        printWindow.document.close()

        root.unmount()
        document.body.removeChild(tempContainer)

        resolve()
      } catch (error) {
        root.unmount()
        if (document.body.contains(tempContainer)) {
          document.body.removeChild(tempContainer)
        }
        reject(error)
      }
    }, 1000)
  })
}
