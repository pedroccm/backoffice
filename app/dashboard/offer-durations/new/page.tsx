"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { createOfferDuration } from "@/lib/api-fetch"
import { useToast } from "@/components/ui/use-toast"

export default function NewOfferDurationPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    months: 1,
    discountPercentage: 0,
  })

  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ 
      ...prev, 
      [name]: Number(value) 
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar campos obrigatórios
      if (formData.months <= 0) throw new Error("Número de meses deve ser maior que zero")
      if (formData.discountPercentage < 0 || formData.discountPercentage > 100) throw new Error("Percentual de desconto deve estar entre 0 e 100")

      // Criar duração de oferta
      await createOfferDuration(formData)

      toast({
        title: "Sucesso",
        description: "Duração de oferta criada com sucesso.",
      })

      // Redirecionar para a lista de durações de ofertas
      router.push("/dashboard/offer-durations")
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar duração de oferta",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">Nova Duração de Oferta</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Duração</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="months">Duração em Meses *</Label>
                <Input
                  id="months"
                  name="months"
                  type="number"
                  min={1}
                  value={formData.months}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="discountPercentage">Percentual de Desconto (%) *</Label>
                <Input
                  id="discountPercentage"
                  name="discountPercentage"
                  type="number"
                  min={0}
                  max={100}
                  value={formData.discountPercentage}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Desconto aplicado quando esta duração for selecionada.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/offer-durations")}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
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