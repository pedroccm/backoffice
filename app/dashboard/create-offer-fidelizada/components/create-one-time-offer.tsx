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
  applyInstallment
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
  
  // Separar os estados de loading para cada operação
  const [addingProduct, setAddingProduct] = useState(false)
  const [applyingInstallment, setApplyingInstallment] = useState(false)
  const [applyingDuration, setApplyingDuration] = useState(false)
  
  // Usando prefixos para evitar conflitos entre os componentes
  const [otInstallments, setOtInstallments] = useState<Installment[]>([])
  const [otSelectedInstallment, setOtSelectedInstallment] = useState<string>("")
  const [otInstallmentApplied, setOtInstallmentApplied] = useState(false)
  
  const [otOfferDurations, setOtOfferDurations] = useState<OfferDuration[]>([])
  const [otSelectedOfferDuration, setOtSelectedOfferDuration] = useState<string>("")
  const [otOfferDurationApplied, setOtOfferDurationApplied] = useState(false)
  
  const [offer, setOffer] = useState<Offer | null>(null)
  
  // Carregar produtos, parcelamentos e durações
  useEffect(() => {
    async function loadData() {
      console.log("======= CARREGANDO DADOS =======");
      console.log("offerId:", offerId);
      
      try {
        // Carregar produtos (apenas one-time)
        const productsData = await getProducts()
        const oneTimeProducts = productsData
          .filter(p => p.paymentType === "ONE_TIME")
          // Filtrar apenas produtos que tenham pelo menos um preço definido
          .filter(p => p.prices && Array.isArray(p.prices) && p.prices.length > 0)
        
        console.log(`Produtos com preço: ${oneTimeProducts.length} de ${productsData.filter(p => p.paymentType === "ONE_TIME").length} produtos one-time disponíveis`);
        setProducts(oneTimeProducts)
        
        // Carregar parcelamentos
        const installmentsData = await getInstallments()
        setOtInstallments(installmentsData)
        
        // Carregar os detalhes da oferta atual
        console.log("Carregando oferta:", offerId);
        const offerData = await getOfferById(offerId)
        console.log("Oferta carregada:", offerData);
        console.log("Itens na oferta:", offerData.items ? offerData.items.length : 0);
        setOffer(offerData)
        
        // Verificar se já existem parcelamentos ou durações aplicados
        if (offerData.installmentId) {
          setOtSelectedInstallment(offerData.installmentId)
          setOtInstallmentApplied(true)
        }
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
      
      if (productDetails) {
        console.log("===== DETALHES DO PRODUTO SELECIONADO =====");
        console.log("Produto ID:", productDetails.id);
        console.log("Nome:", productDetails.name);
        console.log("Preços:", productDetails.prices);
        // Verificar se os preços têm o campo priceId
        const hasAnyPriceId = productDetails.prices.some(price => price.priceId);
        console.log("Algum preço tem priceId?", hasAnyPriceId);
        console.log("===== FIM DETALHES =====");
      }
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
    
    setAddingProduct(true)
    
    try {
      console.log("======= ADICIONANDO PRODUTO =======");
      console.log("Produto:", selectedProduct);
      console.log("Preço:", selectedPrice);
      console.log("Quantidade:", quantity);
      
      const updatedOffer = await addProductToOffer(
        offerId,
        selectedProduct,
        selectedPrice,
        quantity
      )
      
      console.log("======= OFERTA ATUALIZADA =======");
      console.log(JSON.stringify(updatedOffer, null, 2));
      console.log("Itens na oferta:", updatedOffer.items ? updatedOffer.items.length : 0);
      
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
      setAddingProduct(false)
    }
  }
  
  // Função para aplicar parcelamento
  const handleApplyInstallment = async () => {
    if (!otSelectedInstallment) {
      toast({
        title: "Parcelamento não selecionado",
        description: "Selecione um parcelamento para aplicar à oferta.",
        variant: "destructive"
      })
      return
    }
    
    setApplyingInstallment(true)
    
    try {
      const updatedOffer = await applyInstallment({
        offerId,
        installmentId: otSelectedInstallment
      })
      
      setOffer(updatedOffer)
      setOtInstallmentApplied(true)
      
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
      setApplyingInstallment(false)
    }
  }
  
  // Função para limpar o parcelamento aplicado e aplicar um novo
  const handleChangeInstallment = async () => {
    // Se já temos um novo parcelamento selecionado, aplicamos ele imediatamente
    if (otSelectedInstallment && otInstallmentApplied) {
      await handleApplyInstallment();
    } else {
      // Caso contrário, apenas limpamos a seleção anterior para permitir nova seleção
      setOtInstallmentApplied(false);
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
                    <SelectItem value="empty" disabled>Nenhum produto com preço disponível</SelectItem>
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
                      // Usar priceId se disponível, senão usar currencyId ou id como fallback
                      const priceIdentifier = price.priceId || price.id || price.currencyId;
                      
                      console.log("Preço disponível:", {
                        priceId: price.priceId,
                        id: price.id,
                        currencyId: price.currencyId,
                        amount: price.amount,
                        usando: priceIdentifier
                      });
                      
                      return (
                        <SelectItem 
                          key={priceIdentifier} 
                          value={priceIdentifier}
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
                disabled={!selectedProduct || !selectedPrice || addingProduct}
                className="w-full"
              >
                {addingProduct ? (
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
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Parcelamentos</CardTitle>
            <CardDescription>
              Selecione o parcelamento para esta oferta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {otInstallmentApplied ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <div className="flex items-center">
                    <div>
                      <h3 className="font-medium">Parcelamento aplicado</h3>
                      <p className="text-sm text-muted-foreground">
                        {otInstallments.find(i => i.id === otSelectedInstallment)?.installment || 0}x 
                        {otInstallments.find(i => i.id === otSelectedInstallment)?.discountPercentage 
                          ? ` (-${otInstallments.find(i => i.id === otSelectedInstallment)?.discountPercentage}%)` 
                          : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <RadioGroup 
                  value={otSelectedInstallment} 
                  onValueChange={setOtSelectedInstallment}
                  className="space-y-2"
                >
                  {otInstallments.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhum parcelamento disponível.
                    </p>
                  ) : (
                    otInstallments.map((installment) => (
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
                  disabled={!otSelectedInstallment || applyingInstallment}
                  className="w-full mt-4"
                >
                  {applyingInstallment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Aplicando...
                    </>
                  ) : (
                    "Aplicar Parcelamento"
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 