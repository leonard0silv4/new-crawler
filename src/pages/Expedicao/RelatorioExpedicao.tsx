"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Package, TrendingUp, Truck, CircleDot, Calendar as CalendarIcon, Info, Store, Trophy, Crown } from "lucide-react"
import instance from "@/config/axios"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface MetaDoDia {
  data?: string
  tipoConfiguracao: "total" | "porSeller" | null
  total: number | null
  porSeller: {
    [key: string]: number
  } | null
  horariosColeta?: {
    mercadoLivre: string
    shopee: string
    amazon: string
    outros: string
  }
  diaEncerrado?: boolean
}

interface ProdutividadeMesa {
  totalDia: number
  ritmoAtual: number
  porHora: {
    [hora: string]: number
  }
}

export default function RelatorioExpedicao() {
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date())
  const [metaDoDia, setMetaDoDia] = useState<MetaDoDia>({
    tipoConfiguracao: null,
    total: null,
    porSeller: null,
    horariosColeta: {
      mercadoLivre: "11:00",
      shopee: "14:00",
      amazon: "16:00",
      outros: "17:30",
    },
  })
  const [totalFeitos, setTotalFeitos] = useState(0)
  const [porSellerAtual, setPorSellerAtual] = useState<any>(null)
  const [produtividade, setProdutividade] = useState<{ [mesa: string]: ProdutividadeMesa } | null>({
    M1: { totalDia: 0, ritmoAtual: 0, porHora: {} },
    M2: { totalDia: 0, ritmoAtual: 0, porHora: {} },
    M3: { totalDia: 0, ritmoAtual: 0, porHora: {} },
    M4: { totalDia: 0, ritmoAtual: 0, porHora: {} },
  })
  const [diaEncerrado, setDiaEncerrado] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [porcentagemConcluida, setPorcentagemConcluida] = useState<number | null>(null)

  const mesaVencedora = useMemo(() => {
    if (!produtividade) return null

    let maxPacotes = 0
    let vencedora: string | null = null

    Object.entries(produtividade).forEach(([mesa, dados]) => {
      if (dados.totalDia > maxPacotes) {
        maxPacotes = dados.totalDia
        vencedora = mesa
      }
    })

    return vencedora ? { mesa: vencedora, pacotes: maxPacotes } : null
  }, [produtividade])

  // Carregar dados quando a data mudar
  useEffect(() => {
    carregarDados()
  }, [dataSelecionada])

  const carregarDados = async () => {
    try {
      setIsLoading(true)
      const dataFormatada = format(dataSelecionada, "yyyy-MM-dd")
      
      const response = await instance.get("/expedicao/dashboard", {
        params: {
          data: dataFormatada,
        },
      })

      const dados = response as any

      // Configurar meta
      if (dados.meta) {
        setMetaDoDia({
          data: dados.data,
          tipoConfiguracao: dados.meta.tipoConfiguracao,
          total: dados.meta.total,
          porSeller: dados.meta.porSeller,
          horariosColeta: dados.meta.horariosColeta || {
            mercadoLivre: "11:00",
            shopee: "14:00",
            amazon: "16:00",
            outros: "17:30",
          },
          diaEncerrado: dados.diaEncerrado,
        })
      } else {
        setMetaDoDia({
          tipoConfiguracao: null,
          total: null,
          porSeller: null,
          horariosColeta: {
            mercadoLivre: "11:00",
            shopee: "14:00",
            amazon: "16:00",
            outros: "17:30",
          },
        })
      }

      // Configurar dados gerais
      setTotalFeitos(dados.totalGeral || 0)
      setPorSellerAtual(dados.porSeller)
      setDiaEncerrado(dados.diaEncerrado || false)
      setPorcentagemConcluida(dados.porcentagemConcluida)

      // Configurar produtividade por mesa
      if (dados.porMesa) {
        setProdutividade(dados.porMesa)
      }

    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.error || "Data inválida")
      } else {
        toast.error("Erro ao carregar dados do relatório")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const calcularTotalHora = (hora: string): number => {
    if (!produtividade) return 0
    return Object.values(produtividade).reduce((acc, mesa) => acc + (mesa?.porHora?.[hora] || 0), 0)
  }

  const horasDoDia = [
    "07:00 às 08:00",
    "08:00 às 09:00",
    "09:00 às 10:00",
    "10:00 às 11:00",
    "11:00 às 12:00",
    "12:00 às 13:00",
    "13:00 às 14:00",
    "14:00 às 15:00",
    "15:00 às 16:00",
    "16:00 às 17:00",
  ]

  const progressoPercentual =
    metaDoDia.tipoConfiguracao === "total" && metaDoDia.total 
      ? Math.round((totalFeitos / metaDoDia.total) * 100) 
      : porcentagemConcluida 
        ? Math.round(porcentagemConcluida)
        : 0

  const ritmoTotalAtual = produtividade
    ? Object.values(produtividade).reduce((acc, mesa) => acc + mesa.ritmoAtual, 0)
    : 0

  // Verificar se a data selecionada é hoje
  const isHoje = format(dataSelecionada, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                    RELATÓRIO DE EXPEDIÇÃO
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-0.5">Consulta de dados históricos</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !dataSelecionada && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataSelecionada ? (
                        format(dataSelecionada, "dd 'de' MMMM, yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dataSelecionada}
                      onSelect={(date) => date && setDataSelecionada(date)}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Aviso de Dia Encerrado */}
        {diaEncerrado && (
          <Alert className="border-amber-300 bg-amber-50 hidden ">
            <Info className="h-5 w-5 text-amber-600" />
            <AlertDescription className="text-amber-800 font-medium">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Dia Encerrado!</strong> Os dados exibidos são referentes ao dia{" "}
                  <strong>{format(dataSelecionada, "dd/MM/yyyy", { locale: ptBR })}</strong>.
                </div>
                <CalendarIcon className="h-5 w-5 text-amber-600" />
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Horários de Coleta - DESTAQUE MÁXIMO */}
          <Card className="bg-blue-50 border-blue-200 shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold flex items-center gap-3 text-blue-800">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                HORÁRIOS DE COLETA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative p-4 bg-yellow-100 border-2 border-yellow-300 rounded-2xl">
                  <div className="absolute top-2 right-2">
                    <CircleDot className="h-5 w-5 text-yellow-500" />
                  </div>
                  <p className="text-yellow-800 font-bold text-lg mb-1">Mercado Livre</p>
                  <p className="text-4xl font-mono font-black text-yellow-700 tracking-tight">
                    {metaDoDia.horariosColeta?.mercadoLivre || "11:00"}
                  </p>
                </div>
                <div className="relative p-4 bg-orange-100 border-2 border-orange-300 rounded-2xl">
                  <div className="absolute top-2 right-2">
                    <CircleDot className="h-5 w-5 text-orange-500" />
                  </div>
                  <p className="text-orange-800 font-bold text-lg mb-1">Shopee</p>
                  <p className="text-4xl font-mono font-black text-orange-700 tracking-tight">
                    {metaDoDia.horariosColeta?.shopee || "14:00"}
                  </p>
                </div>
                <div className="relative p-4 bg-cyan-100 border-2 border-cyan-300 rounded-2xl">
                  <div className="absolute top-2 right-2">
                    <CircleDot className="h-5 w-5 text-cyan-500" />
                  </div>
                  <p className="text-cyan-800 font-bold text-lg mb-1">Amazon</p>
                  <p className="text-4xl font-mono font-black text-cyan-700 tracking-tight">
                    {metaDoDia.horariosColeta?.amazon || "16:00"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metas por Seller - DESTAQUE VISUAL */}
          <Card className="bg-emerald-50 border-emerald-200 shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold flex items-center gap-3 text-emerald-800">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Store className="h-6 w-6 text-emerald-600" />
                  </div>
                  METAS POR SELLER
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {metaDoDia.tipoConfiguracao === "porSeller" && porSellerAtual && typeof porSellerAtual === "object" ? (
                <div className="space-y-4">
                  {Object.entries(porSellerAtual).map(([seller, dados]: [string, any]) => {
                    const nomeExibicao =
                      seller === "mercadoLivre"
                        ? "Mercado Livre"
                        : seller === "shopee"
                          ? "Shopee"
                          : seller === "amazon"
                            ? "Amazon"
                            : "Outros"

                    const porcentagem = dados.meta > 0 ? Math.round((dados.atual / dados.meta) * 100) : 0

                    const corBarra =
                      seller === "mercadoLivre"
                        ? "bg-yellow-400"
                        : seller === "shopee"
                          ? "bg-orange-400"
                          : seller === "amazon"
                            ? "bg-cyan-400"
                            : "bg-gray-400"

                    const corTexto =
                      seller === "mercadoLivre"
                        ? "text-yellow-700"
                        : seller === "shopee"
                          ? "text-orange-700"
                          : seller === "amazon"
                            ? "text-cyan-700"
                            : "text-gray-700"

                    return (
                      <div key={seller} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={cn("font-bold text-lg", corTexto)}>{nomeExibicao}</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-gray-900 tabular-nums">{dados.atual}</span>
                            <span className="text-xl text-gray-500">/ {dados.meta}</span>
                            <span
                              className={cn(
                                "text-lg font-bold ml-2",
                                porcentagem >= 100 ? "text-emerald-600" : "text-gray-500",
                              )}
                            >
                              ({porcentagem}%)
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div
                            className={cn("h-4 rounded-full transition-all duration-500", corBarra)}
                            style={{ width: `${Math.min(porcentagem, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  <Separator className="bg-emerald-200 my-4" />
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xl font-bold text-gray-800">TOTAL GERAL</span>
                    <span className="text-5xl font-black text-emerald-600">
                      {totalFeitos} <span className="text-2xl text-gray-500">Pcts</span>
                    </span>
                  </div>
                </div>
              ) : metaDoDia.tipoConfiguracao === "total" ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-xl bg-blue-100 border border-blue-200">
                      <p className="text-sm text-blue-700 uppercase font-medium">Meta</p>
                      <p className="text-4xl font-black text-gray-900">{metaDoDia.total || 0}</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-emerald-100 border border-emerald-200">
                      <p className="text-sm text-emerald-700 uppercase font-medium">Feitos</p>
                      <p className="text-4xl font-black text-gray-900">{totalFeitos}</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-amber-100 border border-amber-200">
                      <p className="text-sm text-amber-700 uppercase font-medium">Restante</p>
                      <p className="text-4xl font-black text-gray-900">
                        {Math.max(0, (metaDoDia.total || 0) - totalFeitos)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progresso</span>
                      <span className="font-bold text-gray-900 text-lg">{progressoPercentual}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
                      <div
                        className={cn(
                          "h-5 rounded-full transition-all duration-500",
                          progressoPercentual >= 100 ? "bg-emerald-500" : "bg-blue-500",
                        )}
                        style={{ width: `${Math.min(progressoPercentual, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-lg">Nenhuma meta configurada para este dia</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mesa Vencedora - DESTAQUE MÁXIMO */}
        <Card className="bg-amber-50 border-amber-200 shadow-sm overflow-hidden relative hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/30 rounded-full blur-3xl" />
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-amber-700">
              <Trophy className="h-5 w-5" />
              MESA VENCEDORA
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mesaVencedora && mesaVencedora.pacotes > 0 ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-amber-400 flex items-center justify-center shadow-lg">
                      <span className="text-3xl font-black text-white">{mesaVencedora.mesa}</span>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
                      <Crown className="w-4 h-4 text-yellow-900" />
                    </div>
                  </div>
                  <div>
                    <p className="text-4xl font-black text-gray-900">{mesaVencedora.pacotes}</p>
                    <p className="text-sm text-amber-700">pacotes processados</p>
                  </div>
                </div>
                <div className="hidden md:block text-right">
                  <Badge className="border-amber-400 text-amber-800 bg-amber-100">Líder do dia</Badge>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-4 text-gray-400">
                <Package className="h-8 w-8 mr-2 opacity-50" />
                <p className="text-sm">Sem dados para esta data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cards das Mesas M1-M4 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {["M1", "M2", "M3", "M4"].map((mesa) => {
            const dados = produtividade?.[mesa]
            const isVencedora = mesaVencedora?.mesa === mesa && mesaVencedora.pacotes > 0

            const coresMesa: Record<string, { bg: string; border: string; accent: string }> = {
              M1: { bg: "bg-blue-50", border: "border-blue-200", accent: "bg-blue-500" },
              M2: { bg: "bg-emerald-50", border: "border-emerald-200", accent: "bg-emerald-500" },
              M3: { bg: "bg-amber-50", border: "border-amber-200", accent: "bg-amber-500" },
              M4: { bg: "bg-rose-50", border: "border-rose-200", accent: "bg-rose-500" },
            }

            const cores = coresMesa[mesa]

            return (
              <Card
                key={mesa}
                className={cn(
                  "relative overflow-hidden transition-all duration-300 shadow-sm",
                  isVencedora
                    ? "bg-amber-100 border-amber-400 ring-2 ring-amber-300 scale-[1.02] shadow-md"
                    : `${cores.bg} ${cores.border}`,
                )}
              >
                {isVencedora && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center animate-pulse">
                      <Crown className="w-3 h-3 text-yellow-900" />
                    </div>
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-md",
                        isVencedora ? "bg-amber-500" : cores.accent,
                      )}
                    >
                      {mesa}
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-900">{dados?.totalDia || 0}</p>
                      <p className="text-xs text-gray-500">pacotes</p>
                    </div>
                  </div>
                  {isHoje && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Ritmo atual</span>
                      <span className="font-bold text-gray-700">{dados?.ritmoAtual || 0}/h</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Produção Detalhada - Destaque coluna da mesa vencedora */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-gray-800">
              <TrendingUp className="h-6 w-6 text-blue-500" />
              PRODUÇÃO DETALHADA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="border border-gray-700 p-3 text-left font-semibold">INDICADORES</th>
                    {["M1", "M2", "M3", "M4"].map((mesa) => (
                      <th
                        key={mesa}
                        className={cn(
                          "border border-gray-700 p-3 text-center font-semibold",
                          mesaVencedora?.mesa === mesa && mesaVencedora.pacotes > 0 && "bg-yellow-600",
                        )}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {mesaVencedora?.mesa === mesa && mesaVencedora.pacotes > 0 && <Crown className="w-4 h-4" />}
                          MESA {mesa.replace("M", "")}
                        </div>
                      </th>
                    ))}
                    <th className="border border-gray-700 p-3 text-center font-semibold bg-blue-900">TOTAL DA HORA</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Total do Dia */}
                  <tr className="bg-blue-50 font-bold">
                    <td className="border border-gray-300 p-3">TOTAL DO DIA</td>
                    {["M1", "M2", "M3", "M4"].map((mesa) => (
                      <td
                        key={mesa}
                        className={cn(
                          "border border-gray-300 p-3 text-center text-lg",
                          mesaVencedora?.mesa === mesa && mesaVencedora.pacotes > 0 && "bg-yellow-100",
                        )}
                      >
                        {produtividade?.[mesa]?.totalDia || 0}
                      </td>
                    ))}
                    <td className="border border-gray-300 p-3 text-center text-lg bg-blue-100 font-bold text-blue-700">
                      {totalFeitos} PACOTES
                    </td>
                  </tr>

                  {/* Ritmo Atual - só mostra se for hoje */}
                  {isHoje && (
                    <tr className="bg-green-50 font-semibold">
                      <td className="border border-gray-300 p-3">RITMO ATUAL*</td>
                      {["M1", "M2", "M3", "M4"].map((mesa) => (
                        <td
                          key={mesa}
                          className={cn(
                            "border border-gray-300 p-3 text-center",
                            mesaVencedora?.mesa === mesa && mesaVencedora.pacotes > 0 && "bg-yellow-50",
                          )}
                        >
                          {produtividade?.[mesa]?.ritmoAtual || 0}/h
                        </td>
                      ))}
                      <td className="border border-gray-300 p-3 text-center bg-green-100 font-bold text-green-700">
                        {ritmoTotalAtual} pcts/h
                      </td>
                    </tr>
                  )}

                  <tr className="h-2 bg-gray-100">
                    <td colSpan={6} className="border-0"></td>
                  </tr>

                  {/* Produção por Hora */}
                  {horasDoDia.map((hora, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3 font-medium text-gray-700">{hora}</td>
                      {["M1", "M2", "M3", "M4"].map((mesa) => (
                        <td
                          key={mesa}
                          className={cn(
                            "border border-gray-300 p-3 text-center",
                            mesaVencedora?.mesa === mesa && mesaVencedora.pacotes > 0 && "bg-yellow-50/50",
                          )}
                        >
                          {produtividade?.[mesa]?.porHora?.[hora] || 0}
                        </td>
                      ))}
                      <td className="border border-gray-300 p-3 text-center font-semibold bg-gray-100">
                        {calcularTotalHora(hora)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {isHoje && (
              <p className="text-xs text-gray-500 mt-3 italic">
                *Ritmo Atual: Baseado na janela móvel dos últimos 60 minutos.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
