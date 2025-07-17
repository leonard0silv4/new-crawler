"use client";

import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import instance from "@/config/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Pencil,
  Trash,
  Search,
  UserPlus,
  Settings,
  Users,
  Calendar,
  CircleUserRound,
} from "lucide-react";
import UserEditModal from "./UserEditModal";
import RoleManagerModal from "./RoleManagerModal";

const LIMIT = 20;

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [openRoleModal, setOpenRoleModal] = useState(false);
  const navigate = useNavigate();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery<any[]>({
    queryKey: ["users", search],
    queryFn: async ({ pageParam = 0 }) => {
      const params: any = { skip: pageParam, limit: LIMIT };
      if (search) params.search = search;
      const res = await instance.get("/users", { params });
      return res as any;
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < LIMIT ? undefined : allPages.length * LIMIT,
    initialPageParam: 0,
  });

  const users = data?.pages.flat() || [];
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "100px" }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage]);

  const deleteUser = async (userId: string) => {
    toast("Deseja realmente excluir este usuário?", {
      position: "top-center",
      action: {
        label: "Confirmar",
        onClick: async () => {
          await instance.delete(`/users/${userId}`);
          toast.success("Usuário excluído", {
            position: "top-right",
          });
          refetch();
        },
      },
    });
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      owner: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      faccionista:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      default: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    };
    return colors[role] || colors.default;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gerenciamento de Usuários
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie usuários e suas permissões
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setOpenRoleModal(true)}
                variant="outline"
                className="gap-2"
              >
                <Settings size={16} />
                Gerenciar esquema de permissões
              </Button>
              <Button
                onClick={() => navigate("/account-create")}
                className="gap-2"
              >
                <UserPlus size={16} />
                Adicionar usuário
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total de Usuários
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {users.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Novos este mês
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {
                        users.filter((u) => {
                          const created = new Date(u.createdAt);
                          const now = new Date();
                          return (
                            created.getMonth() === now.getMonth() &&
                            created.getFullYear() === now.getFullYear()
                          );
                        }).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Administradores
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {users.filter((u) => u.role === "owner").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <CircleUserRound className="h-5 w-5 text-indigo-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Faccionistas
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {users.filter((u) => u.role === "faccionista").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buscar usuário
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nome ou email"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user: any) => (
              <Card
                key={user._id}
                className="hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Usuário:{" "}
                          </span>
                          {user.username}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Esquema de permissões:
                        </span>
                        <Badge className={getRoleColor(user.role || "user")}>
                          {user.role || "-"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        Criado em:{" "}
                        {new Date(user.createdAt).toLocaleString("pt-BR")}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingUser(user)}
                        className="hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900"
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteUser(user._id)}
                        className="hover:bg-red-600"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div ref={loadMoreRef} className="text-center py-8">
          {isFetchingNextPage && (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Carregando mais...
              </span>
            </div>
          )}
          {!hasNextPage && users.length > 0 && (
            <p className="text-gray-500 dark:text-gray-400">
              Todos os usuários foram carregados
            </p>
          )}
        </div>

        {!isLoading && users.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum usuário encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {search
                  ? "Tente ajustar os filtros de busca"
                  : "Comece adicionando seu primeiro usuário"}
              </p>
              <Button onClick={() => navigate("/account-create")}>
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Usuário
              </Button>
            </CardContent>
          </Card>
        )}

        <UserEditModal
          user={editingUser}
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
          onUpdated={refetch}
        />

        <RoleManagerModal
          open={openRoleModal}
          onClose={() => setOpenRoleModal(false)}
        />
      </div>
    </div>
  );
}
