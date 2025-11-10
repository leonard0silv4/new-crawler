"use client";

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
  Eraser,
  FileSpreadsheet,
  HandCoins,
  Loader,
  RefreshCcw,
  Search,
  SquareCheck,
  Star,
  Undo2,
  Filter,
  DollarSign,
  Package,
  TrendingUp,
  Printer,
  QrCode,
} from "lucide-react";
import { useLocation, useParams, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import instance from "@/config/axios";
import { usePermission } from "@/hooks/usePermissions";

const AddJob = lazy(() => import("./add"));
const Pix = lazy(() => import("../Pix"));
const StarRating = lazy(() => import("./jobRate"));

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useSse } from "@/hooks/useSse";
import type { DateRange } from "react-day-picker";
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
import { Badge as BadgeComponent } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { printLabel } from "./utils/printLabel";

const Job = () => {
  const { user } = useParams();
  const { openModal } = useModal();
  const location = useLocation();
  const { addOrUpdateNotify } = useNotifyContext();
  const { can } = usePermission();

  const [registers, setRegisters] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [faccionist, setFaccionist] = useState<any>(null);
  const [load, setLoad] = useState(true);
  const [paymentBySelection, setPaymentBySelection] = useState(false);
  const [jobsSelectedRolls, setJobsSelectedRolls] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  const handleCheckboxSelectedJobs = (id: number) => {
    setJobsSelectedRolls((prevSelected: number[]) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((item: number) => item !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const [filters, setFilters] = useState({
    showUnPaid: undefined as boolean | undefined,
    showRecebidoConferido: undefined as boolean | undefined,
    showLotePronto: undefined as boolean | undefined,
    showAprovado: undefined as boolean | undefined,
    showNotRecebido: undefined as boolean | undefined,
    range: undefined as DateRange | undefined,
  });

  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [isDialogJobOpen, setIsDialogJobOpen] = useState(false);
  const [lastLote, setLastLote] = useState("");
  const [loadingLastLote, setLoadingLastLote] = useState(false);
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
    if (!user) {
      return;
    }

    setLoadingLastLote(true);
    instance
      .get(`/factionistJob/${user}`)
      .then((response: any) => {
        setLastLote(response);
      })
      .catch((error: any) => {
        console.error("Erro ao buscar lastLote:", error);
      })
      .finally(() => {
        setLoadingLastLote(false);
      });
  }, [registers, user]);

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

  const searchTerms = searchTerm.split(" ").map((term) => term.toLowerCase());
  const filteredRegisters = registers?.filter((register) =>
    searchTerms.every((term) =>
      Object.values(register).some((value) =>
        value?.toString().toLowerCase().includes(term)
      )
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
      const matchesSearchTerm = searchTerms.every((term) =>
        ["qtd", "larg", "compr", "lote"].some((key) =>
          register[key]?.toString().toLowerCase().includes(term)
        )
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

  const sumTotM = (jobs: any) => {
    return jobs
      .filter((item: any) => !item.pago && item.recebido)
      .reduce((sum: number, item: any) => sum + item.totMetros, 0);
  };

  const totalNotPaid = useMemo(() => {
    const relevantJobs = paymentBySelection ? displayedRegisters : registers;
    return sumNotPayd(relevantJobs);
  }, [displayedRegisters, registers, paymentBySelection]);

  const totalMetros = useMemo(() => {
    const relevantJobs = paymentBySelection ? displayedRegisters : registers;
    return sumTotM(relevantJobs);
  }, [displayedRegisters, registers, paymentBySelection]);

  // Cálculos adicionais baseados nos registros
  const metrosAFazer = useMemo(() => {
    return registers
      .filter((item: any) => !item.lotePronto && !item.pago)
      .reduce((sum: number, item: any) => sum + (item.totMetros || 0), 0);
  }, [registers]);

  const metrosProntosNaoPagos = useMemo(() => {
    return registers
      .filter((item: any) => item.lotePronto && !item.pago)
      .reduce((sum: number, item: any) => sum + (item.totMetros || 0), 0);
  }, [registers]);

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
      advanceMoney: newState,
    }));
  };

  const addJob = (newJob: any) => {
    setRegisters((prev) => (prev.length ? [newJob, ...prev] : [newJob]));
  };

  const downloadPdf = async () => {
    const ids = displayedRegisters.map((r: any) => r._id);
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
    if (!can("edit_production")) {
      toast.error("Você não possui permissões de alteração", {
        position: "top-center",
      });
      return;
    }
    if (valueNow != ev.currentTarget.textContent) {
      instance
        .put(`/jobs/sizes`, { id, field, value: ev.currentTarget.textContent })
        .then(() => { });
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
    if (field == "emenda" && !can("edit_production")) {
      toast.error("Você não possui permissões de alteração", {
        position: "top-center",
      });
      return;
    }
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
                advanceMoney: response.advanceMoney,
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

  const handlePrintLabel = async (register: any) => {
    try {
      const idFaccionista = user || faccionist?._id || "";
      const idLote = register._id;
      // Usar a URL do frontend (window.location.origin)
      const frontendUrl = window.location.origin;
      const qrCodeUrl = `${frontendUrl}/confirm/${idFaccionista}/${idLote}`;
      console.log(qrCodeUrl);
      const faccionistaNome = `${faccionist?.username || ""} ${faccionist?.lastName || ""}`.trim() || "N/A";
      await printLabel({
        lote: register.lote || "N/A",
        faccionistaNome,
        quantidade: register.qtd ?? "N/A",
        largura: register.larg ?? "N/A",
        comprimento: register.compr ?? "N/A",
        emenda: register.emenda || false,
        totalMetros: register.totMetros ?? 0,
        qrCodeUrl,
      });
    } catch (error: any) {
      toast.error(error.message || "Erro ao imprimir etiqueta");
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
      <div className=" space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <NavLink
              className="hover:text-gray-600 transition-colors"
              to="/users"
            >
              <ArrowLeft className="w-5 h-5" />
            </NavLink>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gerenciamento de Trabalhos
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar trabalho..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {can("add_production") && (
              <Suspense fallback={<Button disabled>Carregando...</Button>}>
                <AddJob lastLote={lastLote} addJob={addJob} loadingLastLote={loadingLastLote} />
              </Suspense>
            )}
          </div>
        </div>

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-0 shadow-lg">
          <CardHeader>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <CardTitle className="text-xl capitalize text-gray-900 dark:text-white">
                  {faccionist?.username} {faccionist?.lastName}
                </CardTitle>
                {faccionist?.evaluationScore && (
                  <BadgeComponent variant="secondary" className="mt-2">
                    QoS: {faccionist.evaluationScore}
                  </BadgeComponent>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={paymentBySelection}
                  onCheckedChange={() =>
                    setPaymentBySelection(!paymentBySelection)
                  }
                  id="paymentBySelection"
                />
                <label
                  htmlFor="paymentBySelection"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Pagamento por seleção
                </label>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Package className="w-4 h-4 mr-2" />
                  Endereço
                </div>
                <p className="font-medium capitalize text-gray-900 dark:text-white">
                  {faccionist?.address}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Chave PIX
                </div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {faccionist?.pixKey}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Adiantamento
                </div>
                <div className="flex items-center">
                  <span className="text-sm mr-1">R$</span>
                  {production ? (
                    <span className="font-medium text-gray-900 dark:text-white">
                      {faccionist?.advanceMoney ?? 0}
                    </span>
                  ) : (
                    <span
                      className="font-medium text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 px-1 rounded"
                      onBlur={(e) => {
                        updateAdvancedMoney(e, "advanceMoney", faccionist._id);
                      }}
                      contentEditable
                      suppressContentEditableWarning={true}
                    >
                      {faccionist?.advanceMoney ?? 0}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <HandCoins className="w-4 h-4 mr-2" />
                  Total em Caixa
                </div>
                <p className="font-bold text-lg text-green-600 dark:text-green-400">
                  R$ {totalNotPaid.toFixed(2)}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center w-full">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <span className="text-xs text-gray-600 dark:text-gray-400 mb-1">Metros a pagar</span>
                    <strong className="text-xl text-blue-700 dark:text-blue-400 font-semibold">{totalMetros.toFixed(2)}m</strong>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                    <span className="text-xs text-gray-600 dark:text-gray-400 mb-1">Metros a fazer</span>
                    <strong className="text-xl text-orange-700 dark:text-orange-400 font-semibold">{metrosAFazer.toFixed(2)}m</strong>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                    <span className="text-xs text-gray-600 dark:text-gray-400 mb-1">Prontos não pagos</span>
                    <strong className="text-xl text-purple-700 dark:text-purple-400 font-semibold">{metrosProntosNaoPagos.toFixed(2)}m</strong>
                  </div>
                </div>

                {jobsSelectedRolls.length > 0 && (
                  <div className="flex items-center gap-2 ml-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>
                      Rolos selecionados:{" "}
                      <strong>
                        {(
                          displayedRegisters
                            .filter((lt) => jobsSelectedRolls.includes(lt.lote))
                            .reduce((total, item) => total + item.qtdRolo, 0) * 1.3
                        ).toFixed(2)}
                      </strong>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setJobsSelectedRolls([])}
                    >
                      <Eraser className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {registers.filter((item: any) => !item.pago).length > 0 &&
                !production && (
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
                    className="bg-green-600 hover:bg-green-700"
                    disabled={
                      paymentBySelection
                        ? displayedRegisters.filter((item: any) => !item.pago)
                          .length === 0
                        : registers.filter((item: any) => !item.pago).length ===
                        0
                    }
                  >
                    <HandCoins className="w-4 h-4 mr-2" />
                    Pagar Valor Total
                  </Button>
                )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtros</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? "Ocultar" : "Mostrar"} Filtros
              </Button>
            </div>
          </CardHeader>

          {showFilters && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trabalhos Pagos
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
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="undefined">Todos</SelectItem>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Recebidos/Conferidos
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
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="undefined">Todos</SelectItem>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Lote Pronto
                  </label>
                  <Select
                    onValueChange={(value) =>
                      updateFilter("showLotePronto", value)
                    }
                    value={
                      filters.showLotePronto === undefined
                        ? "undefined"
                        : filters.showLotePronto === true
                          ? "true"
                          : "false"
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="undefined">Todos</SelectItem>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trabalhos Recebidos
                  </label>
                  <Select
                    onValueChange={(value) =>
                      updateFilter("showNotRecebido", value)
                    }
                    value={
                      filters.showNotRecebido === undefined
                        ? "undefined"
                        : filters.showNotRecebido === true
                          ? "true"
                          : "false"
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="undefined">Todos</SelectItem>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trabalhos Aprovados
                  </label>
                  <Select
                    onValueChange={(value) =>
                      updateFilter("showAprovado", value)
                    }
                    value={
                      filters.showAprovado === undefined
                        ? "undefined"
                        : filters.showAprovado === true
                          ? "true"
                          : "false"
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="undefined">Todos</SelectItem>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Período
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!filters.range ? "text-muted-foreground" : ""
                          }`}
                      >
                        {filters.range ? (
                          filters.range.from && filters.range.to ? (
                            `${format(filters.range.from, "PP", {
                              locale: ptBR,
                            })} - ${format(filters.range.to, "PP", {
                              locale: ptBR,
                            })}`
                          ) : filters.range.from ? (
                            `${format(filters.range.from, "PP", {
                              locale: ptBR,
                            })} - ...`
                          ) : (
                            <span>Selecione período</span>
                          )
                        ) : (
                          <span>Selecione período</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={filters.range}
                        onSelect={(newRange) =>
                          setFilters((prevFilters) => ({
                            ...prevFilters,
                            range: newRange,
                          }))
                        }
                        locale={ptBR}
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={downloadPdf}
                    className="w-full bg-transparent"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Relatório PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
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
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          onClick={() =>
                            handleCheckboxSelectedJobs(register.lote)
                          }
                          checked={jobsSelectedRolls?.includes(register.lote)}
                        />
                        <span className="font-bold text-base">LOTE: {register.lote}</span>
                        {register.receivedCheckedByQrCode && (
                          <div className="flex items-center gap-1" title="Confirmado por QR Code">
                            <QrCode className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                      </div>

                      <div className="text-sm text-gray-500">
                        {format(register.data, "dd/MM/yy HH:mm")}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          onClick={() =>
                            updateRate(register._id, register.rateLote)
                          }
                        >
                          {register.rateLote ? (
                            <div className="relative inline-flex">
                              <Badge className="text-yellow-400 w-7 h-7" />
                              <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-900 dark:text-white font-bold z-10">
                                {register.rateLote}
                              </span>
                            </div>
                          ) : (
                            <Star className="text-yellow-400 w-5 h-5" />
                          )}
                        </button>

                        <button
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                          onClick={() => openDialog(register._id)}
                        >
                          <ArchiveRestore className="w-5 h-5" />
                        </button>

                        <button
                          className="text-green-500 hover:text-green-700 transition-colors"
                          onClick={() => handlePrintLabel(register)}
                          title="Imprimir etiqueta"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2 text-sm flex-1 py-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="whitespace-nowrap">
                          <span className="text-gray-500">Qtd:</span>
                          <span
                            className="ml-1 cursor-pointer hover:bg-gray-100 px-1 rounded font-medium"
                            onBlur={(e) =>
                              singleUpdate(e, "qtd", register._id, register.qtd)
                            }
                            contentEditable
                            suppressContentEditableWarning={true}
                          >
                            {register.qtd}
                          </span>
                        </div>

                        <div className="whitespace-nowrap">
                          <span className="text-gray-500">Larg:</span>
                          <span
                            className="ml-1 cursor-pointer hover:bg-gray-100 px-1 rounded font-medium"
                            onBlur={(e) =>
                              singleUpdate(e, "larg", register._id, register.larg)
                            }
                            contentEditable
                            suppressContentEditableWarning={true}
                          >
                            {register.larg}
                          </span>
                        </div>

                        <div className="whitespace-nowrap">
                          <span className="text-gray-500">Compr:</span>
                          <span
                            className="ml-1 cursor-pointer hover:bg-gray-100 px-1 rounded font-medium"
                            onBlur={(e) =>
                              singleUpdate(
                                e,
                                "compr",
                                register._id,
                                register.compr
                              )
                            }
                            contentEditable
                            suppressContentEditableWarning={true}
                          >
                            {register.compr}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-gray-500">Emenda:</span>
                        <span className="font-medium">
                          {register.emenda ? "Sim" : "Não"}
                        </span>
                        <button
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() =>
                            handleStatusChange([register._id], "emenda")
                          }
                        >
                          <RefreshCcw className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <Separator className="my-1.5" />

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Total Metros:</span>
                        <span className="font-medium">
                          {register.totMetros}m
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">Qtd Rolos:</span>
                        <span className="font-medium">{register.qtdRolo}</span>
                      </div>

                      <div className="flex items-center gap-1 col-span-2">
                        <span className="text-gray-500">Orçamento:</span>
                        <span className="font-bold text-green-600">
                          R$ {register.orcamento.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Separator className="my-1.5" />

                    <div className="space-y-1.5">
                      {[
                        {
                          key: "recebidoConferido",
                          label: "Recebido/Conferido",
                          status: register.recebidoConferido,
                          date: register.dataRecebidoConferido,
                        },
                        {
                          key: "lotePronto",
                          label: "Lote Pronto",
                          status: register.lotePronto,
                          date: register.dataLotePronto,
                        },
                        {
                          key: "recebido",
                          label: "Recebido",
                          status: register.recebido,
                          date: register.dataRecebido,
                        },
                        {
                          key: "emAnalise",
                          label: "Em Análise",
                          status: register.emAnalise,
                          date: null,
                        },
                        {
                          key: "aprovado",
                          label: "Aprovado",
                          status: register.aprovado,
                          date: register.dataAprovado,
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-2 h-2 rounded-full ${item.status
                                ? item.key === "emAnalise"
                                  ? "bg-blue-500"
                                  : "bg-green-500"
                                : "bg-red-500"
                                }`}
                            />
                            <span className="text-gray-600">{item.label}:</span>
                            <span>
                              {item.status
                                ? item.date
                                  ? format(
                                    new Date(item.date),
                                    "dd/MM/yy HH:mm"
                                  )
                                  : "Sim"
                                : "Não"}
                            </span>
                          </div>

                          <button
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            onClick={() =>
                              handleStatusChange(
                                [register._id],
                                item.key as any,
                                item.key === "aprovado"
                                  ? register.aprovado
                                  : undefined
                              )
                            }
                          >
                            {item.status ? (
                              <Undo2 className="w-3 h-3" />
                            ) : (
                              <SquareCheck className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2 pb-3">
                    <motion.div
                      key={register.pago ? "paid" : "unpaid"}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="w-full"
                    >
                      {register.pago ? (
                        <div className="flex items-center justify-center gap-2 text-sm bg-green-50 dark:bg-green-950/30 p-2.5 rounded border border-green-200 dark:border-green-800">
                          <CircleCheck className="w-5 h-5 text-green-500" />
                          <div className="flex flex-col">
                            {register.dataPgto && (
                              <span className="text-gray-600 dark:text-gray-400">
                                Pago: {format(new Date(register.dataPgto), "dd/MM/yy")}
                              </span>
                            )}
                            {register.advancedMoneyPayment &&
                              register.advancedMoneyPayment !== 0 && (
                                <span className="text-red-600">
                                  Desc: R$ {register.advancedMoneyPayment.toFixed(2)}
                                </span>
                              )}
                          </div>
                        </div>
                      ) : (
                        <>
                          {!register.pago &&
                            register.recebido &&
                            !production && (
                              <Button
                                onClick={() =>
                                  handleOpenPixModal(
                                    faccionist?.pixKey,
                                    register.orcamento,
                                    `${faccionist?.username} ${faccionist?.lastName}`,
                                    [register._id]
                                  )
                                }
                                className="w-full bg-green-600 hover:bg-green-700"
                                size="sm"
                              >
                                <HandCoins className="w-4 h-4 mr-2" />
                                Pagar Lote
                              </Button>
                            )}
                        </>
                      )}
                    </motion.div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {displayedRegisters?.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum trabalho encontrado
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Tente ajustar os filtros ou adicionar novos trabalhos.
            </p>
          </div>
        )}
      </div>

      <Dialog open={isDialogJobOpen} onOpenChange={setIsDialogJobOpen}>
        <DialogContent>
          <DialogTitle>Confirmar arquivamento de lote</DialogTitle>
          <DialogDescription>
            Tem certeza de que deseja arquivar este lote?
            <strong className="text-blue-600 block mt-2">
              O lote será arquivado e não será mais exibido nas solicitações.
            </strong>
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
