import { lazy, useEffect, useState } from "react";

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
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { Loader, Search, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";

import instance from "@/config/axios";
import CalculateJobs from "./calculateJobs";

const AddFaccionista = lazy(() => import("./add"));
const EditFaccionista = lazy(() => import("./edit"));

const Users = () => {
  const [registers, setRegisters] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [load, setLoad] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const [selectedUserUpdate, setSelectedUserUpdate] = useState<string | null>(
    null
  );

  const updateUserState = (updatedUser: any) => {
    setRegisters((prevRegisters) =>
      prevRegisters.map((user) =>
        user._id === updatedUser._id
          ? {
              ...user,
              ...updatedUser,
              jobs: user.jobs,
            }
          : user
      )
    );
  };

  const openEditDialog = (user: any) => {
    setSelectedUserUpdate(user);
  };

  const closeEditDialog = () => {
    setSelectedUserUpdate(null);
  };

  useEffect(() => {
    instance
      .get("factionist")
      .then((response: any) => {
        const updatedRegisters = response.map((register: any) => ({
          ...register,
        }));
        setRegisters(updatedRegisters);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoad(false));

    const eventSource = new EventSource(
      `${import.meta.env.VITE_APP_BASE_URL}events`
    );

    eventSource.addEventListener("jobUpdated", (event) => {
      const data = JSON.parse(event.data);
      console.log(data);

      setRegisters((prevRegisters) =>
        prevRegisters.map((register) => {
          const jobIndex = register.jobs.findIndex(
            (job: any) => job._id === data.job._id
          );

          if (jobIndex !== -1) {
            return {
              ...register,
              jobs: register.jobs.map((job: any, index: number) =>
                index === jobIndex ? { ...job, ...data.job } : job
              ),
            };
          }

          if (!register.jobs.length && register._id == data.job.faccionistaId) {
            return {
              ...register,
              jobs: [data.job],
            };
          }

          return register;
        })
      );
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const addUserState = (novoItem: any) => {
    setRegisters((prevRegister) => [...prevRegister, novoItem]);
  };

  const openDialog = (id: string) => {
    setSelectedUser(id);
    setIsDialogOpen(true);
  };

  const deleteUser = async () => {
    if (selectedUser) {
      await instance.delete(`factionist/${selectedUser}`).then(() => {
        setRegisters((prevRegisters) =>
          prevRegisters.filter((user) => user._id !== selectedUser)
        );
      });
    }
    setIsDialogOpen(false);
  };

  const filteredRegisters = registers.filter((register) =>
    register?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (load) return <Loader className="w-10 h-10 animate-spin m-auto my-10" />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Procurar Faccionista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <AddFaccionista addUserState={addUserState} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {filteredRegisters?.map((register: any) => (
          <Card key={register._id} className="w-full relative">
            <CardHeader>
              <CardTitle>
                {register.username.toUpperCase()}{" "}
                <a onClick={() => openDialog(register._id)} href="#">
                  <Trash className="w-4 h-4 float-right text-red-500" />
                </a>
              </CardTitle>
              <CardDescription data-id={register._id}>
                {register?.lastName?.toUpperCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <CalculateJobs jobs={register.jobs} />
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => navigate(`/job/${register._id}`)}
                variant="outline"
                className="w-full mr-2"
              >
                Fila de trabalho
              </Button>
              <Button
                onClick={() => openEditDialog(register)}
                variant="outline"
                className="w-full ml-2"
              >
                Editar usuário
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedUserUpdate && (
        <EditFaccionista
          user={selectedUserUpdate}
          onClose={closeEditDialog}
          updateUserState={updateUserState}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza de que deseja excluir este usuário? Esta ação não pode
            ser desfeita.
            <b className="text-red-600 block">
              Todos os trabalhos do usuário serão excluidos
            </b>
          </DialogDescription>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={deleteUser}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
