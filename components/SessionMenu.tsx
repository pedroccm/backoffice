"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { SALES_API_URL } from "@/lib/api-fetch";
import { Copy } from "lucide-react";

// Interface para os dados do formulário
interface SessionFormData {
  name: string;
  salesforceLeadId: string;
}

// Interface para o resultado da sessão
interface SessionResponse {
  id: string;
  leadId: string;
  oneTimeOfferId: string;
  recurrentOfferId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function SessionMenu({ initialSessionId = null }: { initialSessionId?: string | null }) {
  const [formData, setFormData] = useState<SessionFormData>({
    name: "",
    salesforceLeadId: "00Q5Y00000F8XITUA3",
  });
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [sessions, setSessions] = useState<SessionResponse[]>([]);
  const [loadingSessions, setLoadingSessions] = useState<boolean>(true);
  const [selectedSession, setSelectedSession] = useState<SessionResponse | null>(null);
  const { toast } = useToast();

  // Carregar sessões existentes do arquivo e destacar a selecionada
  useEffect(() => {
    async function loadSessions() {
      try {
        setLoadingSessions(true);
        const response = await fetch("/api/sessions");
        
        if (response.ok) {
          const data = await response.json();
          setSessions(data.sessions || []);
          
          // Se houver um ID inicial, encontrar e destacar a sessão
          if (initialSessionId) {
            const session = data.sessions?.find((s: SessionResponse) => s.id === initialSessionId);
            if (session) {
              setSelectedSession(session);
              setResponse(JSON.stringify(session, null, 2));
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar sessões:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as sessões salvas.",
          variant: "destructive",
        });
      } finally {
        setLoadingSessions(false);
      }
    }
    
    loadSessions();
  }, [toast, initialSessionId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const createSession = async () => {
    if (!formData.name || !formData.salesforceLeadId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResponse("Carregando...");

    try {
      const response = await fetch(`${SALES_API_URL}/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setResponse(JSON.stringify(data, null, 2));

      // Adicionar à lista de sessões
      setSessions((prev) => [...prev, data]);

      // Salvar no arquivo sessions.json
      saveSessionsToFile([...sessions, data]);

      toast({
        title: "Sessão criada",
        description: "A sessão foi criada com sucesso e adicionada ao arquivo sessions.json",
      });
    } catch (error) {
      setResponse(
        `Erro ao criar sessão: ${error instanceof Error ? error.message : String(error)}`
      );
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a sessão.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSessionsToFile = async (sessions: SessionResponse[]) => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessions }),
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar sessions.json");
      }
    } catch (error) {
      console.error("Erro ao salvar arquivo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o arquivo sessions.json.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Informação copiada para a área de transferência.",
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Criar Sessão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Lead</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nome do Lead"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="salesforceLeadId">ID do Lead no Salesforce</Label>
              <Input
                id="salesforceLeadId"
                name="salesforceLeadId"
                value={formData.salesforceLeadId}
                onChange={handleChange}
                placeholder="ID do Lead no Salesforce"
              />
            </div>
            <Button onClick={createSession} disabled={loading}>
              {loading ? "Criando..." : "Criar Sessão"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Sessões Salvas</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSessions ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : sessions.length > 0 ? (
            <ScrollArea className="h-[200px] w-full rounded-md border">
              <div className="p-4">
                {sessions.map((session, index) => (
                  <div key={index} className={`mb-6 pb-4 border-b last:border-0 relative ${session.id === initialSessionId ? 'bg-primary/5 p-2 rounded-md border border-primary/20' : ''}`}>
                    <div className="absolute top-0 right-0">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(JSON.stringify(session, null, 2))}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    {session.id === initialSessionId && (
                      <div className="mb-2 px-2 py-1 bg-primary/10 text-sm rounded-sm inline-block">
                        Sessão selecionada
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                      <div className="p-1 bg-muted/20 rounded">
                        <span className="font-semibold text-sm">ID:</span>{" "}
                        <span className="font-mono text-sm">{session.id}</span>
                      </div>
                      <div className="p-1 bg-muted/20 rounded">
                        <span className="font-semibold text-sm">Lead ID:</span>{" "}
                        <span className="font-mono text-sm">{session.leadId}</span>
                      </div>
                      <div className="p-1 bg-muted/20 rounded">
                        <span className="font-semibold text-sm">One Time Offer ID:</span>{" "}
                        <span className="font-mono text-sm">{session.oneTimeOfferId}</span>
                      </div>
                      <div className="p-1 bg-muted/20 rounded">
                        <span className="font-semibold text-sm">Recurrent Offer ID:</span>{" "}
                        <span className="font-mono text-sm">{session.recurrentOfferId}</span>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-1">
                      <div className="p-1 bg-muted/20 rounded">
                        <span className="font-semibold text-sm">Expira em:</span>{" "}
                        <span className="text-sm">{new Date(session.expiresAt).toLocaleString()}</span>
                      </div>
                      <div className="p-1 bg-muted/20 rounded">
                        <span className="font-semibold text-sm">Criada em:</span>{" "}
                        <span className="text-sm">{new Date(session.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="p-1 bg-muted/20 rounded">
                        <span className="font-semibold text-sm">Atualizada em:</span>{" "}
                        <span className="text-sm">{new Date(session.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-center py-4 text-muted-foreground">Nenhuma sessão encontrada.</p>
          )}
        </CardContent>
      </Card>

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Resposta da API</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border">
              <pre className="p-4 text-sm">{response}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 