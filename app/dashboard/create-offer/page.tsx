"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CreateOneTimeOffer } from "./components/create-one-time-offer"
import { CreateRecurrentOffer } from "./components/create-recurrent-offer" 
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getOfferById, getSessionById, createSession } from "@/lib/api-client"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function CreateOfferContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("sessionId") || ""
  const leadId = searchParams.get("leadId") || ""
  const oneTimeOfferId = searchParams.get("oneTimeOfferId") || ""
  const recurrentOfferId = searchParams.get("recurrentOfferId") || ""
  
  const [showOfferDetails, setShowOfferDetails] = useState(false)
  const [oneTimeOfferDetails, setOneTimeOfferDetails] = useState("")
  const [recurrentOfferDetails, setRecurrentOfferDetails] = useState("")
  const [sessionDetails, setSessionDetails] = useState("")
  const [isClosingSession, setIsClosingSession] = useState(false)
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  
  // Novo estado para controlar qual detalhe está sendo exibido
  const [activeDetail, setActiveDetail] = useState<"one-time" | "recurrent" | "session" | null>(null)
  
  // Estado para o formulário de criação de sessão
  const [formData, setFormData] = useState({
    name: "",
    salesforceLeadId: ""
  })
  
  // Estado para armazenar os dados da sessão criada
  const [sessionData, setSessionData] = useState<{
    id: string;
    leadId: string;
    oneTimeOfferId: string;
    recurrentOfferId: string;
    expiresAt: string;
    createdAt?: string;
    updatedAt?: string;
    status: string;
  } | null>(null)
  
  const { toast } = useToast()
  
  // Atualizar os dados da sessão quando eles estiverem disponíveis via URL ou após criação
  useEffect(() => {
    if (sessionId && leadId && oneTimeOfferId && recurrentOfferId && !sessionData) {
      setSessionData({
        id: sessionId,
        leadId: leadId,
        oneTimeOfferId: oneTimeOfferId,
        recurrentOfferId: recurrentOfferId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: "OPEN"
      })
    }
  }, [sessionId, leadId, oneTimeOfferId, recurrentOfferId, sessionData])
  
  // Handler para mudanças no formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  // Função para criar uma sessão
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.salesforceLeadId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para criar a sessão",
        variant: "destructive"
      })
      return
    }
    
    setIsCreatingSession(true)
    
    try {
      const session = await createSession(formData)
      setSessionData(session)
      
      // Formatar a resposta da API para exibição
      const formattedResponse = JSON.stringify(session, null, 2)
      setSessionDetails(formattedResponse)
      setShowOfferDetails(true)
      setActiveDetail("session")
      
      // Salvar a sessão no arquivo sessions.json
      try {
        await fetch('/api/save-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(session),
        });
        console.log('Sessão salva em sessions.json');
      } catch (saveError) {
        console.error('Erro ao salvar sessão:', saveError);
      }
      
      toast({
        title: "Sessão criada",
        description: "Sessão criada com sucesso"
      })
    } catch (error) {
      console.error("Erro ao criar sessão:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar a sessão. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsCreatingSession(false)
    }
  }
  
  // Função para carregar detalhes da oferta one-time
  const handleShowOneTimeOffer = async () => {
    if (!sessionData) {
      toast({
        title: "Sessão não encontrada",
        description: "Crie uma sessão primeiro para ver os detalhes da oferta.",
        variant: "destructive"
      })
      return
    }
    
    try {
      const offer = await getOfferById(sessionData.oneTimeOfferId)
      setOneTimeOfferDetails(JSON.stringify(offer, null, 2))
      setShowOfferDetails(true)
      setActiveDetail("one-time")
    } catch (error) {
      console.error("Erro ao carregar oferta one-time:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da oferta one-time.",
        variant: "destructive"
      })
    }
  }
  
  // Função para carregar detalhes da oferta recorrente
  const handleShowRecurrentOffer = async () => {
    if (!sessionData) {
      toast({
        title: "Sessão não encontrada",
        description: "Crie uma sessão primeiro para ver os detalhes da oferta.",
        variant: "destructive"
      })
      return
    }
    
    try {
      const offer = await getOfferById(sessionData.recurrentOfferId)
      setRecurrentOfferDetails(JSON.stringify(offer, null, 2))
      setShowOfferDetails(true)
      setActiveDetail("recurrent")
    } catch (error) {
      console.error("Erro ao carregar oferta recorrente:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da oferta recorrente.",
        variant: "destructive"
      })
    }
  }
  
  // Função para carregar detalhes da sessão
  const handleShowSession = async () => {
    if (!sessionData) {
      toast({
        title: "Sessão não encontrada",
        description: "Crie uma sessão primeiro para ver os detalhes.",
        variant: "destructive"
      })
      return
    }
    
    try {
      const session = await getSessionById(sessionData.id)
      setSessionDetails(JSON.stringify(session, null, 2))
      setShowOfferDetails(true)
      setActiveDetail("session")
    } catch (error) {
      console.error("Erro ao carregar sessão:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os detalhes da sessão.",
        variant: "destructive"
      })
    }
  }
  
  // Função para finalizar a sessão
  const handleCloseSession = async () => {
    if (!sessionData) {
      toast({
        title: "Sessão não encontrada",
        description: "Crie uma sessão primeiro para finalizá-la.",
        variant: "destructive"
      })
      return
    }
    
    setIsClosingSession(true)
    
    try {
      // Utilizando a rota correta conforme a documentação e adicionando body vazio
      const response = await fetch(`/api/sales/sessions/${sessionData.id}/close`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({}) // Adicionando body vazio para resolver INVALID_JSON
      })
      
      if (!response.ok) {
        throw new Error(`Erro ao finalizar sessão: ${response.status}`)
      }
      
      const session = await response.json()
      
      // Atualizar o sessionData para refletir que a sessão foi fechada
      setSessionData(prevData => ({
        ...prevData!,
        status: "CLOSED"
      }))
      
      toast({
        title: "Sessão finalizada",
        description: "A sessão foi finalizada com sucesso."
      })
      
      // Mostrar os detalhes da sessão atualizada
      setSessionDetails(JSON.stringify(session, null, 2))
      setShowOfferDetails(true)
      setActiveDetail("session")
    } catch (error) {
      console.error("Erro ao finalizar sessão:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível finalizar a sessão.",
        variant: "destructive"
      })
    } finally {
      setIsClosingSession(false)
    }
  }
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Criar Oferta</h1>
        <p className="text-muted-foreground">
          Adicione produtos às ofertas de pagamento único e recorrente
        </p>
      </div>
      
      {!sessionData ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Criar Sessão</CardTitle>
            <CardDescription>
              Preencha os dados do lead para criar uma sessão e iniciar a criação da oferta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Lead *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nome completo do lead"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="salesforceLeadId">ID do Lead no Salesforce *</Label>
                  <Input
                    id="salesforceLeadId"
                    name="salesforceLeadId"
                    value={formData.salesforceLeadId}
                    onChange={handleChange}
                    placeholder="ID do lead no Salesforce"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isCreatingSession}>
                  {isCreatingSession ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Criando...
                    </>
                  ) : (
                    "Criar Sessão"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-8">
            <CreateOneTimeOffer 
              sessionId={sessionData.id} 
              offerId={sessionData.oneTimeOfferId} 
              leadId={sessionData.leadId} 
            />
            
            <CreateRecurrentOffer 
              sessionId={sessionData.id} 
              offerId={sessionData.recurrentOfferId} 
              leadId={sessionData.leadId} 
            />
          </div>
          
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Informações da Sessão</CardTitle>
              <CardDescription>
                Visualize detalhes das ofertas e finalize a sessão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-6">
                <Button 
                  onClick={handleShowOneTimeOffer} 
                  variant={activeDetail === "one-time" ? "default" : "outline"}
                  className={activeDetail === "one-time" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                >
                  Exibir One Time
                </Button>
                <Button 
                  onClick={handleShowRecurrentOffer} 
                  variant={activeDetail === "recurrent" ? "default" : "outline"}
                  className={activeDetail === "recurrent" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                >
                  Exibir Recorrente
                </Button>
                <Button 
                  onClick={handleShowSession} 
                  variant={activeDetail === "session" ? "default" : "outline"}
                  className={activeDetail === "session" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                >
                  Exibir Session
                </Button>
                <Button 
                  onClick={handleCloseSession} 
                  disabled={isClosingSession || sessionData?.status === "CLOSED"}
                  className="ml-auto"
                  variant="destructive"
                >
                  {isClosingSession ? "Finalizando..." : sessionData?.status === "CLOSED" ? "Sessão finalizada" : "Finalizar sessão"}
                </Button>
              </div>
              
              {showOfferDetails && (
                <div className="space-y-4">
                  {activeDetail === "one-time" && oneTimeOfferDetails && (
                    <div>
                      <h3 className="font-medium mb-2">Detalhes da Oferta Única</h3>
                      <Textarea 
                        value={oneTimeOfferDetails} 
                        readOnly 
                        className="font-mono text-xs h-60"
                      />
                    </div>
                  )}
                  
                  {activeDetail === "recurrent" && recurrentOfferDetails && (
                    <div>
                      <h3 className="font-medium mb-2">Detalhes da Oferta Recorrente</h3>
                      <Textarea 
                        value={recurrentOfferDetails} 
                        readOnly 
                        className="font-mono text-xs h-60"
                      />
                    </div>
                  )}
                  
                  {activeDetail === "session" && sessionDetails && (
                    <div>
                      <h3 className="font-medium mb-2">Detalhes da Sessão</h3>
                      <Textarea 
                        value={sessionDetails} 
                        readOnly 
                        className="font-mono text-xs h-60"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default function CreateOfferPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-6">Carregando...</div>}>
      <CreateOfferContent />
    </Suspense>
  )
} 