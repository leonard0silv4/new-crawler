import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2, AlertCircle, Package, CreditCard } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface LoteCardProps {
  register: any;
  onRecebidoChange: (
    id: string,
    lote: string,
    field: "recebidoConferido"
  ) => void;
  onProntoChange: (id: string, lote: string, field: "lotePronto") => void;
}

export function LoteCard({
  register,
  onRecebidoChange,
  onProntoChange,
}: LoteCardProps) {
  const isPago = register.dataPgto;
  const cardBg = isPago
    ? "bg-emerald-50 dark:bg-emerald-950/30 border-l-4 border-emerald-500"
    : "bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500";

  return (
    <div
      className={`rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow flex flex-col h-full ${cardBg}`}
    >
      <div className="mb-5 pb-3 border-b-2 border-gray-300 dark:border-gray-600">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          LOTE {register.lote}
        </h2>
      </div>

      <div className="space-y-3 mb-5 flex-grow">
        <div className="bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Especificação
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {register.qtd} Tela{register.qtd > 1 ? "s" : ""} - {register.larg} x{" "}
            {register.compr}
          </p>
        </div>

        {register.emenda && (
          <div className="bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded-lg flex items-center gap-2 border border-yellow-300 dark:border-yellow-800">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              Possui Emenda
            </p>
          </div>
        )}

        <div className="bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Recebido</p>
            {register.recebidoConferido && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {register.recebidoConferido && register.dataRecebidoConferido
              ? format(
                  new Date(register.dataRecebidoConferido),
                  "dd/MM/yyyy HH:mm",
                  { locale: ptBR }
                )
              : "Não conferido"}
          </p>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
            <Switch
              checked={register.recebidoConferido}
              disabled={register.recebidoConferido}
              onCheckedChange={() =>
                onRecebidoChange(
                  register._id,
                  register.lote,
                  "recebidoConferido"
                )
              }
              aria-label="Marcar como recebido"
            />
            <span
              className={`text-xs ${
                register.recebidoConferido
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {register.recebidoConferido
                ? "Conferido ✓"
                : "Marcar como conferido"}
            </span>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">Pronto</p>
            {register.lotePronto && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {register.lotePronto && register.dataLotePronto
              ? format(new Date(register.dataLotePronto), "dd/MM/yyyy HH:mm", {
                  locale: ptBR,
                })
              : "Não pronto"}
          </p>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
            <Switch
              checked={register.lotePronto}
              disabled={register.lotePronto}
              onCheckedChange={() =>
                onProntoChange(register._id, register.lote, "lotePronto")
              }
              aria-label="Marcar como pronto"
            />
            <span
              className={`text-xs ${
                register.lotePronto
                  ? "text-gray-400 dark:text-gray-500"
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              {register.lotePronto ? "Pronto ✓" : "Marcar como pronto"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Resumo do Lote
        </p>
        <div className="flex justify-between items-baseline">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Lote com {register.totMetros?.toFixed(2) || 0} m²
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            R$ {register.orcamento?.toFixed(2) || "0.00"}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t-2 border-gray-300 dark:border-gray-600 mt-auto">

        {isPago ? (
          <div className="flex items-center gap-3 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 p-3 rounded-lg border border-emerald-300 dark:border-emerald-900/50 min-h-[70px]">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Pago</p>
              <p className="text-xs opacity-80">
                {format(new Date(register.dataPgto), "dd/MM/yyyy HH:mm", {
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>
        ) : register.recebido && register.lotePronto ? (
          <div className="flex items-center gap-3 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 p-3 rounded-lg border border-orange-300 dark:border-orange-900/50 min-h-[70px]">
            <CreditCard className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-semibold">Aguardando Pagamento</p>
            
          </div>
        ) : register.lotePronto && register.recebidoConferido ? (
          <div className="flex items-center gap-3 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 p-3 rounded-lg border border-blue-300 dark:border-blue-900/50 min-h-[70px]">
            <Package className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-semibold">Aguardando Coleta</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
