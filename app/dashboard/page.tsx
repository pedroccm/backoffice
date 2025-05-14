"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, FileText, Tag, Ticket, ShoppingCart, DollarSign, Settings, LayoutDashboard, CreditCard, Calculator, Clock, Plus, Download, Users, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Dashboard() {
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
          {/* Sessions dentro de Vendas */}
          <div className="col-span-3 border rounded-lg p-4 bg-muted/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary-600" />
                <h3 className="text-md font-medium">Sessions</h3>
              </div>
              <Link href="/dashboard/sessions">
                <Button variant="outline" size="sm" className="flex items-center text-primary-600 hover:text-primary-800">
                  <span className="mr-1 text-sm">Ver todas</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/dashboard/offers">
                <Card className="dashboard-card border-l-4 border-l-primary-600 hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Ofertas</CardTitle>
                    <ShoppingCart className="dashboard-card-icon h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <CardDescription>Gerenciar ofertas e propostas</CardDescription>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/dashboard/create-offer">
                <Card className="dashboard-card border-l-4 border-l-secondary-600 hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Criar Oferta</CardTitle>
                    <Plus className="h-4 w-4 text-secondary-600" />
                  </CardHeader>
                  <CardContent>
                    <CardDescription>Criar novas ofertas para clientes</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
          
          <Link href="/dashboard/payment-methods">
            <Card className="dashboard-card border-l-4 border-l-primary-600">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Métodos de Pagamento</CardTitle>
                <CreditCard className="dashboard-card-icon h-4 w-4" />
              </CardHeader>
              <CardContent>
                <CardDescription>Gerenciar métodos de pagamento</CardDescription>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/installments">
            <Card className="dashboard-card border-l-4 border-l-secondary-600">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Parcelas</CardTitle>
                <Calculator className="h-4 w-4 text-secondary-600" />
              </CardHeader>
              <CardContent>
                <CardDescription>Gerenciar opções de parcelamento</CardDescription>
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/offer-durations">
            <Card className="dashboard-card border-l-4 border-l-accent-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Duração de Ofertas</CardTitle>
                <Clock className="h-4 w-4 text-accent-600" />
              </CardHeader>
              <CardContent>
                <CardDescription>Gerenciar durações de ofertas</CardDescription>
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

      {/* API */}
      <div>
        <h2 className="text-lg font-semibold mb-4">API</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/gets">
            <Card className="dashboard-card border-l-4 border-l-primary-600">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">GETS (API)</CardTitle>
                <Download className="dashboard-card-icon h-4 w-4" />
              </CardHeader>
              <CardContent>
                <CardDescription>Consultar dados via API</CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
