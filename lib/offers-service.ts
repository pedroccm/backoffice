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

// Dados mockados para casos de falha completa das APIs
const mockEmptyOffers: Array<Offer & { leadName: string }> = [
  {
    id: "mock-1",
    leadId: "mock-lead-1",
    leadName: "Cliente Exemplo",
    status: "PENDING",
    type: "ONE_TIME",
    subtotalPrice: 1500.00,
    totalPrice: 1350.00,
    offerItems: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "mock-2",
    leadId: "mock-lead-2",
    leadName: "Empresa Demo",
    status: "CONVERTED",
    type: "RECURRENT",
    subtotalPrice: 3000.00,
    totalPrice: 2700.00,
    offerItems: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(), // ontem
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// Lista todas as ofertas disponíveis no sistema, buscando os detalhes dos leads
export async function getAllOffers(): Promise<Array<Offer & { leadName: string }>> {
  try {
    console.log("Iniciando busca de todas as ofertas...");
    
    // Buscar todas as ofertas da API
    const offers = await getApiOffers();
    
    // Verificação adicional para garantir que offers seja um array válido
    if (!Array.isArray(offers)) {
      console.error("getAllOffers: A API retornou um valor não-array:", offers);
      throw new Error("Formato de resposta inválido: esperava um array de ofertas");
    }
    
    console.log(`Ofertas obtidas com sucesso: ${offers.length} encontradas`);
    
    // Adicionar detalhes dos leads para cada oferta em paralelo
    const offersWithLeadPromises = offers.map(async (offer) => {
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
    });
    
    // Esperar todas as consultas de leads terminarem
    const offersWithLeadDetails = await Promise.all(offersWithLeadPromises);
    console.log(`Detalhes de leads adicionados a ${offersWithLeadDetails.length} ofertas`);
    
    return offersWithLeadDetails;
  } catch (error) {
    console.error("Erro grave ao buscar todas as ofertas:", error);
    
    // Verificar se estamos em ambiente de desenvolvimento
    if (process.env.NODE_ENV === "development") {
      console.warn("Retornando dados mockados como fallback final em ambiente de desenvolvimento");
      return mockEmptyOffers;
    }
    
    // Em produção, retornamos um array vazio para evitar quebrar a UI
    console.warn("Retornando array vazio como fallback final em produção");
    return [];
  }
}

// Função auxiliar para formatar valores monetários
export function formatCurrency(value: number): string {
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  } catch (error) {
    console.error("Erro ao formatar valor monetário:", error);
    return `R$ ${value.toFixed(2)}`;
  }
} 