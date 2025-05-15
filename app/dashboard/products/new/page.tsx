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
import { ArrowLeft } from "lucide-react"
import {
  createProduct,
  getCategories,
  type Category,
} from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"

export default function NewProductPage() {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    productType: "ONE_TIME",
    status: "ACTIVE",
    singleItemOnly: false,
    categoryId: "",
    createdBy: "system",
  })
  const router = useRouter()
  const { toast } = useToast()

  const calculateAdjustedPrice = (basePrice: number, modifierTypeId: string | null) => {
    if (!modifierTypeId) return basePrice

    const modifier = modifierTypes.find((m) => m.key === modifierTypeId)
    if (!modifier) return basePrice

    switch (modifier.displayName.toLowerCase()) {
      case 'desconto 10%':
        return basePrice * 0.9
      case 'desconto 20%':
        return basePrice * 0.8
      case 'desconto 30%':
        return basePrice * 0.7
      case 'acréscimo 10%':
        return basePrice * 1.1
      case 'acréscimo 20%':
        return basePrice * 1.2
      case 'acréscimo 30%':
        return basePrice * 1.3
      default:
        return basePrice
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        // Carregar apenas categorias, que são necessárias para o formulário
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as categorias.",
          variant: "destructive",
        });
      }
    }

    loadData();
  }, [toast]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar campos obrigatórios
      if (!formData.name || !formData.description || !formData.categoryId) {
        throw new Error("Por favor, preencha todos os campos obrigatórios")
      }

      console.log("Enviando dados do produto:", formData)

      const newProduct = await createProduct(formData)
      console.log("Produto criado com sucesso:", newProduct)

      toast({
        title: "Sucesso",
        description: "Produto criado com sucesso. Agora você pode adicionar preços, entregáveis e diretrizes na tela de edição.",
      })
      
      // Redirecionar para a página de edição do produto criado
      router.push(`/dashboard/products/${newProduct.id}`)
    } catch (error) {
      console.error("Erro ao criar produto:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível criar o produto.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/products")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="text-3xl font-bold">Novo Produto</h1>
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
                <Label htmlFor="singleItemOnly">Apenas um item por carrinho</Label>
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

              <div className="flex justify-end mt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Criando..." : "Criar Produto"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
