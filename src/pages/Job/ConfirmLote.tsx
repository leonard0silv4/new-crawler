import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import instance from "@/config/axios";
import { Loader, CheckCircle2, XCircle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge as BadgeComponent } from "@/components/ui/badge";

interface ApiResponse {
    success: boolean;
    alreadyMarked?: boolean;
    data?: {
        nomeFaccionista: string;
        lote: string;
        dataRecebidoConferido: string;
        dataFormatada: string;
        horaFormatada: string;
        message: string;
    };
    error?: string;
    message?: string;
}

const ConfirmLote = () => {
    const { idFaccionista, idLote } = useParams<{
        idFaccionista: string;
        idLote: string;
    }>();

    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState<ApiResponse | null>(null);
    const hasRequestedRef = useRef(false);

    useEffect(() => {
        if (hasRequestedRef.current) {
            return;
        }

        const confirmLote = async () => {
            if (!idFaccionista || !idLote) {
                setResponse({
                    success: false,
                    error: "Parâmetros inválidos",
                    message: "Os IDs fornecidos não são válidos",
                });
                setLoading(false);
                return;
            }

            hasRequestedRef.current = true;

            try {
                const apiResponse = (await instance.get(
                    `/${idFaccionista}/${idLote}`
                )) as ApiResponse;
                setResponse(apiResponse);
            } catch (error: any) {
                console.error("Erro ao confirmar lote:", error);
                console.error("Erro response:", error.response);
                if (error.response?.status === 200 && error.response?.data) {
                    console.log("Resposta no catch (status 200):", error.response.data);
                    setResponse(error.response.data);
                } else {
                    setResponse({
                        success: false,
                        error: error.response?.data?.error || "Erro ao processar solicitação",
                        message:
                            error.response?.data?.message ||
                            error.message ||
                            "Erro ao confirmar lote. Tente novamente.",
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        confirmLote();
    }, [idFaccionista, idLote]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center p-8">
                        <Loader className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Confirmando lote...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!response) {
        return null;
    }



    if (response.success === true) {

        if (response.data) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                    <Card className="w-full max-w-md shadow-lg">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <div
                                    className={`rounded-full p-4 ${response.alreadyMarked
                                        ? "bg-blue-100 dark:bg-blue-900"
                                        : "bg-green-100 dark:bg-green-900"
                                        }`}
                                >
                                    {response.alreadyMarked ? (
                                        <Info className="w-16 h-16 text-blue-500" />
                                    ) : (
                                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                                    )}
                                </div>
                            </div>
                            <CardTitle
                                className={`text-2xl ${response.alreadyMarked
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-green-600 dark:text-green-400"
                                    }`}
                            >
                                {response.alreadyMarked
                                    ? "Lote já Recebido"
                                    : "Lote Recebido!"}
                            </CardTitle>
                            {response.alreadyMarked && (
                                <BadgeComponent variant="secondary" className="mt-2 mx-auto">
                                    Confirmado Anteriormente
                                </BadgeComponent>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-center space-y-2">
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {response.data.lote}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Faccionista: {response.data.nomeFaccionista}
                                </p>
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                                    <span>{response.data.dataFormatada}</span>
                                    <span>•</span>
                                    <span>{response.data.horaFormatada}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                                    {response.data.message}
                                </p>
                            </div>
                            <div className="flex justify-center mt-6">
                                <Button
                                    onClick={() => window.close()}
                                    variant="outline"
                                    className="w-full max-w-xs"
                                >
                                    Fechar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
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
                            Lote Recebido!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center">
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                {response.message || "Lote confirmado com sucesso!"}
                            </p>
                            <div className="flex justify-center mt-6">
                                <Button
                                    onClick={() => window.close()}
                                    variant="outline"
                                    className="w-full max-w-xs"
                                >
                                    Fechar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
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
                    <CardTitle className="text-2xl text-red-600 dark:text-red-400">
                        Erro ao Confirmar
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center">
                        {response.error && (
                            <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                                {response.error}
                            </p>
                        )}
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                            {response.message || "Ocorreu um erro ao processar a solicitação"}
                        </p>
                        <div className="flex flex-col gap-3 items-center mt-6">
                            {response.message !== "Nenhum token fornecido" && (
                                <Button
                                    onClick={() => window.location.reload()}
                                    variant="outline"
                                    className="w-full max-w-xs"
                                >
                                    Tentar Novamente
                                </Button>
                            )}
                            {response.message === "Nenhum token fornecido" && (
                                <Button
                                    onClick={() => {
                                        window.location.href = "/login";
                                    }}
                                    className="w-full max-w-xs"
                                >
                                    Ir para o login
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ConfirmLote;

