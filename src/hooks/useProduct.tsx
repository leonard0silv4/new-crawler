import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import instance from "@/config/axios";
import { toast } from "sonner";

export type Product = {
  _id: string;
  nome: string;
  sku: string;
  descricao: string;
  preco: number;
};

type FetchParams = {
  searchTerm?: string;
  limit?: number;
};

export function useProductsService({
  searchTerm,
  limit = 20,
}: FetchParams = {}) {
  const queryClient = useQueryClient();

  const productsQuery = useInfiniteQuery({
    queryKey: ["products", searchTerm],
    queryFn: async ({ pageParam }) => {
      const res = await instance.get("/products", {
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
    mutationFn: async (data: Omit<Product, "_id">) => {
      const res = await instance.post("/products", data);
      return res as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto criado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao criar produto.");
    },
  });

  const deleteAllProducts = useMutation({
    mutationFn: async () => {
      const res = await instance.delete("/products");
      return res as any;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["products"] });

      const previousData = queryClient.getQueryData<any>(["products"]);

      queryClient.setQueryData(["products"], {
        pages: [],
        pageParams: [],
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["products"], context.previousData);
      }
      toast.error("Erro ao deletar todos os produtos.");
    },
    onSuccess: () => {
      toast.success("Todos os produtos foram deletados com sucesso!");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({
      id,
      update,
    }: {
      id: string;
      update: Omit<Product, "_id">;
    }) => {
      const res = await instance.put(`/products/${id}`, update);
      return res as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produto atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar produto.");
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      console.log("Deletando:", id);

      const response = await instance.delete(`/products/${id}`);
      console.log("Resposta:", response);
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["products"] });

      const previousData = queryClient.getQueryData<any>(["products"]);

      if (!previousData || !previousData.pages) {
        return { previousData: null };
      }

      const newData = structuredClone(previousData);
      newData.pages = newData.pages.map((page: any) => ({
        ...page,
        data: page.data.filter((p: any) => p._id !== id),
      }));

      queryClient.setQueryData(["products"], newData);

      return { previousData };
    },
    onError: (err, id, context) => {
      console.error("Erro ao excluir produto:", err, id);
      queryClient.setQueryData(["products"], context?.previousData);
      toast.error("Erro ao excluir produto.");
    },
    onSettled: () => {},
  });

  const importProducts = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await instance.post("/products/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Importação concluída com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao importar produtos.");
    },
  });

  return {
    productsQuery,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteAllProducts,
    importProducts,
  };
}
