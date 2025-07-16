"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, CalendarIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InvoiceFiltersProps {
  searchTerm: string;
  selectedDate: Date | undefined;
  onSearchChange: (value: string) => void;
  onDateChange: (date: Date | undefined) => void;
  onClearFilters: () => void;
}

export function InvoiceFilters({
  searchTerm,
  selectedDate,
  onSearchChange,
  onDateChange,
  onClearFilters,
}: InvoiceFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Buscar e Filtrar</CardTitle>
        <CardDescription>
          Encontre notas fiscais por data, fornecedor, CNPJ ou produtos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Fornecedor, CNPJ, número ou produto..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Data de Emissão</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-transparent"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR })
                    : "Todas as datas"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={onDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label>&nbsp;</Label>
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={onClearFilters}
            >
              <Filter className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
