"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, FileText, BookOpen, Tag, Ticket, ShoppingCart, DollarSign, Settings } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getAllOffers } from "@/lib/offers-service"
import { formatCurrency } from "@/lib/offers-service"
import { useToast } from "@/components/ui/use-toast"
import type { Offer } from "@/lib/sales-api"

export default function Dashboard() {
  const [recentOffers, setRecentOffers] = useState<(Offer & { leadName: string })[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const offers = await getAllOffers()
        
        // Verificar se recebemos ofertas válidas
        if (offers && offers.length > 0) {
          // Pegar as 5 ofertas mais recentes
          const sortedOffers = offers
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
          setRecentOffers(sortedOffers)
        } else {
          // Limpar ofertas existentes se não recebemos dados válidos
          setRecentOffers([])
          console.info("Nenhuma oferta encontrada na API")
          
          // Notificação suave de que não há dados (opcional)
          toast({
            title: "Informação",
            description: "Não há ofertas disponíveis no momento."
          })
        }
      } catch (error) {
        console.error("Erro ao carregar ofertas:", error)
        setRecentOffers([])
        toast({
          variant: "destructive",
          title: "Erro ao carregar ofertas",
          description: "Não foi possível carregar as ofertas recentes."
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  return (
    <div className="grid gap-6">
      <h1 className="page-title">Dashboard</h1>

      {/* Microserviço: Catálogo */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Catálogo</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/catalog">
            <Card className="dashboard-card border-l-4 border-l-primary-600">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Produtos</CardTitle>
                <Package className="dashboard-card-icon h-4 w-4" />
              </CardHeader>
              <CardContent>
                <CardDescription>Gerenciar produtos, preços e atributos</CardDescription>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/categories">
            <Card className="dashboard-card border-l-4 border-l-secondary-600">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Categorias</CardTitle>
                <Tag className="h-4 w-4 text-secondary-600" />
              </CardHeader>
              <CardContent>
                <CardDescription>Gerenciar categorias de produtos</CardDescription>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/deliverables">
            <Card className="dashboard-card border-l-4 border-l-accent-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Entregáveis</CardTitle>
                <FileText className="h-4 w-4 text-accent-600" />
              </CardHeader>
              <CardContent>
                <CardDescription>Gerenciar entregáveis de produtos</CardDescription>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/currencies">
            <Card className="dashboard-card border-l-4 border-l-secondary-600">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Moedas</CardTitle>
                <DollarSign className="h-4 w-4 text-secondary-600" />
              </CardHeader>
              <CardContent>
                <CardDescription>Gerenciar moedas para preços</CardDescription>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/modifier-types">
            <Card className="dashboard-card border-l-4 border-l-accent-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Modificadores</CardTitle>
                <Settings className="h-4 w-4 text-accent-600" />
              </CardHeader>
              <CardContent>
                <CardDescription>Gerenciar tipos de modificadores</CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Microserviço: Vendas */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Vendas</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/offers">
            <Card className="dashboard-card border-l-4 border-l-primary-600">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Ofertas</CardTitle>
                <ShoppingCart className="dashboard-card-icon h-4 w-4" />
              </CardHeader>
              <CardContent>
                <CardDescription>Gerenciar ofertas e propostas</CardDescription>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/coupons">
            <Card className="dashboard-card border-l-4 border-l-accent-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Cupons</CardTitle>
                <Ticket className="h-4 w-4 text-accent-600" />
              </CardHeader>
              <CardContent>
                <CardDescription>Gerenciar cupons de desconto</CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ofertas Recentes</CardTitle>
            <Link href="/dashboard/offers">
              <Button variant="outline" size="sm">
                Ver Todas
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOffers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhuma oferta encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOffers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell>{offer.leadName}</TableCell>
                      <TableCell>
                        <Badge variant={offer.status === "CONVERTED" ? "default" : "secondary"}>
                          {offer.status === "CONVERTED" ? "Convertido" : "Em Aberto"}
                        </Badge>
                      </TableCell>
                      <TableCell>{offer.type === "ONE_TIME" ? "Único" : "Recorrente"}</TableCell>
                      <TableCell>{formatCurrency(offer.totalPrice)}</TableCell>
                      <TableCell>{new Date(offer.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
