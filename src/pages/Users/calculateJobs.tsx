import { motion, AnimatePresence } from "framer-motion";

const CalculateJobs = ({ jobs }: any) => {
  const conferidoReady = jobs?.every(
    (job: any) => job.recebidoConferido === true
  );
  const loteReady = jobs?.every((job: any) => job.lotePronto === true);

  const hasUnpaidJobsWithConferido = jobs?.some(
    (job: any) => job.recebido === true && job.pago === false
  );

  const qtdAwaitConferido = jobs?.filter(
    (job: any) => job.recebidoConferido === false
  ).length;

  const qtdAwaitReady = jobs?.filter(
    (job: any) => job.lotePronto === false
  ).length;

  if (!jobs || jobs?.length <= 0) {
    return (
      <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
        <span className="w-2 h-2 me-1 bg-green-500 rounded-full"></span>
        Nenhum pedido efetuado ainda...
      </span>
    );
  }

  return (
    <AnimatePresence>
      <p className="flex">
        <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
          <motion.span
            className={`flex w-2.5 h-2.5 rounded-full me-1.5 flex-shrink-0 ${
              conferidoReady ? "bg-teal-500" : "bg-red-500"
            }`}
            animate={{ scale: conferidoReady ? 1.2 : 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          ></motion.span>
          {conferidoReady
            ? `Pedidos conferidos`
            : `Aguardando conferência (${qtdAwaitConferido})`}
        </span>
      </p>
      <p className="flex">
        <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
          <motion.span
            className={`flex w-2.5 h-2.5 rounded-full me-1.5 flex-shrink-0 ${
              loteReady ? "bg-teal-500" : "bg-red-500"
            }`}
            animate={{ scale: loteReady ? 1.2 : 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          ></motion.span>
          {loteReady
            ? `Pedidos prontos`
            : `Pedidos em andamento (${qtdAwaitReady})`}
        </span>
      </p>
      <p className="flex">
        <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
          <motion.span
            className={`flex w-2.5 h-2.5 rounded-full me-1.5 flex-shrink-0 ${
              hasUnpaidJobsWithConferido ? "bg-red-500" : "bg-teal-500"
            }`}
            animate={{ scale: hasUnpaidJobsWithConferido ? 1 : 1.2 }}
            transition={{ type: "spring", stiffness: 300 }}
          ></motion.span>
          {hasUnpaidJobsWithConferido
            ? `Aguardando pagamento`
            : `Todos os pedidos pagos`}
        </span>
      </p>
    </AnimatePresence>
  );
};

export default CalculateJobs;
