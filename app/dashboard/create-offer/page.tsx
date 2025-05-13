"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { createSession } from "@/lib/api-client"
import { CreateOneTimeOffer } from "./components/create-one-time-offer"
import { CreateRecurrentOffer } from "./components/create-recurrent-offer"

export default function CreateOfferPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [sessionData, setSessionData] = useState<{
    id: string;
    leadId: string;
    oneTimeOfferId: string;
    recurrentOfferId: string;
    expiresAt: string;
    createdAt?: string;
    updatedAt?: string;
  } | null>(null)
  const [apiResponse, setApiResponse] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    salesforceLeadId: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

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
    
    setLoading(true)
    
    try {
      const session = await createSession(formData)
      setSessionData(session)
      
      // Formatar a resposta da API para exibição
      const formattedResponse = JSON.stringify(session, null, 2)
      setApiResponse(formattedResponse)
      
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
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Criar Oferta</h1>
      
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
              <Button type="submit" disabled={loading || !!sessionData}>
                {loading ? (
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
          
          {apiResponse && (
            <div className="mt-6">
              <Label className="text-lg font-semibold">Resposta da API (conforme documentação):</Label>
              <div className="flex flex-col md:flex-row gap-4 mt-2">
                <div className="p-4 bg-slate-50 rounded-md overflow-auto max-h-80 border border-slate-200 flex-1">
                  <div className="flex items-center mb-2 text-sm text-slate-500">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded mr-2">200</span>
                    <span>POST /sessions</span>
                  </div>
                  <pre className="text-sm font-mono">{apiResponse}</pre>
                </div>
                <div className="p-4 bg-blue-50 rounded-md border border-blue-100 max-w-md flex-shrink-0">
                  <h3 className="text-sm font-semibold text-blue-700 mb-2">Documentação (Fields)</h3>
                  <ul className="text-xs space-y-1 text-blue-800">
                    <li><span className="font-semibold">id:</span> Identificador único da sessão</li>
                    <li><span className="font-semibold">leadId:</span> Identificador do lead</li>
                    <li><span className="font-semibold">oneTimeOfferId:</span> ID da oferta de pagamento único</li>
                    <li><span className="font-semibold">recurrentOfferId:</span> ID da oferta recorrente</li>
                    <li><span className="font-semibold">expiresAt:</span> Data de expiração</li>
                    <li><span className="font-semibold">createdAt:</span> Data de criação</li>
                    <li><span className="font-semibold">updatedAt:</span> Data da última atualização</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue="one-time" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger 
            value="one-time" 
            disabled={!sessionData}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            One Time
          </TabsTrigger>
          <TabsTrigger 
            value="recurrent" 
            disabled={!sessionData}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Recorrente
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="one-time" className="mt-4">
          {sessionData ? (
            <CreateOneTimeOffer 
              sessionId={sessionData.id} 
              offerId={sessionData.oneTimeOfferId}
              leadId={sessionData.leadId}
            />
          ) : (
            <Card>
              <CardContent className="py-10">
                <p className="text-center text-muted-foreground">
                  Crie uma sessão para habilitar a criação de ofertas
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="recurrent" className="mt-4">
          {sessionData ? (
            <CreateRecurrentOffer 
              sessionId={sessionData.id} 
              offerId={sessionData.recurrentOfferId}
              leadId={sessionData.leadId}
            />
          ) : (
            <Card>
              <CardContent className="py-10">
                <p className="text-center text-muted-foreground">
                  Crie uma sessão para habilitar a criação de ofertas
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 