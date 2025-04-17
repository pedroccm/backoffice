"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, AlertCircle, PercentIcon } from "lucide-react"
import { getCouponById, type Coupon } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CouponDetailPage({ params }: { params: { id: string } }) {
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadCoupon() {
      try {
        const data = await getCouponById(params.id)
        setCoupon(data)
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes do cupom.",
          variant: "destructive",
        })
        router.push("/dashboard/coupons")
      } finally {
        setLoading(false)
      }
    }

    loadCoupon()
  }, [params.id, router, toast])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge>Ativo</Badge>
      case "INACTIVE":
        return <Badge variant="secondary">Inativo</Badge>
      case "EXPIRED":
        return <Badge variant="outline">Expirado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getUsageTypeBadge = (usageType: string) => {
    switch (usageType) {
      case "ONE_TIME":
        return <Badge variant="outline">Produto Único</Badge>
      case "RECURRING":
        return <Badge variant="outline">Produto Recorrente</Badge>
      default:
        return <Badge variant="outline">Não especificado</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!coupon) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-2">Cupom não encontrado</h2>
        <Button onClick={() => router.push("/dashboard/coupons")}>Voltar para a lista</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/coupons")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="text-3xl font-bold">Cupom: {coupon.code}</h1>
        <div className="ml-auto">
          <Button onClick={() => router.push(`/dashboard/coupons/${coupon.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <Alert variant="warning">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Cada cupom pode ser utilizado apenas uma vez. Após o uso, o cupom se tornará
          indisponível para uso futuro.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Cupom</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">ID</h3>
                <p className="text-sm">{coupon.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                {getStatusBadge(coupon.status)}
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Tipo de Produto</h3>
                {getUsageTypeBadge(coupon.usageType || "ONE_TIME")}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Código</h3>
              <p className="text-lg font-semibold">{coupon.code}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Valor do Desconto</h3>
              <div className="flex items-center">
                <PercentIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                <p className="text-lg font-semibold">{coupon.discountValue}%</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Valor Mínimo de Compra</h3>
                <p className="text-sm">
                  {coupon.minPurchaseAmount ? `R$ ${coupon.minPurchaseAmount.toFixed(2)}` : "Não definido"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Usos Atuais</h3>
                <p className="text-sm">{coupon.usedCount}</p>
              </div>
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Criado em</h3>
                <p className="text-sm">{new Date(coupon.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Atualizado em</h3>
                <p className="text-sm">{new Date(coupon.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
