"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Trash2, FileText, Eye } from "lucide-react"
import {
  getProductById,
  deleteProductDeliverable,
  getCurrencies,
  getModifierTypes,
  getCategories,
  getProductOffers,
  type Product,
  type Currency,
  type ModifierType,
  type Category,
  type Offer,
} from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import React from "react"

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [modifierTypes, setModifierTypes] = useState<ModifierType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const formatCurrency = (amount: number, currencyId: string) => {
    const currency = currencies.find((c) => c.id === currencyId)
    return currency 
      ? `${currency.symbol} ${amount.toFixed(2)}`
      : `${amount.toFixed(2)}`
  }

  const getCurrencyName = (currencyId: string) => {
    const currency = currencies.find((c) => c.id === currencyId)
    return currency?.name || 'N/A'
  }

  const getModifierName = (modifierTypeId: string | null) => {
    if (!modifierTypeId) return 'Padrão'
    const modifier = modifierTypes.find((m) => m.key === modifierTypeId)
    return modifier?.displayName || 'N/A'
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [productData, currenciesData, modifierTypesData, categoriesData, offersData] = await Promise.all([
          getProductById(id),
          getCurrencies(),
          getModifierTypes(),
          getCategories(),
          getProductOffers(id),
        ])
        setProduct(productData)
        setCurrencies(currenciesData)
        setModifierTypes(modifierTypesData)
        setCategories(categoriesData)
        setOffers(offersData)
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes do produto.",
          variant: "destructive",
        })
        router.push("/dashboard/products")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, router, toast])

  const handleDeleteDeliverable = async (deliverableId: string) => {
    if (!product) return

    try {
      await deleteProductDeliverable(product.id, deliverableId)

      // Atualiza o estado local removendo o entregável
      setProduct({
        ...product,
        deliverables: product.deliverables.filter((d) => d.id !== deliverableId),
      })

      toast({
        title: "Sucesso",
        description: "Entregável removido com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o entregável.",
        variant: "destructive",
      })
    }
  }

  const getModifierById = (id: string | null) => {
    if (!id) return null
    return modifierTypes.find((m) => m.key === id)
  }

  const formatPrice = (price: { amount: number; currencyId: string; modifierTypeId: string | null }) => {
    const currency = currencies.find((c) => c.id === price.currencyId)
    const symbol = currency ? currency.symbol : ""
    return `${symbol} ${price.amount.toFixed(2)}`
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.name : categoryId
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-2">Produto não encontrado</h2>
        <Button onClick={() => router.push("/dashboard/products")}>Voltar para a lista</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/products")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <div className="ml-auto">
          <Button
            variant="outline"
            className="mr-2"
            onClick={() => router.push(`/dashboard/products/${product.id}/contract`)}
          >
            <FileText className="mr-2 h-4 w-4" />
            Gerar Contrato
          </Button>
          <Button onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detalhes do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
                  <p className="text-sm">{product.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge variant={product.status === "ACTIVE" ? "default" : "secondary"}>
                    {product.status === "ACTIVE" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Descrição</h3>
                <p className="text-sm">{product.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tipo</h3>
                  <p className="text-sm">{product.productType === "ONE_TIME" ? "Único" : "Recorrente"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Item Único</h3>
                  <p className="text-sm">{product.singleItemOnly ? "Sim" : "Não"}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Categoria</h3>
                <p className="text-sm">{getCategoryName(product.categoryId)}</p>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Criado por</h3>
                <p className="text-sm">{product.createdBy}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Criado em</h3>
                  <p className="text-sm">{new Date(product.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Atualizado em</h3>
                  <p className="text-sm">{new Date(product.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preços</CardTitle>
          </CardHeader>
          <CardContent>
            {product?.prices && product.prices.length > 0 ? (
              <div className="space-y-4">
                {product.prices.map((price, index) => (
                  <div key={index} className="border p-4 rounded-lg">
                    <div className="grid gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Valor:</span>
                        <span className="text-lg font-semibold">{formatCurrency(price.amount, price.currencyId)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Moeda:</span>
                        <span>{getCurrencyName(price.currencyId)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Tipo:</span>
                        <Badge variant="secondary">{getModifierName(price.modifierTypeId)}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground italic">Nenhum preço registrado</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deliverables">
        <TabsList>
          <TabsTrigger value="deliverables">Entregáveis</TabsTrigger>
          <TabsTrigger value="guidelines">Diretrizes</TabsTrigger>
          <TabsTrigger value="offers">Ofertas</TabsTrigger>
        </TabsList>
        <TabsContent value="deliverables">
          <Card>
            <CardHeader>
              <CardTitle>Entregáveis</CardTitle>
            </CardHeader>
            <CardContent>
              {product.deliverables.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum entregável associado a este produto.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.deliverables.map((deliverable) => (
                      <TableRow key={deliverable.id}>
                        <TableCell className="font-medium">{deliverable.name}</TableCell>
                        <TableCell>{deliverable.description}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Remover</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover entregável</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover este entregável do produto? Esta ação não pode ser
                                  desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteDeliverable(deliverable.id)}>
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="guidelines">
          <Card>
            <CardHeader>
              <CardTitle>Diretrizes</CardTitle>
              <p className="text-sm text-muted-foreground">
                Diretrizes são pré-existentes e não podem ser modificadas no backoffice.
              </p>
            </CardHeader>
            <CardContent>
              {product.guidelines.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma diretriz associada a este produto.</p>
              ) : (
                <div className="space-y-4">
                  {product.guidelines.map((guideline) => (
                    <div key={guideline.id} className="rounded-lg border p-4">
                      <h4 className="font-medium">{guideline.name}</h4>
                      <p className="mt-1 text-sm text-muted-foreground">{guideline.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="offers">
          <Card>
            <CardHeader>
              <CardTitle>Ofertas</CardTitle>
              <p className="text-sm text-muted-foreground">
                Lista de ofertas que incluem este produto.
              </p>
            </CardHeader>
            <CardContent>
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
                  {offers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhuma oferta encontrada para este produto.
                      </TableCell>
                    </TableRow>
                  ) : (
                    offers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell className="font-medium">{offer.id}</TableCell>
                        <TableCell>{offer.leadName}</TableCell>
                        <TableCell>
                          <Badge variant={offer.status === "CONVERTED" ? "default" : "secondary"}>
                            {offer.status === "CONVERTED" ? "Convertido" : "Em Aberto"}
                          </Badge>
                        </TableCell>
                        <TableCell>{offer.type === "ONE_TIME" ? "Único" : "Recorrente"}</TableCell>
                        <TableCell>R$ {offer.subtotal.toFixed(2)}</TableCell>
                        <TableCell>R$ {offer.total.toFixed(2)}</TableCell>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
