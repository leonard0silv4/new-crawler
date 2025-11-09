"use client"

import { QRCodeSVG } from "qrcode.react"
import { useEffect } from "react"

interface LabelPrintProps {
    lote: number | string
    faccionistaNome: string
    quantidade: number | string
    largura: number | string
    comprimento: number | string
    emenda: boolean
    totalMetros: number
    qrCodeUrl: string
    onPrint?: () => void
}

const LabelPrint = ({
    lote,
    faccionistaNome,
    quantidade,
    largura,
    comprimento,
    emenda,
    totalMetros,
    qrCodeUrl,
    onPrint,
}: LabelPrintProps) => {
    useEffect(() => {
        if (onPrint) {
            onPrint()
        }
    }, [onPrint])

    // QR codes now positioned with 10mm margins for safe print area
    const qrSize = 70
    const qrMargin = "10mm"

    return (
        <div
            className="label-print"
            style={{
                width: "190mm",
                height: "90mm",
                padding: "0",
                border: "1px solid #000",
                borderBottom: "1px dashed #999",
                borderTop: "1px dashed #999",
                fontFamily: '"Arial", "Helvetica", sans-serif',
                boxSizing: "border-box",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                backgroundColor: "#ffffff",
                pageBreakInside: "avoid",
            }}
        >
            {/* QR Code superior esquerdo */}
            <div
                style={{
                    position: "absolute",
                    top: qrMargin,
                    left: qrMargin,
                }}
            >
                <QRCodeSVG
                    value={qrCodeUrl}
                    size={qrSize}
                    level="M"
                    includeMargin={false}
                    fgColor="#000000"
                    bgColor="#ffffff"
                />
            </div>

            {/* QR Code superior direito */}
            <div
                style={{
                    position: "absolute",
                    top: qrMargin,
                    right: qrMargin,
                }}
            >
                <QRCodeSVG
                    value={qrCodeUrl}
                    size={qrSize}
                    level="M"
                    includeMargin={false}
                    fgColor="#000000"
                    bgColor="#ffffff"
                />
            </div>

            {/* QR Code inferior esquerdo */}
            <div
                style={{
                    position: "absolute",
                    bottom: qrMargin,
                    left: qrMargin,
                }}
            >
                <QRCodeSVG
                    value={qrCodeUrl}
                    size={qrSize}
                    level="M"
                    includeMargin={false}
                    fgColor="#000000"
                    bgColor="#ffffff"
                />
            </div>

            {/* QR Code inferior direito */}
            <div
                style={{
                    position: "absolute",
                    bottom: qrMargin,
                    right: qrMargin,
                }}
            >
                <QRCodeSVG
                    value={qrCodeUrl}
                    size={qrSize}
                    level="M"
                    includeMargin={false}
                    fgColor="#000000"
                    bgColor="#ffffff"
                />
            </div>

            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: "8mm 25mm",
                    flex: 1,
                }}
            >
                {/* Lote - main identifier */}
                <div
                    style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        marginBottom: "5mm",
                        letterSpacing: "0.5px",
                    }}
                >
                    LOTE: {lote}
                </div>

                {/* Faccionista */}
                <div
                    style={{
                        fontSize: "13px",
                        marginBottom: "4mm",
                        color: "#333",
                    }}
                >
                    <strong>Faccionista:</strong> {faccionistaNome}
                </div>

                <div
                    style={{
                        fontSize: "12px",
                        display: "flex",
                        gap: "12mm",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        marginBottom: "3mm",
                        color: "#333",
                    }}
                >
                    <span>
                        <strong>Qtd:</strong> {quantidade}
                    </span>
                    <span>
                        <strong>Larg:</strong> {largura}
                    </span>
                    <span>
                        <strong>Compr:</strong> {comprimento}
                    </span>
                </div>

                {/* Emenda status */}
                <div
                    style={{
                        fontSize: "12px",
                        marginBottom: "3mm",
                        color: "#333",
                    }}
                >
                    <strong>Emenda:</strong> {emenda ? "Sim" : "Não"}
                </div>

                {/* Total metros - highlighted */}
                <div
                    style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        marginTop: "4mm",
                        color: "#000",
                        padding: "2mm 4mm",
                        border: "1px solid #ddd",
                        borderRadius: "2px",
                    }}
                >
                    Total: {totalMetros}m
                </div>
            </div>
        </div>
    )
}

export default LabelPrint
