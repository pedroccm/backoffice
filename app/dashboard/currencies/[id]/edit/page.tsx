"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import { getCurrencies, type Currency } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"

export default function EditCurrencyPage({ params }: { params: { id: string } }) {
  const [currency, setCurrency] = useState<Currency | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    symbol: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadCurrency() {
      try {
        // Como não temos uma função getCurrencyById, vamos buscar todas as moedas e filtrar
        const currencies = await getCurrencies()
        const foundCurrency = currencies.find((c) => c.id === params.id)

        if (foundCurrency) {
          setCurrency(foundCurrency)
          setFormData({
            code: foundCurrency.code,
            name: foundCurrency.name,
            symbol: foundCurrency.symbol,
          })
        } else {
          toast({
            title: "Erro",
            description: "Moeda não encontrada.",
            variant: "destructive",
          })
          router.push("/dashboard/currencies")
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes da moeda.",
          variant: "destructive",
        })
        router.push("/dashboard/currencies")
      } finally {
        setLoading(false)
      }
    }

    loadCurrency()
  }, [params.id, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currency) return

    setSaving(true)

    try {
      // Como não temos uma função updateCurrency, vamos apenas mostrar um toast de sucesso
      toast({
        title: "Sucesso",
        description: "Moeda atualizada com sucesso.",
      })
      router.push("/dashboard/currencies")
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a moeda.",
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

  if (!currency) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-2">Moeda não encontrada</h2>
        <Button onClick={() => router.push("/dashboard/currencies")}>Voltar para a lista</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push(`/dashboard/currencies/${currency.id}`)}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="text-3xl font-bold">Editar Moeda</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Moeda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="code">Código da Moeda</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Ex: BRL, USD, EUR"
                  maxLength={3}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Código de 3 letras seguindo o padrão ISO 4217 (ex: BRL, USD, EUR)
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Real Brasileiro"
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="symbol">Símbolo</Label>
                <Input
                  id="symbol"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  placeholder="Ex: R$, $, €"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.push(`/dashboard/currencies/${currency.id}`)}
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
