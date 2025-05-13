"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Package, ShoppingCart, FileText, Tag, Settings, LayoutDashboard, Ticket, DollarSign, ChevronDown, Download, CreditCard, Calculator, Clock, Plus } from "lucide-react"
import { useSidebar } from "./sidebar-provider"
import { useState } from "react"

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, close } = useSidebar()
  const [catalogoExpanded, setCatalogoExpanded] = useState(true)
  const [vendasExpanded, setVendasExpanded] = useState(true)

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm md:hidden" onClick={close} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-white transition-transform md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b px-4 py-4 bg-primary-50">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6 text-primary-700" />
            <span className="text-primary-700">Backoffice</span>
          </Link>
        </div>
        <ScrollArea className="flex-1">
          <nav className="grid gap-1 p-2">
            <Link href="/dashboard" passHref legacyBehavior>
              <Button
                variant={pathname === "/dashboard" ? "secondary" : "ghost"}
                className={cn("justify-start", pathname === "/dashboard" ? "sidebar-active" : "sidebar-item")}
                onClick={close}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>

            {/* Microserviço: Catálogo */}
            <div className="mt-4">
              <Button
                variant="ghost"
                className="w-full justify-between font-semibold"
                onClick={() => setCatalogoExpanded(!catalogoExpanded)}
              >
                <span>Catálogo</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", catalogoExpanded ? "rotate-180" : "")} />
              </Button>
              {catalogoExpanded && (
                <div className="ml-4 grid gap-1">
                  <Link href="/dashboard/products" passHref legacyBehavior>
                    <Button
                      variant={pathname.startsWith("/dashboard/products") ? "secondary" : "ghost"}
                      className={cn(
                        "justify-start",
                        pathname.startsWith("/dashboard/products") ? "sidebar-active" : "sidebar-item",
                      )}
                      onClick={close}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Produtos
                    </Button>
                  </Link>
                  <Link href="/dashboard/categories" passHref legacyBehavior>
                    <Button
                      variant={pathname.startsWith("/dashboard/categories") ? "secondary" : "ghost"}
                      className={cn(
                        "justify-start",
                        pathname.startsWith("/dashboard/categories") ? "sidebar-active" : "sidebar-item",
                      )}
                      onClick={close}
                    >
                      <Tag className="mr-2 h-4 w-4" />
                      Categorias
                    </Button>
                  </Link>
                  <Link href="/dashboard/deliverables" passHref legacyBehavior>
                    <Button
                      variant={pathname.startsWith("/dashboard/deliverables") ? "secondary" : "ghost"}
                      className={cn(
                        "justify-start",
                        pathname.startsWith("/dashboard/deliverables") ? "sidebar-active" : "sidebar-item",
                      )}
                      onClick={close}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Entregáveis
                    </Button>
                  </Link>
                  <Link href="/dashboard/currencies" passHref legacyBehavior>
                    <Button
                      variant={pathname.startsWith("/dashboard/currencies") ? "secondary" : "ghost"}
                      className={cn(
                        "justify-start",
                        pathname.startsWith("/dashboard/currencies") ? "sidebar-active" : "sidebar-item",
                      )}
                      onClick={close}
                    >
                      <DollarSign className="mr-2 h-4 w-4" />
                      Moedas
                    </Button>
                  </Link>
                  <Link href="/dashboard/modifier-types" passHref legacyBehavior>
                    <Button
                      variant={pathname.startsWith("/dashboard/modifier-types") ? "secondary" : "ghost"}
                      className={cn(
                        "justify-start",
                        pathname.startsWith("/dashboard/modifier-types") ? "sidebar-active" : "sidebar-item",
                      )}
                      onClick={close}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Modificadores
                    </Button>
                  </Link>
                  <Link href="/dashboard/payment-methods" passHref legacyBehavior>
                    <Button
                      variant={pathname.startsWith("/dashboard/payment-methods") ? "secondary" : "ghost"}
                      className={cn(
                        "justify-start",
                        pathname.startsWith("/dashboard/payment-methods") ? "sidebar-active" : "sidebar-item",
                      )}
                      onClick={close}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Métodos de Pagamento
                    </Button>
                  </Link>
                  <Link href="/dashboard/installments" passHref legacyBehavior>
                    <Button
                      variant={pathname.startsWith("/dashboard/installments") ? "secondary" : "ghost"}
                      className={cn(
                        "justify-start",
                        pathname.startsWith("/dashboard/installments") ? "sidebar-active" : "sidebar-item",
                      )}
                      onClick={close}
                    >
                      <Calculator className="mr-2 h-4 w-4" />
                      Parcelas
                    </Button>
                  </Link>
                  <Link href="/dashboard/offer-durations" passHref legacyBehavior>
                    <Button
                      variant={pathname.startsWith("/dashboard/offer-durations") ? "secondary" : "ghost"}
                      className={cn(
                        "justify-start",
                        pathname.startsWith("/dashboard/offer-durations") ? "sidebar-active" : "sidebar-item",
                      )}
                      onClick={close}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Duração de Ofertas
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Microserviço: Vendas */}
            <div className="mt-2">
              <Button
                variant="ghost"
                className="w-full justify-between font-semibold"
                onClick={() => setVendasExpanded(!vendasExpanded)}
              >
                <span>Vendas</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", vendasExpanded ? "rotate-180" : "")} />
              </Button>
              {vendasExpanded && (
                <div className="ml-4 grid gap-1">
                  <Link href="/dashboard/offers" passHref legacyBehavior>
                    <Button
                      variant={pathname.startsWith("/dashboard/offers") ? "secondary" : "ghost"}
                      className={cn(
                        "justify-start",
                        pathname.startsWith("/dashboard/offers") ? "sidebar-active" : "sidebar-item",
                      )}
                      onClick={close}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Ofertas
                    </Button>
                  </Link>
                  <Link href="/dashboard/create-offer" passHref legacyBehavior>
                    <Button
                      variant={pathname.startsWith("/dashboard/create-offer") ? "secondary" : "ghost"}
                      className={cn(
                        "justify-start",
                        pathname.startsWith("/dashboard/create-offer") ? "sidebar-active" : "sidebar-item",
                      )}
                      onClick={close}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Oferta
                    </Button>
                  </Link>
                  <Link href="/dashboard/coupons" passHref legacyBehavior>
                    <Button
                      variant={pathname.startsWith("/dashboard/coupons") ? "secondary" : "ghost"}
                      className={cn(
                        "justify-start",
                        pathname.startsWith("/dashboard/coupons") ? "sidebar-active" : "sidebar-item",
                      )}
                      onClick={close}
                    >
                      <Ticket className="mr-2 h-4 w-4" />
                      Cupons
                    </Button>
                  </Link>
                  <Link href="/dashboard/sessions" passHref legacyBehavior>
                    <Button
                      variant={pathname.startsWith("/dashboard/sessions") ? "secondary" : "ghost"}
                      className={cn(
                        "justify-start",
                        pathname.startsWith("/dashboard/sessions") ? "sidebar-active" : "sidebar-item",
                      )}
                      onClick={close}
                    >
                      <Ticket className="mr-2 h-4 w-4" />
                      Sessions
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Menu GETS */}
            <div className="mt-4">
              <Link href="/dashboard/gets" passHref legacyBehavior>
                <Button
                  variant={pathname.startsWith("/dashboard/gets") ? "secondary" : "ghost"}
                  className={cn(
                    "justify-start font-semibold",
                    pathname.startsWith("/dashboard/gets") ? "sidebar-active" : "sidebar-item",
                  )}
                  onClick={close}
                >
                  <Download className="mr-2 h-4 w-4" />
                  GETS (API)
                </Button>
              </Link>
            </div>
          </nav>
        </ScrollArea>
      </aside>
    </>
  )
}
