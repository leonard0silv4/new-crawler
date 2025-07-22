"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import instance from "@/config/axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  Store,
  Clock,
  Bell,
  Monitor,
  Save,
  Download,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

const Config = () => {
  const { permissions }: any = useContext(AuthContext);
  const [emailNotify, setEmailNotify] = useState("");
  const [storeName, setStoreName] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [load, setLoad] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [production, setProduction] = useState(
    !!(
      window.localStorage !== undefined &&
      localStorage.getItem("productionBrowser") == "yes"
    )
  );
  const [hour, setHour] = useState<number>(3);

  useEffect(() => {
    instance
      .get("config")
      .then((response: any) => {
        setEmailNotify(response.emailNotify);
        setStoreName(response.storeName);
        setSendEmail(response.sendEmail);
        setHour(response.cronInterval.split(" ")[1]);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setInitialLoad(false);
      });
  }, []);

  const setProductionLocal = () => {
    if (localStorage.getItem("productionBrowser") == "no") {
      localStorage.setItem("productionBrowser", "yes");
      setProduction(true);
    } else {
      localStorage.setItem("productionBrowser", "no");
      setProduction(false);
    }
    window.location.reload();
  };

  const clearOldJobs = () => {
    instance.get("jobs/archive").then((response: any) => {
      console.log(response);
      toast.success("Trabalhos", {
        description: `${response?.archived}  com 4 meses e pagos limpos`,
        position: "top-right",
        closeButton: true,
        duration: 2000,
      });
    });
  };

  const backup = async () => {
    try {
      const response: any = await instance.get("/backup", {
        responseType: "blob", // importante para tratar como arquivo
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `backup-${new Date().toISOString()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Backup gerado com sucesso", {
        position: "top-right",
        duration: 3000,
      });
    } catch (err) {
      console.error("Erro ao fazer backup", err);
      toast.error("Erro ao gerar backup", {
        position: "top-right",
      });
    }
  };

  const handleSubmit = (e: any) => {
    setLoad(true);
    instance
      .post("/saveConfig", {
        emailNotify,
        storeName,
        sendEmail,
        hour,
      })
      .then(() => {
        toast.success("Configurações", {
          description: "Atualizadas com sucesso",
          position: "top-right",
          closeButton: true,
          duration: 2000,
        });
      })
      .catch((err) => {
        toast.error("Erro", {
          description:
            err?.response?.data?.error || "Erro ao salvar configurações",
          position: "top-right",
          closeButton: true,
        });
      })
      .finally(() => {
        setLoad(false);
      });
    e.preventDefault();
    return false;
  };

  if (initialLoad) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando configurações...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as configurações do sistema e notificações
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notificações por Email
            </CardTitle>
            <CardDescription>
              Configure as preferências de notificação por email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email para notificações</Label>
              <Input
                id="email"
                type="email"
                value={emailNotify}
                onChange={(e) => setEmailNotify(e.target.value)}
                placeholder="seu@email.com"
                className="max-w-md"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="sendEmail"
                checked={sendEmail}
                onCheckedChange={() => setSendEmail(!sendEmail)}
              />
              <Label htmlFor="sendEmail" className="text-sm font-medium">
                Habilitar envio de email para produtos atualizados
              </Label>
              {sendEmail && (
                <Badge variant="secondary" className="ml-2">
                  <Bell className="h-3 w-3 mr-1" />
                  Ativo
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Configurações da Loja
            </CardTitle>
            <CardDescription>
              Informações sobre sua loja no Mercado Livre
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="storeName">Nome da loja no Mercado Livre</Label>
              <Input
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Nome da sua loja"
                className="max-w-md"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Rotina de Notificações
            </CardTitle>
            <CardDescription>
              Configure o horário para execução das rotinas automáticas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="hour">
                Hora para rotina de notificação por email
              </Label>
              <Select
                onValueChange={(value) => setHour(Number.parseInt(value))}
                value={`${hour}`}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione a hora" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(24).keys()].map((h) => (
                    <SelectItem key={h} value={String(h)}>
                      {h.toString().padStart(2, "0")}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Configurações do Sistema
            </CardTitle>
            <CardDescription>
              Configurações específicas do ambiente de trabalho
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="production"
                checked={production}
                onCheckedChange={() => setProductionLocal()}
              />
              <Label htmlFor="production" className="text-sm font-medium">
                Computador de linha de produção
              </Label>
              {production && (
                <Badge variant="destructive" className="ml-2">
                  Produção
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Esta configuração requer reinicialização da aplicação
            </p>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end gap-10">
          <Button
            disabled={load}
            size="lg"
            className="min-w-[120px]"
            onClick={(e) => {
              e.preventDefault();
              backup();
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Backup banco de dados
          </Button>
          <Button
            disabled={load}
            size="lg"
            className="min-w-[120px]"
            onClick={(e) => {
              e.preventDefault();
              clearOldJobs();
            }}
          >
            <Save className="w-4 h-4 mr-2" />
            Limpar lotes antigos
          </Button>

          <Button
            type="submit"
            disabled={load}
            size="lg"
            className="min-w-[120px]"
          >
            {load ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </form>

      <pre className="hidden">{JSON.stringify(permissions)}</pre>
    </div>
  );
};

export default Config;
