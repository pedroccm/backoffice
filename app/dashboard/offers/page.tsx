"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, XCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { type Offer } from "@/lib/api-fetch"
import { getAllOffers, formatCurrency } from "@/lib/offers-service"
import { getAllSessionOffers, closeSessionOffer, type SessionOffer } from "@/lib/session-offers-service"

// Interface estendida para incluir leadName nas ofertas
interface OfferWithLeadName extends Offer {
  leadName: string;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<OfferWithLeadName[]>([])
  const [sessionOffers, setSessionOffers] = useState<SessionOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSessionOffers, setLoadingSessionOffers] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [closingSessionId, setClosingSessionId] = useState<string | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [isClosingOffer, setIsClosingOffer] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const offersData = await getAllOffers()
        setOffers(offersData)
      } catch (error) {
        console.error("Erro ao carregar ofertas:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar as ofertas.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    async function loadSessionOffers() {
      try {
        setLoadingSessionOffers(true)
        const sessionOffersData = await getAllSessionOffers()
        setSessionOffers(sessionOffersData)
      } catch (error) {
        console.error("Erro ao carregar ofertas das sessões:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar as ofertas das sessões.",
          variant: "destructive",
        })
      } finally {
        setLoadingSessionOffers(false)
      }
    }

    loadData()
    loadSessionOffers()
  }, [toast])

  const filteredOffers = offers.filter(
    (offer) =>
      offer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.leadName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredSessionOffers = sessionOffers.filter(
    (offer) =>
      offer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.leadId.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCloseOffer = async (sessionId: string) => {
    try {
      setIsClosingOffer(true);
      const success = await closeSessionOffer(sessionId);
      
      if (success) {
        // Atualizar a lista de ofertas
        const updatedSessionOffers = sessionOffers.map((offer) => {
          if (offer.sessionId === sessionId) {
            return { ...offer, status: "CLOSED" };
          }
          return offer;
        });
        setSessionOffers(updatedSessionOffers);
        
        toast({
          title: "Sucesso",
          description: "Oferta fechada com sucesso.",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível fechar a oferta.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao fechar oferta:", error);
      toast({
        title: "Erro",
        description: "Erro ao fechar a oferta.",
        variant: "destructive",
      });
    } finally {
      setIsClosingOffer(false);
      setIsConfirmDialogOpen(false);
      setClosingSessionId(null);
    }
  };

  const openConfirmDialog = (sessionId: string) => {
    setClosingSessionId(sessionId);
    setIsConfirmDialogOpen(true);
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ofertas</h1>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar ofertas..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="sessionOffers">
        <TabsList className="mb-4">
          <TabsTrigger value="sessionOffers">Ofertas de Sessões</TabsTrigger>
          <TabsTrigger value="allOffers">Todas as Ofertas</TabsTrigger>
        </TabsList>

        <TabsContent value="sessionOffers">
          <Card>
            <CardHeader>
              <CardTitle>Ofertas de Sessões</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSessionOffers ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID da Oferta</TableHead>
                          <TableHead>Sessão</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Subtotal</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Data de Criação</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSessionOffers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              Nenhuma oferta de sessão encontrada.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSessionOffers.map((offer) => (
                            <TableRow key={offer.id}>
                              <TableCell className="font-medium">{offer.id.substring(0, 8)}...</TableCell>
                              <TableCell className="font-mono text-xs">{offer.sessionId.substring(0, 8)}...</TableCell>
                              <TableCell>
                                <Badge variant={offer.offerType === "ONE_TIME" ? "outline" : "secondary"}>
                                  {offer.offerType === "ONE_TIME" ? "Único" : "Recorrente"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={offer.status === "CONVERTED" ? "default" : offer.status === "CLOSED" ? "destructive" : "secondary"}>
                                  {offer.status === "CONVERTED" 
                                    ? "Convertido" 
                                    : offer.status === "CLOSED"
                                    ? "Fechado"
                                    : "Em Aberto"}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatCurrency(offer.subtotalPrice)}</TableCell>
                              <TableCell>{formatCurrency(offer.totalPrice)}</TableCell>
                              <TableCell>{new Date(offer.createdAt).toLocaleString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.push(`/dashboard/offers/${offer.id}`)}
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">Ver Detalhes</span>
                                  </Button>
                                  
                                  {offer.status !== "CLOSED" && offer.status !== "CONVERTED" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => openConfirmDialog(offer.sessionId)}
                                    >
                                      <XCircle className="h-4 w-4 text-destructive" />
                                      <span className="sr-only">Fechar Oferta</span>
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allOffers">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Ofertas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID da Oferta</TableHead>
                          <TableHead>Lead</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Subtotal</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Data de Criação</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOffers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                              Nenhuma oferta encontrada.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredOffers.map((offer) => (
                            <TableRow key={offer.id}>
                              <TableCell className="font-medium">{offer.id.substring(0, 8)}...</TableCell>
                              <TableCell>{offer.leadName}</TableCell>
                              <TableCell>
                                <Badge variant={offer.status === "CONVERTED" ? "default" : "secondary"}>
                                  {offer.status === "CONVERTED" ? "Convertido" : "Em Aberto"}
                                </Badge>
                              </TableCell>
                              <TableCell>{offer.type === "ONE_TIME" ? "Único" : "Recorrente"}</TableCell>
                              <TableCell>{formatCurrency(offer.subtotalPrice)}</TableCell>
                              <TableCell>{formatCurrency(offer.totalPrice)}</TableCell>
                              <TableCell>{new Date(offer.createdAt).toLocaleString()}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => router.push(`/dashboard/offers/${offer.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">Ver Detalhes</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de confirmação */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar fechamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja fechar esta oferta? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isClosingOffer}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => closingSessionId && handleCloseOffer(closingSessionId)}
              disabled={isClosingOffer}
            >
              {isClosingOffer ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Fechando...
                </>
              ) : (
                "Fechar oferta"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 