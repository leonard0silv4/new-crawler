import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import instance from "@/config/axios";
import {
  format,
  subDays,
  eachDayOfInterval,
  startOfMonth,
  endOfToday,
  getDaysInMonth,
} from "date-fns";

const getDayKey = (date: Date) => format(date, "yyyy-MM-dd");

type HourlySalesEntry = {
  hour: string;
  totalAmount: number;
};

type SummaryItem = {
  source: string;
  totalOrders: number;
  totalProductsAmount: number;
  totalShipping: number;
  totalAmount: number;
};

type SummaryApiResponse = {
  summary: SummaryItem[];
  hourlySales: HourlySalesEntry[];
};

const fetchSummary = async (day: string): Promise<SummaryApiResponse> => {
  try {
    const res = await instance.get(`/orders/summary?day=${day}`);
    return res as any;
  } catch (error) {
    console.error("Erro ao buscar resumo de pedidos para", day, error);
    return { summary: [], hourlySales: [] };
  }
};

const fetchMonthlySummary = async (
  month: string
): Promise<SummaryApiResponse> => {
  try {
    const res = await instance.get(`/orders/monthly-summary?month=${month}`);
    return res as any;
  } catch (error) {
    console.error("Erro ao buscar resumo mensal para", month, error);
    return { summary: [], hourlySales: [] };
  }
};

export function useDashboardSalesData() {
  const queryClient = useQueryClient();

  const today = new Date();
  const yesterday = subDays(today, 1);
  const yesterday2 = subDays(today, 2);
  const todayKey = getDayKey(today);
  const yesterdayKey = getDayKey(yesterday);
  const yesterday2Key = getDayKey(yesterday2);

  const lastMonthDate = subDays(startOfMonth(today), 1);
  const lastMonthKey = format(lastMonthDate, "yyyy-MM");

  const lastMonthQuery = useQuery<SummaryApiResponse>({
    queryKey: ["orders-monthly-summary", lastMonthKey],
    queryFn: () => fetchMonthlySummary(lastMonthKey),
  });

  const todayQuery = useQuery<SummaryApiResponse>({
    queryKey: ["orders-summary", todayKey],
    queryFn: () => fetchSummary(todayKey),
  });

  const yesterdayQuery = useQuery<SummaryApiResponse>({
    queryKey: ["orders-summary", yesterdayKey],
    queryFn: () => fetchSummary(yesterdayKey),
  });

  const yesterday2Query = useQuery<SummaryApiResponse>({
    queryKey: ["orders-summary", yesterday2Key],
    queryFn: () => fetchSummary(yesterday2Key),
  });

  const startDateForDaily = (() => {
    const startOfCurrentMonth = startOfMonth(today);
    const sixDaysAgo = subDays(today, 6);
    return sixDaysAgo < startOfCurrentMonth ? startOfCurrentMonth : sixDaysAgo;
  })();

  const daysInMonth = eachDayOfInterval({
    start: startDateForDaily,
    end: endOfToday(),
  });

  const dailyQueries = useQueries({
    queries: daysInMonth.map((day: any) => {
      const key = getDayKey(day);
      return {
        queryKey: ["orders-summary", key],
        queryFn: () => fetchSummary(key),
        staleTime: 1000 * 60 * 10,
      };
    }),
  });

  const isLoading =
    todayQuery.isLoading ||
    yesterdayQuery.isLoading ||
    yesterday2Query.isLoading ||
    dailyQueries.some((q) => q.isLoading) ||
    lastMonthQuery.isLoading;

  const dailyResults = dailyQueries
    .map((q, index) => {
      const date = daysInMonth[index];
      const key = getDayKey(date);
      // if (key === todayKey) return null;
      return q.data?.summary ?? [];
    })
    .filter((item): item is SummaryItem[] => Boolean(item));

  function aggregateLojas(results: SummaryItem[][]) {
    const map: Record<string, { totalAmount: number; count: number }> = {};
    for (const result of results) {
      for (const loja of result) {
        if (!map[loja.source]) {
          map[loja.source] = { totalAmount: 0, count: 0 };
        }
        map[loja.source].totalAmount += loja.totalAmount;
        map[loja.source].count += 1;
      }
    }
    return map;
  }

  const lojaMap = aggregateLojas(dailyResults);

  const mediaDiaria = Object.entries(lojaMap).map(([source, value]) => ({
    source,
    totalAmount: Number((value.totalAmount / value.count).toFixed(2)),
  }));

  const diasNoMes = getDaysInMonth(today);
  const previsaoMes = mediaDiaria.map((loja) => ({
    ...loja,
    totalAmount: Number((loja.totalAmount * diasNoMes).toFixed(2)),
  }));

  return {
    isLoading,
    hoje: todayQuery.data?.summary ?? [],
    ontem: yesterdayQuery.data?.summary ?? [],
    ontem2: yesterday2Query.data?.summary ?? [],
    hourlySalesHoje: todayQuery.data?.hourlySales ?? [],
    lastMonth: lastMonthQuery.data?.summary ?? [],
    mediaDiaria,
    previsaoMes,
    refetchAll: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "orders-summary",
      });
      await queryClient.refetchQueries({
        predicate: (query) => query.queryKey[0] === "orders-summary",
      });
    },
  };
}
