"use client"

import { QRCodeSVG } from "qrcode.react"

interface LabelPrintSmallProps {
    lote: number | string
    faccionistaNome: string
    largura: number | string
    comprimento: number | string
    qrCodeUrl: string
}

export function LabelPrintSmall({ lote, faccionistaNome, largura, comprimento, qrCodeUrl }: LabelPrintSmallProps) {
    return (
        <div
            className="label-print-small"
            style={{
                width: "92mm",
                height: "42mm",
                padding: "2.5mm",
                border: "1px solid #000",
                borderRadius: "1mm",
                display: "flex",
                alignItems: "center",
                gap: "2.5mm",
                boxSizing: "border-box",
                backgroundColor: "#fff",
                fontFamily: '"Arial Black", "Arial", sans-serif',
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.8mm",
                    flex: 1,
                }}
            >
                <div
                    style={{
                        fontSize: "22px",
                        fontWeight: 900,
                        color: "#111",
                        letterSpacing: "0.4px",
                        lineHeight: 1.1,
                    }}
                >
                    LOTE {lote}
                </div>

                <div
                    style={{
                        fontSize: "15px",
                        color: "#111",
                        lineHeight: 1.25,
                        fontWeight: 700,
                    }}
                >
                    <strong>Faccionista:</strong> {faccionistaNome}
                </div>

                <div
                    style={{
                        fontSize: "28px",
                        fontWeight: 900,
                        color: "#000",
                        letterSpacing: "0.45px",
                        lineHeight: 1.05,
                    }}
                >
                    {largura} × {comprimento}
                </div>
            </div>

            <QRCodeSVG
                value={qrCodeUrl}
                size={60}
                level="L"
                includeMargin={false}
                fgColor="#000000"
                bgColor="#ffffff"
                style={{ flexShrink: 0 }}
            />
        </div>
    )
}
