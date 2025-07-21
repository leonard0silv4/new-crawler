import { useQueries, useQuery } from "@tanstack/react-query";
import instance from "@/config/axios";
import {
  format,
  subDays,
  eachDayOfInterval,
  startOfMonth,
  endOfToday,
  getDaysInMonth,
} from "date-fns";
import { useEffect } from "react";

const getDayKey = (date: Date) => format(date, "yyyy-MM-dd");

type SummaryResponse = {
  source: string;
  totalOrders: number;
  totalProductsAmount: number;
  totalShipping: number;
  totalAmount: number;
}[];

const fetchSummary = async (day: string): Promise<SummaryResponse> => {
  try {
    const res = await instance.get(`/orders/summary?day=${day}`);
    return Array.isArray(res) ? res : [];
  } catch (error) {
    console.error("Erro ao buscar resumo de pedidos para", day, error);
    return [];
  }
};

export function useDashboardSalesData() {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const todayKey = getDayKey(today);
  const yesterdayKey = getDayKey(yesterday);

  const todayQuery = useQuery<SummaryResponse>({
    queryKey: ["orders-summary", todayKey],
    queryFn: () => fetchSummary(todayKey),
  });

  const yesterdayQuery = useQuery<SummaryResponse>({
    queryKey: ["orders-summary", yesterdayKey],
    queryFn: () => fetchSummary(yesterdayKey),
  });

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(today),
    end: endOfToday(),
  }).slice(-5);

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

  const dailyResults = dailyQueries.map((q) => q.data ?? []).filter(Boolean);

  function aggregateLojas(results: SummaryResponse[]) {
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

  useEffect(() => {
    console.log("Resumo de vendas hook", {
      hoje: todayQuery.data,
      ontem: yesterdayQuery.data,
      mediaDiaria,
      previsaoMes,
      isLoading,
    });
  }, [
    todayQuery.data,
    yesterdayQuery.data,
    mediaDiaria,
    previsaoMes,
    isLoading,
  ]);

  return {
    isLoading,
    hoje: todayQuery.data ?? [],
    ontem: yesterdayQuery.data ?? [],
    mediaDiaria,
    previsaoMes,
  };
}
