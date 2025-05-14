"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SessionMenu from "@/components/SessionMenu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function SessionsContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      setSelectedSessionId(sessionId);
    }
  }, [sessionId]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Sessions</h2>
        <p className="text-muted-foreground">
          Crie e gerencie sessões para interagir com as APIs do sistema.
        </p>
        {selectedSessionId && (
          <p className="mt-2 p-2 bg-muted/30 rounded-md border border-primary/20">
            Visualizando detalhes da sessão: <span className="font-mono">{selectedSessionId}</span>
          </p>
        )}
      </div>
      <SessionMenu initialSessionId={selectedSessionId} />
    </div>
  );
}

export default function SessionsPage() {
  return (
    <Suspense fallback={<div className="flex flex-col gap-4">Carregando...</div>}>
      <SessionsContent />
    </Suspense>
  );
} 