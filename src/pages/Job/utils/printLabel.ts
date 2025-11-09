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
  const totalSmallLabels = Number.isFinite(qtyNumber) && qtyNumber > 0 ? Math.ceil(qtyNumber) : 1

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
        React.createElement(
          "div",
          {
            key: "small-page",
            className: "small-labels-page",
            style: {
              display: "flex",
              flexWrap: "wrap",
              columnGap: "2mm",
              rowGap: "2mm",
              justifyContent: "space-between",
              marginTop: "6mm",
              padding: "2mm 1.5mm",
              pageBreakBefore: "always",
            },
          },
          Array.from({ length: totalSmallLabels }).map((_, index) =>
            React.createElement(LabelPrintSmall, {
              key: `small-label-${index}`,
              lote,
              faccionistaNome,
              largura,
              comprimento,
              qrCodeUrl,
            })
          )
        )
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
                  .label-print,
                  .label-print-small {
                    page-break-inside: avoid;
                    break-inside: avoid;
                    orphans: 3;
                    widows: 3;
                  }
                  svg {
                    page-break-inside: avoid;
                    break-inside: avoid;
                  }
                  .small-labels-page {
                    page-break-before: always;
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
                  flex-wrap: wrap;
                  row-gap: 2mm;
                  column-gap: 2mm;
                  width: 190mm;
                  margin: 0 auto;
                  padding: 2mm 0;
                  justify-content: space-between;
                }

                .label-print-small {
                  flex: 0 0 calc(50% - 1mm);
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
