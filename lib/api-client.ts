import { PaymentMethod } from "@/lib/api-fetch";
import { getOffer, saveOffer, removeOffer } from "@/lib/offer-storage";

// Debugging helper
function logDebug(message: string, data?: any) {
  console.log(`[API Client] ${message}`, data ? data : "")
}

// Interfaces para tipos de dados
interface Guideline {
  id: string
  name: string
  description: string
  productId: string
  createdAt: string
  updatedAt: string
}

// Interface unificada de Product
export type Product = {
  id: string
  name: string
  description: string
  productType?: string
  paymentType?: "ONE_TIME" | "RECURRENT"
  status?: string
  singleItemOnly?: boolean
  categoryId?: string
  prices: { 
    id?: string;
    priceId?: string;
    amount: number; 
    currencyId: string; 
    modifierTypeId?: string | null 
  }[]
  deliverables?: Deliverable[]
  guidelines?: Guideline[]
  createdBy?: string
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  description: string
}

interface Currency {
  id: string
  code: string
  name: string
  symbol: string
}

interface Deliverable {
  id: string
  name: string
  description: string
  productId: string
  createdAt: string
  updatedAt: string
}

// Update the ModifierType interface to include priceAdjustment
interface ModifierType {
  key: string
  displayName: string
  description: string
  createdBy: string
  priceAdjustment?: {
    type: string
    value: number
  } | null
  valueRestrictions?: {
    maxValues: number
    restrictedCurrencies?: string[]
    restrictedProducts?: string[]
  } | null
}

// Update the Coupon interface to remove maxUses field
interface Coupon {
  id: string
  code: string
  discountType: string // Will always be "PERCENTAGE" now
  discountValue: number
  status: string
  usageType: "ONE_TIME" | "RECURRING" // New field
  usedCount?: number
  createdAt: string
  updatedAt: string
}

// Variáveis para armazenar os dados em memória
const products: Product[] = []
const categories: Category[] = []
const currencies: Currency[] = []
let deliverables: Deliverable[] = []
const guidelines: Guideline[] = []
const modifierTypes: ModifierType[] = []
let coupons: Coupon[] = []
const offers: Offer[] = []
const offerItems: OfferItem[] = []

// Adicionar a interface Installment
export interface Installment {
  id: string;
  installment: number;
  discountPercentage: number;
  paymentMethodId: string;
  createdAt: string;
  updatedAt: string;
}

// Function to calculate adjusted price based on modifier
export function calculateAdjustedPrice(basePrice: number, modifierTypeId: string | null): number {
  if (!modifierTypeId) return basePrice

  const modifier = modifierTypes.find((m) => m.key === modifierTypeId)
  if (!modifier || !modifier.priceAdjustment) return basePrice

  const { value } = modifier.priceAdjustment
  return basePrice + value
}

// Adicionando as funções para gerenciar diretrizes

export async function getGuidelines(): Promise<Guideline[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Extrair todas as diretrizes de todos os produtos
      const allGuidelines = products.reduce((acc, product) => {
        return [...acc, ...product.guidelines]
      }, [] as Guideline[])

      // Adicionar também as diretrizes de guidelines que não estão associadas a produtos
      const standaloneGuidelines = guidelines.filter((g: Guideline) => !g.productId || !products.some((p) => p.id === g.productId))

      resolve([...allGuidelines, ...standaloneGuidelines])
    }, 500)
  })
}

export async function getGuidelineById(id: string): Promise<Guideline> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Procurar em todas as diretrizes de produtos
      for (const product of products) {
        const guideline = product.guidelines.find((g) => g.id === id)
        if (guideline) {
          resolve({ ...guideline })
          return
        }
      }

      // Procurar nas diretrizes independentes
      const guideline = guidelines.find((g) => g.id === id)
      if (guideline) {
        resolve({ ...guideline })
        return
      }

      reject(new Error(`Falha ao buscar diretriz com ID ${id}`))
    }, 500)
  })
}

export async function createGuideline(guideline: {
  name: string
  description: string
  productId?: string
}): Promise<Guideline> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newGuideline: Guideline = {
        id: `guide-${guidelines.length + 1}`,
        name: guideline.name,
        description: guideline.description,
        productId: guideline.productId || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Se tiver um productId, adicionar à lista de diretrizes do produto
      if (guideline.productId) {
        const productIndex = products.findIndex((p) => p.id === guideline.productId)
        if (productIndex !== -1) {
          products[productIndex].guidelines.push(newGuideline)
        }
      } else {
        // Caso contrário, adicionar à lista de diretrizes independentes
        guidelines.push(newGuideline)
      }

      resolve({ ...newGuideline })
    }, 500)
  })
}

