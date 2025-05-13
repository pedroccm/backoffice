import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';
import { getOffer, saveOffer } from '@/lib/offer-storage';

// GET - obter detalhes de uma oferta específica
export async function GET(
  request: NextRequest,
  { params }: { params: { offerId: string } }
) {
  const { offerId } = params;
  
  console.log(`Buscando detalhes da oferta ${offerId}`);
  
  try {
    // Verificar cache local em ambiente de desenvolvimento
    const cachedOffer = getOffer(offerId);
    if (cachedOffer) {
      console.log(`Encontrada oferta ${offerId} em cache`);
      return NextResponse.json(cachedOffer);
    }
    
    // Fazer a requisição para a API externa
    const response = await fetch(`${SALES_API_URL}/offers/${offerId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      }
    });
    
    // Se a resposta for bem-sucedida, retornar os dados da API
    if (response.ok) {
      const offerData = await response.json();
      
      // Garantir que os dados da oferta têm todos os campos necessários
      if (!offerData.offerItems) {
        offerData.offerItems = [];
      }
      
      // Atualizar o cache 
      saveOffer(offerId, offerData);
      
      return NextResponse.json(offerData);
    } 
    
    // Em ambiente de desenvolvimento, criar uma oferta simulada se não existir
    if (process.env.NODE_ENV === 'development') {
      console.log(`API externa retornou erro ${response.status}. Criando oferta simulada para ${offerId}`);
      
      // Criar uma nova oferta simulada
      const mockOffer = {
        id: offerId,
        leadId: "lead-123",
        leadName: "Cliente Simulado",
        couponId: null,
        couponDiscountPercentage: null,
        couponDiscountTotal: null,
        installmentId: null,
        installmentMonths: null,
        installmentDiscountPercentage: null,
        installmentDiscountTotal: null,
        offerDurationId: null,
        offerDurationMonths: null,
        offerDurationDiscountPercentage: null,
        offerDurationDiscountTotal: null,
        projectStartDate: null,
        paymentStartDate: null,
        payDay: null,
        status: "PENDING",
        type: "ONE_TIME",
        subtotalPrice: 0,
        totalPrice: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        offerItems: []
      };
      
      // Salvar em cache
      saveOffer(offerId, mockOffer);
      
      return NextResponse.json(mockOffer);
    }
    
    // Em produção, retornar o erro
    const errorText = await response.text().catch(() => '');
    return NextResponse.json(
      { error: `Oferta não encontrada: ${response.status}`, details: errorText },
      { status: response.status }
    );
    
  } catch (error) {
    console.error(`Erro ao buscar oferta ${offerId}:`, error);
    
    // Em desenvolvimento, retornar uma oferta simulada
    if (process.env.NODE_ENV === 'development') {
      console.log(`Erro ao processar requisição. Criando oferta simulada para ${offerId}`);
      
      const mockOffer = {
        id: offerId,
        leadId: "lead-123",
        leadName: "Cliente Simulado",
        status: "PENDING",
        type: "ONE_TIME",
        subtotalPrice: 0,
        totalPrice: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        offerItems: []
      };
      
      // Salvar em cache
      saveOffer(offerId, mockOffer);
      
      return NextResponse.json(mockOffer);
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    );
  }
} 