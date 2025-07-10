import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Loader2, User, Shield, Plus, ArrowLeft } from "lucide-react";
import instance from "@/config/axios";

interface Role {
  _id: string;
  name: string;
}

interface Permission {
  _id: string;
  name: string;
  description: string;
}

const formSchema = z.object({
  username: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  password: z.string().min(3, { message: "Mínimo 3 caracteres" }),
  roleId: z.string().min(1, "Selecione uma role"),
  newRoleName: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export default function CreateAccount() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<
    Permission[]
  >([]);
  const [isPending, setIsPending] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      roleId: "",
      newRoleName: "",
      permissions: [],
    },
  });

  const watchRole = form.watch("roleId");
  const isCreatingNewRole = watchRole === "new";

  useEffect(() => {
    instance.get("/roles").then((res) => setRoles(res as any));
    instance.get("/permissions").then((res) => setPermissions(res as any));
  }, []);

  const handleRoleChange = async (roleId: string) => {
    form.setValue("roleId", roleId);
    form.setValue("newRoleName", "");
    form.setValue("permissions", []);

    if (roleId === "new") {
      setSelectedRolePermissions([]);
    } else {
      const res = await instance.get(`/roles/${roleId}`);
      setSelectedRolePermissions(res as any);
    }
  };

  const togglePermission = (id: string) => {
    const current = form.getValues("permissions") || [];
    form.setValue(
      "permissions",
      current.includes(id) ? current.filter((p) => p !== id) : [...current, id]
    );
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsPending(true);

    try {
      let roleId = data.roleId;

      if (isCreatingNewRole) {
        if (!data.newRoleName || !data.permissions?.length) {
          toast.error("Preencha o nome da nova role e selecione permissões");
          return;
        }

        const newRole: any = await instance.post("/roles", {
          name: data.newRoleName,
          permissions: data.permissions,
        });

        roleId = newRole._id;
      }

      await instance.post("/users", {
        username: data.username,
        password: data.password,
        roleId,
      });

      toast.success("Usuário criado com sucesso!");
      navigate("/manage-users");
    } catch (error: any) {
      console.log(error);
      toast.error("Erro ao criar usuário", {
        description: error?.response?.data?.error,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Criar Conta</h1>
            <p className="mt-2 text-muted-foreground">
              Preencha os dados para criar uma nova conta de usuário
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Usuário
            </CardTitle>
            <CardDescription>
              Defina as credenciais e permissões do novo usuário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome de usuário</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite o nome de usuário"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Digite a senha"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Permissões</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="roleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Esquema de permissões</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleRoleChange(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um esquema de permissões" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role._id} value={role._id}>
                                {role.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="new">
                              <div className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Criar novo esquema
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!isCreatingNewRole && selectedRolePermissions.length > 0 && (
                    <Card className="mt-4">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                          Permissões incluídas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedRolePermissions.map((perm) => (
                            <Badge key={perm._id} variant="secondary">
                              {perm.description}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {isCreatingNewRole && (
                    <div className="mt-4 space-y-4">
                      <FormField
                        control={form.control}
                        name="newRoleName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do novo esquema</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: Moderador, Analista..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div>
                        <Label className="text-sm font-medium">
                          Selecione as permissões
                        </Label>
                        <Card className="mt-2">
                          <CardContent className="pt-4">
                            <div className="grid gap-3">
                              {permissions.map((perm) => (
                                <FormField
                                  key={perm._id}
                                  control={form.control}
                                  name="permissions"
                                  render={() => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={
                                            form
                                              .watch("permissions")
                                              ?.includes(perm._id) || false
                                          }
                                          onCheckedChange={() =>
                                            togglePermission(perm._id)
                                          }
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <Label className="text-sm font-medium">
                                          {perm.description}
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                          {perm.name}
                                        </p>
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isPending} className="flex-1">
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar Conta"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
