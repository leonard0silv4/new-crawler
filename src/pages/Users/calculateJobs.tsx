import { motion, AnimatePresence } from "framer-motion";

const CalculateJobs = ({ jobs }: any) => {
  const conferidoReady = jobs?.every(
    (job: any) => job.recebidoConferido === true
  );
  const loteReady = jobs?.every((job: any) => job.lotePronto === true);

  const hasUnpaidJobsWithConferido = jobs?.some(
    (job: any) => job.recebido === true && job.pago === false
  );

  const ReadyNotRecived = jobs?.some(
    (job: any) => job.lotePronto === true && job.recebido === false
  );

  const qtdAwaitConferido = jobs?.filter(
    (job: any) => job.recebidoConferido === false
  ).length;

  const qtdAwaitReady = jobs?.filter(
    (job: any) => job.lotePronto === false
  ).length;

  if (!jobs || jobs?.length <= 0) {
    return (
      <div className="min-h-16 pt-7 mb-3">
        <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300 ">
          <span className="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
          Nenhum pedido efetuado ainda...
        </span>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <p key="conferido-status" className="flex">
        <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
          <motion.div
            animate={{ scale: conferidoReady ? 1.2 : 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`flex-none rounded-full ${
              conferidoReady ? "bg-emerald-500/20" : "bg-red-500/20"
            }  p-1 me-2`}
          >
            <div
              className={`size-1.5 rounded-full ${
                conferidoReady ? "bg-emerald-500" : "bg-red-500"
              }`}
            ></div>
          </motion.div>

          {conferidoReady
            ? `Pedidos conferidos`
            : `Aguardando conferência (${qtdAwaitConferido})`}
        </span>
      </p>
      <p key="lote-status" className="flex">
        <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
          <motion.div
            animate={{ scale: loteReady ? 1.2 : 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`flex-none rounded-full ${
              loteReady ? "bg-emerald-500/20" : "bg-red-500/20"
            }  p-1 me-2`}
          >
            <div
              className={`size-1.5 rounded-full ${
                loteReady ? "bg-emerald-500" : "bg-red-500"
              }`}
            ></div>
          </motion.div>
          {loteReady
            ? `Pedidos prontos`
            : `Pedidos em andamento (${qtdAwaitReady})`}
        </span>
      </p>
      <p key="payment-status" className="flex">
        <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
          <motion.div
            animate={{ scale: hasUnpaidJobsWithConferido ? 1.2 : 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={`flex-none rounded-full ${
              hasUnpaidJobsWithConferido ? "bg-red-500/20" : "bg-emerald-500/20"
            }  p-1 me-2`}
          >
            <div
              className={`size-1.5 rounded-full ${
                hasUnpaidJobsWithConferido ? "bg-red-500" : "bg-emerald-500"
              }`}
            ></div>
          </motion.div>
          {hasUnpaidJobsWithConferido
            ? `Aguardando pagamento`
            : `Todos os pedidos pagos`}
        </span>
      </p>
      {ReadyNotRecived && (
        <p key="payment-status" className="flex">
          <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
            <motion.div
              transition={{ type: "spring", stiffness: 300 }}
              className={`flex-none rounded-full bg-purple-500/20 p-1 me-2`}
            >
              <div className={`size-1.5 rounded-full bg-purple-500`}></div>
            </motion.div>
            Lotes prontos e não recebidos
          </span>
        </p>
      )}
    </AnimatePresence>
  );
};

export default CalculateJobs;
