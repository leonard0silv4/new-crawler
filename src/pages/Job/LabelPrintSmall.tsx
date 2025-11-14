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
                padding: "2mm",
                border: "1px solid #000",
                borderRadius: "1mm",
                display: "flex",
                alignItems: "center",
                gap: "2mm",
                boxSizing: "border-box",
                backgroundColor: "#fff",
                fontFamily: '"Arial Black", "Arial", sans-serif',
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5mm",
                    flex: 1,
                    minWidth: 0,
                }}
            >
                <div
                    style={{
                        fontSize: "24px",
                        fontWeight: 900,
                        color: "#111",
                        letterSpacing: "0.3px",
                        lineHeight: 1.2,
                    }}
                >
                    LOTE {lote}
                </div>

                <div
                    style={{
                        fontSize: "20px",
                        color: "#111",
                        lineHeight: 1.3,
                        fontWeight: 700,
                        wordBreak: "break-word",
                        textTransform: "capitalize",
                    }}
                >
                    {faccionistaNome}
                </div>

                <div
                    style={{
                        fontSize: "26px",
                        fontWeight: 900,
                        color: "#000",
                        letterSpacing: "0.3px",
                        lineHeight: 1.1,
                    }}
                >
                    {largura} × {comprimento}
                </div>
            </div>

            <QRCodeSVG
                value={qrCodeUrl}
                size={50}
                level="M"
                includeMargin={false}
                fgColor="#000000"
                bgColor="#ffffff"
                style={{ flexShrink: 0, width: "50px", height: "50px" }}
            />
        </div>
    )
}
