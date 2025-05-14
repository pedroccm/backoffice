"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search } from "lucide-react"
import { getInstallments, getPaymentMethods, type Installment, type PaymentMethod } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"

export default function InstallmentsPage() {
  const [installments, setInstallments] = useState<Installment[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const [installmentsData, paymentMethodsData] = await Promise.all([
          getInstallments(),
          getPaymentMethods()
        ]);
        setInstallments(installmentsData)
        setPaymentMethods(paymentMethodsData)
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as parcelas.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const filteredInstallments = installments.filter(
    (installment) =>
      installment.installment.toString().includes(searchTerm) ||
      installment.discountPercentage.toString().includes(searchTerm) ||
      getPaymentMethodName(installment.paymentMethodId).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPaymentMethodName = (id: string) => {
    const method = paymentMethods.find((method) => method.id === id)
    return method ? method.name : id
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Parcelas</h1>
        <Button onClick={() => router.push("/dashboard/installments/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Parcela
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Parcelas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar parcelas..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parcelas</TableHead>
                    <TableHead>Desconto (%)</TableHead>
                    <TableHead>Método de Pagamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstallments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        Nenhuma parcela encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredInstallments.map((installment) => (
                      <TableRow key={installment.id}>
                        <TableCell className="font-medium">{installment.installment}x</TableCell>
                        <TableCell>{installment.discountPercentage}%</TableCell>
                        <TableCell>{getPaymentMethodName(installment.paymentMethodId)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 