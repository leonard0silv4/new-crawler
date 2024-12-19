"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

import moment from "moment";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Product } from ".";

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

const chartConfig = {
  price: {
    label: "price",
    color: "#2563eb",
  },
} satisfies ChartConfig;

export const ProductDrawer: React.FC<ProductDrawerProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const chartData =
    product?.history?.map((prd: any) => {
      return {
        date: moment(prd.updatedAt).format("DD/MM"),
        price: prd.price,
        seller: prd.seller,
        fullDate: moment(prd.updatedAt).format("DD/MM HH:mm"),
      };
    }) || {};

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { price, seller, fullDate } = payload[0].payload;
      return (
        <div className="bg-white p-2 shadow-md rounded-md">
          <p className="text-sm text-gray-700">{`Data: ${fullDate}`}</p>
          <p className="text-sm text-blue-500">{`Preço: R$${price}`}</p>
          <p className="text-sm text-green-500">{`Vendedor: ${seller}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>{product.name}</DrawerTitle>
            <DrawerDescription>Historico de preços</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 mb-20">
            <div className="mt-3 h-[120px]">
              {chartData.length ? (
                <ChartContainer
                  config={chartConfig}
                  className="min-h-[200px] w-full"
                >
                  <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 6)}
                    />
                    <ChartTooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="price"
                      fill={chartConfig.price.color}
                      radius={8}
                    />
                    <Bar dataKey="myPrice" fill="var(--chart-2)" radius={8} />
                  </BarChart>
                </ChartContainer>
              ) : (
                "Historico Vazio"
              )}
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button onClick={onClose} variant="outline">
                Fechar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