export async function updateGuideline(id: string, guideline: Partial<Guideline>): Promise<Guideline> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Procurar e atualizar em diretrizes de produtos
      for (const product of products) {
        const guidelineIndex = product.guidelines.findIndex((g) => g.id === id)
        if (guidelineIndex !== -1) {
          // Se o productId mudou, precisamos mover a diretriz
          if (guideline.productId !== undefined && guideline.productId !== product.id) {
            // Remover do produto atual
            const updatedGuideline = {
              ...product.guidelines[guidelineIndex],
              ...guideline,
              updatedAt: new Date().toISOString(),
            }
            product.guidelines.splice(guidelineIndex, 1)

            // Adicionar ao novo produto ou à lista independente
            if (guideline.productId) {
              const newProductIndex = products.findIndex((p) => p.id === guideline.productId)
              if (newProductIndex !== -1) {
                products[newProductIndex].guidelines.push(updatedGuideline)
              } else {
                guidelines.push(updatedGuideline)
              }
            } else {
              guidelines.push(updatedGuideline)
            }

            resolve({ ...updatedGuideline })
            return
          } else {
            // Atualizar no mesmo produto
            const updatedGuideline = {
              ...product.guidelines[guidelineIndex],
              ...guideline,
              updatedAt: new Date().toISOString(),
            }
            product.guidelines[guidelineIndex] = updatedGuideline
            resolve({ ...updatedGuideline })
            return
          }
        }
      }

      // Procurar e atualizar em diretrizes independentes
      const guidelineIndex = guidelines.findIndex((g) => g.id === id)
      if (guidelineIndex !== -1) {
        // Se adicionou um productId, precisamos mover a diretriz
        if (guideline.productId) {
          const updatedGuideline = {
            ...guidelines[guidelineIndex],
            ...guideline,
            updatedAt: new Date().toISOString(),
          }
          guidelines.splice(guidelineIndex, 1)

          // Adicionar ao produto
          const productIndex = products.findIndex((p) => p.id === guideline.productId)
          if (productIndex !== -1) {
            products[productIndex].guidelines.push(updatedGuideline)
          } else {
            // Se o produto não existir, manter como independente
            guidelines.push(updatedGuideline)
          }

          resolve({ ...updatedGuideline })
          return
        } else {
          // Atualizar na lista independente
          const updatedGuideline = {
            ...guidelines[guidelineIndex],
            ...guideline,
            updatedAt: new Date().toISOString(),
          }
          guidelines[guidelineIndex] = updatedGuideline
          resolve({ ...updatedGuideline })
          return
        }
      }

      reject(new Error(`Falha ao atualizar diretriz com ID ${id}`))
    }, 500)
  })
}

export async function deleteGuideline(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Procurar e excluir em diretrizes de produtos
      for (const product of products) {
        const guidelineIndex = product.guidelines.findIndex((g) => g.id === id)
        if (guidelineIndex !== -1) {
          product.guidelines.splice(guidelineIndex, 1)
          resolve()
          return
        }
      }

      // Procurar e excluir em diretrizes independentes
      const guidelineIndex = guidelines.findIndex((g) => g.id === id)
      if (guidelineIndex !== -1) {
        guidelines.splice(guidelineIndex, 1)
        resolve()
        return
      }

      reject(new Error(`Falha ao excluir diretriz com ID ${id}`))
    }, 500)
  })
}

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch('/api/catalog/categories');
    if (!response.ok) throw new Error('Falha ao buscar categorias');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
}

export async function getCoupons(): Promise<Coupon[]> {
  try {
    const response = await fetch('/api/sales/coupons');
    if (!response.ok) throw new Error('Falha ao buscar cupons');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar cupons:', error);
    return [];
  }
}

export async function deleteCoupon(id: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      coupons = coupons.filter((coupon) => coupon.id !== id)
      resolve()
    }, 500)
  })
}

export async function getCurrencies(): Promise<Currency[]> {
  try {
    const response = await fetch('/api/catalog/currencies');
    if (!response.ok) throw new Error('Falha ao buscar moedas');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar moedas:', error);
    return [];
  }
}

export async function getDeliverables(): Promise<Deliverable[]> {
  try {
    const response = await fetch('/api/catalog/deliverables');
    if (!response.ok) throw new Error('Falha ao buscar entregáveis');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar entregáveis:', error);
    return [];
  }
}

export async function deleteDeliverable(id: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      deliverables = deliverables.filter((deliverable) => deliverable.id !== id)
      resolve()
    }, 500)
  })
}

export async function getProducts(): Promise<Product[]> {
  try {
    // Tentar buscar da API do catálogo primeiro
    let response = await fetch('/api/catalog/products');
    
    // Se não conseguir, tentar a API de vendas
    if (!response.ok) {
      console.log('Tentando API de vendas após falha na API do catálogo');
      response = await fetch('/api/sales/products');
    }
    
    if (!response.ok) throw new Error('Falha ao buscar produtos');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
}

export async function getCouponById(id: string): Promise<Coupon> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const coupon = coupons.find((coupon) => coupon.id === id)
      if (coupon) {
        resolve(coupon)
      } else {
        reject(new Error(`Coupon with id ${id} not found`))
      }
    }, 500)
  })
}

// Update the createCoupon function to remove maxUses field
export async function createCoupon(
  coupon: Omit<Coupon, "id" | "createdAt" | "updatedAt" | "usedCount" | "discountType"> & { discountType?: string },
): Promise<Coupon> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newCoupon: Coupon = {
        id: `coupon-${coupons.length + 1}`,
        ...coupon,
        discountType: "PERCENTAGE", // Always set to PERCENTAGE
        usedCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      coupons.push(newCoupon)
      resolve(newCoupon)
    }, 500)
  })
}

export async function createCurrency(currency: Omit<Currency, "id">): Promise<Currency> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newCurrency: Currency = {
        id: `currency-${currencies.length + 1}`,
        ...currency,
      }
      currencies.push(newCurrency)
      resolve(newCurrency)
    }, 500)
  })
}

export async function getProductById(id: string): Promise<Product> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const product = products.find((product) => product.id === id)
      if (product) {
        resolve(product)
      } else {
        reject(new Error(`Product with id ${id} not found`))
      }
    }, 500)
  })
}

export async function deleteProductDeliverable(productId: string, deliverableId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const productIndex = products.findIndex((product) => product.id === productId)
      if (productIndex !== -1) {
        products[productIndex].deliverables = products[productIndex].deliverables.filter(
          (deliverable) => deliverable.id !== deliverableId,
        )
        resolve()
      } else {
        reject(new Error(`Product with id ${productId} not found`))
      }
    }, 500)
  })
}

