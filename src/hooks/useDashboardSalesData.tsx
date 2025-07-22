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

export function useDashboardSalesData() {
  const queryClient = useQueryClient();

  const today = new Date();
  const yesterday = subDays(today, 1);
  const todayKey = getDayKey(today);
  const yesterdayKey = getDayKey(yesterday);

  const todayQuery = useQuery<SummaryApiResponse>({
    queryKey: ["orders-summary", todayKey],
    queryFn: () => fetchSummary(todayKey),
  });

  const yesterdayQuery = useQuery<SummaryApiResponse>({
    queryKey: ["orders-summary", yesterdayKey],
    queryFn: () => fetchSummary(yesterdayKey),
  });

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(today),
    // start: subDays(today, 15),
    end: endOfToday(),
  });

  const dailyQueries = useQueries({
    queries: daysInMonth.map((day) => {
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
    dailyQueries.some((q) => q.isLoading);

  const dailyResults = dailyQueries
    .map((q) => q.data?.summary ?? [])
    .filter(Boolean);

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
    hourlySalesHoje: todayQuery.data?.hourlySales ?? [],
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
