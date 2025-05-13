import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';

// POST - aplicar duração a uma oferta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId, offerDurationId } = body;
    
    console.log(`Aplicando duração ${offerDurationId} à oferta ${offerId}`);
    
    // Fazer a requisição para a API externa usando o endpoint da documentação
    const apiResponse = await fetch(`${SALES_API_URL}/offers/offer-duration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify({
        offerId,
        offerDurationId
      }),
    });
    
    console.log(`Resposta da API: status ${apiResponse.status}`);
    
    // Se a resposta não for bem-sucedida, trate o erro
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text().catch(() => '');
      console.error(`Erro na API externa: ${errorText}`);
      
      // Em desenvolvimento, simule uma resposta
      if (process.env.NODE_ENV === 'development') {
        // Simular aplicação de duração de oferta
        const mockResponse = {
          id: offerId,
          leadId: "lead-123",
          couponId: null,
          couponDiscountPercentage: null,
          couponDiscountTotal: null,
          installmentId: null,
          installmentMonths: null,
          installmentDiscountPercentage: null,
          installmentDiscountTotal: null,
          offerDurationId: offerDurationId,
          offerDurationMonths: 24,
          offerDurationDiscountPercentage: 10,
          offerDurationDiscountTotal: 100,
          projectStartDate: null,
          paymentStartDate: null,
          payDay: null,
          status: "PENDING",
          type: "ONE_TIME",
          subtotalPrice: 1000,
          totalPrice: 900,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          offerItems: [{
            id: `item-${Date.now()}`,
            offerId: offerId,
            productId: "product-1",
            priceId: "price-1",
            productType: "ONE_TIME",
            price: 1000,
            quantity: 1,
            totalPrice: 1000
          }]
        };
        
        return NextResponse.json(mockResponse);
      }
      
      return NextResponse.json(
        { error: `Falha ao aplicar duração à oferta: ${apiResponse.status}`, details: errorText }, 
        { status: apiResponse.status }
      );
    }
    
    // Retorne a resposta da API
    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao processar a requisição:', error);
    
    // Em desenvolvimento, retorne dados simulados com erro
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        id: "simulated-offer-id",
        leadId: "lead-123",
        offerDurationId: "duration-1",
        offerDurationMonths: 24,
        offerDurationDiscountPercentage: 10,
        offerDurationDiscountTotal: 100,
        subtotalPrice: 1000,
        totalPrice: 900,
        items: [
          {
            id: `item-${Date.now()}`,
            productId: "product-1",
            price: 1000,
            quantity: 1,
            totalPrice: 1000
          }
        ],
        status: "PENDING",
        type: "ONE_TIME",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) }, 
      { status: 500 }
    );
  }
} 