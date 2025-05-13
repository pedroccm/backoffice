import { getOfferById } from "./api-fetch";
import type { Offer } from "./api-fetch";

// Interface para o resultado da sessão
interface Session {
  id: string;
  leadId: string;
  oneTimeOfferId: string;
  recurrentOfferId: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// Interface para ofertas com informações extras
export interface SessionOffer extends Offer {
  sessionId: string;
  offerType: 'ONE_TIME' | 'RECURRENT';
}

// Buscar todas as sessões do arquivo sessions.json através da API
export async function getSessions(): Promise<Session[]> {
  try {
    const response = await fetch('/api/sessions');
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar sessões: ${response.status}`);
    }
    
    const data = await response.json();
    return data.sessions || [];
  } catch (error) {
    console.error('Erro ao buscar sessões:', error);
    return [];
  }
}

// Função para buscar detalhes de uma oferta da API
export async function getOfferDetails(offerId: string, sessionId: string, offerType: 'ONE_TIME' | 'RECURRENT'): Promise<SessionOffer | null> {
  try {
    const offer = await getOfferById(offerId);
    return {
      ...offer,
      sessionId,
      offerType
    };
  } catch (error) {
    console.error(`Erro ao buscar oferta ${offerId}:`, error);
    return null;
  }
}

// Função principal para buscar todas as ofertas das sessões
export async function getAllSessionOffers(): Promise<SessionOffer[]> {
  try {
    const sessions = await getSessions();
    const offers: SessionOffer[] = [];
    const offerPromises: Promise<SessionOffer | null>[] = [];
    
    // Coletar todas as promessas de busca de ofertas
    for (const session of sessions) {
      if (session.oneTimeOfferId) {
        offerPromises.push(getOfferDetails(session.oneTimeOfferId, session.id, 'ONE_TIME'));
      }
      if (session.recurrentOfferId) {
        offerPromises.push(getOfferDetails(session.recurrentOfferId, session.id, 'RECURRENT'));
      }
    }
    
    // Aguardar todas as requisições e filtrar resultados nulos
    const results = await Promise.allSettled(offerPromises);
    
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        offers.push(result.value);
      }
    });
    
    return offers;
  } catch (error) {
    console.error('Erro ao buscar ofertas das sessões:', error);
    return [];
  }
}

// Função para formatar valores monetários
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
} 