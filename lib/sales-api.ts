import { apiRequest, SALES_API_URL } from "./api-fetch";

// Interfaces para o serviço de vendas
export interface Session {
  id: string;
  leadId: string;
  oneTimeOfferId: string;
  recurrentOfferId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
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

// Sessions
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

// Função para fechar uma sessão
export async function closeSession(sessionId: string): Promise<Session> {
  return apiRequest<Session>(`${SALES_API_URL}/sessions/${sessionId}/close`, {
    method: "PUT",
  });
}

// Offers
export async function getAllOffers(): Promise<Offer[]> {
  const maxRetries = 2;
  let lastError = null;
  
  try {
    console.log("Buscando ofertas diretamente da API local...");
    const localOffers = await apiRequest<Offer[]>("/api/sales/offers");
    
    // Verificar se retornou dados válidos
    if (Array.isArray(localOffers) && localOffers.length > 0) {
      console.log(`API local retornou ${localOffers.length} ofertas com sucesso`);
      return localOffers;
    } else {
      console.warn("API local retornou um array vazio ou inválido");
      throw new Error("Dados inválidos da API local");
    }
  } catch (error) {
    console.error("Erro ao acessar ofertas:", error);
    
    // Se a API falhar, retornamos array vazio para não quebrar a UI
    if (process.env.NODE_ENV === "development") {
      console.warn("Retornando array vazio como fallback em ambiente de desenvolvimento");
      return [];
    } else {
      throw error;
    }
  }
}

export async function getOfferById(offerId: string): Promise<Offer> {
  return apiRequest<Offer>(`${SALES_API_URL}/offers/${offerId}`);
}

// Adicionar item a uma oferta
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

// Remover item de uma oferta
export async function removeItemFromOffer(offerId: string, offerItemId: string): Promise<Offer> {
  return apiRequest<Offer>(`${SALES_API_URL}/offers/${offerId}/items/${offerItemId}`, {
    method: "DELETE",
  });
}

// Atualizar uma oferta
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

// Aplicar duração a uma oferta
export async function applyOfferDuration(data: {
  offerId: string;
  offerDurationId: string;
}): Promise<Offer> {
  return apiRequest<Offer>(`${SALES_API_URL}/offers/offer-duration`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Aplicar cupom a uma oferta
export async function applyCoupon(data: { offerId: string; couponCode: string }): Promise<Offer> {
  return apiRequest<Offer>(`${SALES_API_URL}/offers/coupon`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Aplicar parcelamento a uma oferta
export async function applyInstallment(data: { offerId: string; installmentId: string }): Promise<Offer> {
  return apiRequest<Offer>(`${SALES_API_URL}/offers/installment`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Cupons
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

// Leads
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

// Offer Durations
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

// Installments
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

// Payment Methods
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