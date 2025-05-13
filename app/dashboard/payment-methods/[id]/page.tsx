"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { getPaymentMethodById, updatePaymentMethod } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"

export default function EditPaymentMethodPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
  })

  const router = useRouter()
  const { toast } = useToast()
  const { id } = params

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPaymentMethodById(id)
        setFormData({
          name: data.name,
          description: data.description || "",
          code: data.code,
        })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do método de pagamento.",
          variant: "destructive",
        })
        router.push("/dashboard/payment-methods")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Validar campos obrigatórios
      if (!formData.name) throw new Error("Nome é obrigatório")
      if (!formData.code) throw new Error("Código é obrigatório")

      // Atualizar método de pagamento
      await updatePaymentMethod(id, formData)

      toast({
        title: "Sucesso",
        description: "Método de pagamento atualizado com sucesso.",
      })

      // Redirecionar para a lista de métodos de pagamento
      router.push("/dashboard/payment-methods")
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar método de pagamento",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">Editar Método de Pagamento</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Método de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Cartão de Crédito"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Ex: CREDIT_CARD"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Um código único para identificar este método de pagamento.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descrição do método de pagamento"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/payment-methods")}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 