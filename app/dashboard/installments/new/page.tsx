"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, AlertTriangle } from "lucide-react"
import { createInstallment, getPaymentMethods, type PaymentMethod } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NewInstallmentPage() {
  const [loading, setLoading] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [formData, setFormData] = useState({
    installment: 1,
    discountPercentage: 0,
    paymentMethodId: "",
  })

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadPaymentMethods() {
      try {
        console.log("Buscando métodos de pagamento...");
        const data = await getPaymentMethods();
        console.log("Métodos de pagamento recebidos:", data);
        
        // Garante que data é um array, mesmo que venha um objeto ou null/undefined
        const methodsArray = Array.isArray(data) ? data : [];
        
        setPaymentMethods(methodsArray);
        
        // Se existir algum método de pagamento, selecionar o primeiro por padrão
        if (methodsArray.length > 0) {
          setFormData(prev => ({ ...prev, paymentMethodId: methodsArray[0].id }));
        }
      } catch (error) {
        console.error("Erro ao carregar métodos de pagamento:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os métodos de pagamento.",
          variant: "destructive",
        });
      }
    }

    loadPaymentMethods();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === "installment" || name === "discountPercentage" 
        ? Number(value) 
        : value 
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, paymentMethodId: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar campos obrigatórios
      if (formData.installment <= 0) throw new Error("Número de parcelas deve ser maior que zero")
      if (formData.discountPercentage < 0 || formData.discountPercentage > 100) throw new Error("Percentual de desconto deve estar entre 0 e 100")
      if (!formData.paymentMethodId) throw new Error("Método de pagamento é obrigatório")

      // Criar parcela
      await createInstallment(formData)

      toast({
        title: "Sucesso",
        description: "Parcela criada com sucesso.",
      })

      // Redirecionar para a lista de parcelas
      router.push("/dashboard/installments")
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar parcela",
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
        <h1 className="text-3xl font-bold">Nova Parcela</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes da Parcela</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {paymentMethods.length === 0 && (
              <Alert variant="warning" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Não há métodos de pagamento cadastrados. É necessário cadastrar pelo menos um método de pagamento antes de criar parcelas.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="installment">Número de Parcelas *</Label>
                <Input
                  id="installment"
                  name="installment"
                  type="number"
                  min={1}
                  value={formData.installment}
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
                  Desconto aplicado quando esta opção de parcelamento for selecionada.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paymentMethodId">Método de Pagamento *</Label>
                <Select 
                  value={formData.paymentMethodId} 
                  onValueChange={handleSelectChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um método de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.length === 0 ? (
                      <p className="px-2 py-1.5 text-sm text-muted-foreground">
                        Nenhum método de pagamento encontrado
                      </p>
                    ) : (
                      paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/installments")}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading || paymentMethods.length === 0}
              >
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