export async function deleteProductGuideline(productId: string, guidelineId: string): Promise<Product> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const productIndex = products.findIndex((product) => product.id === productId)
      if (productIndex !== -1) {
        products[productIndex].guidelines = products[productIndex].guidelines.filter(
          (guideline) => guideline.id !== guidelineId,
        )
        resolve(products[productIndex])
      } else {
        reject(new Error(`Product with id ${productId} not found`))
      }
    }, 500)
  })
}

// Corrigir a função createProduct para garantir compatibilidade de tipos
export async function createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
  try {
    logDebug("Creating product with data:", product);
    
    // Passo 1: Criar o produto base
    const response = await fetch('/api/catalog/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: product.name,
        description: product.description,
        paymentType: product.productType,
        singleItemOnly: product.singleItemOnly,
        categoryId: product.categoryId,
        createdBy: product.createdBy || "system"
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Falha ao criar produto base: ${response.status} ${errorText}`);
    }
    
    let newProduct = await response.json();
    const productId = newProduct.id;
    logDebug("Produto base criado:", newProduct);
    
    // Passo 2: Adicionar preços
    if (product.prices && product.prices.length > 0) {
      for (const price of product.prices) {
        if (price.amount > 0 && price.currencyId) {
          try {
            // Verificar se modifierTypeId é um UUID válido ou null
            // Se for uma string vazia ou inválida, usar null
            let validModifierTypeId = null;
            if (price.modifierTypeId) {
              // Verificar se é um UUID válido (formato aproximado)
              const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
              if (uuidRegex.test(price.modifierTypeId)) {
                validModifierTypeId = price.modifierTypeId;
              } else {
                logDebug("modifierTypeId inválido, será enviado como null:", price.modifierTypeId);
              }
            }
            
            const priceData = {
              productId: productId,
              currencyId: price.currencyId,
              amount: Number(price.amount),
              modifierTypeId: validModifierTypeId
            };
            
            logDebug("Enviando dados de preço:", priceData);
            
            const priceResponse = await fetch('/api/catalog/products/prices', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(priceData),
            });
            
            if (!priceResponse.ok) {
              const errorText = await priceResponse.text().catch(() => '');
              throw new Error(`API respondeu com status ${priceResponse.status}: ${errorText}`);
            }
            
            newProduct = await priceResponse.json();
            logDebug("Preço adicionado:", newProduct);
          } catch (priceError) {
            console.error("Erro ao adicionar preço:", priceError);
            throw new Error(`Falha ao adicionar preço ao produto: ${priceError instanceof Error ? priceError.message : String(priceError)}`);
          }
        } else {
          logDebug("Ignorando preço inválido:", price);
        }
      }
    }
    
    // Passo 3: Adicionar entregáveis (deliverables)
    if (product.deliverables && product.deliverables.length > 0) {
      for (const deliverable of product.deliverables) {
        if (deliverable.id) {
          try {
            const deliverableResponse = await fetch('/api/catalog/products/deliverables', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                productId: productId,
                deliverableId: deliverable.id
              }),
            });
            
            if (!deliverableResponse.ok) {
              const errorText = await deliverableResponse.text().catch(() => '');
              console.warn(`Falha ao adicionar entregável: ${deliverableResponse.status} ${errorText}`);
              continue; // Continuar com o próximo entregável mesmo que este falhe
            }
            
            newProduct = await deliverableResponse.json();
            logDebug("Entregável adicionado:", newProduct);
          } catch (deliverableError) {
            console.warn("Erro ao adicionar entregável:", deliverableError);
            // Continuar com os próximos entregáveis
          }
        }
      }
    }
    
    // Passo 4: Adicionar guidelines
    if (product.guidelines && product.guidelines.length > 0) {
      for (const guideline of product.guidelines) {
        if (guideline.id) {
          try {
            const guidelineResponse = await fetch('/api/catalog/products/guidelines', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                description: guideline.description,
                name: guideline.name,
                productId: productId
              }),
            });
            
            if (!guidelineResponse.ok) {
              const errorText = await guidelineResponse.text().catch(() => '');
              console.warn(`Falha ao adicionar guideline: ${guidelineResponse.status} ${errorText}`);
              continue; // Continuar com a próxima guideline mesmo que esta falhe
            }
            
            newProduct = await guidelineResponse.json();
            logDebug("Guideline adicionada:", newProduct);
          } catch (guidelineError) {
            console.warn("Erro ao adicionar guideline:", guidelineError);
            // Continuar com as próximas guidelines
          }
        }
      }
    }
    
    // Buscar o produto final atualizado
    try {
      const finalProductResponse = await fetch(`/api/catalog/products/find/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (finalProductResponse.ok) {
        newProduct = await finalProductResponse.json();
      }
    } catch (error) {
      // Ignorar erro ao buscar produto final, usar o que já temos
      console.warn("Erro ao buscar produto final:", error);
    }
    
    logDebug("Produto completo criado:", newProduct);
    return newProduct;
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    throw error;
  }
}

