import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function WelcomePage() {
  return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <Card className="max-w-lg w-full text-center shadow-md mt-5">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold">Olá 👋</CardTitle>
        </CardHeader>
        <CardContent className="mt-4">
          <p className="text-muted-foreground">
            Bem-vindo ao sistema. Use o menu para começar a navegar pelas
            funcionalidades disponíveis.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
