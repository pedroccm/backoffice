"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Trash2, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { 
  getProductById, 
  getCurrencies, 
  getDeliverables, 
  getModifierTypes,
  deleteProductPrice,
  deleteProductDeliverable,
  deleteProductGuideline
} from "@/lib/catalog-api"
import type { Product, Currency, Deliverable, ModifierType } from "@/lib/catalog-api"
import { AddPriceDialog } from "@/components/product/AddPriceDialog"
import { AddDeliverableDialog } from "@/components/product/AddDeliverableDialog"
import { AddGuidelineDialog } from "@/components/product/AddGuidelineDialog"

export default function ProductDetailsPage() {
  const params = useParams()
  const productId = params?.id as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [modifierTypes, setModifierTypes] = useState<ModifierType[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Função para buscar todos os dados necessários
  async function loadData() {
    try {
      setLoading(true)
      const [productData, currenciesData, deliverablesData, modifierTypesData] = await Promise.all([
        getProductById(productId),
        getCurrencies(),
        getDeliverables(),
        getModifierTypes()
      ])
      setProduct(productData)
      setCurrencies(currenciesData)
      setDeliverables(deliverablesData)
      setModifierTypes(modifierTypesData)
    } catch (error) {
      console.error('Erro ao carregar dados do produto:', error)
      toast({
        variant: "destructive",
        title: "Erro ao carregar produto",
        description: "Não foi possível obter os detalhes do produto."
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId) {
      loadData()
    } else {
      setLoading(false)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "ID do produto não encontrado."
      })
    }
  }, [productId, toast])

  // Adicionar log para verificar a estrutura dos dados
  useEffect(() => {
    if (product && deliverables.length > 0) {
      console.log('Produto carregado:', product);
      console.log('Entregáveis do produto:', product.deliverables);
      console.log('Lista de entregáveis disponíveis:', deliverables);
    }
  }, [product, deliverables]);

  const getCurrencySymbol = (currencyId: string): string => {
    const currency = currencies.find(c => c.id === currencyId)
    return currency?.symbol || ""
  }

  const getModifierName = (modifierTypeId: string | null): string => {
    if (!modifierTypeId) return "Nenhum"
    const modifier = modifierTypes.find(m => m.id === modifierTypeId || m.key === modifierTypeId)
    return modifier?.displayName || "Nenhum"
  }

  const getDeliverableName = (deliverableId: string): string => {
    // Log para debug
    console.log('Buscando entregável com ID:', deliverableId);
    
    // Verificar se a lista de entregáveis está carregada
    if (!deliverables || deliverables.length === 0) {
      console.log('Lista de entregáveis vazia ou não carregada');
      return deliverableId;
    }
    
    // Tentar encontrar o entregável pelo ID
    const deliverable = deliverables.find(d => d.id === deliverableId);
    console.log('Entregável encontrado:', deliverable);
    
    // Se encontrado, retornar o nome, caso contrário retornar o ID
    if (deliverable && deliverable.name) {
      return deliverable.name;
    }
    
    // Se não encontrou, verificar se o objeto de entregável já é o objeto completo 
    // (pode ocorrer dependendo de como a API retorna os dados)
    if (typeof deliverableId === 'object' && (deliverableId as any).name) {
      return (deliverableId as any).name;
    }
    
    return deliverableId;
  }

  // Funções para lidar com remoção de itens
  const handleDeletePrice = async (priceId: string) => {
    try {
      if (!product) return
      
      await deleteProductPrice(product.id, priceId)
      toast({
        title: "Preço removido",
        description: "O preço foi removido com sucesso."
      })
      loadData() // Recarregar dados
    } catch (error) {
      console.error("Erro ao remover preço:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover o preço."
      })
    }
  }

  const handleDeleteDeliverable = async (deliverableId: string) => {
    try {
      if (!product) return
      
      console.log(`Tentando remover entregável ${deliverableId} do produto ${product.id}`);
      
      const result = await deleteProductDeliverable(product.id, deliverableId);
      console.log('Resposta da API:', result);
      
      toast({
        title: "Entregável removido",
        description: "O entregável foi removido com sucesso."
      });
      
      // Recarregar dados após um breve atraso para garantir que o servidor tenha processado a exclusão
      setTimeout(() => {
        loadData();
      }, 500);
    } catch (error) {
      console.error("Erro ao remover entregável:", error);
      
      // Detalhar o erro se possível
      let errorMessage = "Não foi possível remover o entregável.";
      if (error instanceof Error) {
        errorMessage += ` Detalhes: ${error.message}`;
      }
      
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage
      });
    }
  }

  const handleDeleteGuideline = async (guidelineId: string) => {
    try {
      if (!product) return
      
      await deleteProductGuideline(product.id, guidelineId)
      toast({
        title: "Diretriz removida",
        description: "A diretriz foi removida com sucesso."
      })
      loadData() // Recarregar dados
    } catch (error) {
      console.error("Erro ao remover diretriz:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover a diretriz."
      })
    }
  }

  // Função para navegar para a página de edição
  const handleEditProduct = () => {
    router.push(`/dashboard/products/${productId}/edit`)
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
        <Button onClick={() => router.push("/dashboard/catalog")}>Voltar para o catálogo</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/catalog")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="text-3xl font-bold">Detalhes do Produto</h1>
        <Button className="ml-auto" onClick={handleEditProduct}>
          <Edit className="mr-2 h-4 w-4" />
          Editar Produto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Nome</dt>
                <dd className="text-lg">{product.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant={product.status === "ACTIVE" ? "default" : "outline"}>
                    {product.status === "ACTIVE" ? "Ativo" : "Inativo"}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Tipo de Pagamento</dt>
                <dd>
                  <Badge variant="secondary">
                    {product.paymentType === "ONE_TIME" ? "Único" : "Recorrente"}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Item Único</dt>
                <dd>{product.singleItemOnly ? "Sim" : "Não"}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Descrição</dt>
                <dd className="mt-1">{product.description}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Criado em</dt>
                <dd>{new Date(product.createdAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Última atualização</dt>
                <dd>{new Date(product.updatedAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="prices">
        <TabsList>
          <TabsTrigger value="prices">Preços</TabsTrigger>
          <TabsTrigger value="deliverables">Entregáveis</TabsTrigger>
          <TabsTrigger value="guidelines">Diretrizes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Preços</CardTitle>
              <AddPriceDialog 
                productId={product.id} 
                currencies={currencies} 
                modifierTypes={modifierTypes} 
                onPriceAdded={loadData} 
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Moeda</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Modificador</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.prices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Nenhum preço definido
                      </TableCell>
                    </TableRow>
                  ) : (
                    product.prices.map((price, index) => (
                      <TableRow key={index}>
                        <TableCell>{getCurrencySymbol(price.currencyId)}</TableCell>
                        <TableCell>{price.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell>{getModifierName(price.modifierTypeId)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => price.id && handleDeletePrice(price.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
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
        
        <TabsContent value="deliverables">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Entregáveis</CardTitle>
              <AddDeliverableDialog 
                productId={product.id} 
                deliverables={deliverables} 
                onDeliverableAdded={loadData} 
              />
            </CardHeader>
            <CardContent>
              {deliverables.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Carregando entregáveis...
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.deliverables.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-4">
                          Nenhum entregável definido
                        </TableCell>
                      </TableRow>
                    ) : (
                      product.deliverables.map((deliverable) => (
                        <TableRow key={deliverable.id}>
                          <TableCell className="font-medium">
                            {getDeliverableName(deliverable.id)}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteDeliverable(deliverable.id)}
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="guidelines">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Diretrizes</CardTitle>
              <AddGuidelineDialog 
                productId={product.id} 
                onGuidelineAdded={loadData} 
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {product.guidelines.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        Nenhuma diretriz definida
                      </TableCell>
                    </TableRow>
                  ) : (
                    product.guidelines.map((guideline) => (
                      <TableRow key={guideline.id}>
                        <TableCell className="font-medium">{guideline.name}</TableCell>
                        <TableCell>{guideline.description}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteGuideline(guideline.id)}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
