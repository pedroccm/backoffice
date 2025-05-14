"use client";

import { Copy } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { ScrollArea } from "./scroll-area";
import { useToast } from "./use-toast";

interface ApiResponseViewerProps {
  response: string;
  title?: string;
  height?: string;
  showCopy?: boolean;
}

export function ApiResponseViewer({
  response,
  title = "Resultado",
  height = "400px",
  showCopy = true
}: ApiResponseViewerProps) {
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(response);
    toast({
      title: "Copiado!",
      description: "Informação copiada para a área de transferência.",
    });
  };

  if (!response) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {showCopy && (
          <Button variant="outline" size="icon" onClick={copyToClipboard}>
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className={`h-[${height}] w-full rounded-md border`}>
          <pre className="p-4 text-sm">{response}</pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 