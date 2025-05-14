"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { getProductById, type Product } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import { ContractGenerator } from "@/components/contract-generator"

export default function ProductContractPage({ params }: { params: { productId: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProductById(params.productId)
        setProduct(data)
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

    loadProduct()
  }, [params.productId, router, toast])

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
        <h1 className="text-3xl font-bold">Contrato: {product.name}</h1>
      </div>

      <ContractGenerator product={product} />
    </div>
  )
} 