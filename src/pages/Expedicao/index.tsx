"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, Scan, CheckCircle2, AlertTriangle, Activity, BarChart3, Loader2, Calendar, Info } from "lucide-react"
import instance from "@/config/axios"
import { toast } from "sonner"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion, AnimatePresence } from "motion/react"

interface RegistroAnterior {
  orderId: string
  mesaId: string
  dataHora: string
}

// Função para identificar o seller baseado no padrão do código de barras
const identificarSeller = (codigo: string): { seller: string | null; isValid: boolean; error?: string } => {
  // Remover espaços em branco
  const codigoLimpo = codigo.trim()

  // Padrão Mercado Livre: 11 dígitos numéricos
  if (/^\d{11}$/.test(codigoLimpo)) {
    return { seller: "mercadoLivre", isValid: true }
  }

  // Padrão Shopee: BR + 12 dígitos + 1 letra maiúscula (total 15 caracteres)
  if (/^BR\d{12}[A-Z]$/.test(codigoLimpo)) {
    return { seller: "shopee", isValid: true }
  }

  // Padrão Amazon: AMZB + 9 dígitos + 2 letras minúsculas (total 15 caracteres)
  if (/^AMZB\d{9}[a-z]{2}$/.test(codigoLimpo)) {
    return { seller: "amazon", isValid: true }
  }

  // Código não corresponde a nenhum padrão conhecido
  return {
    seller: null,
    isValid: false,
    error: "Código não corresponde a nenhum padrão válido (Mercado Livre, Shopee ou Amazon)",
  }
}

