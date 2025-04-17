"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
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
  getOfferById,
  getProducts,
  addProductToOffer,
  removeProductFromOffer,
  type Offer,
  type Product,
} from "@/lib/api-client"

export default function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [offer, setOffer] = useState<Offer | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [selectedPrice, setSelectedPrice] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const [offerData, productsData] = await Promise.all([getOfferById(id), getProducts()])
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

    loadData()
  }, [id, router, toast])

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
      const updatedOffer = await addProductToOffer(id, selectedProduct, selectedPrice, quantity)
      setOffer(updatedOffer)
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
      const updatedOffer = await removeProductFromOffer(id, itemId)
      setOffer(updatedOffer)
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

      <Card>
        <CardHeader>
          <CardTitle>Informações da Oferta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
                <p className="text-sm">{offer.id}</p>
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
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Tipo</h3>
                <p className="text-sm">{offer.type === "ONE_TIME" ? "Único" : "Recorrente"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Subtotal</h3>
                <p className="text-sm">R$ {offer.subtotal.toFixed(2)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total</h3>
                <p className="text-sm">R$ {offer.total.toFixed(2)}</p>
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
                          {getProductById(selectedProduct)?.prices.map((price) => (
                            <SelectItem key={price.currencyId} value={price.currencyId}>
                              R$ {price.amount.toFixed(2)}
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
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddProduct}>Adicionar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Preço Unitário</TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offer.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum produto adicionado à oferta.
                  </TableCell>
                </TableRow>
              ) : (
                offer.items.map((item) => {
                  const product = getProductById(item.productId)
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{product?.name || "Produto não encontrado"}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>R$ {item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>R$ {item.lineTotal.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveProduct(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Remover</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 