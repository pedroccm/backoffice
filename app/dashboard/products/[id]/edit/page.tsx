"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  getGuidelines,
  getModifierTypes,
  calculateAdjustedPrice,
  type Product,
  type Category,
  type Currency,
  type Deliverable,
  type Guideline,
  type ModifierType,
} from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
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
    productType: "ONE_TIME",
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
        const [productData, categoriesData, currenciesData, deliverablesData, modifierTypesData, guidelinesData] =
          await Promise.all([
            getProductById(id),
            getCategories(),
            getCurrencies(),
            getDeliverables(),
            getModifierTypes(),
            getGuidelines(),
          ])
        setProduct(productData)
        setCategories(categoriesData)
        setCurrencies(currenciesData)
        setAvailableDeliverables(deliverablesData)
        setModifierTypes(modifierTypesData)
        setAvailableGuidelines(guidelinesData)

        // Inicializar o formulário com os dados do produto
        setFormData({
          name: productData.name,
          description: productData.description,
          productType: productData.productType,
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
            const quantityMatch = d.description.match(/$$Quantidade: (\d+)$$/)
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
    if (!modifier) return ""

    let description = modifier.description

    if (modifier.priceAdjustment) {
      const { type, value } = modifier.priceAdjustment
      if (type === "MULTIPLIER") {
        description += ` (Multiplicador de preço: ${value}x)`
      } else if (type === "FIXED_AMOUNT") {
        description += ` (Adicional fixo: ${value})`
      }
    }

    return description
  }

  const checkModifierRestrictions = (currencyId: string, modifierTypeId: string | null): boolean => {
    if (!modifierTypeId) return true

    const modifierType = modifierTypes.find((m) => m.key === modifierTypeId)
    if (!modifierType || !modifierType.valueRestrictions) return true

    // Check if this currency is restricted
    const isCurrencyRestricted = modifierType.valueRestrictions.restrictedCurrencies?.includes(currencyId)

    // Check if "Essential Training" product is restricted
    const isProductRestricted =
      formData.name === "Essential Training" &&
      modifierType.valueRestrictions.restrictedProducts?.includes("Essential Training")

    // If either condition is true, enforce the maxValues restriction
    if (isCurrencyRestricted || isProductRestricted) {
      // Count how many prices already use this modifier
      const existingCount = formData.prices?.filter((p) => p.modifierTypeId === modifierTypeId).length || 0
      return existingCount < modifierType.valueRestrictions.maxValues
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setSaving(true)

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.categoryId) {
        throw new Error("Por favor, preencha todos os campos obrigatórios")
      }

      if (!formData.prices?.[0]?.amount || !formData.prices?.[0]?.currencyId) {
        throw new Error("Por favor, defina um preço válido e selecione uma moeda")
      }

      if (formData.prices && formData.prices.length > 0) {
        const selectedCurrencyId = formData.prices[0].currencyId
        const selectedModifierTypeId = formData.prices[0].modifierTypeId

        if (!checkModifierRestrictions(selectedCurrencyId, selectedModifierTypeId)) {
          toast({
            title: "Erro de Validação",
            description:
              "Este produto não pode ter mais valores com o modificador selecionado devido às restrições configuradas.",
            variant: "destructive",
          })
          setSaving(false)
          return
        }
      }

      // Filtrar entregáveis vazios
      const validDeliverables = selectedDeliverables.filter((d) => d.id !== "")

      // Formatar entregáveis para o formato esperado pela API
      const formattedDeliverables = validDeliverables.map((d) => {
        const deliverable = getDeliverableById(d.id)
        if (!deliverable) {
          throw new Error(`Entregável com ID ${d.id} não encontrado`)
        }

        return {
          id: d.id,
          name: deliverable.name,
          description: `${deliverable.description} (Quantidade: ${d.quantity})`,
          productId: product.id,
        }
      })

      // Get selected guidelines
      const selectedGuidelines = availableGuidelines.filter((g) => selectedGuidelineIds.includes(g.id))

      // Ensure prices are properly formatted
      const formattedPrices =
        formData.prices?.map((price) => ({
          amount: Number(price.amount),
          currencyId: price.currencyId,
          modifierTypeId: price.modifierTypeId,
        })) || []

      console.log("Atualizando produto com dados:", {
        ...formData,
        prices: formattedPrices,
        deliverables: formattedDeliverables,
        guidelines: selectedGuidelines,
      })

      await updateProduct(product.id, {
        ...formData,
        prices: formattedPrices,
        deliverables: formattedDeliverables,
        guidelines: selectedGuidelines,
      })

      toast({
        title: "Sucesso",
        description: "Produto atualizado com sucesso.",
      })
      router.push(`/dashboard/products/${product.id}`)
    } catch (error) {
      console.error("Erro ao atualizar produto:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o produto.",
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
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-2">Produto não encontrado</h2>
        <Button onClick={() => router.push("/dashboard/products")}>Voltar para a lista</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push(`/dashboard/products/${product.id}`)}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="text-3xl font-bold">Editar Produto</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="productType">Tipo de Produto</Label>
                <RadioGroup
                  id="productType"
                  value={formData.productType}
                  onValueChange={(value) => handleSelectChange("productType", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ONE_TIME" id="one-time" />
                    <Label htmlFor="one-time">Único</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="RECURRENT" id="recurrent" />
                    <Label htmlFor="recurrent">Recorrente</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="status">Status</Label>
                <RadioGroup
                  id="status"
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ACTIVE" id="active" />
                    <Label htmlFor="active">Ativo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="INACTIVE" id="inactive" />
                    <Label htmlFor="inactive">Inativo</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="singleItemOnly"
                  checked={formData.singleItemOnly}
                  onCheckedChange={(checked) => handleSwitchChange("singleItemOnly", checked)}
                />
                <Label htmlFor="singleItemOnly">Apenas um item pode ser adquirido</Label>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="categoryId">Categoria</Label>
                <Select value={formData.categoryId} onValueChange={(value) => handleSelectChange("categoryId", value)}>
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

              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Entregáveis</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addDeliverable}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Entregável
                  </Button>
                </div>

                {selectedDeliverables.map((deliverable, index) => (
                  <div key={index} className="grid gap-4 p-4 border rounded-md">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-medium">Entregável {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDeliverable(index)}
                        disabled={selectedDeliverables.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid gap-3">
                      <Label htmlFor={`deliverable-id-${index}`}>Entregável</Label>
                      <Select
                        value={deliverable.id}
                        onValueChange={(value) => handleDeliverableChange(index, "id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um entregável" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDeliverables.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {deliverable.id && (
                      <div className="text-sm text-muted-foreground">
                        <p>{getDeliverableById(deliverable.id)?.description}</p>
                      </div>
                    )}

                    <div className="grid gap-3">
                      <Label htmlFor={`deliverable-quantity-${index}`}>Quantidade</Label>
                      <Input
                        id={`deliverable-quantity-${index}`}
                        type="number"
                        min="1"
                        value={deliverable.quantity}
                        onChange={(e) =>
                          handleDeliverableChange(index, "quantity", Number.parseInt(e.target.value) || 1)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-6">
                <h3 className="text-lg font-medium">Diretrizes Associadas</h3>
                <div className="grid gap-4 p-4 border rounded-md">
                  <p className="text-sm text-muted-foreground mb-2">
                    Selecione as diretrizes pré-existentes que devem ser associadas a este produto:
                  </p>
                  <div className="grid gap-3">
                    {availableGuidelines.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhuma diretriz disponível.</p>
                    ) : (
                      <div className="space-y-2">
                        {availableGuidelines.map((guideline) => (
                          <div key={guideline.id} className="flex items-start space-x-2">
                            <Checkbox
                              id={`guideline-${guideline.id}`}
                              checked={selectedGuidelineIds.includes(guideline.id)}
                              onCheckedChange={() => handleGuidelineToggle(guideline.id)}
                              className="mt-1"
                            />
                            <div className="grid gap-1.5">
                              <Label htmlFor={`guideline-${guideline.id}`} className="font-medium cursor-pointer">
                                {guideline.name}
                              </Label>
                              <p className="text-sm text-muted-foreground">{guideline.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                <h3 className="text-lg font-medium">Informações de Preço</h3>
                <div className="grid gap-4 p-4 border rounded-md">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="price">Preço Base</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.prices?.[0]?.amount || 0}
                        onChange={(e) => {
                          const price = Number.parseFloat(e.target.value)
                          setFormData((prev) => ({
                            ...prev,
                            prices: [
                              {
                                amount: price,
                                currencyId: prev.prices?.[0]?.currencyId || "",
                                modifierTypeId: prev.prices?.[0]?.modifierTypeId || null,
                              },
                              ...(prev.prices?.slice(1) || []),
                            ],
                          }))
                        }}
                        required
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="currencyId">Moeda</Label>
                      <Select
                        value={formData.prices?.[0]?.currencyId || ""}
                        onValueChange={(value) => {
                          setFormData((prev) => ({
                            ...prev,
                            prices: [
                              {
                                amount: prev.prices?.[0]?.amount || 0,
                                currencyId: value,
                                modifierTypeId: prev.prices?.[0]?.modifierTypeId || null,
                              },
                              ...(prev.prices?.slice(1) || []),
                            ],
                          }))
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma moeda" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.id} value={currency.id}>
                              {currency.name} ({currency.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="modifierTypeId">Tipo de Modificador</Label>
                    <TooltipProvider>
                      <div className="flex items-center gap-2">
                        <Select
                          value={formData.prices?.[0]?.modifierTypeId || ""}
                          onValueChange={(value) => {
                            setFormData((prev) => ({
                              ...prev,
                              prices: [
                                {
                                  amount: prev.prices?.[0]?.amount || 0,
                                  currencyId: prev.prices?.[0]?.currencyId || "",
                                  // Fix: Convert "null" string to actual null
                                  modifierTypeId: value === "null" ? null : value,
                                },
                                ...(prev.prices?.slice(1) || []),
                              ],
                            }))
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione um modificador (opcional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="null">Nenhum modificador</SelectItem>
                            {modifierTypes.map((modifier) => (
                              <SelectItem key={modifier.key} value={modifier.key}>
                                {modifier.displayName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" type="button">
                              <Info className="h-4 w-4" />
                              <span className="sr-only">Informações sobre modificadores</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-sm">
                            <p>
                              Modificadores ajustam o preço base do produto. Podem ser multiplicadores (ex: 1.5x) ou
                              valores fixos adicionais.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TooltipProvider>

                    {formData.prices?.[0]?.modifierTypeId && (
                      <p className="text-sm text-muted-foreground">
                        {getModifierDescription(formData.prices[0].modifierTypeId)}
                      </p>
                    )}
                  </div>

                  {adjustedPrice !== null && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Preço Ajustado:</span>
                        <span className="font-bold text-lg">
                          {(() => {
                            const currency = currencies.find((c) => c.id === formData.prices?.[0]?.currencyId)
                            return currency
                              ? `${currency.symbol} ${adjustedPrice.toFixed(2)}`
                              : adjustedPrice.toFixed(2)
                          })()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Este é o preço final após aplicar o modificador selecionado.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.push(`/dashboard/products/${product.id}`)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
