"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search } from "lucide-react"
import { getDeliverables, type Deliverable } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"

export default function DeliverablesPage() {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const deliverablesData = await getDeliverables()
        setDeliverables(deliverablesData)
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os entregáveis.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const filteredDeliverables = deliverables.filter(
    (deliverable) =>
      deliverable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deliverable.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Entregáveis</h1>
        <Button onClick={() => router.push("/dashboard/deliverables/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Entregável
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Entregáveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar entregáveis..."
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
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliverables.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                        Nenhum entregável encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDeliverables.map((deliverable) => (
                      <TableRow key={deliverable.id}>
                        <TableCell className="font-medium">{deliverable.name}</TableCell>
                        <TableCell>{deliverable.description}</TableCell>
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
