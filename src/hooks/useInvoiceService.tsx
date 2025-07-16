import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import instance from "@/config/axios";
import { toast } from "sonner";

type FetchParams = {
  searchTerm?: string;
  selectedDate?: Date;
  limit?: number;
};

export function useInvoicesService({
  searchTerm,
  selectedDate,
  limit = 20,
}: FetchParams = {}) {
  const queryClient = useQueryClient();

  const invoicesQuery = useInfiniteQuery({
    queryKey: ["invoices", searchTerm, selectedDate],
    queryFn: async ({ pageParam }) => {
      const params: any = { limit };

      if (pageParam) params.cursor = pageParam;
      if (searchTerm) params.search = searchTerm;
      if (selectedDate) {
        const start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);
        params.startDate = start.toISOString();
        params.endDate = end.toISOString();
      }

      const res = await instance.get("/nfe", { params });
      return res as any;
    },
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    initialPageParam: 0,
  });

  const saveInvoice = useMutation({
    mutationFn: async (nota: any) => {
      const res = await instance.post("/nfe", nota);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Nota fiscal salva com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao salvar a nota fiscal.");
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      await instance.delete(`/nfe/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("Nota fiscal excluída com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao excluir a nota fiscal.");
    },
  });

  const parseXml = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await instance.post("/nfe/parse", formData);
      return res.data;
    },
  });

  return {
    invoicesQuery,
    saveInvoice,
    deleteInvoice,
    parseXml,
  };
}