export default function Expedicao() {
  const [codigoBarras, setCodigoBarras] = useState("")
  const [mesaSelecionada, setMesaSelecionada] = useState("")
  const [sellerSelecionado, setSellerSelecionado] = useState<string>("")
  const [isModalMesaOpen, setIsModalMesaOpen] = useState(false)
  const [isDuplicadoAlertOpen, setIsDuplicadoAlertOpen] = useState(false)
  const [registroAnterior, setRegistroAnterior] = useState<RegistroAnterior | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalProcessados, setTotalProcessados] = useState(0)
  const [ultimoPacote, setUltimoPacote] = useState<{
    orderId: string
    mesa: string
    hora: string
  } | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [diaEncerrado, setDiaEncerrado] = useState(false)
  const [dataContabilizacao, setDataContabilizacao] = useState<string>("")
  const [codigoJaVerificado, setCodigoJaVerificado] = useState<string | null>(null) // Proteção contra duplicados
  const [horaAtual, setHoraAtual] = useState(format(new Date(), "HH:mm:ss"))

  const inputCodigoRef = useRef<HTMLInputElement>(null)
  const inputMesaRef = useRef<HTMLInputElement>(null)
  const timeoutMesaRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-focus no input de código de barras ao carregar a página
  useEffect(() => {
    inputCodigoRef.current?.focus()
    verificarDiaEncerrado()
  }, [])

  // Atualizar hora atual a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setHoraAtual(format(new Date(), "HH:mm:ss"))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const verificarDiaEncerrado = async () => {
    try {
      const response: any = await instance.get("/expedicao/dia-encerrado")
      if (response.encerrado) {
        setDiaEncerrado(true)
        setDataContabilizacao(response.proximoDiaUtil)
      }
    } catch (error) {
      console.error("Erro ao verificar dia encerrado:", error)
    }
  }

  // Re-focus após fechar modais
  useEffect(() => {
    if (!isModalMesaOpen && !isDuplicadoAlertOpen) {
      setTimeout(() => {
        inputCodigoRef.current?.focus()
      }, 100)
    }
  }, [isModalMesaOpen, isDuplicadoAlertOpen])

  // Auto-focus no input de mesa quando modal abre
  useEffect(() => {
    if (isModalMesaOpen) {
      setTimeout(() => {
        inputMesaRef.current?.focus()
      }, 100)
    } else {
      // Se modal foi fechado sem completar, limpar código verificado e cancelar timeout
      if (timeoutMesaRef.current) {
        clearTimeout(timeoutMesaRef.current)
        timeoutMesaRef.current = null
      }
      
      if (codigoJaVerificado) {
        setCodigoJaVerificado(null)
        setCodigoBarras("")
        setMesaSelecionada("")
        setSellerSelecionado("")
      }
    }
  }, [isModalMesaOpen])
  
  // Limpar timeout ao desmontar componente
  useEffect(() => {
    return () => {
      if (timeoutMesaRef.current) {
        clearTimeout(timeoutMesaRef.current)
      }
    }
  }, [])

  const verificarCodigoBarras = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!codigoBarras.trim()) {
      toast.error("Código de barras vazio!")
      return
    }

    // Validar e identificar o seller
    const validacao = identificarSeller(codigoBarras)

    if (!validacao.isValid) {
      toast.error("Código Inválido!", {
        description: validacao.error,
        duration: 5000,
      })
      setCodigoBarras("")
      return
    }

    // Definir o seller identificado automaticamente
    if (validacao.seller) {
      setSellerSelecionado(validacao.seller)

      // Mostrar toast informando o seller identificado
      const sellerNome =
        validacao.seller === "mercadoLivre"
          ? "Mercado Livre"
          : validacao.seller === "shopee"
            ? "Shopee"
            : validacao.seller === "amazon"
              ? "Amazon"
              : "Outros"

      toast.info(`Seller Identificado: ${sellerNome}`, {
        duration: 2000,
      })
    }

    setIsProcessing(true)

    try {
      // Verificar se o código já existe
      const response = (await instance.get(`/expedicao/verificar/${codigoBarras}`)) as any

      if (response.existe) {
        // Código duplicado - exibir alerta e BLOQUEAR registro
        setRegistroAnterior({
          orderId: response.registro.orderId,
          mesaId: response.registro.mesaId,
          dataHora: response.registro.createdAt,
        })
        setIsDuplicadoAlertOpen(true)
        
        toast.error("Código de barras já registrado!", {
          description: `Registrado na ${response.registro.mesaId}`,
          duration: 3000,
        })
        
        // Resetar tudo e NÃO permitir registro
        setCodigoBarras("")
        setSellerSelecionado("")
        setCodigoJaVerificado(null)

        // Fechar modal automaticamente após 2 segundos
        setTimeout(() => {
          setIsDuplicadoAlertOpen(false)
        }, 2000)
      } else {
        // Código novo - salvar como verificado e abrir modal para selecionar mesa
        setCodigoJaVerificado(codigoBarras)
        setIsModalMesaOpen(true)
      }
    } catch (error: any) {
      console.error("Erro ao verificar código:", error)
      if (error.response?.status === 404) {
        // Código não existe (novo) - salvar como verificado e abrir modal
        setCodigoJaVerificado(codigoBarras)
        setIsModalMesaOpen(true)
      } else {
        toast.error("Erro ao verificar código de barras!")
        setCodigoBarras("")
        setSellerSelecionado("")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const selecionarMesa = async (e: React.FormEvent, mesaForcada?: string) => {
    e.preventDefault()

    // PROTEÇÃO: Evitar chamadas duplicadas
    if (isProcessing) {
      console.log("⚠️ Registro já em andamento, ignorando chamada duplicada")
      return
    }

    // Usar mesa forçada (dos botões) ou a selecionada no input
    const mesa = mesaForcada || mesaSelecionada

    // PROTEÇÃO: Verificar se o código foi validado
    if (!codigoJaVerificado || codigoJaVerificado !== codigoBarras) {
      toast.error("Código não verificado! Bipe o código novamente.")
      setIsModalMesaOpen(false)
      setCodigoBarras("")
      setMesaSelecionada("")
      setSellerSelecionado("")
      return
    }

    if (!mesa.trim()) {
      toast.error("Selecione uma mesa!")
      return
    }

    // Validar se é M1, M2, M3 ou M4
    const mesaValida = ["M1", "M2", "M3", "M4"].includes(mesa.toUpperCase())
    
    if (!mesaValida) {
      toast.error("Mesa inválida! Use M1, M2, M3 ou M4")
      setMesaSelecionada("")
      return
    }

    setIsProcessing(true)

    try {
      const response: any = await instance.post("/expedicao/registrar", {
        orderId: codigoBarras,
        mesaId: mesa.toUpperCase(),
        seller: sellerSelecionado || undefined,
      })

      // Verificar se dia foi encerrado
      if (response.avisos?.diaEncerrado) {
        setDiaEncerrado(true)
        setDataContabilizacao(response.registro.dataContabilizacao)
        toast.info(response.avisos.message, {
          duration: 5000,
        })
      }

      // Sucesso - mostrar feedback e resetar
      setUltimoPacote({
        orderId: codigoBarras,
        mesa: mesa.toUpperCase(),
        hora: format(new Date(), "HH:mm:ss"),
      })
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 800)

      setTotalProcessados((prev) => prev + 1)

      const sellerNome = sellerSelecionado
        ? ` - ${
            sellerSelecionado === "mercadoLivre"
              ? "Mercado Livre"
              : sellerSelecionado === "shopee"
                ? "Shopee"
                : sellerSelecionado === "amazon"
                  ? "Amazon"
                  : "Outros"
          }`
        : ""

      toast.success(`Pacote registrado na ${mesa.toUpperCase()}${sellerNome}!`, {
        description: `ID: ${codigoBarras}`,
      })

      // Resetar campos
      setCodigoBarras("")
      setMesaSelecionada("")
      setSellerSelecionado("")
      setCodigoJaVerificado(null) // Limpar código verificado

      // Fechar modal automaticamente após 1 segundo
      setTimeout(() => {
        setIsModalMesaOpen(false)
      }, 1000)
    } catch (error: any) {
      // Verificar o tipo de erro e mostrar toast apropriado
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message
      
      if (error.response?.status === 409) {
        // Conflito - código duplicado
        toast.error("Código já registrado!", {
          description: errorMessage,
          duration: 3000,
        })
      } else if (error.response?.status === 400) {
        // Bad Request
        toast.error("Dados inválidos!", {
          description: errorMessage,
          duration: 3000,
        })
      } else {
        // Outros erros
        toast.error("Erro ao registrar!", {
          description: errorMessage || "Tente novamente",
          duration: 3000,
        })
      }
      
      // Resetar em caso de erro
      setCodigoBarras("")
      setMesaSelecionada("")
      setSellerSelecionado("")
      setCodigoJaVerificado(null)
      setIsModalMesaOpen(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCodigoBarrasKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      verificarCodigoBarras(e)
    }
  }

  const handleMesaKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      // Cancelar qualquer timeout pendente para evitar chamada duplicada
      if (timeoutMesaRef.current) {
        clearTimeout(timeoutMesaRef.current)
        timeoutMesaRef.current = null
      }
      selecionarMesa(e)
    }
  }

  // Função para identificar e auto-selecionar mesa
  const handleMesaChange = (valor: string) => {
    const valorUpper = valor.toUpperCase()
    setMesaSelecionada(valorUpper)

    // Cancelar timeout anterior se existir
    if (timeoutMesaRef.current) {
      clearTimeout(timeoutMesaRef.current)
      timeoutMesaRef.current = null
    }

    // Se o valor for exatamente M1, M2, M3 ou M4, registrar automaticamente
    if (["M1", "M2", "M3", "M4"].includes(valorUpper)) {
      // Pequeno delay para dar feedback visual
      timeoutMesaRef.current = setTimeout(() => {
        // Simular submit do form, passando a mesa já validada
        selecionarMesa({ preventDefault: () => {} } as React.FormEvent, valorUpper)
        timeoutMesaRef.current = null
      }, 300)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Modernizado */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Scan className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">Expedição - Leitura de Código</CardTitle>
                  <p className="text-sm text-gray-500 mt-0.5">Sistema de registro de pacotes por mesa</p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-500">{format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}</p>
                <p className="text-lg font-semibold text-gray-900 font-mono tabular-nums">{horaAtual}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Aviso de Dia Encerrado */}
        {diaEncerrado && dataContabilizacao && (
          <Alert className="border border-amber-200 bg-amber-50">
            <Info className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">Dia Encerrado!</span> Os pacotes registrados agora serão
                  contabilizados para{" "}
                  <span className="font-semibold">
                    {format(parseISO(dataContabilizacao), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                  .
                </div>
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Processados Hoje</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalProcessados}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {ultimoPacote && (
            <Card className="bg-white border border-green-200 shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 font-medium">Último Pacote</p>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      {ultimoPacote.mesa} - {ultimoPacote.hora}
                    </p>
                    <p className="text-xs text-gray-500 truncate">ID: {ultimoPacote.orderId}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Área de Leitura Principal */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Scan className="h-5 w-5 text-blue-600" />
              Leitura de Código de Barras
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8 pb-8">
            <form onSubmit={verificarCodigoBarras} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  Digite ou bipe o código do pacote
                </label>
                <div className="relative">
                  <Input
                    ref={inputCodigoRef}
                    type="text"
                    value={codigoBarras}
                    onChange={(e) => setCodigoBarras(e.target.value)}
                    onKeyPress={handleCodigoBarrasKeyPress}
                    placeholder="Código de barras"
                    disabled={isProcessing}
                    className="h-14 text-xl font-mono text-center border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    autoComplete="off"
                    autoFocus
                  />
                  {isProcessing && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={!codigoBarras.trim() || isProcessing}
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <Scan className="h-5 w-5 mr-2" />
                    Verificar Código
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">Instruções de Uso</h4>
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• Este campo está sempre pronto para leitura (autofocus)</li>
                    <li>• Bipe o código de barras ou digite manualmente</li>
                    <li>• O sistema verificará automaticamente se é duplicado</li>
                    <li>• Após verificação, selecione a mesa (M1, M2, M3 ou M4)</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Animação de Sucesso */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            >
              <div className="bg-green-500 text-white rounded-full p-8 shadow-2xl">
                <CheckCircle2 className="h-24 w-24" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Seleção de Mesa e Seller */}
      <Dialog open={isModalMesaOpen} onOpenChange={setIsModalMesaOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">Selecionar Mesa</DialogTitle>
              <DialogDescription className="text-gray-500">
                Bipe o código da mesa (M1, M2, M3 ou M4) para registro automático
              </DialogDescription>
            </DialogHeader>
          <form onSubmit={selecionarMesa} className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Scan className="h-4 w-4 text-blue-600" />
                Bipe o código da mesa
              </Label>
              <Input
                ref={inputMesaRef}
                type="text"
                value={mesaSelecionada}
                onChange={(e) => handleMesaChange(e.target.value)}
                onKeyPress={handleMesaKeyPress}
                placeholder="M1, M2, M3 ou M4"
                disabled={isProcessing}
                className="h-14 text-xl font-mono text-center border-gray-300 focus:border-blue-500"
                autoComplete="off"
                maxLength={2}
              />
              <p className="text-xs text-gray-500 text-center">
                O registro será feito automaticamente ao bipar o código
              </p>
            </div>

            <div className="pt-2">
              <p className="text-xs text-gray-400 text-center mb-2">Ou clique em uma mesa:</p>
              <div className="grid grid-cols-4 gap-2">
                {["M1", "M2", "M3", "M4"].map((mesa) => (
                  <Button
                    key={mesa}
                    type="button"
                    variant={mesaSelecionada === mesa ? "default" : "outline"}
                    onClick={() => {
                      // Cancelar qualquer timeout pendente do input
                      if (timeoutMesaRef.current) {
                        clearTimeout(timeoutMesaRef.current)
                        timeoutMesaRef.current = null
                      }
                      
                      setMesaSelecionada(mesa)
                      
                      // Chamar diretamente sem setTimeout para evitar delay
                      selecionarMesa({ preventDefault: () => {} } as React.FormEvent, mesa)
                    }}
                    className={`h-12 text-base font-bold ${
                      mesaSelecionada === mesa ? "bg-blue-600 hover:bg-blue-700" : "border-gray-300 hover:bg-gray-50"
                    }`}
                    disabled={isProcessing}
                  >
                    {mesa}
                  </Button>
                ))}
              </div>
            </div>

            {sellerSelecionado && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <div>
                    <p className="font-semibold text-sm">Seller Identificado Automaticamente</p>
                    <p className="text-xs">
                      {sellerSelecionado === "mercadoLivre"
                        ? "Mercado Livre"
                        : sellerSelecionado === "shopee"
                          ? "Shopee"
                          : sellerSelecionado === "amazon"
                            ? "Amazon"
                            : "Outros"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 justify-center text-blue-700">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <p className="font-semibold">Registrando pacote...</p>
                </div>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog de Duplicado */}
      <AlertDialog open={isDuplicadoAlertOpen} onOpenChange={setIsDuplicadoAlertOpen}>
        <AlertDialogContent className="border-2 border-red-200 max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
              <AlertDialogTitle className="text-2xl font-bold text-red-600">Código Duplicado!</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="space-y-3 text-base">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="font-semibold text-red-900 mb-2">Este pacote já foi registrado anteriormente:</p>
                {registroAnterior && (
                  <div className="space-y-2 text-red-800">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="font-mono">
                        {registroAnterior.orderId}
                      </Badge>
                    </div>
                    <p className="font-semibold">
                      Mesa: <span className="text-xl">{registroAnterior.mesaId}</span>
                    </p>
                    <p>
                      Data/Hora:{" "}
                      <span className="font-mono font-semibold">
                        {format(parseISO(registroAnterior.dataHora), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                      </span>
                    </p>
                  </div>
                )}
              </div>
              <p className="text-red-700 font-medium text-center">Nova gravação BLOQUEADA por segurança.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setIsDuplicadoAlertOpen(false)
                setRegistroAnterior(null)
              }}
              className="w-full h-12 text-base font-semibold bg-red-600 hover:bg-red-700"
            >
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
