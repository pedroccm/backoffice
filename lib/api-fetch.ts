// URLs base das APIs
export const SALES_API_URL = "https://api.sales.dev.mktlab.app";
export const CATALOG_API_URL = "https://api.catalog.dev.mktlab.app";

// Função auxiliar para fazer requisições à API
export async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  // Verificar se a URL é relativa (API local) ou absoluta (API externa)
  const isLocalApi = url.startsWith('/api/');
  const isExternalSalesApi = url.includes(SALES_API_URL);
  const isExternalCatalogApi = url.includes(CATALOG_API_URL);
  
  // Log para debug
  console.debug(`Iniciando requisição para: ${url} (${isLocalApi ? 'API local' : 'API externa'})`);
  
  try {
    // Adiciona timeout para evitar requisições penduradas
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    // Log para debug sobre a resposta
    console.debug(`Resposta de ${url}: status ${response.status}`);

    if (!response.ok) {
      // Tenta extrair mensagem de erro da resposta
      let errorDetails = '';
      
      try {
        const errorText = await response.text();
        
        // Verificar se há conteúdo na resposta
        if (errorText.trim()) {
          try {
            // Tentar converter para JSON
            const errorData = JSON.parse(errorText);
            errorDetails = JSON.stringify(errorData);
            console.error(`Erro na resposta de ${url}:`, errorData);
          } catch (jsonError) {
            // Se não for JSON válido, usar o texto bruto
            errorDetails = errorText;
            console.error(`Erro na resposta de ${url} (texto não-JSON):`, errorText);
          }
        } else {
          errorDetails = '[Resposta vazia]';
          console.error(`Erro na resposta de ${url}: Resposta vazia`);
        }
      } catch (e) {
        errorDetails = '[Erro ao ler resposta]';
        console.error(`Não foi possível extrair detalhes do erro de ${url}:`, e);
      }
      
      throw new Error(
        `Erro na requisição: ${response.status} - ${response.statusText}${errorDetails ? ` - ${errorDetails}` : ''}`
      );
    }

    // Para respostas vazias sem conteúdo
    if (response.status === 204) {
      console.debug(`Resposta sem conteúdo de ${url}`);
      return {} as T;
    }

    // Verifica o tipo de conteúdo
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`Resposta não-JSON de ${url}: ${contentType}`);
      // Para APIs que não retornam JSON
      const text = await response.text();
      
      // Tentar converter para JSON mesmo assim (algumas APIs retornam JSON sem o Content-Type correto)
      try {
        if (text.trim()) {
          const data = JSON.parse(text);
          console.debug(`Dados recebidos de ${url} (convertidos de texto): ${Array.isArray(data) ? `Array com ${data.length} itens` : 'Objeto'}`);
          return data as T;
        }
      } catch (e) {
        console.debug(`Não foi possível converter resposta de texto para JSON: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`);
      }
      
      // Se chegou aqui, retornar um objeto vazio ou array conforme o tipo esperado
      console.warn(`Retornando dados vazios para resposta não-JSON de ${url}`);
      return (Array.isArray({} as T) ? [] : {}) as T;
    }

    let data;
    try {
      const text = await response.text();
      
      // Verificar se há conteúdo na resposta
      if (!text.trim()) {
        console.warn(`Resposta JSON vazia de ${url}`);
        return (Array.isArray({} as T) ? [] : {}) as T;
      }
      
      data = JSON.parse(text);
    } catch (e) {
      console.error(`Erro ao parsear JSON de ${url}:`, e);
      throw new Error(`Erro ao processar resposta da API: ${e instanceof Error ? e.message : String(e)}`);
    }
    
    // Log para debug sobre o resultado
    console.debug(`Dados recebidos de ${url}: ${Array.isArray(data) ? `Array com ${data.length} itens` : 'Objeto'}`);
    
    return data as T;
  } catch (error) {
    // Tratamento específico para erros de timeout
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error(`Timeout na requisição para ${url}`);
      
      if (isExternalSalesApi || isExternalCatalogApi) {
        console.warn(`Redirecionando para API local equivalente após timeout em API externa ${url}`);
        
        // Redirecionar para a API local equivalente
        const localUrl = url
          .replace(SALES_API_URL, '/api/sales')
          .replace(CATALOG_API_URL, '/api/catalog');
        
        console.debug(`Tentando API local: ${localUrl}`);
        return apiRequest<T>(localUrl, options);
      }
    }
    
    // Para APIs locais, podemos tratar o erro de forma diferente para não quebrar a interface
    if (isLocalApi) {
      console.error(`Erro ao acessar API local ${url}:`, error);
      
      // Verificar o tipo de retorno esperado com base no URL
      if (url.endsWith('/offers') || url.endsWith('/products') || 
          url.endsWith('/categories') || url.endsWith('/currencies') || 
          url.endsWith('/deliverables') || url.endsWith('/modifier-types') ||
          url.endsWith('/coupons')) {
        // Endpoints que retornam arrays
        console.warn(`Retornando array vazio como fallback para ${url}`);
        return [] as unknown as T;
      }
      
      // Endpoints que retornam objetos
      console.warn(`Retornando objeto vazio como fallback para ${url}`);
      return {} as T;
    }
    
    // Se a API externa falhar e não for API local, tenta redirecionar para a API local
    if (isExternalSalesApi || isExternalCatalogApi) {
      console.warn(`API externa falhou: ${url}. Erro: ${error instanceof Error ? error.message : String(error)}`);
      console.warn(`Tentando redirecionar para API local`);
      
      try {
        // Redirecionar para a API local equivalente
        const localUrl = url
          .replace(SALES_API_URL, '/api/sales')
          .replace(CATALOG_API_URL, '/api/catalog');
        
        console.debug(`Tentando API local: ${localUrl}`);
        return apiRequest<T>(localUrl, options);
      } catch (localError) {
        console.error(`Também falhou ao acessar API local ${url}:`, localError);
        throw error; // Repassar o erro original se a API local também falhar
      }
    }
    
    throw error;
  }
}

