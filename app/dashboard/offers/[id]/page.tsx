"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Trash2, FileText, LinkIcon } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { 
  getProductById as fetchProductById, 
  getProducts, 
  type Offer, 
  type Product,
  type OfferItem
} from "@/lib/api-fetch"
import { getOfferWithLeadDetails, formatCurrency } from "@/lib/offers-service"
import { addItemToOffer, removeItemFromOffer } from "@/lib/api-fetch"
import { getSessions } from "@/lib/session-offers-service"

// Interface estendida para detalhes da oferta
interface OfferWithLeadName extends Offer {
  leadName: string;
}

// Interface para o resultado da sessão
interface Session {
  id: string;
  leadId: string;
  oneTimeOfferId: string;
  recurrentOfferId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [offer, setOffer] = useState<OfferWithLeadName | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [relatedSession, setRelatedSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingSession, setLoadingSession] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [selectedPrice, setSelectedPrice] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const [offerData, productsData] = await Promise.all([
          getOfferWithLeadDetails(id), 
          getProducts()
        ])
        setOffer(offerData)
        setProducts(productsData)
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes da oferta.",
          variant: "destructive",
        })
        router.push("/dashboard/offers")
      } finally {
        setLoading(false)
      }
    }

    async function findRelatedSession() {
      try {
        setLoadingSession(true)
        const sessions = await getSessions()
        const session = sessions.find(
          s => s.oneTimeOfferId === id || s.recurrentOfferId === id
        )
        
        if (session) {
          setRelatedSession(session)
        }
      } catch (error) {
        console.error("Erro ao buscar sessão relacionada:", error)
      } finally {
        setLoadingSession(false)
      }
    }

    loadData()
    findRelatedSession()
  }, [id, router, toast])

  const offerTypeInSession = React.useMemo(() => {
    if (!relatedSession) return null
    if (relatedSession.oneTimeOfferId === id) return "ONE_TIME"
    if (relatedSession.recurrentOfferId === id) return "RECURRENT"
    return null
  }, [relatedSession, id])

  const handleAddProduct = async () => {
    if (!selectedProduct || !selectedPrice || !quantity) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedOffer = await addItemToOffer({
        offerId: id,
        productId: selectedProduct,
        priceId: selectedPrice,
        quantity: quantity
      })
      
      const updatedOfferWithLeadName = { 
        ...updatedOffer, 
        leadName: offer?.leadName || "Lead não encontrado" 
      }
      
      setOffer(updatedOfferWithLeadName)
      setIsDialogOpen(false)
      toast({
        title: "Sucesso",
        description: "Produto adicionado à oferta com sucesso.",
      })

      // Reset form
      setSelectedProduct("")
      setSelectedPrice("")
      setQuantity(1)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o produto à oferta.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveProduct = async (itemId: string) => {
    try {
      const updatedOffer = await removeItemFromOffer(id, itemId)
      
      const updatedOfferWithLeadName = { 
        ...updatedOffer, 
        leadName: offer?.leadName || "Lead não encontrado" 
      }
      
      setOffer(updatedOfferWithLeadName)
      toast({
        title: "Sucesso",
        description: "Produto removido da oferta com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o produto da oferta.",
        variant: "destructive",
      })
    }
  }

  const getProductById = (productId: string) => {
    return products.find((p) => p.id === productId)
  }

  const navigateToSession = () => {
    if (relatedSession) {
      router.push(`/dashboard/sessions?id=${relatedSession.id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-2">Oferta não encontrada</h2>
        <Button onClick={() => router.push("/dashboard/offers")}>Voltar para a lista</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/offers")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="text-3xl font-bold">Detalhes da Oferta</h1>
      </div>

      {relatedSession && (
        <Card className="bg-muted/20 border-primary/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Sessão Relacionada
              </CardTitle>
              <Button variant="outline" size="sm" onClick={navigateToSession}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Ver Sessão
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">ID da Sessão</h3>
                <p className="text-sm font-mono">{relatedSession.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Tipo da Oferta na Sessão</h3>
                <Badge variant={offerTypeInSession === "ONE_TIME" ? "outline" : "secondary"}>
                  {offerTypeInSession === "ONE_TIME" ? "Única" : "Recorrente"}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Expira em</h3>
                <p className="text-sm">{new Date(relatedSession.expiresAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informações da Oferta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
                <p className="text-sm font-mono">{offer.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <Badge variant={offer.status === "CONVERTED" ? "default" : "secondary"}>
                  {offer.status === "CONVERTED" ? "Convertido" : "Em Aberto"}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Lead</h3>
                <p className="text-sm">{offer.leadName}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">{offer.leadId}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Tipo</h3>
                <p className="text-sm">{offer.type === "ONE_TIME" ? "Único" : "Recorrente"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Subtotal</h3>
                <p className="text-sm">{formatCurrency(offer.subtotalPrice)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total</h3>
                <p className="text-sm">{formatCurrency(offer.totalPrice)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Criado em</h3>
                <p className="text-sm">{new Date(offer.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Atualizado em</h3>
                <p className="text-sm">{new Date(offer.updatedAt).toLocaleString()}</p>
              </div>
            </div>
            {offer.couponId && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Cupom</h3>
                  <p className="text-sm">{offer.couponId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Desconto do Cupom</h3>
                  <p className="text-sm">{offer.couponDiscountPercentage}% ({formatCurrency(offer.couponDiscountTotal || 0)})</p>
                </div>
              </div>
            )}
            {offer.installmentId && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Parcelamento</h3>
                  <p className="text-sm">{offer.installmentMonths}x</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Desconto do Parcelamento</h3>
                  <p className="text-sm">{offer.installmentDiscountPercentage}% ({formatCurrency(offer.installmentDiscountTotal || 0)})</p>
                </div>
              </div>
            )}
            {offer.projectStartDate && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Data de Início do Projeto</h3>
                  <p className="text-sm">{new Date(offer.projectStartDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Data de Início do Pagamento</h3>
                  <p className="text-sm">{offer.paymentStartDate ? new Date(offer.paymentStartDate).toLocaleDateString() : "Não definido"}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Produtos</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Produto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Produto à Oferta</DialogTitle>
                  <DialogDescription>
                    Selecione um produto e defina a quantidade para adicionar à oferta.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="product">Produto</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedProduct && (
                    <div className="grid gap-2">
                      <Label htmlFor="price">Preço</Label>
                      <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um preço" />
                        </SelectTrigger>
                        <SelectContent>
                          {getProductById(selectedProduct)?.prices.map((price, index) => (
                            <SelectItem key={index} value={price.currencyId}>
                              {formatCurrency(price.amount)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleAddProduct}>
                    Adicionar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Preço Unitário</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offer.offerItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum produto adicionado à oferta.
                    </TableCell>
                  </TableRow>
                ) : (
                  offer.offerItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.productId}
                      </TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleRemoveProduct(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remover</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 