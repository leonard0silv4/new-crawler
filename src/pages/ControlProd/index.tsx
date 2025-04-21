"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Barcode, Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Lista de colaboradores (você pode substituir por dados reais)
const colaboradores = [
  { value: "1", label: "João Silva" },
  { value: "2", label: "Maria Oliveira" },
  { value: "3", label: "Pedro Santos" },
  { value: "4", label: "Ana Souza" },
  { value: "5", label: "Carlos Ferreira" },
];

const formSchema = z.object({
  colaborador: z.string({
    required_error: "Por favor selecione um colaborador",
  }),
  codigoPedido: z.string().min(1, "Código do pedido é obrigatório"),
  largura: z.string().min(1, "Largura da tela é obrigatória"),
  comprimento: z.string().min(1, "Comprimento da tela é obrigatória"),
  emenda: z.enum(["sim", "nao"], {
    required_error: "Por favor selecione se há emenda",
  }),
});

export default function ProductionForm() {
  const [open, setOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigoPedido: "",
      largura: "",
      comprimento: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Encontrar o nome completo do colaborador
    const colaboradorNome =
      colaboradores.find((c) => c.value === values.colaborador)?.label ||
      values.colaborador;

    // Definir a mensagem de sucesso
    setSuccessMessage(
      `Apontamento para ${colaboradorNome} realizado com sucesso!`
    );

    // Mostrar a modal de sucesso
    setShowSuccessModal(true);

    // Configurar o fechamento automático após 5 segundos
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 5000);

    // Resetar o formulário
    form.reset();
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="mt-20 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Registro de Produção</CardTitle>
            <CardDescription>
              Preencha os dados de produção para registrar seu trabalho.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="colaborador"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Colaborador</FormLabel>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={open}
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? colaboradores.find(
                                    (colaborador) =>
                                      colaborador.value === field.value
                                  )?.label
                                : "Selecione um colaborador"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Buscar colaborador..." />
                            <CommandList>
                              <CommandEmpty>
                                Nenhum colaborador encontrado.
                              </CommandEmpty>
                              <CommandGroup>
                                {colaboradores.map((colaborador) => (
                                  <CommandItem
                                    key={colaborador.value}
                                    value={colaborador.value}
                                    onSelect={(value) => {
                                      form.setValue("colaborador", value);
                                      setOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        colaborador.value === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {colaborador.label}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="codigoPedido"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código do Pedido</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Escaneie ou digite o código do pedido"
                            {...field}
                            className="pl-10"
                          />
                          <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use um leitor de código de barras ou digite manualmente
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="largura"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Largura da Tela (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Largura"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="comprimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Comprimento da Tela (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Comprimento"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="emenda"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Emenda?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="sim" />
                            </FormControl>
                            <FormLabel className="font-normal">Sim</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="nao" />
                            </FormControl>
                            <FormLabel className="font-normal">Não</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">
                  Enviar Apontamento
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">
                APONTAMENTO DE COSTURA
              </DialogTitle>
              <DialogDescription className="text-center text-lg pt-2">
                {successMessage}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
