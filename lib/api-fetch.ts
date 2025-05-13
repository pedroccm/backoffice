// URLs base das APIs
export const SALES_API_URL = "https://api.sales.dev.mktlab.app";
export const CATALOG_API_URL = "https://api.catalog.dev.mktlab.app";

// Função auxiliar para fazer requisições à API
export async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    // Tenta extrair mensagem de erro da resposta
    try {
      const errorData = await response.json();
      throw new Error(
        `Erro na requisição: ${response.status} - ${response.statusText} - ${
          errorData.message || JSON.stringify(errorData)
        }`
      );
    } catch (e) {
      throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
    }
  }

  return response.json() as Promise<T>;
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