export async function updateCoupon(id: string, coupon: Partial<Coupon>): Promise<Coupon> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const couponIndex = coupons.findIndex((coupon) => coupon.id === id)
      if (couponIndex !== -1) {
        coupons[couponIndex] = {
          ...coupons[couponIndex],
          ...coupon,
          updatedAt: new Date().toISOString(),
        }
        resolve(coupons[couponIndex])
      } else {
        reject(new Error(`Coupon with id ${id} not found`))
      }
    }, 500)
  })
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      logDebug("Updating product with ID:", id)
      logDebug("Update data:", product)

      const productIndex = products.findIndex((p) => p.id === id)
      if (productIndex !== -1) {
        // Format prices if provided
        let updatedPrices = products[productIndex].prices
        if (product.prices) {
          updatedPrices = product.prices.map((price) => ({
            amount: Number(price.amount),
            currencyId: price.currencyId,
            modifierTypeId: price.modifierTypeId,
          }))
        }

        // Handle deliverables if provided
        if (product.deliverables) {
          // Remove existing deliverables for this product
          products[productIndex].deliverables = []

          // Add the updated deliverables
          products[productIndex].deliverables = product.deliverables.map((deliverable) => ({
            ...deliverable,
            productId: id,
          }))
        }

        // Update other fields
        products[productIndex] = {
          ...products[productIndex],
          ...product,
          prices: updatedPrices,
          updatedAt: new Date().toISOString(),
        }

        logDebug("Updated product:", products[productIndex])
        resolve(products[productIndex])
      } else {
        reject(new Error(`Product with id ${id} not found`))
      }
    }, 500)
  })
}

// Add these functions to the api-client.ts file

export async function getModifierTypes(): Promise<ModifierType[]> {
  try {
    const response = await fetch('/api/catalog/modifier-types');
    if (!response.ok) throw new Error('Falha ao buscar tipos de modificadores');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar tipos de modificadores:', error);
    return [];
  }
}

export async function getModifierTypeByKey(key: string): Promise<ModifierType> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const modifierType = modifierTypes.find((modifierType) => modifierType.key === key)
      if (modifierType) {
        resolve({ ...modifierType })
      } else {
        reject(new Error(`Modifier type with key ${key} not found`))
      }
    }, 500)
  })
}

export async function createModifierType(
  modifierType: Omit<ModifierType, "key"> & { key: string },
): Promise<ModifierType> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newModifierType: ModifierType = {
        ...modifierType,
      }
      modifierTypes.push(newModifierType)
      resolve(newModifierType)
    }, 500)
  })
}

export async function updateModifierType(key: string, modifierType: Partial<ModifierType>): Promise<ModifierType> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const modifierTypeIndex = modifierTypes.findIndex((modifierType) => modifierType.key === key)
      if (modifierTypeIndex !== -1) {
        modifierTypes[modifierTypeIndex] = {
          ...modifierTypes[modifierTypeIndex],
          ...modifierType,
        }
        resolve(modifierTypes[modifierTypeIndex])
      } else {
        reject(new Error(`Modifier type with key ${key} not found`))
      }
    }, 500)
  })
}

export async function deleteModifierType(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const modifierTypeIndex = modifierTypes.findIndex((modifierType) => modifierType.key === key)
      if (modifierTypeIndex !== -1) {
        modifierTypes.splice(modifierTypeIndex, 1)
        resolve()
      } else {
        reject(new Error(`Modifier type with key ${key} not found`))
      }
    }, 500)
  })
}

// Tipo unificado de Offer
export type Offer = {
  id: string
  leadId: string
  leadName?: string
  status?: "PENDING" | "CONVERTED" | "EXPIRED" | "CANCELLED"
  type?: "ONE_TIME" | "RECURRENT"
  subtotal: number
  total: number
  items: OfferItem[]
  couponId?: string
  couponDiscountPercentage?: number
  couponDiscountTotal?: number
  installmentId?: string
  installmentMonths?: number
  installmentDiscountPercentage?: number
  installmentDiscountTotal?: number
  offerDurationId?: string
  offerDurationMonths?: number
  offerDurationDiscountPercentage?: number
  offerDurationDiscountTotal?: number
  projectStartDate?: string
  paymentStartDate?: string
  payDay?: number
  isFixedTermOffer?: boolean
  createdAt: string
  updatedAt: string
}

// Tipo unificado de OfferItem
export type OfferItem = {
  id: string
  offerId?: string
  productId: string
  priceId?: string
  productType?: string
  price: number
  quantity: number
  totalPrice: number
}

