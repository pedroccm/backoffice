"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit } from "lucide-react"
import { getCurrencies, type Currency } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"

export default function CurrencyDetailPage({ params }: { params: { id: string } }) {
  const [currency, setCurrency] = useState<Currency | null>(null)
  const [loading, setLoading] = useState(true)
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
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/currencies")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="text-3xl font-bold">Moeda: {currency.code}</h1>
        <div className="ml-auto">
          <Button onClick={() => router.push(`/dashboard/currencies/${currency.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Moeda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
              <p className="text-sm">{currency.id}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Código</h3>
              <p className="text-lg font-semibold">{currency.code}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Nome</h3>
              <p className="text-sm">{currency.name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Símbolo</h3>
              <p className="text-lg">{currency.symbol}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Exemplo de Formatação</h3>
              <p className="text-sm">
                {currency.symbol}1.000,00 ({currency.name})
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
