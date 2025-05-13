import { getLeadById, getOfferById, getSessionByLeadId } from "./api-fetch";
import type { Lead, Offer } from "./api-fetch";

// Variável de ambiente - poderia vir de .env no projeto real
const USE_MOCK_DATA = false;

// Armazenamento temporário para IDs de ofertas conhecidas
// Em uma aplicação real, isso poderia ser obtido de um serviço de gerenciamento de estado ou de uma API
const KNOWN_OFFER_IDS = [
  "3fa85f64-5717-4562-b3fc-2c963f66afa1",
  "3fa85f64-5717-4562-b3fc-2c963f66afa2",
  "3fa85f64-5717-4562-b3fc-2c963f66afa3",
  "3fa85f64-5717-4562-b3fc-2c963f66afa4",
  "3fa85f64-5717-4562-b3fc-2c963f66afa5"
];

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
    // Como não há um endpoint para listar todas as ofertas, vamos buscar por IDs conhecidos
    // Isso é uma solução temporária até que um endpoint de listagem seja implementado na API
    const offersPromises = KNOWN_OFFER_IDS.map(id => getOfferWithLeadDetails(id));
    
    // Aguardar todas as requisições e filtrar possíveis falhas
    const offersResults = await Promise.allSettled(offersPromises);
    const offers = offersResults
      .filter((result): result is PromiseFulfilledResult<Offer & { leadName: string }> => 
        result.status === "fulfilled")
      .map(result => result.value);
    
    return offers;
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