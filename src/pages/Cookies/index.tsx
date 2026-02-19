"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import instance from "@/config/axios";
import { toast } from "sonner";
import {
  Cookie,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface SaveResult {
  ok: boolean;
  inserted: number;
  skipped: number;
}

const CookiesPage = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [saveResult, setSaveResult] = useState<SaveResult | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const validateJson = (value: string): boolean => {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        setJsonError("O JSON deve ser um array de cookies");
        return false;
      }
      setJsonError(null);
      return true;
    } catch {
      setJsonError("JSON inválido");
      return false;
    }
  };

  const handleJsonChange = (value: string) => {
    setJsonInput(value);
    if (value.trim()) {
      validateJson(value);
    } else {
      setJsonError(null);
    }
  };

  const handleSave = async () => {
    if (!jsonInput.trim()) {
      toast.error("Cole o JSON de cookies antes de salvar", {
        position: "top-right",
      });
      return;
    }

    if (!validateJson(jsonInput)) {
      toast.error(jsonError || "JSON inválido", { position: "top-right" });
      return;
    }

    setSaving(true);
    setSaveResult(null);

    try {
      const cookies = JSON.parse(jsonInput);
      const response: any = await instance.post("/cookies", { cookies });
      // O interceptor já retorna response.data para requests não-blob
      const result: SaveResult = response;

      setSaveResult(result);
      toast.success("Cookies salvos com sucesso!", {
        description: `${result.inserted} inseridos, ${result.skipped} ignorados`,
        position: "top-right",
        duration: 4000,
      });
    } catch (err: any) {
      toast.error("Erro ao salvar cookies", {
        description:
          err?.response?.data?.error || "Verifique o formato do JSON",
        position: "top-right",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPkl = async () => {
    setDownloading(true);
    try {
      const response: any = await instance.get("/cookies/pkl", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ml_cookies.pkl");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Download iniciado!", { position: "top-right" });
    } catch (err: any) {
      toast.error("Erro ao baixar o arquivo pkl", {
        description: err?.response?.data?.error || "Tente novamente",
        position: "top-right",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Cookie className="h-8 w-8" />
          Cookies do Mercado Livre
        </h1>
        <p className="text-muted-foreground mt-2">
          Atualize os cookies de autenticação e baixe o arquivo pickle para o
          crawler
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Importar Cookies
            </CardTitle>
            <CardDescription>
              Cole o JSON exportado pela extensão do navegador (formato array de
              cookies). O sistema irá converter e salvar os cookies válidos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="cookieJson">JSON dos cookies</Label>
                {jsonInput.trim() && (
                  <span className="text-xs">
                    {jsonError ? (
                      <span className="flex items-center gap-1 text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {jsonError}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        JSON válido
                      </span>
                    )}
                  </span>
                )}
              </div>
              <Textarea
                id="cookieJson"
                value={jsonInput}
                onChange={(e) => handleJsonChange(e.target.value)}
                placeholder='[{"name": "...", "value": "...", "domain": "...", ...}]'
                className="font-mono text-xs min-h-[280px] resize-y"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || !!jsonError || !jsonInput.trim()}
              size="lg"
              className="w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Cookie className="w-4 h-4 mr-2" />
                  Salvar Cookies
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {saveResult && (
          <>
            <Separator />
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  Cookies salvos com sucesso
                </CardTitle>
                <CardDescription>
                  <span className="flex items-center gap-3 mt-1">
                    <Badge variant="secondary">
                      {saveResult.inserted} inseridos
                    </Badge>
                    {saveResult.skipped > 0 && (
                      <Badge variant="outline">
                        {saveResult.skipped} ignorados (sem valor)
                      </Badge>
                    )}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Agora você pode baixar o arquivo{" "}
                    <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                      ml_cookies.pkl
                    </code>{" "}
                    para utilizar com o crawler.
                  </p>
                  <Button
                    onClick={handleDownloadPkl}
                    disabled={downloading}
                    size="lg"
                    variant="default"
                    className="w-full sm:w-auto"
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando arquivo...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Baixar ml_cookies.pkl
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Download direto
            </CardTitle>
            <CardDescription>
              Baixe o arquivo pickle dos cookies atualmente salvos no banco de
              dados, sem precisar reimportar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleDownloadPkl}
              disabled={downloading}
              variant="outline"
              size="lg"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando arquivo...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar ml_cookies.pkl
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CookiesPage;
