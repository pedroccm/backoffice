"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, ListFilter, ArrowUpDown, ChevronUp, ChevronDown, Search, Filter } from "lucide-react"
import { getProducts, getCategories } from "@/lib/catalog-api"
import type { Product, Category } from "@/lib/catalog-api"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"

type SortOrder = "asc" | "desc" | "none";

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>("none")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories()
        ])
        setProducts(productsData)
        setCategories(categoriesData)
      } catch (err) {
        setError("Não foi possível carregar os dados do catálogo.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.name : categoryId
  }

  const handleAddProduct = () => {
    router.push("/dashboard/products/new")
  }

  const handleSortChange = (order: SortOrder) => {
    setSortOrder(order);
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  }

  // Filtrar produtos com base no termo de busca e categoria selecionada
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm 
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoryName(product.categoryId).toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesCategory = selectedCategory 
      ? product.categoryId === selectedCategory 
      : true;
    
    return matchesSearch && matchesCategory;
  });

  // Ordenar produtos com base na opção selecionada
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === "none") return 0;
    if (sortOrder === "asc") return a.name.localeCompare(b.name);
    return b.name.localeCompare(a.name);
  });

  const getSortIcon = () => {
    if (sortOrder === "asc") return <ChevronUp className="h-4 w-4" />;
    if (sortOrder === "desc") return <ChevronDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Catálogo de Produtos</h1>
        <Button onClick={handleAddProduct}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => router.refresh()} variant="outline">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>Todos os Produtos</CardTitle>
                {selectedCategory && (
                  <Badge variant="outline" className="ml-2">
                    {getCategoryName(selectedCategory)}
                    <button 
                      className="ml-1 font-medium" 
                      onClick={() => handleCategoryChange(null)}
                    >
                      ×
                    </button>
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar produtos..."
                    className="pl-8 w-[250px]"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Categorias
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Filtrar por categoria</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleCategoryChange(null)}>
                      Todas as categorias
                    </DropdownMenuItem>
                    {categories.map((category) => (
                      <DropdownMenuItem 
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={selectedCategory === category.id ? "font-bold" : ""}
                      >
                        {category.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {getSortIcon()}
                      <span className="ml-2">Ordenar</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleSortChange("asc")}>
                      <ChevronUp className="mr-2 h-4 w-4" />
                      Ordem alfabética (A-Z)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("desc")}>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      Ordem alfabética inversa (Z-A)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("none")}>
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      Ordem padrão
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo de Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        {searchTerm || selectedCategory
                          ? "Nenhum produto encontrado com os filtros selecionados" 
                          : "Nenhum produto encontrado"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.paymentType === "ONE_TIME" ? "Único" : "Recorrente"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={product.status === "ACTIVE" ? "default" : "outline"}
                          >
                            {product.status === "ACTIVE" ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            onClick={() => router.push(`/dashboard/products/${product.id}`)}
                            className="px-0"
                          >
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 