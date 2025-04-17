"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { getOffers, type Offer } from "@/lib/api-client"

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const offersData = await getOffers()
        setOffers(offersData)
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar as ofertas.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const filteredOffers = offers.filter(
    (offer) =>
      offer.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.leadName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ofertas</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ofertas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar ofertas..."
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
                    <TableHead>ID da Oferta</TableHead>
                    <TableHead>Lead</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOffers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhuma oferta encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOffers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell className="font-medium">{offer.id}</TableCell>
                        <TableCell>{offer.leadName}</TableCell>
                        <TableCell>
                          <Badge variant={offer.status === "CONVERTED" ? "default" : "secondary"}>
                            {offer.status === "CONVERTED" ? "Convertido" : "Em Aberto"}
                          </Badge>
                        </TableCell>
                        <TableCell>{offer.type === "ONE_TIME" ? "Único" : "Recorrente"}</TableCell>
                        <TableCell>R$ {offer.subtotal.toFixed(2)}</TableCell>
                        <TableCell>R$ {offer.total.toFixed(2)}</TableCell>
                        <TableCell>{new Date(offer.createdAt).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/offers/${offer.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver Detalhes</span>
                          </Button>
                        </TableCell>
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