"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Trash2, Info } from "lucide-react"
import {
  getProductById,
  updateProduct,
  getCategories,
  getCurrencies,
  getDeliverables,
  getModifierTypes,
  type Product,
  type Category,
  type Currency,
  type Deliverable,
  type Guideline,
  type ModifierType,
} from "@/lib/catalog-api"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Função auxiliar para calcular o preço ajustado com base no tipo de modificador
function calculateAdjustedPrice(basePrice: number, modifierTypeId: string | null): number | null {
  if (!modifierTypeId) return null;
  
  // Implementação simplificada - em produção, deve usar dados do modificador
  return basePrice;
}

export default function EditProductPage() {
  const params = useParams();
  const productId = params?.id as string;
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [availableDeliverables, setAvailableDeliverables] = useState<Deliverable[]>([])
  const [availableGuidelines, setAvailableGuidelines] = useState<Guideline[]>([])
  const [modifierTypes, setModifierTypes] = useState<ModifierType[]>([])
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    paymentType: "ONE_TIME",
    status: "ACTIVE",
    singleItemOnly: false,
    categoryId: "",
    prices: [{ amount: 0, currencyId: "", modifierTypeId: null }],
  })
  const [selectedDeliverables, setSelectedDeliverables] = useState<
    Array<{
      id: string
      quantity: number
    }>
  >([])
  const [selectedGuidelineIds, setSelectedGuidelineIds] = useState<string[]>([])
  const [adjustedPrice, setAdjustedPrice] = useState<number | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const [productData, categoriesData, currenciesData, deliverablesData, modifierTypesData] =
          await Promise.all([
            getProductById(productId),
            getCategories(),
            getCurrencies(),
            getDeliverables(),
            getModifierTypes(),
          ])
        setProduct(productData)
        setCategories(categoriesData)
        setCurrencies(currenciesData)
        setAvailableDeliverables(deliverablesData)
        setModifierTypes(modifierTypesData)

        // Usar as diretrizes do próprio produto como disponíveis
        if (productData.guidelines) {
          setAvailableGuidelines(productData.guidelines)
        }

        // Inicializar o formulário com os dados do produto
        setFormData({
          name: productData.name,
          description: productData.description,
          paymentType: productData.paymentType,
          status: productData.status,
          singleItemOnly: productData.singleItemOnly,
          categoryId: productData.categoryId,
          prices:
            productData.prices.length > 0 ? productData.prices : [{ amount: 0, currencyId: "", modifierTypeId: null }],
        })

        // Inicializar entregáveis
        if (productData.deliverables && productData.deliverables.length > 0) {
          // Extrair quantidade da descrição se existir
          const parsedDeliverables = productData.deliverables.map((d) => {
            const quantityMatch = d.description?.match(/Quantidade: (\d+)/)
            const quantity = quantityMatch ? Number.parseInt(quantityMatch[1]) : 1

            return {
              id: d.id,
              quantity: quantity,
            }
          })
          setSelectedDeliverables(parsedDeliverables)
        } else {
          setSelectedDeliverables([{ id: "", quantity: 1 }])
        }

        // Inicializar diretrizes selecionadas
        if (productData.guidelines && productData.guidelines.length > 0) {
          setSelectedGuidelineIds(productData.guidelines.map((g) => g.id))
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
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
  }, [productId, router, toast])

  // Calculate adjusted price when base price or modifier changes
  useEffect(() => {
    if (formData.prices && formData.prices[0]?.amount && formData.prices[0]?.modifierTypeId) {
      const basePrice = Number(formData.prices[0].amount)
      const modifierId = formData.prices[0].modifierTypeId
      const adjusted = calculateAdjustedPrice(basePrice, modifierId)
      setAdjustedPrice(adjusted)
    } else {
      setAdjustedPrice(null)
    }
  }, [formData.prices])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleDeliverableChange = (index: number, field: string, value: string | number) => {
    const updatedDeliverables = [...selectedDeliverables]
    updatedDeliverables[index] = { ...updatedDeliverables[index], [field]: value }
    setSelectedDeliverables(updatedDeliverables)
  }

  const addDeliverable = () => {
    setSelectedDeliverables([...selectedDeliverables, { id: "", quantity: 1 }])
  }

  const removeDeliverable = (index: number) => {
    const updatedDeliverables = [...selectedDeliverables]
    updatedDeliverables.splice(index, 1)
    setSelectedDeliverables(updatedDeliverables)
  }

  const getDeliverableById = (id: string) => {
    return availableDeliverables.find((d) => d.id === id)
  }

  const handleGuidelineToggle = (guidelineId: string) => {
    setSelectedGuidelineIds((prev) => {
      if (prev.includes(guidelineId)) {
        return prev.filter((id) => id !== guidelineId)
      } else {
        return [...prev, guidelineId]
      }
    })
  }

  const getModifierById = (id: string | null) => {
    if (!id) return null
    return modifierTypes.find((m) => m.key === id)
  }

  const getModifierDescription = (id: string | null) => {
    const modifier = getModifierById(id)
    return modifier?.description || "Nenhuma restrição aplicada"
  }

  const checkModifierRestrictions = (currencyId: string, modifierTypeId: string | null): boolean => {
    // Esta função verificaria restrições entre modificadores e moedas
    // Implementação simplificada - em produção, deve verificar regras reais
    
    // Por exemplo, poderia verificar se o modificador XYZ só é aplicável para BRL, mas não USD
    return true
  }

  const handlePriceChange = (index: number, field: string, value: any) => {
    const updatedPrices = [...(formData.prices || [])]
    updatedPrices[index] = { ...updatedPrices[index], [field]: value }
    
    // Se trocar a moeda, verificar e limpar o modificador se for incompatível
    if (field === 'currencyId' && updatedPrices[index].modifierTypeId) {
      const isValid = checkModifierRestrictions(value, updatedPrices[index].modifierTypeId)
      if (!isValid) {
        updatedPrices[index].modifierTypeId = null
      }
    }
    
    setFormData((prev) => ({ ...prev, prices: updatedPrices }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
      // Verificar campos obrigatórios
      if (!formData.name || !formData.description || !formData.categoryId) {
        toast({
          title: "Erro de validação",
          description: "Preencha todos os campos obrigatórios.",
          variant: "destructive",
        })
        setSaving(false)
        return
      }
      
      // Preparar dados do produto para envio
      const productData: Partial<Product> = {
        ...formData,
        id: productId, // Garantir que o ID está sendo enviado
      }
      
      // Atualizar produto
      await updateProduct(productData as any)
      
      toast({
        title: "Produto atualizado",
        description: "O produto foi atualizado com sucesso.",
      })
      
      // Redirecionar para a página de detalhes do produto
      router.push(`/dashboard/products/${product?.id}`)
    } catch (error) {
      console.error("Erro ao atualizar produto:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o produto.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
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
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Produto não encontrado</h2>
          <Button onClick={() => router.push("/dashboard/products")}>Voltar para Produtos</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center">
        <Button variant="outline" size="icon" onClick={() => router.push(`/dashboard/products/${productId}`)}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="text-2xl font-bold ml-4">Editar Produto</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Digite o nome do produto"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoria *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleSelectChange("categoryId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Digite a descrição do produto"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Pagamento</Label>
                <RadioGroup
                  value={formData.paymentType}
                  onValueChange={(value) => handleSelectChange("paymentType", value)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ONE_TIME" id="payment-one-time" />
                    <Label htmlFor="payment-one-time">Pagamento Único</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="RECURRING" id="payment-recurring" />
                    <Label htmlFor="payment-recurring">Recorrente</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <RadioGroup
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ACTIVE" id="status-active" />
                    <Label htmlFor="status-active">Ativo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="INACTIVE" id="status-inactive" />
                    <Label htmlFor="status-inactive">Inativo</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="singleItemOnly"
                checked={formData.singleItemOnly}
                onCheckedChange={(checked) => handleSwitchChange("singleItemOnly", checked)}
              />
              <Label htmlFor="singleItemOnly">Apenas um item por pedido</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Quando ativado, apenas um item deste produto pode ser adicionado por pedido.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/products/${productId}`)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <span className="animate-spin mr-1">◌</span>Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 