export async function getOffers(): Promise<Offer[]> {
  try {
    logDebug("Buscando ofertas da API")
    
    // Acessar a API local que já tem dados mockados
    const response = await fetch("/api/sales/offers")
    if (!response.ok) {
      throw new Error(`Erro ao buscar ofertas: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Transformar para o formato usado pelo cliente
    return data.map((offer: any) => ({
      id: offer.id,
      leadId: offer.leadId,
      leadName: offer.leadName || "Cliente",
      status: offer.status,
      type: offer.type,
      subtotal: offer.subtotalPrice,
      total: offer.totalPrice,
      items: offer.offerItems.map((item: any) => ({
        id: item.id,
        offerId: item.offerId,
        productId: item.productId,
        priceId: item.priceId,
        productType: item.productType,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.totalPrice
      })),
      couponId: offer.couponId,
      couponDiscountPercentage: offer.couponDiscountPercentage,
      couponDiscountTotal: offer.couponDiscountTotal,
      installmentId: offer.installmentId,
      installmentMonths: offer.installmentMonths,
      installmentDiscountPercentage: offer.installmentDiscountPercentage,
      installmentDiscountTotal: offer.installmentDiscountTotal,
      offerDurationId: offer.offerDurationId,
      offerDurationMonths: offer.offerDurationMonths,
      offerDurationDiscountPercentage: offer.offerDurationDiscountPercentage,
      offerDurationDiscountTotal: offer.offerDurationDiscountTotal,
      projectStartDate: offer.projectStartDate,
      paymentStartDate: offer.paymentStartDate,
      payDay: offer.payDay,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt
    }))
  } catch (error) {
    logDebug("Erro ao buscar ofertas:", error)
    return offers // dados mockados em memória como fallback
  }
}

export async function getProductOffers(productId: string): Promise<Offer[]> {
  try {
    const allOffers = await getOffers()
    return allOffers.filter((offer) => 
      offer.items.some((item) => item.productId === productId)
    )
  } catch (error) {
    logDebug(`Erro ao buscar ofertas para o produto ${productId}:`, error)
    return []
  }
}

export async function getOfferById(id: string): Promise<Offer> {
  try {
    // Fazer a requisição para a API seguindo o documento
    const response = await fetch(`/api/sales/offers/${id}`);
    
    if (!response.ok) {
      throw new Error(`Falha ao buscar oferta: ${response.status}`);
    }
    
    const offerData = await response.json();
    console.log(`[API Client] Oferta ${id} recebida da API:`, offerData);
    
    // Verificar se os itens estão disponíveis
    if (!offerData.offerItems || !Array.isArray(offerData.offerItems)) {
      console.log('[API Client] Aviso: Oferta não possui itens.');
    }
    
    // Construir objeto padrão com os dados da API
    const offer: Offer = {
      id: offerData.id,
      leadId: offerData.leadId || "",
      leadName: offerData.leadName,
      status: offerData.status,
      type: offerData.type,
      subtotal: offerData.subtotalPrice || offerData.subtotal || 0,
      total: offerData.totalPrice || offerData.total || 0,
      items: Array.isArray(offerData.offerItems) 
        ? offerData.offerItems?.map(item => ({
            id: item.id,
            productId: item.productId,
            priceId: item.priceId,
            price: item.price,
            quantity: item.quantity,
            totalPrice: item.totalPrice
          }))
        : [],
      couponId: offerData.couponId,
      couponDiscountPercentage: offerData.couponDiscountPercentage,
      couponDiscountTotal: offerData.couponDiscountTotal,
      installmentId: offerData.installmentId,
      installmentMonths: offerData.installmentMonths,
      installmentDiscountPercentage: offerData.installmentDiscountPercentage,
      installmentDiscountTotal: offerData.installmentDiscountTotal,
      offerDurationId: offerData.offerDurationId,
      offerDurationMonths: offerData.offerDurationMonths,
      offerDurationDiscountPercentage: offerData.offerDurationDiscountPercentage,
      offerDurationDiscountTotal: offerData.offerDurationDiscountTotal,
      projectStartDate: offerData.projectStartDate,
      paymentStartDate: offerData.paymentStartDate,
      payDay: offerData.payDay,
      isFixedTermOffer: offerData.isFixedTermOffer,
      createdAt: offerData.createdAt,
      updatedAt: offerData.updatedAt
    };
    
    // Salvar em cache para referência futura
    saveOffer(id, offerData);
    
    return offer;
  } catch (error) {
    console.error(`[API Client] Erro ao buscar oferta ${id}:`, error);
    throw error;
  }
}

// Função para verificar se um produto foi adicionado à oferta
export async function verifyProductInOffer(offerId: string, productId?: string): Promise<{
  exists: boolean;
  message: string;
  offerDetails?: any;
  items?: any[];
  isDuplicated?: boolean;
  duplicateCount?: number;
}> {
  logDebug(`Verificando se produto ${productId || 'qualquer'} existe na oferta ${offerId}`);
  
  try {
    // Obter os dados da oferta diretamente da API
    const response = await fetch(`/api/sales/offers/${offerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Erro ao buscar oferta: ${response.status} - ${errorText}`);
    }
    
    const offerData = await response.json();
    logDebug(`Obtidos dados diretos da oferta ${offerId}`, offerData);
    
    // Se a oferta não tem itens ou offerItems não é um array
    if (!offerData.offerItems || !Array.isArray(offerData.offerItems) || offerData.offerItems.length === 0) {
      return {
        exists: false,
        message: 'A oferta não possui nenhum item',
        offerDetails: {
          id: offerData.id,
          status: offerData.status,
          type: offerData.type,
          subtotalPrice: offerData.subtotalPrice || 0,
          totalPrice: offerData.totalPrice || 0,
          itemCount: 0
        }
      };
    }
    
    // Se estamos verificando um produto específico
    if (productId) {
      const matchingItems = offerData.offerItems.filter((item: any) => 
        item.productId === productId
      );
      
      const exists = matchingItems.length > 0;
      const isDuplicated = matchingItems.length > 1;
      
      return {
        exists,
        isDuplicated,
        duplicateCount: matchingItems.length,
        message: exists 
          ? `Produto ${productId} encontrado na oferta ${offerId}`
          : `Produto ${productId} não encontrado na oferta ${offerId}`,
        offerDetails: {
          id: offerData.id,
          status: offerData.status,
          type: offerData.type,
          subtotalPrice: offerData.subtotalPrice || 0,
          totalPrice: offerData.totalPrice || 0,
          itemCount: offerData.offerItems.length
        },
        items: matchingItems
      };
    }
    
    // Retornar informações sobre todos os itens
    return {
      exists: true,
      message: `Oferta ${offerId} possui ${offerData.offerItems.length} item(s)`,
      offerDetails: {
        id: offerData.id,
        status: offerData.status,
        type: offerData.type,
        subtotalPrice: offerData.subtotalPrice || 0,
        totalPrice: offerData.totalPrice || 0,
        itemCount: offerData.offerItems.length
      },
      items: offerData.offerItems
    };
  } catch (error) {
    logDebug(`Erro ao verificar produto na oferta:`, error);
    throw error;
  }
}

// Função unificada para adicionar produto a uma oferta
export async function addProductToOffer(
  offerId: string,
  productId: string,
  priceId: string,
  quantity: number
): Promise<Offer> {
  console.log("==============================");
  console.log("INICIANDO ADIÇÃO DE PRODUTO À OFERTA");
  console.log("==============================");
  console.log("offerId:", offerId);
  console.log("productId:", productId);
  console.log("priceId:", priceId);
  console.log("quantity:", quantity);
  
  try {
    // Verificar se o produto já existe na oferta
    const verificationResult = await verifyProductInOffer(offerId, productId);
    
    // Se o produto já existir, apenas retornar a oferta atual
    if (verificationResult.exists) {
      console.log("Produto já existe na oferta. Ignorando duplicação.");
      
      // Verificar se o item está duplicado e alertar
      if (verificationResult.isDuplicated) {
        console.warn(`ALERTA: Produto está duplicado ${verificationResult.duplicateCount} vezes na oferta`);
      }
      
      // Buscar oferta completa
      return await getOfferById(offerId);
    }
    
    // Preparar o corpo da requisição
    const requestBody = {
      offerId,
      productId,
      priceId,
      quantity: Number(quantity) || 1
    };
    
    // Log detalhado do corpo da requisição
    console.log('API request body:');
    console.log(requestBody);
    
    // Usar a rota documentada em doc.txt: /offers/items (POST)
    const response = await fetch("/api/sales/offers/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    
    // Log da resposta HTTP
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error('Erro na resposta da API:', errorText);
      throw new Error(`Erro ao adicionar produto: ${response.status} - ${errorText}`);
    }
    
    // Obter a resposta completa da API
    const apiResponse = await response.json();
    console.log("[API Client] Produto adicionado com sucesso à API");
    console.log("[API Client] Resposta completa da API após adicionar item:", apiResponse);
    
    // Verificar se a resposta possui offerItems
    if (!apiResponse.offerItems || !Array.isArray(apiResponse.offerItems)) {
      console.log("ALERTA: A resposta da API não contém array offerItems!");
    }
    
    // Verificar a estrutura da resposta
    if (!apiResponse || !apiResponse.id) {
      throw new Error("Resposta da API inválida ao adicionar produto");
    }
    
    // Formatar a resposta para garantir que temos o formato correto para o cliente
    const standardizedResponse: Offer = {
      id: apiResponse.id,
      leadId: apiResponse.leadId || "",
      status: apiResponse.status,
      type: apiResponse.type,
      subtotal: apiResponse.subtotalPrice || apiResponse.subtotal || 0,
      total: apiResponse.totalPrice || apiResponse.total || 0,
      items: apiResponse.offerItems?.map(item => ({
        id: item.id,
        productId: item.productId,
        priceId: item.priceId,
        price: item.price,
        quantity: item.quantity,
        totalPrice: item.totalPrice
      })) || [],
      createdAt: apiResponse.createdAt,
      updatedAt: apiResponse.updatedAt
    };
    
    // Salvar a resposta real em cache
    saveOffer(offerId, apiResponse);
    
    return standardizedResponse;
  } catch (error) {
    console.error("[API Client] Erro ao adicionar produto à oferta:", error);
    throw error;
  }
}

export async function createCategory(category: Omit<Category, "id">): Promise<Category> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newCategory: Category = {
        id: `cat-${categories.length + 1}`,
        ...category,
      }
      categories.push(newCategory)
      resolve(newCategory)
    }, 500)
  })
}

export async function createDeliverable(deliverable: Omit<Deliverable, "id" | "productId" | "createdAt" | "updatedAt">): Promise<Deliverable> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newDeliverable: Deliverable = {
        id: `del-${deliverables.length + 1}`,
        ...deliverable,
        productId: "", // Será preenchido quando associado a um produto
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      deliverables.push(newDeliverable)
      resolve(newDeliverable)
    }, 500)
  })
}

// Funções adicionais para API de Payment Methods
export async function getPaymentMethodById(id: string): Promise<PaymentMethod> {
  try {
    const response = await fetch(`/api/sales/payment-methods/${id}`);
    if (!response.ok) throw new Error('Falha ao buscar método de pagamento');
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar método de pagamento ${id}:`, error);
    throw error;
  }
}

export async function createNewPaymentMethod(data: {
  name: string;
  description: string;
  code: string;
}): Promise<PaymentMethod> {
  try {
    const response = await fetch('/api/sales/payment-methods', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Falha ao criar método de pagamento: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao criar método de pagamento:', error);
    throw error;
  }
}

export async function updatePaymentMethod(id: string, data: {
  name?: string;
  description?: string;
  code?: string;
}): Promise<PaymentMethod> {
  try {
    const response = await fetch(`/api/sales/payment-methods/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...data }),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Falha ao atualizar método de pagamento: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro ao atualizar método de pagamento ${id}:`, error);
    throw error;
  }
}

export async function deletePaymentMethod(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/sales/payment-methods/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Falha ao excluir método de pagamento: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error(`Erro ao excluir método de pagamento ${id}:`, error);
    throw error;
  }
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    // Tentar obter dados reais
    const methods = await getAllPaymentMethods();
    
    // Se retornou array vazio, fornecer dados padrão para ambientes de desenvolvimento
    if (Array.isArray(methods) && methods.length === 0) {
      console.log("Nenhum método de pagamento encontrado, usando dados padrão");
      return [
        {
          id: "method-dev-1",
          name: "Cartão de Crédito",
          description: "Pagamento via cartão de crédito (Visa, Mastercard, etc)",
          code: "CREDIT_CARD",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "method-dev-2",
          name: "Pix",
          description: "Pagamento instantâneo via Pix",
          code: "PIX",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
    
    // Retornar os dados reais
    return methods;
  } catch (error) {
    console.error("Erro ao obter métodos de pagamento:", error);
    // Em caso de erro, retornar array vazio
    return [];
  }
}

export async function getAllPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const response = await fetch('/api/sales/payment-methods');
    if (!response.ok) throw new Error('Falha ao buscar métodos de pagamento');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar métodos de pagamento:', error);
    return [];
  }
}

// Funções para gerenciar parcelas (installments)
export async function getInstallments(): Promise<Installment[]> {
  try {
    const response = await fetch('/api/sales/installments');
    if (!response.ok) throw new Error('Falha ao buscar parcelas');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar parcelas:', error);
    return [];
  }
}

export async function getInstallmentById(id: string): Promise<Installment> {
  try {
    const response = await fetch(`/api/sales/installments/${id}`);
    if (!response.ok) throw new Error('Falha ao buscar parcela');
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar parcela ${id}:`, error);
    throw error;
  }
}

export async function createInstallment(data: {
  installment: number;
  discountPercentage: number;
  paymentMethodId: string;
}): Promise<Installment> {
  try {
    const response = await fetch('/api/sales/installments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Falha ao criar parcela: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao criar parcela:', error);
    throw error;
  }
}

export async function updateInstallment(id: string, data: {
  installment?: number;
  discountPercentage?: number;
  paymentMethodId?: string;
}): Promise<Installment> {
  try {
    const response = await fetch(`/api/sales/installments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Falha ao atualizar parcela: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro ao atualizar parcela ${id}:`, error);
    throw error;
  }
}

export async function deleteInstallment(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/sales/installments/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Falha ao excluir parcela: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error(`Erro ao excluir parcela ${id}:`, error);
    throw error;
  }
}

// Funções para gerenciar durações de ofertas
export type OfferDuration = {
  id: string;
  months: number;
  discountPercentage: number;
  createdAt: string;
  updatedAt: string;
};

export async function getOfferDurations(): Promise<OfferDuration[]> {
  try {
    const response = await fetch('/api/sales/offer-durations');
    if (!response.ok) throw new Error('Falha ao buscar durações de ofertas');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar durações de ofertas:', error);
    return [];
  }
}

export async function getOfferDurationById(id: string): Promise<OfferDuration> {
  try {
    const response = await fetch(`/api/sales/offer-durations/${id}`);
    if (!response.ok) throw new Error('Falha ao buscar duração de oferta');
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar duração de oferta ${id}:`, error);
    throw error;
  }
}

// Função para aplicar status de fidelização à oferta
export async function applyFixedTerm({ offerId, isFixedTermOffer }: { offerId: string, isFixedTermOffer: boolean }): Promise<Offer> {
  try {
    const response = await fetch('/api/sales/offers/fixed-term', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ offerId, isFixedTermOffer }),
    });
    
    if (!response.ok) throw new Error('Falha ao aplicar fidelização à oferta');
    
    const offerData = await response.json();
    console.log("Fidelização aplicada com sucesso:", offerData);
    
    // Salvar em cache
    saveOffer(offerId, offerData);
    
    // Formatar resposta para o frontend
    const offer: Offer = {
      id: offerData.id,
      leadId: offerData.leadId || "",
      status: offerData.status,
      type: offerData.type,
      subtotal: offerData.subtotalPrice || offerData.subtotal || 0,
      total: offerData.totalPrice || offerData.total || 0,
      items: Array.isArray(offerData.offerItems) 
        ? offerData.offerItems?.map(item => ({
            id: item.id,
            productId: item.productId,
            priceId: item.priceId,
            price: item.price,
            quantity: item.quantity,
            totalPrice: item.totalPrice
          }))
        : [],
      couponId: offerData.couponId,
      couponDiscountPercentage: offerData.couponDiscountPercentage,
      couponDiscountTotal: offerData.couponDiscountTotal,
      installmentId: offerData.installmentId,
      installmentMonths: offerData.installmentMonths,
      installmentDiscountPercentage: offerData.installmentDiscountPercentage,
      installmentDiscountTotal: offerData.installmentDiscountTotal,
      offerDurationId: offerData.offerDurationId,
      offerDurationMonths: offerData.offerDurationMonths,
      offerDurationDiscountPercentage: offerData.offerDurationDiscountPercentage,
      offerDurationDiscountTotal: offerData.offerDurationDiscountTotal,
      projectStartDate: offerData.projectStartDate,
      paymentStartDate: offerData.paymentStartDate,
      payDay: offerData.payDay,
      isFixedTermOffer: offerData.isFixedTermOffer,
      createdAt: offerData.createdAt,
      updatedAt: offerData.updatedAt
    };
    
    return offer;
  } catch (error) {
    console.error('Erro ao aplicar fidelização à oferta:', error);
    throw error;
  }
}

