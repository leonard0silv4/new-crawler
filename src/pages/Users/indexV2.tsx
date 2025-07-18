"use client";

import { lazy, useEffect, useState, Suspense, useContext } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  Trash2,
  Edit3,
  Users,
  Plus,
  Briefcase,
  AlertTriangle,
  Grid3X3,
  List,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AddFaccionista = lazy(() => import("./add"));
const EditFaccionista = lazy(() => import("./edit"));
import CalculateJobs from "./calculateJobs";
import { AuthContext } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import instance from "@/config/axios";
import { useSse } from "@/hooks/useSse";

interface Faccionista {
  _id: string;
  username: string;
  lastName?: string;
  jobs: any[];
}

const FaccionistaCard = ({
  register,
  onEdit,
  onDelete,
  onViewJobs,
  hasPermissions,
}: {
  register: Faccionista;
  onEdit: (user: Faccionista) => void;
  onDelete: (id: string) => void;
  onViewJobs: (id: string) => void;
  hasPermissions: boolean;
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group transition-all duration-200 border-0 shadow-sm hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {register.username.toUpperCase()}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {register?.lastName?.toUpperCase() || "Sem sobrenome"}
              </CardDescription>
            </div>
            {hasPermissions && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(register)}
                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(register._id)}
                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-gray-500" />
            <Badge variant="secondary" className="text-xs">
              {register.jobs?.length || 0} trabalhos
            </Badge>
          </div>

          <Suspense fallback={"carregando"}>
            <CalculateJobs jobs={register.jobs} />
          </Suspense>
        </CardContent>

        <CardFooter className="pt-4 gap-2">
          <Button
            onClick={() => onViewJobs(register._id)}
            variant="outline"
            className="flex-1 h-9"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Fila de trabalho
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i} className="border-0 shadow-sm">
        <CardHeader></CardHeader>
        <CardContent></CardContent>
        <CardFooter></CardFooter>
      </Card>
    ))}
  </div>
);

const EmptyState = ({ onAdd }: { onAdd?: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-4"
  >
    <div className="rounded-full bg-gray-100 p-6 mb-6">
      <Users className="h-12 w-12 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">
      Nenhum faccionista encontrado
    </h3>
    <p className="text-gray-600 text-center mb-6 max-w-md">
      Comece adicionando seu primeiro faccionista para gerenciar trabalhos e
      acompanhar o progresso.
    </p>
    {onAdd && (
      <Button onClick={onAdd} className="gap-2">
        <Plus className="h-4 w-4" />
        Adicionar Faccionista
      </Button>
    )}
  </motion.div>
);

export default function Faccionistas() {
  const [registers, setRegisters] = useState<Faccionista[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserUpdate, setSelectedUserUpdate] =
    useState<Faccionista | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const navigate = useNavigate();
  const { toast } = useToast();
  const { permissions }: any = useContext(AuthContext);

  const hasManagePermissions = permissions?.includes("manage_faccionistas");

  useEffect(() => {
    const loadFaccionistas = async () => {
      try {
        setLoading(true);
        const response: any = await instance.get("factionist");
        setRegisters(response || []);
      } catch (error) {
        console.error("Erro ao carregar faccionistas:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os faccionistas.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadFaccionistas();
  }, [toast]);

  useSse({
    eventName: "jobUpdated",
    onEvent: (updatedJob: any) => {
      setRegisters((prevRegisters) =>
        prevRegisters.map((register) => {
          const jobIndex = register.jobs.findIndex(
            (job: any) => job._id === updatedJob.job._id
          );

          if (jobIndex !== -1) {
            return {
              ...register,
              jobs: register.jobs.map((job: any, index: number) =>
                index === jobIndex ? { ...job, ...updatedJob.job } : job
              ),
            };
          }

          if (
            !register.jobs.length &&
            register._id === updatedJob.job.faccionistaId
          ) {
            return {
              ...register,
              jobs: [updatedJob.job],
            };
          }

          return register;
        })
      );
    },
  });

  const addUserState = (novoItem: Faccionista) => {
    setRegisters((prevRegister) => [...prevRegister, novoItem]);
    toast({
      title: "Sucesso",
      description: "Faccionista adicionado com sucesso!",
    });
  };

  const updateUserState = (updatedUser: Faccionista) => {
    setRegisters((prevRegisters) =>
      prevRegisters.map((user) =>
        user._id === updatedUser._id
          ? { ...user, ...updatedUser, jobs: user.jobs }
          : user
      )
    );
    toast({
      title: "Sucesso",
      description: "Faccionista atualizado com sucesso!",
    });
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await instance.delete(`factionist/${selectedUser}`);
      setRegisters((prevRegisters) =>
        prevRegisters.filter((user) => user._id !== selectedUser)
      );
      toast({
        title: "Sucesso",
        description: "Faccionista excluído com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o faccionista.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setSelectedUser(id);
    setIsDeleteDialogOpen(true);
  };

  const openEditDialog = (user: Faccionista) => {
    setSelectedUserUpdate(user);
  };

  const closeEditDialog = () => {
    setSelectedUserUpdate(null);
  };

  const filteredRegisters = registers.filter(
    (register) =>
      register?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      register?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center"></div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6" />
            Faccionistas
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus faccionistas e acompanhe o progresso dos trabalhos
          </p>
        </div>

        {hasManagePermissions && (
          <Suspense fallback={"carregando"}>
            <AddFaccionista addUserState={addUserState} />
          </Suspense>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nome ou sobrenome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {filteredRegisters.length} faccionistas
          </Badge>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filteredRegisters.length === 0 ? (
          <EmptyState
            onAdd={
              hasManagePermissions
                ? () => {
                    /* open add dialog */
                  }
                : undefined
            }
          />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {filteredRegisters.map((register) => (
              <FaccionistaCard
                key={register._id}
                register={register}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
                onViewJobs={(id) => navigate(`/job/${id}`)}
                hasPermissions={hasManagePermissions}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedUserUpdate && (
        <Suspense fallback={null}>
          <EditFaccionista
            user={selectedUserUpdate}
            onClose={closeEditDialog}
            updateUserState={updateUserState}
          />
        </Suspense>
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Tem certeza de que deseja excluir este faccionista?</p>
              <p className="text-red-600 font-medium">
                ⚠️ Todos os trabalhos do usuário serão excluídos
                permanentemente.
              </p>
              <p className="text-sm text-gray-600">
                Esta ação não pode ser desfeita.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
