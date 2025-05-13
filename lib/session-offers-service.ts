import { getSessionById, getSessionByLeadId, createSession, getLeadById, getOfferById } from "./sales-api";
import type { Session, Lead, Offer } from "./sales-api";

const API_BASE_URL = "/api/sessions";

// Função para buscar todas as sessões da API interna
export async function getSessions(): Promise<Session[]> {
  try {
    const response = await fetch(API_BASE_URL);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar sessões: ${response.status}`);
    }
    
    const data = await response.json();
    return data.sessions || [];
  } catch (error) {
    console.error("Erro ao buscar sessões:", error);
    return [];
  }
}

// Função para buscar uma sessão específica por ID
export async function getSession(sessionId: string): Promise<Session | null> {
  try {
    // Primeiro tenta buscar da API externa
    try {
      const session = await getSessionById(sessionId);
      return session;
    } catch (externalError) {
      console.warn(`Sessão não encontrada na API externa: ${sessionId}`, externalError);
      
      // Se falhar, tenta buscar localmente
      const sessions = await getSessions();
      const session = sessions.find(s => s.id === sessionId);
      return session || null;
    }
  } catch (error) {
    console.error(`Erro ao buscar sessão ${sessionId}:`, error);
    return null;
  }
}

// Função para criar uma nova sessão
export async function createNewSession(data: { name: string; salesforceLeadId: string }): Promise<Session> {
  try {
    // Cria a sessão na API externa
    const session = await createSession(data);
    
    // Também salva na API interna para garantir sincronização
    const currentSessions = await getSessions();
    const updatedSessions = [...currentSessions, session];
    
    await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessions: updatedSessions }),
    });
    
    return session;
  } catch (error) {
    console.error("Erro ao criar sessão:", error);
    throw error;
  }
}

// Função para buscar o lead associado a uma sessão
export async function getSessionLead(sessionId: string): Promise<Lead | null> {
  try {
    const session = await getSession(sessionId);
    
    if (!session || !session.leadId) {
      return null;
    }
    
    return await getLeadById(session.leadId);
  } catch (error) {
    console.error(`Erro ao buscar lead da sessão ${sessionId}:`, error);
    return null;
  }
}

// Função para buscar a sessão de um lead específico
export async function getLeadSession(leadId: string): Promise<Session | null> {
  try {
    return await getSessionByLeadId(leadId);
  } catch (error) {
    console.error(`Erro ao buscar sessão do lead ${leadId}:`, error);
    return null;
  }
}

// Função para atualizar o estado das sessões após uma operação
export async function updateSessions(sessions: Session[]): Promise<void> {
  try {
    await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessions }),
    });
  } catch (error) {
    console.error("Erro ao atualizar sessões:", error);
    throw error;
  }
}

// Função para buscar detalhes de uma oferta da API
export async function getOfferDetails(offerId: string): Promise<Offer | null> {
  try {
    return await getOfferById(offerId);
  } catch (error) {
    console.error(`Erro ao buscar detalhes da oferta ${offerId}:`, error);
    return null;
  }
}

// Interface da oferta de sessão
export interface SessionOffer {
  id: string;
  sessionId: string;
  offerType: "ONE_TIME" | "RECURRENT";
  status: string;
  leadId: string;
  subtotalPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

// Função para buscar todas as ofertas de sessões
export async function getAllSessionOffers(): Promise<SessionOffer[]> {
  try {
    // Buscar todas as sessões
    const sessions = await getSessions();
    
    // Criar array de ofertas a partir das sessões
    const sessionOffers: SessionOffer[] = [];
    
    // Para cada sessão, adicionar suas ofertas (se houverem)
    for (const session of sessions) {
      if (session.oneTimeOfferId) {
        try {
          const offer = await getOfferById(session.oneTimeOfferId);
          sessionOffers.push({
            id: offer.id,
            sessionId: session.id,
            offerType: "ONE_TIME",
            status: offer.status,
            leadId: session.leadId,
            subtotalPrice: offer.subtotalPrice,
            totalPrice: offer.totalPrice,
            createdAt: offer.createdAt,
            updatedAt: offer.updatedAt
          });
        } catch (error) {
          console.error(`Erro ao buscar oferta única da sessão ${session.id}:`, error);
        }
      }
      
      if (session.recurrentOfferId) {
        try {
          const offer = await getOfferById(session.recurrentOfferId);
          sessionOffers.push({
            id: offer.id,
            sessionId: session.id,
            offerType: "RECURRENT",
            status: offer.status,
            leadId: session.leadId,
            subtotalPrice: offer.subtotalPrice,
            totalPrice: offer.totalPrice,
            createdAt: offer.createdAt,
            updatedAt: offer.updatedAt
          });
        } catch (error) {
          console.error(`Erro ao buscar oferta recorrente da sessão ${session.id}:`, error);
        }
      }
    }
    
    return sessionOffers;
  } catch (error) {
    console.error("Erro ao buscar ofertas de sessões:", error);
    return [];
  }
}