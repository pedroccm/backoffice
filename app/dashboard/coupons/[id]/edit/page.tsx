"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, AlertCircle, PercentIcon } from "lucide-react"
import { getCouponById, updateCoupon, type Coupon } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function EditCouponPage({ params }: { params: { id: string } }) {
  const id = use(params).id
  const [coupon, setCoupon] = useState<Coupon | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    discountValue: 10,
    minPurchaseAmount: null as number | null,
    status: "ACTIVE",
    usageType: "ONE_TIME" as "ONE_TIME" | "RECURRING",
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadCoupon() {
      try {
        const data = await getCouponById(id)
        setCoupon(data)
        setFormData({
          code: data.code,
          discountValue: data.discountValue,
          minPurchaseAmount: data.minPurchaseAmount,
          status: data.status,
          usageType: data.usageType || "ONE_TIME", // Default to ONE_TIME if not set
        })
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
  }, [id, router, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let parsedValue = value === "" ? null : Number(value)

    // Validate percentage value (1-100)
    if (name === "discountValue") {
      parsedValue = Math.min(Math.max(parsedValue || 0, 1), 100)
    }

    setFormData((prev) => ({ ...prev, [name]: parsedValue }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coupon) return

    setSaving(true)

    try {
      // Validate required fields
      if (!formData.code) {
        throw new Error("O código do cupom é obrigatório")
      }

      if (!formData.discountValue || formData.discountValue < 1 || formData.discountValue > 100) {
        throw new Error("O valor do desconto deve estar entre 1% e 100%")
      }

      await updateCoupon(coupon.id, {
        ...formData,
        discountType: "PERCENTAGE", // Always set to PERCENTAGE
      })
      toast({
        title: "Sucesso",
        description: "Cupom atualizado com sucesso.",
      })
      router.push("/dashboard/coupons")
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível atualizar o cupom.",
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
        <Button variant="outline" size="icon" onClick={() => router.push(`/dashboard/coupons/${coupon.id}`)}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="text-3xl font-bold">Editar Cupom</h1>
      </div>

      <Alert variant="warning">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Cada cupom pode ser utilizado apenas uma vez. Após o uso, o cupom se tornará
          indisponível para uso futuro.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cupom</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="code">Código do Cupom</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Ex: DESCONTO20"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Use um código único e fácil de lembrar (ex: DESCONTO20, PROMO50)
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="usageType">Tipo de Produto</Label>
                <RadioGroup
                  id="usageType"
                  value={formData.usageType}
                  onValueChange={(value) => handleSelectChange("usageType", value)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="ONE_TIME" id="one-time" />
                    <Label htmlFor="one-time" className="flex-1 cursor-pointer font-medium">
                      Produto Único
                      <p className="font-normal text-sm text-muted-foreground mt-1">
                        Cupom válido para produtos de pagamento único
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="RECURRING" id="recurring" />
                    <Label htmlFor="recurring" className="flex-1 cursor-pointer font-medium">
                      Produto Recorrente
                      <p className="font-normal text-sm text-muted-foreground mt-1">
                        Cupom válido para produtos com pagamento recorrente
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="discountValue">Porcentagem de Desconto (%)</Label>
                <div className="relative">
                  <Input
                    id="discountValue"
                    name="discountValue"
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={formData.discountValue}
                    onChange={handleNumberChange}
                    className="pl-8"
                    required
                  />
                  <PercentIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Insira um valor entre 1% e 100%. Este cupom aplicará um desconto percentual ao valor do produto.
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="INACTIVE">Inativo</SelectItem>
                    <SelectItem value="EXPIRED">Expirado</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Defina como "Inativo" para desabilitar temporariamente o cupom sem excluí-lo.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => router.push(`/dashboard/coupons/${coupon.id}`)}>
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
