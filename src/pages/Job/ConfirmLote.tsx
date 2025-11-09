import { useEffect, useState, useRef } from "react"
import { useParams } from "react-router-dom"
import instance from "@/config/axios"
import { Loader, CheckCircle2, XCircle, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge as BadgeComponent } from "@/components/ui/badge"

interface SuccessData {
    nomeFaccionista: string
    lote: string
    updatedField: "recebidoConferido" | "recebido"
    timestampIso: string | null
    dataFormatada: string | null
    horaFormatada: string | null
    message: string
    dataRecebidoConferido?: string
    dataRecebido?: string
}

interface ApiResponse {
    success: boolean
    alreadyMarked?: boolean
    data?: SuccessData
    error?: string
    message?: string
}

const ConfirmLote = () => {
    const { idFaccionista, idLote } = useParams<{
        idFaccionista: string
        idLote: string
    }>()

    const [loading, setLoading] = useState(true)
    const [response, setResponse] = useState<ApiResponse | null>(null)
    const hasRequestedRef = useRef(false)

    useEffect(() => {
        if (hasRequestedRef.current) {
            return
        }

        const confirmLote = async () => {
            if (!idFaccionista || !idLote) {
                setResponse({
                    success: false,
                    error: "Parâmetros inválidos",
                    message: "Os IDs fornecidos não são válidos",
                })
                setLoading(false)
                return
            }

            hasRequestedRef.current = true

            try {
                const apiResponse = (await instance.get(
                    `/${idFaccionista}/${idLote}`
                )) as ApiResponse
                setResponse(apiResponse)
            } catch (error: any) {
                console.error("Erro ao confirmar lote:", error)
                console.error("Erro response:", error.response)
                if (error.response?.status === 200 && error.response?.data) {
                    console.log("Resposta no catch (status 200):", error.response.data)
                    setResponse(error.response.data)
                } else {
                    setResponse({
                        success: false,
                        error: error.response?.data?.error || "Erro ao processar solicitação",
                        message:
                            error.response?.data?.message ||
                            error.message ||
                            "Erro ao confirmar lote. Tente novamente.",
                    })
                }
            } finally {
                setLoading(false)
            }
        }

        confirmLote()
    }, [idFaccionista, idLote])

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center p-8">
                        <Loader className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                        <p className="text-lg text-gray-600 dark:text-gray-400">Confirmando lote...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!response) {
        return null
    }

    const renderSuccessCard = (alreadyMarked?: boolean) => {
        if (!response.data) {
            return null
        }

        const {
            nomeFaccionista,
            lote,
            updatedField,
            dataFormatada,
            horaFormatada,
            message,
        } = response.data

        const statusLabel =
            updatedField === "recebidoConferido"
                ? "Recebido e Conferido"
                : "Recebido"

        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div
                                className={`rounded-full p-4 ${alreadyMarked ? "bg-blue-100 dark:bg-blue-900" : "bg-green-100 dark:bg-green-900"}`}
                            >
                                {alreadyMarked ? (
                                    <Info className="w-16 h-16 text-blue-500" />
                                ) : (
                                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                                )}
                            </div>
                        </div>
                        <CardTitle
                            className={`text-2xl ${alreadyMarked ? "text-blue-600 dark:text-blue-400" : "text-green-600 dark:text-green-400"}`}
                        >
                            {alreadyMarked ? "Lote já processado" : "Lote atualizado"}
                        </CardTitle>
                        <BadgeComponent
                            variant={alreadyMarked ? "secondary" : "default"}
                            className="mt-2 mx-auto"
                        >
                            {statusLabel}
                        </BadgeComponent>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3 text-center">
                            <div>
                                <p className="text-xl font-semibold text-gray-900 dark:text-white">{lote}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Faccionista: {nomeFaccionista}
                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                {dataFormatada && <span>{dataFormatada}</span>}
                                {dataFormatada && horaFormatada && <span>•</span>}
                                {horaFormatada && <span>{horaFormatada}</span>}
                            </div>

                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                                {message || response.message}
                            </p>
                        </div>
                        <div className="flex justify-center mt-6">
                            <Button onClick={() => window.close()} variant="outline" className="w-full max-w-xs">
                                Fechar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (response.success === true) {
        if (response.data) {
            return renderSuccessCard(response.alreadyMarked)
        }

        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="rounded-full bg-green-100 dark:bg-green-900 p-4">
                                <CheckCircle2 className="w-16 h-16 text-green-500" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                            Lote atualizado
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center">
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                {response.message || "Lote confirmado com sucesso!"}
                            </p>
                            <div className="flex justify-center mt-6">
                                <Button onClick={() => window.close()} variant="outline" className="w-full max-w-xs">
                                    Fechar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-red-100 dark:bg-red-900 p-4">
                            <XCircle className="w-16 h-16 text-red-500" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-red-600 dark:text-red-400">Erro ao Confirmar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        {response.error && (
                            <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">{response.error}</p>
                        )}
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            {response.message || "Ocorreu um erro ao processar a solicitação"}
                        </p>
                        <div className="flex justify-center mt-6">
                            <Button onClick={() => window.location.reload()} variant="outline" className="w-full max-w-xs">
                                Tentar Novamente
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ConfirmLote

