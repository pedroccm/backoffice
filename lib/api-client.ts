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

interface Product {
  id: string
  name: string
  description: string
  productType: string
  status: string
  singleItemOnly: boolean
  categoryId: string
  prices: { amount: number; currencyId: string; modifierTypeId: string | null }[]
  deliverables: Deliverable[]
  guidelines: Guideline[]
  createdBy: string
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
    const response = await fetch('/api/catalog/products');
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
  return new Promise((resolve) => {
    setTimeout(() => {
      logDebug("Creating product with data:", product)
      const productId = `prod-${products.length + 1}`

      // Ensure prices are properly formatted
      const formattedPrices = product.prices.map((price) => ({
        amount: Number(price.amount),
        currencyId: price.currencyId,
        modifierTypeId: price.modifierTypeId,
      }))

      // Process deliverables - handle both existing and new deliverables
      const productDeliverables = product.deliverables.map((deliverable) => {
        // Check if this is an existing deliverable (has an id) or a new one
        const existingDeliverable = deliverables.find((d) => d.id === deliverable.id)

        if (existingDeliverable) {
          // If it's an existing deliverable, just update the productId
          return {
            ...existingDeliverable,
            productId: productId,
          }
        } else {
          // If it's a new deliverable, create a new one
          return {
            id: `del-${deliverables.length + 1}`,
            name: deliverable.name,
            description: deliverable.description,
            productId: productId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        }
      })

      // Create the new product with properly formatted data
      const newProduct: Product = {
        id: productId,
        name: product.name,
        description: product.description,
        productType: product.productType,
        status: product.status,
        singleItemOnly: product.singleItemOnly,
        categoryId: product.categoryId,
        prices: formattedPrices,
        deliverables: productDeliverables,
        guidelines: product.guidelines || [],
        createdBy: product.createdBy || "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Add the new product to the products array
      products.push(newProduct)

      // Add any new deliverables to the deliverables array
      productDeliverables.forEach((deliverable) => {
        if (!deliverables.some((d) => d.id === deliverable.id)) {
          deliverables.push(deliverable)
        }
      })

      logDebug("Created new product:", newProduct)
      resolve(newProduct)
    }, 500)
  })
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

export type Offer = {
  id: string
  leadId: string
  leadName: string
  status: "OPEN" | "CONVERTED"
  type: "ONE_TIME" | "RECURRENT"
  subtotal: number
  total: number
  items: OfferItem[]
  createdAt: string
  updatedAt: string
}

export type OfferItem = {
  id: string
  offerId: string
  productId: string
  productPriceId: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export async function getOffers(): Promise<Offer[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...offers])
    }, 500)
  })
}

export async function getProductOffers(productId: string): Promise<Offer[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const productOffers = offers.filter(offer => 
        offer.items.some(item => item.productId === productId)
      )
      resolve([...productOffers])
    }, 500)
  })
}

export async function getOfferById(id: string): Promise<Offer> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const offer = offers.find((offer) => offer.id === id)
      if (offer) {
        resolve({ ...offer })
      } else {
        reject(new Error(`Offer with id ${id} not found`))
      }
    }, 500)
  })
}

export async function addProductToOffer(
  offerId: string,
  productId: string,
  priceId: string,
  quantity: number
): Promise<Offer> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const offerIndex = offers.findIndex((o) => o.id === offerId)
      if (offerIndex === -1) {
        reject(new Error(`Offer with id ${offerId} not found`))
        return
      }

      const product = products.find((p) => p.id === productId)
      if (!product) {
        reject(new Error(`Product with id ${productId} not found`))
        return
      }

      const price = product.prices.find((p) => p.currencyId === priceId)
      if (!price) {
        reject(new Error(`Price with id ${priceId} not found for product ${productId}`))
        return
      }

      const newItem: OfferItem = {
        id: `item-${offerItems.length + 1}`,
        offerId,
        productId,
        productPriceId: priceId,
        quantity,
        unitPrice: price.amount,
        lineTotal: price.amount * quantity
      }

      offerItems.push(newItem)
      offers[offerIndex].items.push(newItem)

      // Recalcular totais
      const subtotal = offers[offerIndex].items.reduce((acc, item) => acc + item.lineTotal, 0)
      offers[offerIndex].subtotal = subtotal
      offers[offerIndex].total = subtotal // Por enquanto sem desconto

      resolve({ ...offers[offerIndex] })
    }, 500)
  })
}

export async function removeProductFromOffer(offerId: string, itemId: string): Promise<Offer> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const offerIndex = offers.findIndex((o) => o.id === offerId)
      if (offerIndex === -1) {
        reject(new Error(`Offer with id ${offerId} not found`))
        return
      }

      const itemIndex = offers[offerIndex].items.findIndex((i) => i.id === itemId)
      if (itemIndex === -1) {
        reject(new Error(`Item with id ${itemId} not found in offer ${offerId}`))
        return
      }

      // Remover item
      offers[offerIndex].items.splice(itemIndex, 1)

      // Recalcular totais
      const subtotal = offers[offerIndex].items.reduce((acc, item) => acc + item.lineTotal, 0)
      offers[offerIndex].subtotal = subtotal
      offers[offerIndex].total = subtotal // Por enquanto sem desconto

      resolve({ ...offers[offerIndex] })
    }, 500)
  })
}

export async function createOffer(offer: {
  leadId: string
  leadName: string
  type: "ONE_TIME" | "RECURRENT"
  items?: {
    productId: string
    productPriceId: string
    quantity: number
  }[]
}): Promise<Offer> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newOffer: Offer = {
        id: `offer-${offers.length + 1}`,
        leadId: offer.leadId,
        leadName: offer.leadName,
        status: "OPEN",
        type: offer.type,
        subtotal: 0,
        total: 0,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Se houver itens, adiciona-os à oferta
      if (offer.items && offer.items.length > 0) {
        for (const item of offer.items) {
          const product = products.find(p => p.id === item.productId)
          if (!product) continue

          const price = product.prices.find(p => p.currencyId === item.productPriceId)
          if (!price) continue

          const newItem: OfferItem = {
            id: `item-${offerItems.length + 1}`,
            offerId: newOffer.id,
            productId: item.productId,
            productPriceId: item.productPriceId,
            quantity: item.quantity,
            unitPrice: price.amount,
            lineTotal: price.amount * item.quantity
          }

          offerItems.push(newItem)
          newOffer.items.push(newItem)
        }

        // Calcula os totais
        newOffer.subtotal = newOffer.items.reduce((acc, item) => acc + item.lineTotal, 0)
        newOffer.total = newOffer.subtotal // Por enquanto sem desconto
      }

      offers.push(newOffer)
      resolve({ ...newOffer })
    }, 500)
  })
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

export type { Product, Category, Currency, Deliverable, Guideline, ModifierType, Coupon }
