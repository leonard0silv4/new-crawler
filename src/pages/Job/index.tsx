import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { useModal } from "../../context/ModalContext";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArchiveRestore,
  ArrowLeft,
  CalendarIcon,
  Circle,
  CircleCheck,
  CircleCheckBig,
  FileSpreadsheet,
  HandCoins,
  Loader,
  RefreshCcw,
  Search,
  SquareCheck,
  Undo2,
} from "lucide-react";
import { useLocation, useParams, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

import instance from "@/config/axios";
const AddJob = lazy(() => import("./add"));
const Pix = lazy(() => import("../Pix"));

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useSse } from "@/hooks/useSse";
import { DateRange } from "react-day-picker";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNotifyContext } from "@/context/NotifyContext";

const Job = () => {
  let { user } = useParams();
  const { openModal } = useModal();
  const location = useLocation();
  const { addOrUpdateNotify } = useNotifyContext();

  const [registers, setRegisters] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [faccionist, setFaccionist] = useState<any>(null);
  const [load, setLoad] = useState(true);
  const [paymentBySelection, setPaymentBySelection] = useState(false);

  const [showUnPaid, setShowUnPaid] = useState(false);
  const [showRecebidoConferido, setShowRecebidoConferido] = useState(false);
  const [showLotePronto, setShowLotePronto] = useState(false);
  const [showAprovado, setShowAprovado] = useState(false);
  const [showRecebido, setShowRecebido] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [isDialogJobOpen, setIsDialogJobOpen] = useState(false);

  const [lastLote, setLastLote] = useState("");

  const openDialog = (id: string) => {
    setSelectedJob(id);
    setIsDialogJobOpen(true);
  };

  useEffect(() => {
    setLoad(true);

    instance
      .get(`factionist/${user}`)
      .then((response: any) => {
        setFaccionist(response[0]);
        setRegisters(response[0].jobs);
      })
      .finally(() => {
        setLoad(false);
      });
  }, [location]);

  useEffect(() => {
    instance.get(`/factionistJob/${user}`).then((response: any) => {
      setLastLote(response);
    });
  }, [registers]);

  useSse({
    eventName: "jobUpdated",
    onEvent: (updatedJob: any) => {
      if (updatedJob.job.faccionistaId != user)
        addOrUpdateNotify(updatedJob.job.faccionistaId);

      setRegisters((prevRegisters) => {
        const updatedIndex = prevRegisters.findIndex(
          (register) => register._id === updatedJob.job._id
        );

        if (updatedIndex !== -1) {
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
    },
  });

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
    setShowUnPaid((prev) => !prev);
  };

  const filteredRegisters = registers?.filter((register) =>
    Object.values(register).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const applyFilters = (registers: any) => {
    return registers?.filter((register: any) => {
      const matchesSearchTerm = Object.values(register).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesUnPaid = showUnPaid ? !register.pago : true;

      const matchesRecebidoConferido = showRecebidoConferido
        ? register.recebidoConferido
        : true;

      const matchesLotePronto = showLotePronto ? register.lotePronto : true;

      const matchesAprovado = showAprovado ? register.aprovado : true;

      const matchesRecebido = showRecebido ? register.recebido : true;

      const matchesDateRange =
        range && range.from && range.to
          ? isWithinInterval(new Date(register.data), {
              start: startOfDay(range.from),
              end: endOfDay(range.to),
            })
          : true;

      return (
        matchesSearchTerm &&
        matchesUnPaid &&
        matchesRecebidoConferido &&
        matchesLotePronto &&
        matchesAprovado &&
        matchesRecebido &&
        matchesDateRange
      );
    });
  };

  const displayedRegisters = applyFilters(filteredRegisters);

  const sumNotPayd = (jobs: any) => {
    return jobs
      .filter((item: any) => !item.pago && item.recebido)
      .reduce((sum: number, item: any) => sum + item.orcamento, 0);
  };

  const totalNotPaid = useMemo(() => {
    const relevantJobs = paymentBySelection ? displayedRegisters : registers;
    return sumNotPayd(relevantJobs);
  }, [displayedRegisters, registers, paymentBySelection]);

  const handleOpenPixModal = (
    key: string,
    price: number,
    username: string,
    jobIds: string[]
  ) => {
    openModal(
      <Suspense fallback={<>Carregando...</>}>
        <Pix
          pixKey={key}
          price={price}
          username={username}
          onMarkAsPaid={() => handleStatusChange(jobIds, "pago")}
        />
      </Suspense>
    );
  };

  const addJob = (newJob: any) => {
    setRegisters((prev) => (prev.length ? [...prev, newJob] : [newJob]));
  };

  const downloadPdf = async () => {
    const ids = displayedRegisters.map((r: any) => r._id);
    console.log(ids);

    if (ids.length == 0) {
      toast.error("Seleção para relatório vazia");
      return;
    }

    try {
      const response = await instance.post(
        "report/pdf",
        { ids, user: faccionist.username, pixKey: faccionist.pixKey },
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${faccionist.username}_${format(new Date(), "dd_MM", {
          locale: ptBR,
        })}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao baixar PDF:", error);
    }
  };

  const singleUpdate = async (
    ev: any,
    field: "qtd" | "larg" | "compr",
    id: string
  ) => {
    console.log(ev.currentTarget.textContent);

    instance
      .put(`/jobs/sizes`, { id, field, value: ev.currentTarget.textContent })
      .then(() => {});
  };

  const handleStatusChange = async (
    ids: string[],
    field:
      | "pago"
      | "recebidoConferido"
      | "lotePronto"
      | "aprovado"
      | "recebido"
      | "emenda"
      | "emAnalise"
      | "isArchived"
  ) => {
    instance.put(`jobs`, { ids, field }).then(() => {
      if (field === "isArchived") {
        setRegisters((prevRegisters) =>
          prevRegisters.filter((register) => !ids.includes(register._id))
        );
      }
    });
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
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 pb-24">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <NavLink className="hover:text-gray-600" to="/users">
            <ArrowLeft />
          </NavLink>

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
          <Suspense fallback={<>Carregando...</>}>
            <AddJob lastLote={lastLote} addJob={addJob} />
          </Suspense>
        </div>

        <div className="flex justify-between items-center">
          <Card className="relative block w-full p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 ">
            <CardHeader>
              <CardTitle className="capitalize">
                {faccionist?.username} {faccionist?.lastName}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center text-md font-normal text-gray-900 dark:text-white mb-3">
                Endereço:{" "}
                <b className="ml-2 capitalize">{faccionist?.address}</b>
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
                  onClick={() => {
                    const relevantRegisters = paymentBySelection
                      ? displayedRegisters.filter(
                          (item: any) => !item.pago && item.recebido
                        )
                      : registers.filter(
                          (item: any) => !item.pago && item.recebido
                        );

                    handleOpenPixModal(
                      faccionist?.pixKey,
                      sumNotPayd(relevantRegisters),
                      `${faccionist?.username} ${faccionist?.lastName}`,
                      relevantRegisters.map((item: any) => item._id)
                    );
                  }}
                  className="mt-2 bg-green-800"
                  disabled={
                    paymentBySelection
                      ? displayedRegisters.filter((item: any) => !item.pago)
                          .length === 0
                      : registers.filter((item: any) => !item.pago).length === 0
                  }
                >
                  <HandCoins className="w-4 h-4 mr-2" />
                  Pagar valor total
                </Button>
              )}

              <div className="flex items-center text-md space-x-2 mt-4 font-normal text-gray-900 dark:text-white mb-3 sm:absolute top-4 right-4">
                <Checkbox
                  checked={paymentBySelection}
                  onCheckedChange={() =>
                    setPaymentBySelection(!paymentBySelection)
                  }
                  id="paymentBySelection"
                />
                <label
                  htmlFor="paymentBySelection"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Habilitar pagamento por seleção
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col justify-center flex-wrap md:justify-start md:flex-row">
          <div className="flex items-center text-sm font-medium text-gray-900 p-3">
            <Button variant="outline" onClick={togglePaid} className="">
              {" "}
              <motion.div
                key={showUnPaid ? "show" : "hide"}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={iconVariants}
                transition={{ duration: 0.2 }}
              >
                {showUnPaid ? <CircleCheckBig /> : <Circle />}
              </motion.div>
              Mostrar trabalhos não pagos
            </Button>
          </div>

          <div className="flex items-center text-sm font-medium text-gray-900 p-3">
            <Button
              variant="outline"
              onClick={toggleRecebidoConferidoFilter}
              className=""
            >
              <motion.div
                key={showRecebidoConferido ? "show" : "hide"}
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
              className=""
            >
              <motion.div
                key={showLotePronto ? "show" : "hide"}
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
              onClick={toggleRecebidoFilter}
              className=""
            >
              <motion.div
                key={showRecebido ? "show" : "hide"}
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
          <div className="flex items-center text-sm font-medium text-gray-900 p-3">
            <Button
              variant="outline"
              onClick={toggleAprovadoFilter}
              className=""
            >
              <motion.div
                key={showAprovado ? "show" : "hide"}
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-[240px] pl-3 text-left font-medium text-gray-900 ${
                    !range ? "text-muted-foreground" : ""
                  }`}
                >
                  {range ? (
                    range.from && range.to ? (
                      `${format(range.from, "PP", {
                        locale: ptBR,
                      })} - ${format(range.to, "PP", { locale: ptBR })}`
                    ) : range.from ? (
                      `${format(range.from, "PP", { locale: ptBR })} - ...`
                    ) : (
                      <span className="font-medium text-gray-900">
                        Selecione intervalo
                      </span>
                    )
                  ) : (
                    <span className="font-medium text-gray-900">
                      Selecione intervalo
                    </span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={(newRange) => setRange(newRange)}
                  locale={ptBR}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center text-sm font-medium text-gray-900 p-3">
            <a className="cursor-pointer" onClick={downloadPdf}>
              <FileSpreadsheet />
            </a>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid items-stretch grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {displayedRegisters?.map((register: any) => (
              <motion.div
                key={register._id + "m"}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Card
                  key={register._id}
                  className="w-full bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 relative h-full flex flex-col"
                >
                  <CardHeader>
                    <CardTitle>
                      LOTE: {register.lote}
                      <a
                        className="cursor-pointer"
                        onClick={() => openDialog(register._id)}
                      >
                        <ArchiveRestore className="w-4 h-4 float-right text-blue-400" />
                      </a>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                      Data:{" "}
                      <span className="px-1 inline-block ml-1">
                        {format(register.data, "dd/MM/yy")}
                      </span>
                    </div>

                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                      Quantidade:{" "}
                      <span
                        className="px-1 inline-block ml-1"
                        onBlur={(e) => {
                          singleUpdate(e, "qtd", register._id);
                        }}
                        contentEditable
                        suppressContentEditableWarning={true}
                      >
                        {register.qtd}
                      </span>
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                      Largura:{" "}
                      <span
                        className="px-1 inline-block ml-1"
                        onBlur={(e) => {
                          singleUpdate(e, "larg", register._id);
                        }}
                        contentEditable
                        suppressContentEditableWarning={true}
                      >
                        {register.larg}
                      </span>
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                      Comprimento:{" "}
                      <span
                        className="px-1 inline-block ml-1"
                        onBlur={(e) => {
                          singleUpdate(e, "compr", register._id);
                        }}
                        contentEditable
                        suppressContentEditableWarning={true}
                      >
                        {" "}
                        {register.compr}{" "}
                      </span>
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                      Emenda{" "}
                      <span className="px-1 inline-block ml-1">
                        {register.emenda ? "Sim" : "Não"}
                      </span>
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
                      Total Metros:{" "}
                      <span className="px-1 inline-block ml-1">
                        {register.totMetros}
                      </span>
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                      Orçamento:{" "}
                      <span className="px-1 inline-block ml-1">
                        R${register.orcamento.toFixed(2)}
                      </span>
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
                        Recebido/Conferido:
                        <span className="px-1 inline-block ml-1">
                          {register.recebidoConferido ? "" : "Não"}{" "}
                          {register.dataRecebidoConferido &&
                          register.recebidoConferido
                            ? format(
                                register.dataRecebidoConferido,
                                "dd/MM/yyyy HH:mm"
                              )
                            : ""}
                        </span>
                        {register.recebidoConferido && (
                          <a
                            className="cursor-pointer ml-2"
                            onClick={() =>
                              handleStatusChange(
                                [register._id],
                                "recebidoConferido"
                              )
                            }
                          >
                            <Undo2 className="w-4 h-4" />
                          </a>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                        <span
                          className={`${
                            register.lotePronto ? "bg-teal-500" : "bg-red-500 "
                          } flex w-2.5 h-2.5  rounded-full me-1.5 flex-shrink-0`}
                        ></span>
                        Lote Pronto:{" "}
                        <span className="px-1 inline-block ml-1">
                          {register.lotePronto ? "" : "Não"}{" "}
                          {register.dataLotePronto && register.lotePronto
                            ? format(
                                register.dataLotePronto,
                                "dd/MM/yyyy HH:mm"
                              )
                            : ""}
                        </span>
                        {register.lotePronto && (
                          <a
                            className="cursor-pointer ml-2"
                            onClick={() =>
                              handleStatusChange([register._id], "lotePronto")
                            }
                          >
                            <Undo2 className="w-4 h-4" />
                          </a>
                        )}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                        <span
                          className={`${
                            register.recebido ? "bg-teal-500" : "bg-red-500 "
                          } flex w-2.5 h-2.5  rounded-full me-1.5 flex-shrink-0`}
                        ></span>
                        Recebido:{" "}
                        <span className="px-1 inline-block ml-1">
                          {register.recebido ? "Sim" : "Não"}
                        </span>
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
                            register.emAnalise ? "bg-blue-500" : "bg-teal-500 "
                          } flex w-2.5 h-2.5  rounded-full me-1.5 flex-shrink-0`}
                        ></span>
                        Em análise:{" "}
                        <span className="px-1 inline-block ml-1">
                          {register.emAnalise ? "Sim" : "Não"}
                        </span>
                      </span>
                      {/* {!register.emAnalise && ( */}
                      <a
                        className="cursor-pointer"
                        onClick={() =>
                          handleStatusChange([register._id], "emAnalise")
                        }
                      >
                        <SquareCheck className="w-5 h-5" />
                      </a>
                      {/* )} */}
                    </div>

                    <div className="flex">
                      <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                        <span
                          className={`${
                            register.aprovado ? "bg-teal-500" : "bg-red-500 "
                          } flex w-2.5 h-2.5  rounded-full me-1.5 flex-shrink-0`}
                        ></span>
                        Aprovado:{" "}
                        <span className="px-1 inline-block ml-1">
                          {register.aprovado ? "Sim" : "Não"}
                        </span>
                      </span>
                      {/* {!register.aprovado && ( */}
                      <a
                        className="cursor-pointer"
                        onClick={() =>
                          handleStatusChange([register._id], "aprovado")
                        }
                      >
                        <SquareCheck className="w-5 h-5" />
                      </a>
                      {/* )} */}
                    </div>
                  </CardContent>
                  {/* <Button
                    onClick={() => handleStatusChange([register._id], "pago")}
                    className="bg-green-800 flex items-center"
                  >
                    <HandCoins className="w-4 h-4 mr-2" />
                    revert pay
                  </Button> */}
                  <CardFooter className="flex justify-center items-center mt-auto">
                    <motion.div
                      key={register.pago ? "paid" : "unpaid"}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-2 items-center"
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
                      {register.dataPgto && register.pago ? (
                        <div className="text-sm font-medium text-gray-900 dark:text-white text-center">
                          Data Pagamento:{" "}
                          {register.dataPgto
                            ? format(register.dataPgto, "dd/MM/yy")
                            : "-"}
                        </div>
                      ) : null}
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <Dialog open={isDialogJobOpen} onOpenChange={setIsDialogJobOpen}>
        <DialogContent>
          <DialogTitle>Confirmar arquivamento de lote</DialogTitle>
          <DialogDescription>
            Tem certeza de que deseja arquivar este lote?
            <b className="text-blue-600 block">
              O lote será arquivado e não será mais exibido nas solicitações.
            </b>
          </DialogDescription>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={() => {
                handleStatusChange([selectedJob ?? ""], "isArchived");
                setIsDialogJobOpen(false);
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Job;
