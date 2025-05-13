"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { 
  getProducts, 
  getInstallments, 
  getOfferDurations, 
  getOfferById, 
  addProductToOffer,
  type Product, 
  type Installment, 
  type OfferDuration,
  type Offer, 
  applyInstallment,
  applyOfferDuration
} from "@/lib/api-client"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Trash } from "lucide-react"

interface CreateOneTimeOfferProps {
  sessionId: string
  offerId: string
  leadId: string
}

export function CreateOneTimeOffer({ sessionId, offerId, leadId }: CreateOneTimeOfferProps) {
  const { toast } = useToast()
  
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [loading, setLoading] = useState(false)
  
  const [installments, setInstallments] = useState<Installment[]>([])
  const [selectedInstallment, setSelectedInstallment] = useState<string>("")
  
  const [offerDurations, setOfferDurations] = useState<OfferDuration[]>([])
  const [selectedOfferDuration, setSelectedOfferDuration] = useState<string>("")
  
  const [offer, setOffer] = useState<Offer | null>(null)
  
  // Carregar produtos, parcelamentos e durações
  useEffect(() => {
    async function loadData() {
      try {
        // Carregar produtos (apenas one-time)
        const productsData = await getProducts()
        const oneTimeProducts = productsData.filter(p => p.paymentType === "ONE_TIME")
        setProducts(oneTimeProducts)
        
        // Carregar parcelamentos
        const installmentsData = await getInstallments()
        setInstallments(installmentsData)
        
        // Carregar durações de oferta
        const offerDurationsData = await getOfferDurations()
        setOfferDurations(offerDurationsData)
        
        // Carregar os detalhes da oferta atual
        const offerData = await getOfferById(offerId)
        setOffer(offerData)
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados necessários.",
          variant: "destructive"
        })
      }
    }
    
    loadData()
  }, [offerId, toast])
  
  // Atualizar produto selecionado
  useEffect(() => {
    if (selectedProduct) {
      const productDetails = products.find(p => p.id === selectedProduct)
      setSelectedProductDetails(productDetails || null)
      setSelectedPrice("")
    } else {
      setSelectedProductDetails(null)
    }
  }, [selectedProduct, products])
  
  // Função para adicionar produto à oferta
  const handleAddProduct = async () => {
    if (!selectedProduct || !selectedPrice || quantity <= 0) {
      toast({
        title: "Campos incompletos",
        description: "Selecione um produto, preço e quantidade válida.",
        variant: "destructive"
      })
      return
    }
    
    setLoading(true)
    
    try {
      const updatedOffer = await addProductToOffer(
        offerId,
        selectedProduct,
        selectedPrice,
        quantity
      )
      
      setOffer(updatedOffer)
      
      // Limpar seleção
      setSelectedProduct("")
      setSelectedPrice("")
      setQuantity(1)
      
      toast({
        title: "Produto adicionado",
        description: "Produto adicionado à oferta com sucesso."
      })
    } catch (error) {
      console.error("Erro ao adicionar produto:", error)
      
      // Mostrar mensagem de erro mais detalhada
      const errorMessage = error instanceof Error 
        ? error.message
        : "Erro desconhecido ao adicionar produto";
        
      toast({
        title: "Erro ao adicionar produto",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Função para aplicar parcelamento
  const handleApplyInstallment = async () => {
    if (!selectedInstallment) {
      toast({
        title: "Parcelamento não selecionado",
        description: "Selecione um parcelamento para aplicar à oferta.",
        variant: "destructive"
      })
      return
    }
    
    setLoading(true)
    
    try {
      const updatedOffer = await applyInstallment({
        offerId,
        installmentId: selectedInstallment
      })
      
      setOffer(updatedOffer)
      
      toast({
        title: "Parcelamento aplicado",
        description: "Parcelamento aplicado à oferta com sucesso."
      })
    } catch (error) {
      console.error("Erro ao aplicar parcelamento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível aplicar o parcelamento à oferta.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  // Função para aplicar duração da oferta
  const handleApplyOfferDuration = async () => {
    if (!selectedOfferDuration) {
      toast({
        title: "Duração não selecionada",
        description: "Selecione uma duração para aplicar à oferta.",
        variant: "destructive"
      })
      return
    }
    
    setLoading(true)
    
    try {
      const updatedOffer = await applyOfferDuration({
        offerId,
        offerDurationId: selectedOfferDuration
      })
      
      setOffer(updatedOffer)
      
      toast({
        title: "Duração aplicada",
        description: "Duração aplicada à oferta com sucesso."
      })
    } catch (error) {
      console.error("Erro ao aplicar duração:", error)
      toast({
        title: "Erro",
        description: "Não foi possível aplicar a duração à oferta.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }
  
  const formatCurrency = (value: number) => {
    // Garantir que o valor é tratado como número
    const numericValue = Number(value);
    
    // Verificar se é um número válido
    if (isNaN(numericValue)) {
      return 'R$ 0,00';
    }
    
    try {
      // Usar a formatação brasileira para moeda
      const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      // Garantir que não estamos adicionando R$ duplicado
      return formatter.format(numericValue);
    } catch (error) {
      console.error("Erro ao formatar moeda:", error);
      
      // Formatação manual como fallback
      const formatted = numericValue.toFixed(2).replace('.', ',');
      const parts = formatted.split(',');
      const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `R$ ${integerPart},${parts[1] || '00'}`;
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Produtos Únicos</CardTitle>
          <CardDescription>
            Selecione produtos de pagamento único para adicionar à oferta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="product">Produto</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.length === 0 ? (
                    <SelectItem value="empty" disabled>Nenhum produto disponível</SelectItem>
                  ) : (
                    products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Preço</Label>
              <Select 
                value={selectedPrice} 
                onValueChange={setSelectedPrice} 
                disabled={!selectedProductDetails}
              >
                <SelectTrigger id="price" className="w-full">
                  <SelectValue placeholder="Selecione um preço" />
                </SelectTrigger>
                <SelectContent>
                  {!selectedProductDetails || selectedProductDetails.prices.length === 0 ? (
                    <SelectItem value="empty" disabled>Nenhum preço disponível</SelectItem>
                  ) : (
                    selectedProductDetails.prices.map((price) => {
                      const formattedPrice = formatCurrency(price.amount);
                      
                      return (
                        <SelectItem 
                          key={price.currencyId} 
                          value={price.currencyId}
                          textValue={formattedPrice}
                        >
                          {formattedPrice}
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                disabled={!selectedPrice}
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleAddProduct} 
                disabled={!selectedProduct || !selectedPrice || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Adicionando...
                  </>
                ) : (
                  "Adicionar Produto"
                )}
              </Button>
            </div>
          </div>
          
          {offer && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Produtos na Oferta</h3>
              {offer.items.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum produto adicionado à oferta ainda.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offer.items.map((item) => {
                      const itemProduct = products.find(p => p.id === item.productId);
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{itemProduct?.name || 'Produto desconhecido'}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.totalPrice)}</TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">Subtotal:</TableCell>
                      <TableCell className="font-bold">{offer.subtotal ? formatCurrency(offer.subtotal) : 'R$ 0,00'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">Total:</TableCell>
                      <TableCell className="font-bold">{offer.total ? formatCurrency(offer.total) : 'R$ 0,00'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Parcelamentos</CardTitle>
            <CardDescription>
              Selecione o parcelamento para esta oferta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={selectedInstallment} 
              onValueChange={setSelectedInstallment}
              className="space-y-2"
            >
              {installments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum parcelamento disponível.
                </p>
              ) : (
                installments.map((installment) => (
                  <div key={installment.id} className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value={installment.id} id={`installment-${installment.id}`} />
                    <Label htmlFor={`installment-${installment.id}`} className="flex-1">
                      {installment.installment}x {installment.discountPercentage > 0 ? `(-${installment.discountPercentage}%)` : ''}
                    </Label>
                  </div>
                ))
              )}
            </RadioGroup>
            
            <Button 
              onClick={handleApplyInstallment} 
              disabled={!selectedInstallment || loading}
              className="w-full mt-4"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Aplicando...
                </>
              ) : (
                "Aplicar Parcelamento"
              )}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Duração da Oferta</CardTitle>
            <CardDescription>
              Selecione a duração desta oferta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={selectedOfferDuration} 
              onValueChange={setSelectedOfferDuration}
              className="space-y-2"
            >
              {offerDurations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma duração disponível.
                </p>
              ) : (
                offerDurations.map((duration) => (
                  <div key={duration.id} className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value={duration.id} id={`duration-${duration.id}`} />
                    <Label htmlFor={`duration-${duration.id}`} className="flex-1">
                      {duration.months} meses {duration.discountPercentage > 0 ? `(-${duration.discountPercentage}%)` : ''}
                    </Label>
                  </div>
                ))
              )}
            </RadioGroup>
            
            <Button 
              onClick={handleApplyOfferDuration} 
              disabled={!selectedOfferDuration || loading}
              className="w-full mt-4"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Aplicando...
                </>
              ) : (
                "Aplicar Duração"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 