import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ResumeCardProps {
  title: string;
  data: { source: string; totalAmount: number; totalOrders?: number }[];
  showOrdersCount?: boolean;
}

export function ResumeCard({
  title,
  data,
  showOrdersCount = true,
}: ResumeCardProps) {
  const totalAmount = data.reduce((acc, l) => acc + (l.totalAmount || 0), 0);
  const totalOrders = data.reduce((acc, l) => acc + (l.totalOrders || 0), 0);

  return (
    <Card className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900">
          {title} {showOrdersCount && ` ( ${totalOrders} pedidos )`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.map((loja) => (
          <div
            key={loja.source}
            className="flex justify-between text-sm text-gray-700"
          >
            <span className="font-medium">{loja.source}</span>
            <span className="text-right">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(loja.totalAmount)}
              {showOrdersCount &&
                loja.totalOrders !== undefined &&
                ` (${loja.totalOrders} pedidos)`}
            </span>
          </div>
        ))}
        <Separator className="my-2" />
        <div className="flex justify-between items-center pt-2">
          <span className="text-base font-bold text-gray-900">Total:</span>
          <span className="text-base font-bold text-gray-900">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(totalAmount)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
