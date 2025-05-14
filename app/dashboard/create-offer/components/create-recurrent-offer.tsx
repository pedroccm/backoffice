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
  applyFixedTerm,
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
import { Switch } from "@/components/ui/switch"

interface CreateRecurrentOfferProps {
  sessionId: string
  offerId: string
  leadId: string
}

export function CreateRecurrentOffer({ sessionId, offerId, leadId }: CreateRecurrentOfferProps) {
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
  
  const [installments, setInstallments] = useState<Installment[]>([])
  const [selectedInstallment, setSelectedInstallment] = useState<string>("")
  const [installmentApplied, setInstallmentApplied] = useState(false)
  
  const [offerDurations, setOfferDurations] = useState<OfferDuration[]>([])
  const [selectedOfferDuration, setSelectedOfferDuration] = useState<string>("")
  const [offerDurationApplied, setOfferDurationApplied] = useState(false)
  
  const [offer, setOffer] = useState<Offer | null>(null)
  
  const [isFixedTerm, setIsFixedTerm] = useState(false)
  const [applyingFixedTerm, setApplyingFixedTerm] = useState(false)
  
  // Carregar produtos, parcelamentos e durações
  useEffect(() => {
    async function loadData() {
      try {
        // Carregar produtos (apenas recorrentes)
        const productsData = await getProducts()
        const recurrentProducts = productsData
          .filter(p => p.paymentType === "RECURRENT")
          // Filtrar apenas produtos que tenham pelo menos um preço definido
          .filter(p => p.prices && Array.isArray(p.prices) && p.prices.length > 0)
        
        console.log(`Produtos recorrentes com preço: ${recurrentProducts.length} de ${productsData.filter(p => p.paymentType === "RECURRENT").length} produtos recorrentes disponíveis`);
        setProducts(recurrentProducts)
        
        // Carregar parcelamentos
        const installmentsData = await getInstallments()
        setInstallments(installmentsData)
        
        // Carregar durações de oferta
        const offerDurationsData = await getOfferDurations()
        setOfferDurations(offerDurationsData)
        
        // Carregar os detalhes da oferta atual
        const offerData = await getOfferById(offerId)
        console.log("Oferta recorrente carregada:", offerData);
        console.log("Itens na oferta recorrente:", offerData.items ? offerData.items.length : 0);
        setOffer(offerData)
        
        // Verificar se já existem parcelamentos ou durações aplicados
        if (offerData.installmentId) {
          setSelectedInstallment(offerData.installmentId)
          setInstallmentApplied(true)
        }
        
        if (offerData.offerDurationId) {
          setSelectedOfferDuration(offerData.offerDurationId)
          setOfferDurationApplied(true)
        }
        
        // Verificar se a oferta já é fidelizada
        setIsFixedTerm(!!offerData.isFixedTermOffer)
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
    
    setAddingProduct(true)
    
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
      setAddingProduct(false)
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
    
    setApplyingInstallment(true)
    
    try {
      const updatedOffer = await applyInstallment({
        offerId,
        installmentId: selectedInstallment
      })
      
      setOffer(updatedOffer)
      setInstallmentApplied(true)
      
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
    
    setApplyingDuration(true)
    
    try {
      const updatedOffer = await applyOfferDuration({
        offerId,
        offerDurationId: selectedOfferDuration
      })
      
      setOffer(updatedOffer)
      setOfferDurationApplied(true)
      
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
      setApplyingDuration(false)
    }
  }

  // Função para permitir alterar o parcelamento aplicado
  const handleChangeInstallment = async () => {
    // Se já temos um novo parcelamento selecionado, aplicamos ele imediatamente
    if (selectedInstallment && installmentApplied) {
      await handleApplyInstallment();
    } else {
      // Caso contrário, apenas limpamos a seleção anterior para permitir nova seleção
      setInstallmentApplied(false);
    }
  }
  
  // Função para permitir alterar a duração aplicada
  const handleChangeOfferDuration = async () => {
    // Se já temos uma nova duração selecionada, aplicamos ela imediatamente
    if (selectedOfferDuration && offerDurationApplied) {
      await handleApplyOfferDuration();
    } else {
      // Caso contrário, apenas limpamos a seleção anterior para permitir nova seleção
      setOfferDurationApplied(false);
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

  // Função para toggle de fidelização
  const handleFixedTermToggle = async (value: boolean) => {
    setApplyingFixedTerm(true)
    
    try {
      const updatedOffer = await applyFixedTerm({
        offerId,
        isFixedTermOffer: value
      })
      
      setOffer(updatedOffer)
      setIsFixedTerm(value)
      
      toast({
        title: value ? "Fidelização ativada" : "Fidelização desativada",
        description: value ? "Oferta marcada como fidelizada com sucesso." : "Oferta desmarcada como fidelizada com sucesso."
      })
    } catch (error) {
      console.error("Erro ao aplicar fidelização:", error)
      // Reverter o toggle se houver erro
      setIsFixedTerm(!value)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status de fidelização da oferta.",
        variant: "destructive"
      })
    } finally {
      setApplyingFixedTerm(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Produtos Recorrentes</CardTitle>
          <CardDescription>
            Selecione produtos de pagamento recorrente para adicionar à oferta
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
                    <SelectItem value="empty" disabled>Nenhum produto recorrente com preço disponível</SelectItem>
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
              {!offer.items || offer.items.length === 0 ? (
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Parcelamentos</CardTitle>
            <CardDescription>
              Selecione o parcelamento para esta oferta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {installmentApplied ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <div className="flex items-center">
                    <div>
                      <h3 className="font-medium">Parcelamento aplicado</h3>
                      <p className="text-sm text-muted-foreground">
                        {installments.find(i => i.id === selectedInstallment)?.installment || 0}x 
                        {installments.find(i => i.id === selectedInstallment)?.discountPercentage 
                          ? ` (-${installments.find(i => i.id === selectedInstallment)?.discountPercentage}%)` 
                          : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
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
                  disabled={!selectedInstallment || applyingInstallment}
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
        
        <Card>
          <CardHeader>
            <CardTitle>Duração da Oferta</CardTitle>
            <CardDescription>
              Selecione a duração desta oferta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {offerDurationApplied ? (
              <div className="space-y-4">
                <div className="p-4 border rounded-md">
                  <div className="flex items-center">
                    <div>
                      <h3 className="font-medium">Duração aplicada</h3>
                      <p className="text-sm text-muted-foreground">
                        {offerDurations.find(d => d.id === selectedOfferDuration)?.months || 0} meses
                        {offerDurations.find(d => d.id === selectedOfferDuration)?.discountPercentage 
                          ? ` (-${offerDurations.find(d => d.id === selectedOfferDuration)?.discountPercentage}%)` 
                          : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
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
                  disabled={!selectedOfferDuration || applyingDuration}
                  className="w-full mt-4"
                >
                  {applyingDuration ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Aplicando...
                    </>
                  ) : (
                    "Aplicar Duração"
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Opções da Oferta</CardTitle>
          <CardDescription>
            Configure opções adicionais para esta oferta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between py-4">
            <div className="space-y-0.5">
              <Label htmlFor="fixed-term">Fidelizado</Label>
              <p className="text-sm text-muted-foreground">
                Ativa a fidelização do cliente nesta oferta
              </p>
            </div>
            <Switch 
              id="fixed-term"
              checked={isFixedTerm}
              onCheckedChange={handleFixedTermToggle}
              disabled={applyingFixedTerm}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 