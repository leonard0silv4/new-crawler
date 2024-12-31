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
  Badge,
  CalendarIcon,
  CircleCheck,
  FileSpreadsheet,
  HandCoins,
  Loader,
  RefreshCcw,
  Search,
  SquareCheck,
  Star,
  Undo2,
} from "lucide-react";
import { useLocation, useParams, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

import instance from "@/config/axios";
const AddJob = lazy(() => import("./add"));
const Pix = lazy(() => import("../Pix"));
const StarRating = lazy(() => import("./jobRate"));

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";

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

  const [filters, setFilters] = useState({
    showUnPaid: undefined as boolean | undefined,
    showRecebidoConferido: undefined as boolean | undefined,
    showLotePronto: undefined as boolean | undefined,
    showAprovado: undefined as boolean | undefined,
    showNotRecebido: undefined as boolean | undefined,
    range: undefined as DateRange | undefined,
  });
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [isDialogJobOpen, setIsDialogJobOpen] = useState(false);

  const [lastLote, setLastLote] = useState("");

  const [production] = useState(
    !!(window.localStorage !== undefined &&
    localStorage.getItem("productionBrowser") == "yes"
      ? true
      : false)
  );

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

  const filteredRegisters = registers?.filter((register) =>
    Object.values(register).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const updateFilter = (filterName: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]:
        value === "undefined" ? undefined : value === "true" ? true : false,
    }));
  };

  const applyFilters = (registers: any[]) => {
    return registers.filter((register) => {
      const matchesSearchTerm = Object.values(register).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesUnPaid =
        filters.showUnPaid !== undefined
          ? register.pago === filters.showUnPaid
          : true;

      const matchesRecebidoConferido =
        filters.showRecebidoConferido !== undefined
          ? register.recebidoConferido === filters.showRecebidoConferido
          : true;

      const matchesLotePronto =
        filters.showLotePronto !== undefined
          ? register.lotePronto === filters.showLotePronto
          : true;

      const matchesAprovado =
        filters.showAprovado !== undefined
          ? register.aprovado === filters.showAprovado
          : true;

      const matchesNotRecebido =
        filters.showNotRecebido !== undefined
          ? register.recebido === filters.showNotRecebido
          : true;

      const matchesDateRange =
        filters.range && filters.range.from && filters.range.to
          ? isWithinInterval(new Date(register.data), {
              start: startOfDay(filters.range.from),
              end: endOfDay(filters.range.to),
            })
          : true;

      return (
        matchesSearchTerm &&
        matchesUnPaid &&
        matchesRecebidoConferido &&
        matchesLotePronto &&
        matchesAprovado &&
        matchesNotRecebido &&
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
    jobIds: string[],
    advancedMoney?: number,
    faccionistId?: string
  ) => {
    openModal(
      <Suspense fallback={<>Carregando...</>}>
        <Pix
          pixKey={key}
          price={price}
          username={username}
          advancedMoney={advancedMoney ?? 0}
          faccionistId={faccionistId}
          onMarkAsPaid={() => handleStatusChange(jobIds, "pago")}
          updateAdvancedMoney={(data) => updateAdvancedMoneyPix(data)}
          updateValueAdvancedJob={(data) => updateValueAdvancedJob(data)}
          jobIds={jobIds}
        />
      </Suspense>
    );
  };

  const updateValueAdvancedJob = (jobs: any) => {
    setRegisters((prevRegisters) =>
      prevRegisters.map((register) => {
        const matchingJob = jobs.find((job: any) => job._id === register._id);
        if (matchingJob) {
          return {
            ...register,
            advancedMoneyPayment: matchingJob.advancedMoneyPayment,
          };
        }
        return register;
      })
    );
  };

  const updateAdvancedMoneyPix = (newState: number) => {
    setFaccionist((prevState: any) => ({
      ...prevState,
      advanceMoney: newState, // Atualize apenas o campo necessário
    }));
  };

  const addJob = (newJob: any) => {
    setRegisters((prev) => (prev.length ? [newJob, ...prev] : [newJob]));
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
    id: string,
    valueNow?: any
  ) => {
    if (valueNow != ev.currentTarget.textContent) {
      instance
        .put(`/jobs/sizes`, { id, field, value: ev.currentTarget.textContent })
        .then(() => {});
    }
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
      | "isArchived",
    acValue?: boolean
  ) => {
    instance.put(`jobs`, { ids, field }).then(() => {
      if (field === "isArchived") {
        setRegisters((prevRegisters) =>
          prevRegisters.filter((register) => !ids.includes(register._id))
        );
      }

      if (field === "aprovado" && !acValue) {
        openModal(
          <Suspense fallback={<>Carregando...</>}>
            <StarRating ids={ids} />
          </Suspense>
        );
      }
    });
  };

  const updateRate = (id: string, rateLote: number) => {
    openModal(
      <Suspense fallback={<>Carregando...</>}>
        <StarRating rateAc={rateLote} ids={id} />
      </Suspense>
    );
  };

  const updateAdvancedMoney = async (
    ev: any,
    field: "advanceMoney",
    id: string
  ) => {
    if (!production) {
      if (ev.currentTarget.textContent != faccionist?.advanceMoney) {
        try {
          instance
            .put(`factionist/${id}`, {
              [field]: ev.currentTarget.textContent,
            })
            .then((response: any) => {
              setFaccionist((prevState: any) => ({
                ...prevState,
                advanceMoney: response.advanceMoney, // Atualize apenas o campo necessário
              }));
            });
        } catch (error) {
          toast.error("Erro ao atualizar usuário", {
            position: "top-center",
          });
        }
      }
    }
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
          <Card className="relative block w-full  bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 ">
            <CardHeader>
              <CardTitle className="capitalize">
                {faccionist?.username} {faccionist?.lastName}{" "}
                <p className="mt-2 font-medium text-md">
                  {" "}
                  {faccionist?.evaluationScore
                    ? "QoS : " + faccionist?.evaluationScore
                    : ""}
                </p>
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
                Adiantamento
                <b className="ml-1">R$</b>
                {production ? (
                  <b className="px-1 inline-block ">
                    {faccionist?.advanceMoney ?? 0}
                  </b>
                ) : (
                  <b
                    className="px-1 inline-block "
                    onBlur={(e) => {
                      updateAdvancedMoney(e, "advanceMoney", faccionist._id);
                    }}
                    contentEditable
                    suppressContentEditableWarning={true}
                  >
                    {faccionist?.advanceMoney ?? 0}
                  </b>
                )}
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
                      relevantRegisters.map((item: any) => item._id),
                      faccionist.advanceMoney,
                      faccionist._id
                    );
                  }}
                  className={`${production && "hidden"} mt-2 bg-green-800`}
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
          <div className="flex gap-3 flex-col text-sm font-medium text-gray-900 p-3">
            <label
              htmlFor="filtroAprovado"
              className="text-sm font-medium text-gray-700"
            >
              Trabalhos pagos
            </label>
            <Select
              onValueChange={(value) => updateFilter("showUnPaid", value)}
              value={
                filters.showUnPaid === undefined
                  ? "undefined"
                  : filters.showUnPaid === true
                  ? "true"
                  : "false"
              }
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="undefined">Selecione</SelectItem>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 flex-col text-sm font-medium text-gray-900 p-3">
            <label
              htmlFor="filtroAprovado"
              className="text-sm font-medium text-gray-700"
            >
              Recebidos/conferidos
            </label>

            <Select
              onValueChange={(value) =>
                updateFilter("showRecebidoConferido", value)
              }
              value={
                filters.showRecebidoConferido === undefined
                  ? "undefined"
                  : filters.showRecebidoConferido === true
                  ? "true"
                  : "false"
              }
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Selectione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="undefined">Selecione</SelectItem>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 flex-col text-sm font-medium text-gray-900 p-3">
            <label
              htmlFor="filtroAprovado"
              className="text-sm font-medium text-gray-700"
            >
              Pronto
            </label>
            <Select
              onValueChange={(value) => updateFilter("showLotePronto", value)}
              value={
                filters.showLotePronto === undefined
                  ? "undefined"
                  : filters.showLotePronto === true
                  ? "true"
                  : "false"
              }
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="undefined">Selecione</SelectItem>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 flex-col text-sm font-medium text-gray-900 p-3">
            <label
              htmlFor="filtroAprovado"
              className="text-sm font-medium text-gray-700"
            >
              Trabalhos recebidos
            </label>
            <Select
              onValueChange={(value) => updateFilter("showNotRecebido", value)}
              value={
                filters.showNotRecebido === undefined
                  ? "undefined"
                  : filters.showNotRecebido === true
                  ? "true"
                  : "false"
              }
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="undefined">Selecione</SelectItem>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3 flex-col text-sm font-medium text-gray-900 p-3">
            <label
              htmlFor="filtroAprovado"
              className="text-sm font-medium text-gray-700"
            >
              Trabalhos aprovados
            </label>
            <Select
              onValueChange={(value) => updateFilter("showAprovado", value)}
              value={
                filters.showAprovado === undefined
                  ? "undefined"
                  : filters.showAprovado === true
                  ? "true"
                  : "false"
              }
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="undefined">Selecione</SelectItem>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center text-sm font-medium text-gray-900 p-3 mt-8">
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
          <div className="flex items-center text-sm font-medium text-gray-900 p-3 mt-8">
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
                        <ArchiveRestore className="w-5 h-5 float-right text-blue-400" />
                      </a>
                      <a
                        className="cursor-pointer"
                        onClick={() =>
                          updateRate(register._id, register.rateLote)
                        }
                      >
                        {register.rateLote ? (
                          <span className="float-right mr-3 relative ">
                            <Badge
                              className={`text-yellow-400 w-8 h-8 float-right `}
                            />
                            <span className="text-[10px] absolute top-0 flex-1 right-0 w-full h-full text-center flex pt-3 justify-center">
                              {register.rateLote}
                            </span>
                          </span>
                        ) : (
                          <span className="float-right mr-3 relative ">
                            <Star
                              className={`text-yellow-400 w-5 h-5 float-right `}
                            />
                          </span>
                        )}
                      </a>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {/* <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                      Qualidade:{" "}
                      <span className={` px-1 inline-block ml-1`}>
                        {register.rateLote ? register.rateLote : "Não avaliado"}
                      </span>
                    </div> */}

                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                      Data:{" "}
                      <span className="px-1 inline-block ml-1">
                        {format(register.data, "dd/MM/yy HH:mm")}
                      </span>
                    </div>

                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                      Quantidade:{" "}
                      <span
                        className="px-1 inline-block ml-1"
                        onBlur={(e) => {
                          singleUpdate(e, "qtd", register._id, register.qtd);
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
                          singleUpdate(e, "larg", register._id, register.larg);
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
                          singleUpdate(
                            e,
                            "compr",
                            register._id,
                            register.compr
                          );
                        }}
                        contentEditable
                        suppressContentEditableWarning={true}
                      >
                        {" "}
                        {register.compr}{" "}
                      </span>
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
                      Emenda:{" "}
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
                      Quantidade de rolos:{" "}
                      <span className="px-1 inline-block ml-1">
                        {register.qtdRolo}
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
                            className="cursor-pointer "
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
                            className="cursor-pointer"
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
                          {register.recebido
                            ? register.dataRecebido
                              ? format(
                                  register.dataRecebido,
                                  "dd/MM/yyyy HH:mm"
                                )
                              : "Sim"
                            : "Não"}{" "}
                        </span>
                      </span>

                      <a
                        className="cursor-pointer"
                        onClick={() =>
                          handleStatusChange([register._id], "recebido")
                        }
                      >
                        {register.recebido ? (
                          <Undo2 className="w-4 h-4" />
                        ) : (
                          <SquareCheck className="w-5 h-5" />
                        )}
                      </a>
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
                        {register.emAnalise ? (
                          <Undo2 className="w-4 h-4" />
                        ) : (
                          <SquareCheck className="w-5 h-5" />
                        )}
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
                          {register.aprovado
                            ? register.dataAprovado
                              ? format(
                                  register.dataAprovado,
                                  "dd/MM/yyyy HH:mm"
                                )
                              : "Sim"
                            : "Não"}{" "}
                        </span>
                      </span>
                      {/* {!register.aprovado && ( */}
                      <a
                        className="cursor-pointer"
                        onClick={() =>
                          handleStatusChange(
                            [register._id],
                            "aprovado",
                            register.aprovado
                          )
                        }
                      >
                        {register.aprovado ? (
                          <Undo2 className="w-4 h-4" />
                        ) : (
                          <SquareCheck className="w-5 h-5" />
                        )}
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
                        <>
                          {!register.pago &&
                          register.recebido &&
                          !production ? (
                            <Button
                              onClick={() =>
                                handleOpenPixModal(
                                  faccionist?.pixKey,
                                  register.orcamento,
                                  `${faccionist?.username} ${faccionist?.lastName}`,
                                  [register._id]
                                )
                              }
                              className={`${
                                production ? "hidden" : ""
                              } bg-green-800 flex items-center`}
                            >
                              <HandCoins className="w-4 h-4 mr-2" />
                              Pagar este lote
                            </Button>
                          ) : (
                            <></>
                          )}
                        </>
                      )}
                      {register.dataPgto && register.pago ? (
                        <div className="text-sm font-medium text-gray-900 dark:text-white text-center">
                          Data Pagamento:{" "}
                          {register.dataPgto
                            ? format(register.dataPgto, "dd/MM/yy")
                            : "-"}
                        </div>
                      ) : null}
                      {register.advancedMoneyPayment &&
                      register.advancedMoneyPayment != 0 ? (
                        <p className="text-red-700 text-sm my-2">
                          Desconto de adiantamento R$
                          {register.advancedMoneyPayment.toFixed(2)}
                        </p>
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
