import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Package, Tag, Ticket, FileText } from "lucide-react"

const menuItems = [
  {
    title: "Produtos",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Ofertas",
    href: "/dashboard/offers",
    icon: FileText,
  },
  {
    title: "Categorias",
    href: "/dashboard/categories",
    icon: Tag,
  },
  {
    title: "Cupons",
    href: "/dashboard/coupons",
    icon: Ticket,
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
