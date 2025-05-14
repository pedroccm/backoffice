"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { createSession, getSessions, saveSessionsToFile, SessionResponse } from "@/lib/api-fetch";
import { ApiResponseViewer } from "./ui/api-response-viewer";

// Interface para os dados do formulário
interface SessionFormData {
  name: string;
  salesforceLeadId: string;
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
        const loadedSessions = await getSessions();
        setSessions(loadedSessions);
        
        // Se houver um ID inicial, encontrar e destacar a sessão
        if (initialSessionId) {
          const session = loadedSessions.find(s => s.id === initialSessionId);
          if (session) {
            setSelectedSession(session);
            setResponse(JSON.stringify(session, null, 2));
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

  const handleCreateSession = async () => {
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
      const data = await createSession(formData);
      setResponse(JSON.stringify(data, null, 2));

      // Adicionar à lista de sessões
      const updatedSessions = [...sessions, data];
      setSessions(updatedSessions);

      // Salvar no arquivo sessions.json
      await saveSessionsToFile(updatedSessions);

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

  const selectSession = (session: SessionResponse) => {
    setSelectedSession(session);
    setResponse(JSON.stringify(session, null, 2));
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
            <Button onClick={handleCreateSession} disabled={loading}>
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
            <p>Carregando sessões...</p>
          ) : sessions.length === 0 ? (
            <p>Nenhuma sessão encontrada.</p>
          ) : (
            <ScrollArea className="h-[200px] w-full rounded-md border">
              <div className="p-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`mb-2 cursor-pointer rounded-md p-2 hover:bg-accent ${
                      selectedSession?.id === session.id ? "bg-primary/10" : ""
                    }`}
                    onClick={() => selectSession(session)}
                  >
                    <p className="font-medium">ID: {session.id.substring(0, 8)}...</p>
                    <p className="text-sm text-muted-foreground">
                      Criado em: {new Date(session.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {response && <ApiResponseViewer response={response} title="Detalhes da Sessão" />}
    </div>
  );
} 