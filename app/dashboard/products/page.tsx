"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Eye } from "lucide-react"
import {
  getProducts,
  getCurrencies,
  getModifierTypes,
  getCategories,
  calculateAdjustedPrice,
  type Product,
  type Currency,
  type ModifierType,
  type Category,
} from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [modifierTypes, setModifierTypes] = useState<ModifierType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const [productsData, currenciesData, modifierTypesData, categoriesData] = await Promise.all([
          getProducts(),
          getCurrencies(),
          getModifierTypes(),
          getCategories(),
        ])
        setProducts(productsData)
        setCurrencies(currenciesData)
        setModifierTypes(modifierTypesData)
        setCategories(categoriesData)
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getModifierName = (modifierId: string | null) => {
    if (!modifierId) return "Nenhum"
    const modifier = modifierTypes.find((m) => m.key === modifierId)
    return modifier ? modifier.displayName : modifierId
  }

  const getCategoryName = (categoryId: string) => {
    console.log("Buscando categoria:", categoryId);
    console.log("Categorias disponíveis:", categories);
    
    const category = categories.find((c) => c.id === categoryId);
    if (category) {
      return category.name;
    } else {
      console.log(`Categoria com ID ${categoryId} não encontrada!`);
      return categoryId;
    }
  }

  const formatPrice = (price: { amount: number; currencyId: string; modifierTypeId: string | null }) => {
    const currency = currencies.find((c) => c.id === price.currencyId)
    const symbol = currency ? currency.symbol : ""

    if (!price.modifierTypeId) {
      return `${symbol} ${price.amount.toFixed(2)}`
    }

    const adjustedPrice = calculateAdjustedPrice(price.amount, price.modifierTypeId)

    return (
      <div>
        <div>
          {symbol} {adjustedPrice.toFixed(2)}
        </div>
        <div className="text-xs text-muted-foreground">({getModifierName(price.modifierTypeId)})</div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Produtos</h1>
        <Button onClick={() => router.push("/dashboard/products/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar produtos..."
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
                    <TableHead>Tipo</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        Nenhum produto encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.productType === "ONE_TIME" ? "Único" : "Recorrente"}</TableCell>
                        <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/products/${product.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver</span>
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
