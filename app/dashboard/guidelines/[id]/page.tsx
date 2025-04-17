"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit } from "lucide-react"
import { getGuidelineById, getProductById, type Guideline, type Product } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"

export default function GuidelineDetailPage({ params }: { params: { id: string } }) {
  const [guideline, setGuideline] = useState<Guideline | null>(null)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadGuideline() {
      try {
        const data = await getGuidelineById(params.id)
        setGuideline(data)

        if (data.productId) {
          try {
            const productData = await getProductById(data.productId)
            setProduct(productData)
          } catch (error) {
            // Produto não encontrado, mas não é um erro crítico
            console.error("Produto não encontrado:", error)
          }
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes da diretriz.",
          variant: "destructive",
        })
        router.push("/dashboard/guidelines")
      } finally {
        setLoading(false)
      }
    }

    loadGuideline()
  }, [params.id, router, toast])

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
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/guidelines")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="text-3xl font-bold">{guideline.name}</h1>
        <div className="ml-auto">
          <Button onClick={() => router.push(`/dashboard/guidelines/${guideline.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Diretriz</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
              <p className="text-sm">{guideline.id}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Nome</h3>
              <p className="text-lg font-semibold">{guideline.name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Descrição</h3>
              <p className="text-sm">{guideline.description}</p>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Produto Associado</h3>
              {product ? (
                <div className="mt-2">
                  <p className="text-sm font-semibold">{product.name}</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm"
                    onClick={() => router.push(`/dashboard/products/${product.id}`)}
                  >
                    Ver detalhes do produto
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {guideline.productId ? "Produto não encontrado" : "Nenhum produto associado"}
                </p>
              )}
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Criado em</h3>
                <p className="text-sm">{new Date(guideline.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Atualizado em</h3>
                <p className="text-sm">{new Date(guideline.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
