import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { InvoiceFilters } from "./invoice-filters";
import { InvoiceTable } from "./invoice-table";
import { InvoiceModal } from "./invoice-modal";
import { InvoiceViewModal } from "./invoice-view-modal";
import { EmptyState } from "./empty-state";

import type { Invoice } from "./types";
import { useInvoicesService } from "@/hooks/useInvoiceService";
import { usePermission } from "@/hooks/usePermissions";

import { toast } from "sonner";

export default function Nf() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { invoicesQuery, deleteInvoice } = useInvoicesService({
    searchTerm,
    selectedDate,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetched,
  } = invoicesQuery;

  const { can } = usePermission();

  const invoices = data?.pages.flatMap((page: any) => page.data) ?? [];

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleViewInvoice = (invoice: Invoice) => {
    setViewInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handleDeleteInvoice = (id: string) => {
    toast("Deseja excluir esta nota fiscal?", {
      description: "Essa ação não pode ser desfeita.",
      position: "top-center",
      action: {
        label: "Confirmar",
        onClick: () => {
          deleteInvoice.mutate(id);
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
      actionButtonStyle: {
        backgroundColor: "#141414",
        color: "white",
      },
      duration: 10000,
    });
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedDate(undefined);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Gerenciamento de Notas Fiscais
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas notas fiscais eletrônicas (NFe)
          </p>
        </div>
        {can("add_nf") && (
          <Button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Nota Fiscal
          </Button>
        )}
      </div>

      <InvoiceFilters
        searchTerm={searchTerm}
        selectedDate={selectedDate}
        onSearchChange={setSearchTerm}
        onDateChange={setSelectedDate}
        onClearFilters={handleClearFilters}
      />

      {isLoading && !isFetched ? (
        <div className="text-center text-muted-foreground py-12">
          <p>Carregando notas fiscais...</p>
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState
          title="Nenhuma nota fiscal encontrada"
          description="Parece que não há notas fiscais cadastradas ou que correspondem aos seus filtros. Comece adicionando uma nova nota fiscal."
          actionButton={
            can("add_nf") && (
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Nova Nota Fiscal
              </Button>
            )
          }
        />
      ) : (
        <InvoiceTable
          invoices={invoices}
          onViewInvoice={handleViewInvoice}
          onDeleteInvoice={handleDeleteInvoice}
        />
      )}
      <div ref={loadMoreRef} className="h-10" />
      {isFetchingNextPage && (
        <p className="text-muted-foreground text-center py-2">Carregando...</p>
      )}

      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <InvoiceViewModal
        invoice={viewInvoice}
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewInvoice(null);
        }}
      />
    </div>
  );
}