// Tipos para gerenciamento de ofertas
export type ProductPrice = {
  currencyId: string;
  amount: number;
};

export type ProductDetail = {
  id: string;
  name: string;
  description: string;
  paymentType: "ONE_TIME" | "RECURRENT";
  prices: ProductPrice[];
  createdAt: string;
  updatedAt: string;
};

export type Session = {
  id: string;
  leadId: string;
  oneTimeOfferId: string;
  recurrentOfferId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

// Função para criar uma sessão
export async function createSession(data: { name: string; salesforceLeadId: string }): Promise<Session> {
  try {
    const response = await fetch('/api/sales/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Falha ao criar sessão: ${response.status} ${errorText}`);
    }
    
    // Garantir que a resposta segue o formato da documentação
    const sessionData = await response.json();
    
    // Formato da resposta conforme a documentação
    const formattedResponse: Session = {
      id: sessionData.id,
      leadId: sessionData.leadId,
      oneTimeOfferId: sessionData.oneTimeOfferId,
      recurrentOfferId: sessionData.recurrentOfferId,
      expiresAt: sessionData.expiresAt,
      createdAt: sessionData.createdAt,
      updatedAt: sessionData.updatedAt
    };
    
    return formattedResponse;
  } catch (error) {
    console.error('Erro ao criar sessão:', error);
    throw error;
  }
}

export type { Category, Currency, Deliverable, Guideline, ModifierType, Coupon, PaymentMethod }

// Função para aplicar parcelamento à oferta
export async function applyInstallment(data: {
  offerId: string,
  installmentId: string
}): Promise<Offer> {
  try {
    console.log("Aplicando parcelamento à oferta:", data);
    
    // Usar a rota documentada em doc.txt: POST /offers/installment
    const response = await fetch("/api/sales/offers/installment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Erro ao aplicar parcelamento: ${response.status} - ${errorText}`);
    }
    
    const offerData = await response.json();
    console.log("Parcelamento aplicado com sucesso:", offerData);
    
    // Salvar em cache
    saveOffer(data.offerId, offerData);
    
    // Formatar resposta para o frontend
    const offer: Offer = {
      id: offerData.id,
      leadId: offerData.leadId || "",
      status: offerData.status,
      type: offerData.type,
      subtotal: offerData.subtotalPrice || offerData.subtotal || 0,
      total: offerData.totalPrice || offerData.total || 0,
      items: Array.isArray(offerData.offerItems) 
        ? offerData.offerItems?.map(item => ({
            id: item.id,
            productId: item.productId,
            priceId: item.priceId,
            price: item.price,
            quantity: item.quantity,
            totalPrice: item.totalPrice
          }))
        : [],
      couponId: offerData.couponId,
      couponDiscountPercentage: offerData.couponDiscountPercentage,
      couponDiscountTotal: offerData.couponDiscountTotal,
      installmentId: offerData.installmentId,
      installmentMonths: offerData.installmentMonths,
      installmentDiscountPercentage: offerData.installmentDiscountPercentage,
      installmentDiscountTotal: offerData.installmentDiscountTotal,
      offerDurationId: offerData.offerDurationId,
      offerDurationMonths: offerData.offerDurationMonths,
      offerDurationDiscountPercentage: offerData.offerDurationDiscountPercentage,
      offerDurationDiscountTotal: offerData.offerDurationDiscountTotal,
      projectStartDate: offerData.projectStartDate,
      paymentStartDate: offerData.paymentStartDate,
      payDay: offerData.payDay,
      isFixedTermOffer: offerData.isFixedTermOffer,
      createdAt: offerData.createdAt,
      updatedAt: offerData.updatedAt
    };
    
    return offer;
  } catch (error) {
    console.error("Erro ao aplicar parcelamento:", error);
    throw error;
  }
}

// Função para aplicar duração à oferta
export async function applyOfferDuration(data: {
  offerId: string,
  offerDurationId: string
}): Promise<Offer> {
  try {
    console.log("Aplicando duração à oferta:", data);
    
    // Usar a rota documentada em doc.txt: POST /offers/offer-duration
    const response = await fetch("/api/sales/offers/offer-duration", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Erro ao aplicar duração: ${response.status} - ${errorText}`);
    }
    
    const offerData = await response.json();
    console.log("Duração aplicada com sucesso:", offerData);
    
    // Salvar em cache
    saveOffer(data.offerId, offerData);
    
    // Formatar resposta para o frontend
    const offer: Offer = {
      id: offerData.id,
      leadId: offerData.leadId || "",
      status: offerData.status,
      type: offerData.type,
      subtotal: offerData.subtotalPrice || offerData.subtotal || 0,
      total: offerData.totalPrice || offerData.total || 0,
      items: Array.isArray(offerData.offerItems) 
        ? offerData.offerItems?.map(item => ({
            id: item.id,
            productId: item.productId,
            priceId: item.priceId,
            price: item.price,
            quantity: item.quantity,
            totalPrice: item.totalPrice
          }))
        : [],
      couponId: offerData.couponId,
      couponDiscountPercentage: offerData.couponDiscountPercentage,
      couponDiscountTotal: offerData.couponDiscountTotal,
      installmentId: offerData.installmentId,
      installmentMonths: offerData.installmentMonths,
      installmentDiscountPercentage: offerData.installmentDiscountPercentage,
      installmentDiscountTotal: offerData.installmentDiscountTotal,
      offerDurationId: offerData.offerDurationId,
      offerDurationMonths: offerData.offerDurationMonths,
      offerDurationDiscountPercentage: offerData.offerDurationDiscountPercentage,
      offerDurationDiscountTotal: offerData.offerDurationDiscountTotal,
      projectStartDate: offerData.projectStartDate,
      paymentStartDate: offerData.paymentStartDate,
      payDay: offerData.payDay,
      isFixedTermOffer: offerData.isFixedTermOffer,
      createdAt: offerData.createdAt,
      updatedAt: offerData.updatedAt
    };
    
    return offer;
  } catch (error) {
    console.error("Erro ao aplicar duração:", error);
    throw error;
  }
}

export async function getSessionById(sessionId: string): Promise<Session> {
  try {
    console.log(`Buscando sessão: ${sessionId}`);
    
    const response = await fetch(`/api/sales/sessions/${sessionId}`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Falha ao buscar sessão: ${response.status} ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar sessão ${sessionId}:`, error);
    throw error;
  }
}
