import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import instance from "@/config/axios";
import { toast } from "sonner";

export type CatalogProduct = {
  _id: string;
  sku1: string;
  sku2: string;
  produto: string;
  medidas: string;
  largura: number;
  comprimento: number;
  altura: number;
  peso: number;
  pesoCubico: number;
};

type FetchParams = {
  searchTerm?: string;
  limit?: number;
};

export function useCatalogProductService({
  searchTerm,
  limit = 50,
}: FetchParams = {}) {
  const queryClient = useQueryClient();

  const catalogQuery = useInfiniteQuery({
    queryKey: ["catalog-products", searchTerm],
    queryFn: async ({ pageParam }) => {
      const res = await instance.get("/catalog", {
        params: {
          search: searchTerm || undefined,
          cursor: pageParam || undefined,
          limit,
        },
      });
      return res as any;
    },
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
    initialPageParam: 0,
  });

  const createProduct = useMutation({
    mutationFn: async (data: Omit<CatalogProduct, "_id" | "pesoCubico">) => {
      const res = await instance.post("/catalog", data);
      return res as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog-products"] });
      toast.success("Produto cadastrado com sucesso!");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error || "Erro ao cadastrar produto.";
      toast.error(msg);
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({
      id,
      update,
    }: {
      id: string;
      update: Omit<CatalogProduct, "_id" | "pesoCubico">;
    }) => {
      const res = await instance.put(`/catalog/${id}`, update);
      return res as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog-products"] });
      toast.success("Produto atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar produto.");
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      await instance.delete(`/catalog/${id}`);
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["catalog-products"] });
      const previousData = queryClient.getQueryData<any>(["catalog-products"]);

      if (previousData?.pages) {
        const newData = structuredClone(previousData);
        newData.pages = newData.pages.map((page: any) => ({
          ...page,
          data: page.data.filter((p: any) => p._id !== id),
        }));
        queryClient.setQueryData(["catalog-products"], newData);
      }

      return { previousData };
    },
    onError: (_err, _id, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["catalog-products"], context.previousData);
      }
      toast.error("Erro ao excluir produto.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog-products"] });
    },
  });

  const importProducts = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await instance.post("/catalog/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res as any;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["catalog-products"] });
      toast.success(
        `Importação concluída: ${data.imported} importados, ${data.skipped} ignorados.`
      );
    },
    onError: () => {
      toast.error("Erro ao importar produtos.");
    },
  });

  return {
    catalogQuery,
    createProduct,
    updateProduct,
    deleteProduct,
    importProducts,
  };
}
