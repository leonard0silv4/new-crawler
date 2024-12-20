import { useEffect, useMemo, useState } from "react";
import { useModal } from "../../context/ModalContext";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Circle,
  CircleArrowLeft,
  CircleCheck,
  CircleCheckBig,
  HandCoins,
  Loader,
  RefreshCcw,
  Search,
  SquareCheck,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

import instance from "@/config/axios";
import { AddJob } from "./add";
import Pix from "../Pix";
import { Button } from "@/components/ui/button";
// import { io } from "socket.io-client";
import moment from "moment";

// Conectar ao socket
// const socket = io(import.meta.env.VITE_APP_BASE_URL, {
//   transports: ["websocket", "polling"],
// });

const Job = () => {
  let { user } = useParams();
  const navigate = useNavigate();
  const { openModal } = useModal();

  const [registers, setRegisters] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [faccionist, setFaccionist] = useState<any>(null);
  const [load, setLoad] = useState(true);

  const [showPaid, setShowPaid] = useState(false); // Estado para controlar a filtragem dos lotes não pagos
  const [showRecebidoConferido, setShowRecebidoConferido] = useState(false);
  const [showLotePronto, setShowLotePronto] = useState(false);
  const [showAprovado, setShowAprovado] = useState(false);
  const [showRecebido, setShowRecebido] = useState(false);

  useEffect(() => {
    setLoad(true);

    // Obtenha os registros iniciais
    instance
      .get(`factionist/${user}`)
      .then((response: any) => {
        setFaccionist(response[0]);
        setRegisters(response[0].jobs);
      })
      .finally(() => {
        setLoad(false);
      });

    // Conecte-se ao SSE
    const eventSource = new EventSource(
      `${import.meta.env.VITE_APP_BASE_URL}events`
    );

    eventSource.addEventListener("jobUpdated", (event) => {
      const updatedJob = JSON.parse(event.data);
      console.log("Job updated:", updatedJob.job);

      setRegisters((prevRegisters) => {
        const updatedIndex = prevRegisters.findIndex(
          (register) => register._id === updatedJob.job._id
        );

        if (updatedIndex !== -1) {
          // Verifique se há realmente alterações antes de atualizar o estado
          const isDifferent =
            JSON.stringify(prevRegisters[updatedIndex]) !==
            JSON.stringify(updatedJob.job);

          if (isDifferent) {
            const updatedRegisters = [...prevRegisters];
            updatedRegisters[updatedIndex] = updatedJob.job;
            return updatedRegisters;
          }
        }

        return prevRegisters;
      });
    });

    // Limpeza ao desmontar o componente
    return () => {
      eventSource.close();
    };
  }, []);

  const toggleRecebidoConferidoFilter = () => {
    setShowRecebidoConferido((prev) => !prev);
  };

  const toggleLoteProntoFilter = () => {
    setShowLotePronto((prev) => !prev);
  };

  const toggleAprovadoFilter = () => {
    setShowAprovado((prev) => !prev);
  };

  const toggleRecebidoFilter = () => {
    setShowRecebido((prev) => !prev);
  };

  const togglePaid = () => {
    setShowPaid((prev) => !prev);
  };

  // Função para filtrar os registros
  const filteredRegisters = registers?.filter((register) =>
    Object.values(register).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Função para aplicar todos os filtros específicos
  const applyFilters = (registers: any) => {
    return registers?.filter((register: any) => {
      // Filtro por texto livre
      const matchesSearchTerm = Object.values(register).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Filtro de showUnpaid
      const matchesPaid = showPaid ? register.pago : true;

      // Filtro de showRecebidoConferido
      const matchesRecebidoConferido = showRecebidoConferido
        ? register.recebidoConferido
        : true;

      // Filtro de showLotePronto
      const matchesLotePronto = showLotePronto ? register.lotePronto : true;

      // Filtro de showAprovado
      const matchesAprovado = showAprovado ? register.aprovado : true;

      // Filtro de showRecebido
      const matchesRecebido = showRecebido ? register.recebido : true;

      // Retorna true se todos os filtros forem satisfeitos
      return (
        matchesSearchTerm &&
        matchesPaid &&
        matchesRecebidoConferido &&
        matchesLotePronto &&
        matchesAprovado &&
        matchesRecebido
      );
    });
  };

  const displayedRegisters = applyFilters(filteredRegisters);

  // Função para somar os valores não pagos
  const sumNotPayd = (jobs: any) => {
    const totalOrcamento = jobs
      .filter((item: any) => !item.pago && item.recebido) // Filtrar os objetos com `pago` igual a false
      .reduce((sum: number, item: any) => sum + item.orcamento, 0);
    return totalOrcamento;
  };

  const totalNotPaid = useMemo(() => sumNotPayd(registers), [registers]);

  const handleOpenPixModal = (
    key: string,
    price: number,
    username: string,
    jobIds: string[]
  ) => {
    openModal(
      <Pix
        pixKey={key}
        price={price}
        username={username}
        onMarkAsPaid={() => handleStatusChange(jobIds, "pago")}
      />
    );
  };

  const addJob = (newJob: any) => {
    setRegisters((prev) => (prev.length ? [...prev, newJob] : [newJob]));
  };

  const handleStatusChange = async (
    ids: string[],
    field: "pago" | "lotePronto" | "aprovado" | "recebido" | "emenda"
  ) => {
    instance.put(`jobs`, { ids, field });
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  };

  if (load) return <Loader className="w-10 h-10 animate-spin m-auto my-10" />;

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <a onClick={() => navigate("/users")} href="">
            <CircleArrowLeft />
          </a>

          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Buscar trabalho"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <AddJob addJob={addJob} />
        </div>

        <div className="flex justify-between items-center">
          <Card className="block w-full p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 ">
            <CardHeader>
              <CardTitle>
                {faccionist?.username} {faccionist?.lastName}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center text-md font-normal text-gray-900 dark:text-white mb-3">
                Endereço: <b className="ml-2">{faccionist?.address}</b>
              </div>

              <div className="flex items-center text-md font-normal text-gray-900 dark:text-white mb-3">
                Chave pix: <b className="ml-2">{faccionist?.pixKey}</b>
              </div>

              <div className="flex items-center text-md font-normal text-gray-900 dark:text-white mb-3">
                Valor total em caixa:
                <b className="ml-2">R$ {totalNotPaid.toFixed(2)}</b>
              </div>
              {registers
                .filter((item: any) => !item.pago)
                .map((item: any) => item._id).length != 0 && (
                <Button
                  onClick={() =>
                    handleOpenPixModal(
                      faccionist?.pixKey,
                      sumNotPayd(registers),
                      `${faccionist?.username} ${faccionist?.lastName}`,
                      registers
                        .filter((item: any) => !item.pago)
                        .map((item: any) => item._id)
                    )
                  }
                  className="mt-2 bg-green-800"
                >
                  <HandCoins className="w-4 h-4 mr-2" />
                  Pagar valor total
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3">
          <div className="flex items-center text-sm font-medium text-gray-900 p-3">
            <Button
              variant="outline"
              onClick={togglePaid}
              className="ml-3 gap-3"
            >
              {" "}
              <motion.div
                key={showPaid ? "show" : "hide"} // Usado para diferenciar os estados
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={iconVariants}
                transition={{ duration: 0.2 }}
              >
                {showPaid ? <CircleCheckBig /> : <Circle />}
              </motion.div>
              Mostrar trabalhos pagos
            </Button>
          </div>

          <div className="flex items-center text-sm font-medium text-gray-900 p-3">
            <Button
              variant="outline"
              onClick={toggleRecebidoConferidoFilter}
              className="ml-3 gap-3"
            >
              <motion.div
                key={showRecebidoConferido ? "show" : "hide"} // Usado para diferenciar os estados
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={iconVariants}
                transition={{ duration: 0.2 }}
              >
                {showRecebidoConferido ? <CircleCheckBig /> : <Circle />}
              </motion.div>
              Recebidos/conferidos
            </Button>
          </div>

          <div className="flex items-center text-sm font-medium text-gray-900 p-3">
            <Button
              variant="outline"
              onClick={toggleLoteProntoFilter}
              className="ml-3 gap-3"
            >
              <motion.div
                key={showLotePronto ? "show" : "hide"} // Usado para diferenciar os estados
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={iconVariants}
                transition={{ duration: 0.2 }}
              >
                {showLotePronto ? <CircleCheckBig /> : <Circle />}
              </motion.div>
              Lotes prontos
            </Button>
          </div>

          <div className="flex items-center text-sm font-medium text-gray-900 p-3">
            <Button
              variant="outline"
              onClick={toggleAprovadoFilter}
              className="ml-3 gap-3"
            >
              <motion.div
                key={showAprovado ? "show" : "hide"} // Usado para diferenciar os estados
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={iconVariants}
                transition={{ duration: 0.2 }}
              >
                {showAprovado ? <CircleCheckBig /> : <Circle />}
              </motion.div>
              Trabalhos aprovados
            </Button>
          </div>

          <div className="flex items-center text-sm font-medium text-gray-900 p-3">
            <Button
              variant="outline"
              onClick={toggleRecebidoFilter}
              className="ml-3 gap-3"
            >
              <motion.div
                key={showRecebido ? "show" : "hide"} // Usado para diferenciar os estados
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={iconVariants}
                transition={{ duration: 0.2 }}
              >
                {showRecebido ? <CircleCheckBig /> : <Circle />}
              </motion.div>
              Trabalhos recebidos
            </Button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {displayedRegisters?.map((register: any) => (
              <motion.div
                key={register._id + "m"} // Use uma chave única para cada item
                variants={itemVariants} // Variantes definidas acima
                initial="hidden" // Estado inicial
                animate="visible" // Estado animado
                exit="exit" // Estado ao remover
                transition={{ duration: 0.3 }} // Tempo da animação
              >
                <Card
                  key={register._id}
                  className="w-full bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  <CardHeader>
                    <CardTitle>LOTE: {register.lote}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                      Data: {moment(register.data).format("DD-MM-YYYY")}
                    </div>

                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                      Quantidade: {register.qtd}
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                      Largura: {register.larg}
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                      Comprimento: {register.compr}
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                      Emenda: {register.emenda ? "Sim" : "Não"}
                      <a
                        className="cursor-pointer ml-3"
                        onClick={() =>
                          handleStatusChange([register._id], "emenda")
                        }
                      >
                        <RefreshCcw className="w-5 h-5" />
                      </a>
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                      Total Metros: {register.totalMetros}
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                      Orçamento: R${register.orcamento.toFixed(2)}
                    </div>
                    <div>
                      <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                        <span
                          className={`${
                            register.recebidoConferido
                              ? "bg-teal-500"
                              : "bg-red-500 "
                          } flex w-2.5 h-2.5  rounded-full me-1.5 flex-shrink-0`}
                        ></span>
                        Recebido/Conferido:{" "}
                        {register.recebidoConferido ? "Sim" : "Não"}
                      </span>
                    </div>
                    <div>
                      <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                        <span
                          className={`${
                            register.lotePronto ? "bg-teal-500" : "bg-red-500 "
                          } flex w-2.5 h-2.5  rounded-full me-1.5 flex-shrink-0`}
                        ></span>
                        Lote Pronto: {register.lotePronto ? "Sim" : "Não"}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                        <span
                          className={`${
                            register.recebido ? "bg-teal-500" : "bg-red-500 "
                          } flex w-2.5 h-2.5  rounded-full me-1.5 flex-shrink-0`}
                        ></span>
                        Recebido: {register.recebido ? "Sim" : "Não"}
                      </span>
                      {!register.recebido && (
                        <a
                          className="cursor-pointer"
                          onClick={() =>
                            handleStatusChange([register._id], "recebido")
                          }
                        >
                          <SquareCheck className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                    <div className="flex">
                      <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                        <span
                          className={`${
                            register.aprovado ? "bg-teal-500" : "bg-red-500 "
                          } flex w-2.5 h-2.5  rounded-full me-1.5 flex-shrink-0`}
                        ></span>
                        Aprovado: {register.aprovado ? "Sim" : "Não"}
                      </span>
                      {!register.aprovado && (
                        <a
                          className="cursor-pointer"
                          onClick={() =>
                            handleStatusChange([register._id], "aprovado")
                          }
                        >
                          <SquareCheck className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                      Data Pagamento:{" "}
                      {register.dataPgto
                        ? moment(register.dataPgto).format("DD-MM-YYYY")
                        : "-"}
                    </div>

                    <Button
                      onClick={() => handleStatusChange([register._id], "pago")}
                      className="bg-red-500"
                    >
                      <HandCoins className="w-4 h-4 mr-2" />
                      Reverter pagamento
                    </Button>

                    <motion.div
                      key={register.pago ? "paid" : "unpaid"} // Define uma key dinâmica para animar a troca
                      initial={{ opacity: 0, scale: 0.8 }} // Valores iniciais
                      animate={{ opacity: 1, scale: 1 }} // Animação de entrada
                      exit={{ opacity: 0, scale: 0.9 }} // Animação de saída
                      transition={{ duration: 0.3 }} // Define a duração da animação
                      className="flex justify-center items-center mt-40 mb-0"
                    >
                      {register.pago ? (
                        <CircleCheck className="w-9 h-9 text-green-500" />
                      ) : (
                        <Button
                          onClick={() =>
                            handleOpenPixModal(
                              faccionist?.pixKey,
                              register.orcamento,
                              `${faccionist?.username} ${faccionist?.lastName}`,
                              [register._id]
                            )
                          }
                          className="bg-green-800 flex items-center"
                        >
                          <HandCoins className="w-4 h-4 mr-2" />
                          Pagar este lote
                        </Button>
                      )}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Job;
