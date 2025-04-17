"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { getGuidelineById, updateGuideline, getProducts, type Guideline, type Product } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"

export default function EditGuidelinePage({ params }: { params: { id: string } }) {
  const [guideline, setGuideline] = useState<Guideline | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    productId: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const [guidelineData, productsData] = await Promise.all([getGuidelineById(params.id), getProducts()])
        setGuideline(guidelineData)
        setProducts(productsData)
        setFormData({
          name: guidelineData.name,
          description: guidelineData.description,
          productId: guidelineData.productId || "",
        })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da diretriz.",
          variant: "destructive",
        })
        router.push("/dashboard/guidelines")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guideline) return

    setSaving(true)

    try {
      await updateGuideline(guideline.id, formData)
      toast({
        title: "Sucesso",
        description: "Diretriz atualizada com sucesso.",
      })
      router.push(`/dashboard/guidelines/${guideline.id}`)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a diretriz.",
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

  if (!guideline) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-2">Diretriz não encontrada</h2>
        <Button onClick={() => router.push("/dashboard/guidelines")}>Voltar para a lista</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push(`/dashboard/guidelines/${guideline.id}`)}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="text-3xl font-bold">Editar Diretriz</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Diretriz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nome da diretriz"
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descrição detalhada da diretriz"
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="productId">Produto (opcional)</Label>
                <Select value={formData.productId} onValueChange={(value) => handleSelectChange("productId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum produto</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.push(`/dashboard/guidelines/${guideline.id}`)}
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
