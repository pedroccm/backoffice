"use client"

import { use } from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Info } from "lucide-react"
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
import {
  addProductPrice,
  updateProductPrice,
} from "@/lib/catalog-api"

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
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
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        // Tentar buscar os dados do produto
        console.log(`[EDIT-PAGE] Tentando carregar produto com ID: ${id}`);
        
        const productData = await getProductById(id);
        
        if (!productData || !productData.id) {
          console.error("[EDIT-PAGE] Produto retornado é inválido:", productData);
          throw new Error("Dados do produto inválidos ou não encontrados");
        }
        
        console.log("[EDIT-PAGE] Produto carregado com sucesso:", productData.id);
        
        // Se o produto foi carregado com sucesso, carregue os dados adicionais
        console.log("[EDIT-PAGE] Carregando dados adicionais (categorias, moedas, etc.)");
        const [categoriesData] = await Promise.all([
          getCategories(),
        ]);
        
        // Garantir que o produto tenha todos os campos necessários para a edição
        const normalizedProduct = {
          ...productData,
          productType: productData.productType || productData.paymentType || "ONE_TIME",
          status: productData.status || "ACTIVE",
        };
        
        setProduct(normalizedProduct);
        setCategories(categoriesData || []);

        // Inicializar o formulário com os dados do produto
        console.log("[EDIT-PAGE] Inicializando formulário com dados do produto");
        setFormData({
          name: normalizedProduct.name || "",
          description: normalizedProduct.description || "",
          productType: normalizedProduct.productType || "ONE_TIME",
          status: normalizedProduct.status || "ACTIVE",
          singleItemOnly: normalizedProduct.singleItemOnly || false,
          categoryId: normalizedProduct.categoryId || "",
        });
        
        console.log("[EDIT-PAGE] Carregamento de dados concluído com sucesso");
      } catch (error) {
        console.error("[EDIT-PAGE] Erro ao carregar produto:", error);
        setProduct(null); // Garantir que produto fique null em caso de erro
        toast({
          title: "Erro ao carregar produto",
          description: error instanceof Error 
            ? error.message 
            : "Não foi possível carregar os detalhes do produto. Por favor, tente novamente.",
          variant: "destructive",
        });
        // NÃO redirecionamos automaticamente - deixamos o usuário decidir
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, router, toast]);

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
    
    if (saving) return
    if (!product) return
    
    setSaving(true)
    
    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.categoryId) {
        throw new Error("Por favor, preencha todos os campos obrigatórios")
      }

      // Atualizar o produto
      const updatedProduct = await updateProduct(product.id, {
        ...formData,
        productType: formData.productType as "ONE_TIME" | "RECURRENT"
      })

      toast({
        title: "Produto atualizado com sucesso",
        description: `O produto "${updatedProduct.name}" foi atualizado.`,
      })

      // Redirecionar para a página de visualização do produto
      router.push(`/dashboard/products/${product.id}`)
    } catch (error) {
      console.error("Erro ao atualizar produto:", error)
      
      // Verificar se é erro de API indisponível
      const errorMessage = error instanceof Error ? error.message : String(error)
      const isApiUnavailable = errorMessage.includes('API') && 
        (errorMessage.includes('indisponível') || errorMessage.includes('unavailable'))
      
      if (isApiUnavailable) {
        toast({
          title: "API indisponível",
          description: "Não é possível atualizar o produto pois a API está indisponível no momento. Por favor, tente novamente mais tarde ou contate o suporte técnico.",
          variant: "destructive",
          duration: 10000 // 10 segundos para dar tempo de ler
        })
      } else {
        toast({
          title: "Erro ao atualizar produto",
          description: errorMessage,
          variant: "destructive"
        })
      }
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
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h2 className="text-xl font-semibold mb-2">Produto não encontrado</h2>
        <p className="text-gray-500 text-center max-w-md mb-4">
          Não foi possível carregar os dados do produto. O produto pode não existir ou pode ter ocorrido um erro ao carregar suas informações.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
          <Button onClick={() => router.push("/dashboard/products")}>
            Voltar para a lista
          </Button>
        </div>
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

      <Card className="mb-6 bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-amber-800">Informação Importante</h3>
              <p className="text-amber-700">
                Para editar Entregáveis, Diretrizes e Preços, por favor, utilize a página de visualização do produto. Aqui você pode editar apenas as informações básicas do produto.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
            <CardDescription>Informações básicas do produto</CardDescription>
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
