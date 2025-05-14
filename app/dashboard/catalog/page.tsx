"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, ListFilter, ArrowUpDown, ChevronUp, ChevronDown, Search, Filter, DollarSign, FileText, ClipboardList, SlidersHorizontal } from "lucide-react"
import { getProducts, getCategories } from "@/lib/catalog-api"
import type { Product, Category } from "@/lib/catalog-api"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"

type SortOrder = "asc" | "desc" | "none";
type CountFilter = "all" | "none" | "some" | "many";

interface CountFilters {
  prices: CountFilter;
  deliverables: CountFilter;
  guidelines: CountFilter;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<SortOrder>("none")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [countFilters, setCountFilters] = useState<CountFilters>({
    prices: "all",
    deliverables: "all",
    guidelines: "all"
  })
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

  // Função para aplicar filtro de contagem
  const applyCountFilter = (product: Product, filterType: keyof CountFilters) => {
    const filter = countFilters[filterType];
    const count = filterType === 'prices' 
      ? product.prices?.length || 0 
      : filterType === 'deliverables' 
        ? product.deliverables?.length || 0 
        : product.guidelines?.length || 0;
    
    switch (filter) {
      case "none": return count === 0;
      case "some": return count > 0 && count < 4;
      case "many": return count >= 4;
      default: return true; // "all"
    }
  }

  // Filtrar produtos com base no termo de busca, categoria selecionada e filtros de contagem
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm 
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getCategoryName(product.categoryId).toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    const matchesCategory = selectedCategory 
      ? product.categoryId === selectedCategory 
      : true;
    
    const matchesPriceFilter = applyCountFilter(product, 'prices');
    const matchesDeliverableFilter = applyCountFilter(product, 'deliverables');
    const matchesGuidelineFilter = applyCountFilter(product, 'guidelines');
    
    return matchesSearch && matchesCategory && matchesPriceFilter && matchesDeliverableFilter && matchesGuidelineFilter;
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

  // Função para determinar a variante do badge com base na quantidade
  const getBadgeVariant = (count: number) => {
    if (count === 0) return "outline";
    if (count >= 4) return "default";
    return "secondary";
  }

  // Função para atualizar filtros de contagem
  const updateCountFilter = (type: keyof CountFilters, value: CountFilter) => {
    setCountFilters(prev => ({
      ...prev,
      [type]: value
    }));
  }

  // Verificar se algum filtro de contagem está ativo
  const hasActiveCountFilters = Object.values(countFilters).some(filter => filter !== 'all');

  // Função para resetar todos os filtros de contagem
  const resetCountFilters = () => {
    setCountFilters({
      prices: "all",
      deliverables: "all",
      guidelines: "all"
    });
  }

  // Traduzir o tipo de filtro para português
  const getFilterLabel = (filter: CountFilter) => {
    switch (filter) {
      case "none": return "Nenhum";
      case "some": return "Alguns (1-3)";
      case "many": return "Muitos (4+)";
      default: return "Todos";
    }
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
                    <Button 
                      variant={hasActiveCountFilters ? "default" : "outline"} 
                      size="sm"
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filtros
                      {hasActiveCountFilters && (
                        <Badge variant="outline" className="ml-2 bg-background text-foreground">
                          {Object.values(countFilters).filter(f => f !== 'all').length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[220px]">
                    <DropdownMenuLabel>Filtrar por quantidade</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuGroup>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <DollarSign className="mr-2 h-4 w-4" />
                          <span>Preços: {getFilterLabel(countFilters.prices)}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup 
                              value={countFilters.prices} 
                              onValueChange={(value) => updateCountFilter('prices', value as CountFilter)}
                            >
                              <DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="none">Nenhum (0)</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="some">Alguns (1-3)</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="many">Muitos (4+)</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <FileText className="mr-2 h-4 w-4" />
                          <span>Entregáveis: {getFilterLabel(countFilters.deliverables)}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup 
                              value={countFilters.deliverables} 
                              onValueChange={(value) => updateCountFilter('deliverables', value as CountFilter)}
                            >
                              <DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="none">Nenhum (0)</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="some">Alguns (1-3)</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="many">Muitos (4+)</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <ClipboardList className="mr-2 h-4 w-4" />
                          <span>Diretrizes: {getFilterLabel(countFilters.guidelines)}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup 
                              value={countFilters.guidelines} 
                              onValueChange={(value) => updateCountFilter('guidelines', value as CountFilter)}
                            >
                              <DropdownMenuRadioItem value="all">Todos</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="none">Nenhum (0)</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="some">Alguns (1-3)</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="many">Muitos (4+)</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                    </DropdownMenuGroup>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={resetCountFilters}
                      disabled={!hasActiveCountFilters}
                    >
                      Limpar filtros
                    </DropdownMenuItem>
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
                    <TableHead className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center gap-1 cursor-help">
                              <DollarSign className="h-4 w-4" /> Preços
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Quantidade de opções de preço disponíveis</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center gap-1 cursor-help">
                              <FileText className="h-4 w-4" /> Entregáveis
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Quantidade de entregáveis associados ao produto</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center gap-1 cursor-help">
                              <ClipboardList className="h-4 w-4" /> Diretrizes
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Quantidade de diretrizes definidas para o produto</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
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
                        <TableCell className="text-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge 
                                  variant={getBadgeVariant(product.prices?.length || 0)} 
                                  className="rounded-full px-2.5 cursor-help"
                                >
                                  {product.prices?.length || 0}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{product.prices?.length || 0} opções de preço</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge 
                                  variant={getBadgeVariant(product.deliverables?.length || 0)} 
                                  className="rounded-full px-2.5 cursor-help"
                                >
                                  {product.deliverables?.length || 0}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{product.deliverables?.length || 0} entregáveis</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="text-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge 
                                  variant={getBadgeVariant(product.guidelines?.length || 0)} 
                                  className="rounded-full px-2.5 cursor-help"
                                >
                                  {product.guidelines?.length || 0}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{product.guidelines?.length || 0} diretrizes</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
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
            <div className="mt-4 text-xs text-muted-foreground flex items-center gap-4 justify-end">
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">0</Badge>
                <span>Nenhum</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">1</Badge>
                <span>1-3 itens</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="default" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">4</Badge>
                <span>4+ itens</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 