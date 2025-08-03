"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  useProductsService,
  type Product as ServiceProduct,
} from "@/hooks/useProduct";

interface ProductAutocompleteProps {
  value: string;
  onValueChange: (value: string) => void;
  onSelect?: (name: string, sku: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ProductAutocomplete({
  value,
  onValueChange,
  onSelect,
  placeholder = "Digite o nome do produto...",
  disabled = false,
}: ProductAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [hasSelectedValue, setHasSelectedValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const { productsQuery } = useProductsService({
    searchTerm: debouncedSearchTerm,
    limit: 10,
  });

  const products =
    productsQuery.data?.pages?.flatMap((page) => page.data) || [];
  const hasResults = products.length > 0;

  // Só mostra dropdown se estiver editando E não tiver um valor já selecionado
  const shouldShowDropdown =
    open &&
    isEditing &&
    !hasSelectedValue &&
    value.length > 0 &&
    (hasResults || productsQuery.isLoading);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    onValueChange(inputValue);
    setIsEditing(true);
    setHasSelectedValue(false);

    if (inputValue.length > 0) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  const handleSelect = (product: ServiceProduct) => {
    onValueChange(product.nome);
    onSelect?.(product.nome, product.sku);
    setOpen(false); // Fecha o dropdown
    setIsEditing(false); // Para de mostrar autocomplete
    setHasSelectedValue(true); // Marca que tem um valor selecionado
    inputRef.current?.blur(); // Remove o foco do input
  };

  const handleInputFocus = () => {
    // Só abre se não tiver um valor já selecionado
    if (value.length > 0 && !hasSelectedValue) {
      setOpen(true);
      setIsEditing(true);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setIsEditing(false);
    }
  };

  const handleClearInput = () => {
    onValueChange("");
    setOpen(false);
    setIsEditing(false);
    setHasSelectedValue(false);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setIsEditing(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-16"
        />
        <div className="absolute right-0 top-0 h-full flex items-center">
          {value.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-full px-2 hover:bg-transparent text-gray-400 hover:text-gray-600"
              onClick={handleClearInput}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {value.length > 0 && !hasSelectedValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-full px-2 hover:bg-transparent"
              onClick={() => {
                setOpen(!open);
                setIsEditing(!isEditing);
              }}
              disabled={disabled}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  open && "rotate-180"
                )}
              />
            </Button>
          )}
        </div>
      </div>

      {shouldShowDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <Command>
            <CommandList className="max-h-60">
              <CommandEmpty>
                {productsQuery.isLoading
                  ? "Carregando..."
                  : "Nenhum produto encontrado."}
              </CommandEmpty>
              {hasResults && (
                <CommandGroup>
                  {products.map((product) => (
                    <CommandItem
                      key={product._id}
                      value={product.nome}
                      onSelect={() => handleSelect(product)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === product.nome ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col flex-1">
                        <span className="font-medium">{product.nome}</span>
                        <span className="text-sm text-muted-foreground">
                          SKU: {product.sku}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
