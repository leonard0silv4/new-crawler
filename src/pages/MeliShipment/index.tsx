"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Package,
  Scan,
  Loader2,
  AlertCircle,
  Ruler,
  Weight,
  History,
  X,
  CheckCircle2,
  ShoppingCart,
  Box,
  ArrowRight,
} from "lucide-react"
import instance from "@/config/axios"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion, AnimatePresence } from "motion/react"

interface Dimensions {
  height_cm: number
  width_cm: number
  length_cm: number
  weight_g: number
}

interface OrderItem {
  id: string
  title: string
  sku: string | null
  quantity: number
  unit_price: number
  variation_id: string | null
}

interface ShipmentResult {
  shipment_id: number
  order_id: number | null
  status: string
  substatus: string | null
  logistic_type: string | null
  mode: string | null
  dimensions: Dimensions | null
  order_items: OrderItem[]
  date_created: string | null
  last_updated: string | null
}

interface ScanHistoryEntry {
  shipment_id: number
  scanned_at: string
  dimensions: Dimensions | null
  items_count: number
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ready_to_ship: { label: "Pronto para envio", color: "bg-blue-100 text-blue-800 border-blue-200" },
  shipped: { label: "Enviado", color: "bg-green-100 text-green-800 border-green-200" },
  delivered: { label: "Entregue", color: "bg-green-100 text-green-800 border-green-200" },
  not_delivered: { label: "Não entregue", color: "bg-red-100 text-red-800 border-red-200" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800 border-red-200" },
  handling: { label: "Processando", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  in_hub: { label: "No hub", color: "bg-purple-100 text-purple-800 border-purple-200" },
  almost_expired: { label: "Quase expirado", color: "bg-orange-100 text-orange-800 border-orange-200" },
}

const LOGISTIC_MAP: Record<string, string> = {
  xd_drop_off: "Drop Off",
  xd_drop_off_partner: "Drop Off Parceiro",
  self_service: "Agência",
  me2: "ME2",
  fulfillment: "Fulfillment",
  cross_docking: "Cross Docking",
}

function formatWeight(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2).replace(".", ",")} kg`
  }
  return `${grams} g`
}

function DimensionCard({
  label,
  value,
  unit,
  icon,
  color,
}: {
  label: string
  value: number
  unit: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className={`rounded-xl border-2 ${color} p-4 flex flex-col items-center gap-2`}>
      <div className="opacity-70">{icon}</div>
      <span className="text-3xl font-bold tabular-nums">{value}</span>
      <span className="text-xs font-medium uppercase tracking-wide opacity-70">{unit}</span>
      <span className="text-xs font-semibold text-center leading-tight">{label}</span>
    </div>
  )
}

export default function MeliShipment() {
  const [barcode, setBarcode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ShipmentResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<ScanHistoryEntry[]>([])
  const [showFlash, setShowFlash] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!isLoading && !error) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isLoading, error])

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault()

    const code = barcode.trim()
    if (!code) {
      toast.error("Digite ou bipe o código de barras")
      return
    }

    if (!/^\d{11}$/.test(code)) {
      toast.error("Código inválido", {
        description: "O código do Mercado Livre deve ter exatamente 11 dígitos numéricos.",
        duration: 4000,
      })
      return
    }

    setIsLoading(true)
    setResult(null)
    setError(null)

    try {
      const data = (await instance.get(`/meli/shipment/${code}`)) as ShipmentResult

      setResult(data)

      setHistory((prev) => [
        {
          shipment_id: data.shipment_id,
          scanned_at: new Date().toISOString(),
          dimensions: data.dimensions,
          items_count: data.order_items.length,
        },
        ...prev.slice(0, 9),
      ])

      setShowFlash(true)
      setTimeout(() => setShowFlash(false), 700)

      if (!data.dimensions) {
        toast.warning("Envio encontrado sem dimensões cadastradas", {
          description: `Pedido #${data.order_id ?? "—"}`,
        })
      } else {
        toast.success("Dimensões encontradas!", {
          description: `${data.dimensions.length_cm} × ${data.dimensions.width_cm} × ${data.dimensions.height_cm} cm`,
        })
      }

      setBarcode("")
    } catch (err: any) {
      const status = err.response?.status
      const data = err.response?.data

      let msg = data?.error ?? "Erro ao consultar o envio."
      if (status === 403) {
        msg = data?.detail ?? "Nenhuma conta conectada tem acesso a este envio."
      } else if (status === 404) {
        msg = `Envio ${code} não encontrado no Mercado Livre.`
      }

      setError(msg)
      toast.error("Erro na consulta", { description: msg, duration: 6000 })
    } finally {
      setIsLoading(false)
    }
  }

  const clearResult = () => {
    setResult(null)
    setError(null)
    setBarcode("")
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const statusInfo = result?.status ? STATUS_MAP[result.status] : null

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Header */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Box className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  Consulta de Dimensões — Mercado Livre
                </CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">
                  Bipe o código de barras da etiqueta para ver as dimensões da caixa
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Scanner Input */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-800 text-base">
              <Scan className="h-4 w-4 text-yellow-600" />
              Leitura de Código de Barras
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Código de barras (11 dígitos)"
                  disabled={isLoading}
                  className="h-14 text-xl font-mono text-center border-gray-300 focus:border-yellow-500 focus:ring-yellow-500 pr-12"
                  autoComplete="off"
                  maxLength={11}
                  autoFocus
                />
                {barcode && (
                  <button
                    type="button"
                    onClick={() => { setBarcode(""); inputRef.current?.focus() }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                {isLoading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-6 w-6 animate-spin text-yellow-600" />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={!barcode.trim() || isLoading}
                className="w-full h-12 text-base font-semibold bg-yellow-500 hover:bg-yellow-600 text-white"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <Scan className="h-5 w-5 mr-2" />
                    Consultar Dimensões
                  </>
                )}
              </Button>
            </form>

            <p className="text-xs text-gray-400 text-center mt-4">
              O campo está sempre pronto para leitura — bipe direto após cada consulta
            </p>
          </CardContent>
        </Card>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Card className="bg-white border-2 border-red-200 shadow-sm">
                <CardContent className="pt-6 pb-6">
                  <div className="flex items-start gap-3 text-red-700">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Erro na consulta</p>
                      <p className="text-sm mt-0.5 text-red-600">{error}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearResult}
                    className="mt-4 border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpar e tentar novamente
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="space-y-4"
            >
              {/* Info bar */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-wrap items-center gap-3 justify-between">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <span className="font-mono font-semibold text-gray-900">
                        Envio #{result.shipment_id}
                      </span>
                      {result.order_id && (
                        <>
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                          <span className="text-gray-500">Pedido #{result.order_id}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {statusInfo && (
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      )}
                      {result.logistic_type && (
                        <Badge variant="outline" className="text-xs">
                          {LOGISTIC_MAP[result.logistic_type] ?? result.logistic_type}
                        </Badge>
                      )}
                      <button
                        onClick={clearResult}
                        className="text-gray-400 hover:text-gray-600 ml-1"
                        title="Fechar resultado"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dimensions */}
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-100 pb-3">
                  <CardTitle className="flex items-center gap-2 text-gray-800 text-base">
                    <Ruler className="h-4 w-4 text-yellow-600" />
                    Dimensões da Caixa
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 pb-6">
                  {result.dimensions ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <DimensionCard
                        label="Comprimento"
                        value={result.dimensions.length_cm}
                        unit="cm"
                        icon={<Ruler className="h-6 w-6" />}
                        color="border-blue-200 bg-blue-50 text-blue-900"
                      />
                      <DimensionCard
                        label="Largura"
                        value={result.dimensions.width_cm}
                        unit="cm"
                        icon={<Ruler className="h-6 w-6 rotate-90" />}
                        color="border-emerald-200 bg-emerald-50 text-emerald-900"
                      />
                      <DimensionCard
                        label="Altura"
                        value={result.dimensions.height_cm}
                        unit="cm"
                        icon={<Package className="h-6 w-6" />}
                        color="border-violet-200 bg-violet-50 text-violet-900"
                      />
                      <DimensionCard
                        label="Peso"
                        value={result.dimensions.weight_g >= 1000
                          ? parseFloat((result.dimensions.weight_g / 1000).toFixed(2))
                          : result.dimensions.weight_g}
                        unit={result.dimensions.weight_g >= 1000 ? "kg" : "g"}
                        icon={<Weight className="h-6 w-6" />}
                        color="border-orange-200 bg-orange-50 text-orange-900"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">Nenhuma dimensão cadastrada</p>
                        <p className="text-xs mt-0.5">
                          Este envio não possui dimensões declaradas na API do Mercado Livre.
                        </p>
                      </div>
                    </div>
                  )}

                  {result.dimensions && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                      <p className="text-xs text-gray-500 font-medium mb-1">Medidas resumidas</p>
                      <p className="text-lg font-bold font-mono text-gray-800">
                        {result.dimensions.length_cm} × {result.dimensions.width_cm} × {result.dimensions.height_cm} cm
                        <span className="text-gray-400 mx-2">|</span>
                        {formatWeight(result.dimensions.weight_g)}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order items */}
              {result.order_items.length > 0 && (
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardHeader className="border-b border-gray-100 pb-3">
                    <CardTitle className="flex items-center gap-2 text-gray-800 text-base">
                      <ShoppingCart className="h-4 w-4 text-yellow-600" />
                      Produtos do Pedido
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 pb-4 space-y-3">
                    {result.order_items.map((item, idx) => (
                      <div key={idx}>
                        {idx > 0 && <Separator className="mb-3" />}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm leading-snug">
                              {item.title}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              {item.sku && (
                                <Badge variant="outline" className="text-xs font-mono">
                                  SKU: {item.sku}
                                </Badge>
                              )}
                              {item.id && (
                                <span className="text-xs text-gray-400 font-mono">{item.id}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-gray-900">
                              Qtd: {item.quantity}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.unit_price.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flash success overlay */}
        <AnimatePresence>
          {showFlash && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
            >
              <div className="bg-yellow-500 text-white rounded-full p-8 shadow-2xl">
                <CheckCircle2 className="h-20 w-20" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100 pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-800 text-base">
                <History className="h-4 w-4 text-gray-500" />
                Histórico da Sessão
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 pb-3">
              <div className="space-y-2">
                {history.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-mono font-semibold text-gray-800">
                          #{entry.shipment_id}
                        </span>
                        {entry.dimensions && (
                          <span className="text-xs text-gray-500 ml-2">
                            {entry.dimensions.length_cm}×{entry.dimensions.width_cm}×{entry.dimensions.height_cm} cm
                            · {formatWeight(entry.dimensions.weight_g)}
                          </span>
                        )}
                        {!entry.dimensions && (
                          <span className="text-xs text-amber-600 ml-2">sem dimensões</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {format(new Date(entry.scanned_at), "HH:mm:ss", { locale: ptBR })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