// Tipos baseados na documentação
export interface Session {
  id: string;
  leadId: string;
  oneTimeOfferId: string;
  recurrentOfferId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  leadExternalAccounts: LeadExternalAccount[];
}

export interface LeadExternalAccount {
  id: string;
  leadId: string;
  platform: string;
  platformId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferItem {
  id: string;
  offerId: string;
  productId: string;
  priceId: string;
  productType: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface Offer {
  id: string;
  leadId: string;
  couponId?: string;
  couponDiscountPercentage?: number;
  couponDiscountTotal?: number;
  installmentId?: string;
  installmentMonths?: number;
  installmentDiscountPercentage?: number;
  installmentDiscountTotal?: number;
  offerDurationId?: string;
  offerDurationMonths?: number;
  offerDurationDiscountPercentage?: number;
  offerDurationDiscountTotal?: number;
  projectStartDate?: string;
  paymentStartDate?: string;
  payDay?: number;
  status: string;
  type: "ONE_TIME" | "RECURRENT";
  subtotalPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  offerItems: OfferItem[];
}

export interface OfferDuration {
  id: string;
  months: number;
  discountPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface Installment {
  id: string;
  installment: number;
  discountPercentage: number;
  paymentMethodId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  type: "ONE_TIME" | "RECURRENT";
  usedOfferId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  paymentType: string;
  status: string;
  singleItemOnly: boolean;
  categoryId: string;
  prices: ProductPrice[];
  deliverables: ProductDeliverable[];
  guidelines: ProductGuideline[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPrice {
  amount: number;
  currencyId: string;
  modifierTypeId?: string;
}

export interface ProductDeliverable {
  id: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductGuideline {
  id: string;
  name: string;
  description: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Currency {
  id: string;
  name: string;
  symbol: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModifierType {
  id: string;
  key: string;
  displayName: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Funções para API de Sessions
export async function createSession(data: { name: string; salesforceLeadId: string }): Promise<Session> {
  return apiRequest<Session>(`${SALES_API_URL}/sessions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getSessionByLeadId(leadId: string): Promise<Session> {
  return apiRequest<Session>(`${SALES_API_URL}/sessions/lead/${leadId}`);
}

export async function getSessionById(sessionId: string): Promise<Session> {
  return apiRequest<Session>(`${SALES_API_URL}/sessions/${sessionId}`);
}

// Funções para API de Offers
export async function getOfferById(offerId: string): Promise<Offer> {
  return apiRequest<Offer>(`${SALES_API_URL}/offers/${offerId}`);
}

export async function addItemToOffer(data: {
  offerId: string;
  productId: string;
  priceId: string;
  quantity: number;
}): Promise<Offer> {
  return apiRequest<Offer>(`${SALES_API_URL}/offers/items`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function removeItemFromOffer(offerId: string, offerItemId: string): Promise<Offer> {
  return apiRequest<Offer>(`${SALES_API_URL}/offers/${offerId}/items/${offerItemId}`, {
    method: "DELETE",
  });
}

export async function updateOffer(data: {
  offerId: string;
  projectStartDate?: string;
  paymentStartDate?: string;
  payDay?: number;
}): Promise<Offer> {
  return apiRequest<Offer>(`${SALES_API_URL}/offers`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function applyOfferDuration(data: {
  offerId: string;
  offerDurationId: string;
}): Promise<Offer> {
  return apiRequest<Offer>(`${SALES_API_URL}/offers/offer-duration`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function applyCoupon(data: { offerId: string; couponCode: string }): Promise<Offer> {
  return apiRequest<Offer>(`${SALES_API_URL}/offers/coupon`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function applyInstallment(data: { offerId: string; installmentId: string }): Promise<Offer> {
  return apiRequest<Offer>(`${SALES_API_URL}/offers/installment`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Funções para API de Coupons
export async function createCoupon(data: {
  code: string;
  discountPercentage: number;
  type: "ONE_TIME" | "RECURRENT";
}): Promise<Coupon> {
  return apiRequest<Coupon>(`${SALES_API_URL}/coupons`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCoupons(): Promise<Coupon[]> {
  return apiRequest<Coupon[]>(`${SALES_API_URL}/coupons`);
}

// Funções para API de Leads
export async function getLeadById(leadId: string): Promise<Lead> {
  return apiRequest<Lead>(`${SALES_API_URL}/leads/${leadId}`);
}

export async function updateLead(data: { id: string; name: string }): Promise<Lead> {
  return apiRequest<Lead>(`${SALES_API_URL}/leads`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function updateLeadExternalAccount(data: {
  leadId: string;
  accountId: string;
  platformId: string;
}): Promise<Lead> {
  return apiRequest<Lead>(`${SALES_API_URL}/leads/external-accounts`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Funções para API de Offer Durations
export async function createOfferDuration(data: {
  months: number;
  discountPercentage: number;
}): Promise<OfferDuration> {
  return apiRequest<OfferDuration>(`${SALES_API_URL}/offer-durations`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getOfferDurations(): Promise<OfferDuration[]> {
  return apiRequest<OfferDuration[]>(`${SALES_API_URL}/offer-durations`);
}

export async function getOfferDurationById(offerDurationId: string): Promise<OfferDuration> {
  return apiRequest<OfferDuration>(`${SALES_API_URL}/offer-durations/${offerDurationId}`);
}

// Funções para API de Installments
export async function createInstallment(data: {
  installment: number;
  discountPercentage: number;
  paymentMethodId: string;
}): Promise<Installment> {
  return apiRequest<Installment>(`${SALES_API_URL}/installments`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getInstallments(): Promise<Installment[]> {
  return apiRequest<Installment[]>(`${SALES_API_URL}/installments`);
}

// Funções para API de Payment Methods
export async function createPaymentMethod(data: {
  name: string;
  description: string;
  code: string;
}): Promise<PaymentMethod> {
  return apiRequest<PaymentMethod>(`${SALES_API_URL}/payment-methods`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  return apiRequest<PaymentMethod[]>(`${SALES_API_URL}/payment-methods`);
}

// Funções para API de Products (Catalog API)
export async function getProducts(): Promise<Product[]> {
  return apiRequest<Product[]>(`${CATALOG_API_URL}/products`);
}

export async function getProductById(id: string): Promise<Product> {
  return apiRequest<Product>(`${CATALOG_API_URL}/products/find/${id}`);
}

// Funções para API de Categories (Catalog API)
export async function getCategories(): Promise<Category[]> {
  return apiRequest<Category[]>(`${CATALOG_API_URL}/categories`);
}

// Funções para API de Currencies (Catalog API)
export async function getCurrencies(): Promise<Currency[]> {
  return apiRequest<Currency[]>(`${CATALOG_API_URL}/currencies`);
}

// Funções para API de Deliverables (Catalog API)
export async function getDeliverables(): Promise<Deliverable[]> {
  return apiRequest<Deliverable[]>(`${CATALOG_API_URL}/deliverables`);
}

// Funções para API de Modifier Types (Catalog API)
export async function getModifierTypes(): Promise<ModifierType[]> {
  return apiRequest<ModifierType[]>(`${CATALOG_API_URL}/modifier-types`);
} 