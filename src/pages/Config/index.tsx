import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import instance from "@/config/axios";
// import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Config = () => {
  const [emailNotify, setEmailNotify] = useState("");
  const [storeName, setStoreName] = useState("");
  const [sendEmail, setSendEmail] = useState(false);
  const [load, setLoad] = useState(false);

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
      .finally(() => {});
  }, []);

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
          description: "Atualizadas",
          position: "top-center",
          closeButton: true,
          duration: 1000,
        });
      })
      .catch((err) => {
        toast.error("Erro ", {
          description: err?.response?.data?.error,
          position: "top-center",
          closeButton: true,
        });
      })
      .finally(() => {
        setLoad(false);
      });

    e.preventDefault();
    return false;
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="mt-20 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={(e) => handleSubmit(e)}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Email para notificações
            </label>
            <div className="mt-2">
              <Input
                value={emailNotify}
                onChange={(e) => setEmailNotify(e.target.value)}
                name="email"
                placeholder="Email para notificações"
                autoComplete="email"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Nome da loja no mercado livre
              </label>
            </div>
            <div className="mt-2">
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                name="password"
                placeholder="Nome da loja"
                autoComplete="password"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <div>
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Hora para rotina de notificação por email
              </label>
              <Select
                onValueChange={(value) => setHour(parseInt(value))}
                value={`${hour}`}
              >
                <SelectTrigger className="w-[180px] mt-2">
                  <SelectValue placeholder="Horas" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(24).keys()].map((h) => (
                    <SelectItem key={h} value={String(h)}>
                      {h.toString().padStart(2, "0")} h
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex items-center ">
              <div className="mr-2 mt-1">
                <Checkbox
                  checked={sendEmail}
                  onCheckedChange={() => setSendEmail(!sendEmail)}
                  id="auto"
                />
              </div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Habilitar envio de email produtos atualizados
              </label>
            </div>
          </div>

          <div>
            <Button
              disabled={load}
              onClick={(e) => handleSubmit(e)}
              type="submit"
              className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6  shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {load && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Config;
