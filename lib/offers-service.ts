import { getLeadById, getOfferById, getAllOffers as getApiOffers } from "./sales-api";
import type { Lead, Offer } from "./sales-api";

// Função que busca detalhes de um lead, incluindo nome para exibição na lista
export async function getLeadDetails(leadId: string): Promise<Lead> {
  try {
    const lead = await getLeadById(leadId);
    return lead;
  } catch (error) {
    console.error(`Erro ao buscar detalhes do lead ${leadId}:`, error);
    // Retornar um objeto mínimo com ID e nome genérico para não travar a UI
    return {
      id: leadId,
      name: "Lead não encontrado",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      leadExternalAccounts: [],
    };
  }
}

// Função que busca uma oferta com detalhes adicionais do lead
export async function getOfferWithLeadDetails(offerId: string): Promise<Offer & { leadName: string }> {
  try {
    // Buscar da API real
    const offer = await getOfferById(offerId);
    let leadName = "Lead não encontrado";
    
    // Buscar detalhes do lead se disponível
    if (offer.leadId) {
      try {
        const lead = await getLeadDetails(offer.leadId);
        leadName = lead.name;
      } catch (error) {
        console.error(`Erro ao buscar lead para a oferta ${offerId}:`, error);
      }
    }
    
    return {
      ...offer,
      leadName,
    };
  } catch (error) {
    console.error(`Erro ao buscar oferta com detalhes do lead ${offerId}:`, error);
    throw error;
  }
}

// Lista todas as ofertas disponíveis no sistema, buscando os detalhes dos leads
export async function getAllOffers(): Promise<Array<Offer & { leadName: string }>> {
  try {
    // Buscar todas as ofertas da API
    const offers = await getApiOffers();
    
    // Adicionar detalhes dos leads para cada oferta
    const offersWithLeadDetails = await Promise.all(
      offers.map(async (offer) => {
        let leadName = "Lead não encontrado";
        
        if (offer.leadId) {
          try {
            const lead = await getLeadDetails(offer.leadId);
            leadName = lead.name;
          } catch (error) {
            console.error(`Erro ao buscar lead para oferta ${offer.id}:`, error);
          }
        }
        
        return {
          ...offer,
          leadName
        };
      })
    );
    
    return offersWithLeadDetails;
  } catch (error) {
    console.error("Erro ao buscar todas as ofertas:", error);
    return [];
  }
}

// Função auxiliar para formatar valores monetários
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
} 