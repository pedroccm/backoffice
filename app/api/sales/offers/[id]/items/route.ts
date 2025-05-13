import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';

// POST - adicionar item a uma oferta
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offerId = params.id;
    const body = await request.json();
    
    console.log(`Adicionando produto ${body.productId} à oferta ${offerId}`);
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/offers/${offerId}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(body),
    });
    
    console.log(`Resposta da API: status ${apiResponse.status}`);
    
    // Se a resposta não for bem-sucedida, trate o erro
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text().catch(() => '');
      console.error(`Erro na API externa: ${errorText}`);
      
      // Em desenvolvimento, simule uma resposta
      if (process.env.NODE_ENV === 'development') {
        // Vamos simular um produto adicionado para desenvolvimento
        const mockItemId = `item-${Date.now()}`;
        const mockPrice = body.priceId.includes('price-1') ? 297 :
                        body.priceId.includes('price-2') ? 397 :
                        body.priceId.includes('price-3') ? 997 :
                        body.priceId.includes('price-4') ? 1297 :
                        body.priceId.includes('price-5') ? 49.90 :
                        body.priceId.includes('price-6') ? 59.90 :
                        body.priceId.includes('price-7') ? 99.90 :
                        body.priceId.includes('price-8') ? 129.90 : 100;
                        
        const quantity = body.quantity || 1;
        const totalPrice = mockPrice * quantity;
        
        // Dados simulados para desenvolvimento
        const mockOffer = {
          id: offerId,
          items: [{
            id: mockItemId,
            productId: body.productId,
            price: mockPrice,
            quantity: quantity,
            totalPrice: totalPrice
          }],
          leadId: offerId.includes('one-time') ? 'lead-123' : 'lead-456',
          subtotal: totalPrice,
          total: totalPrice,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        return NextResponse.json(mockOffer);
      }
      
      return NextResponse.json(
        { error: `Falha ao adicionar item à oferta: ${apiResponse.status}` }, 
        { status: apiResponse.status }
      );
    }
    
    // Retorne a resposta da API
    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao processar a requisição:', error);
    
    // Em desenvolvimento, retorne dados simulados
    if (process.env.NODE_ENV === 'development') {
      const offerId = params.id;
      const body = await request.json().catch(() => ({
        productId: 'prod-1',
        priceId: 'price-1',
        quantity: 1
      }));
        
      // Vamos simular um produto adicionado para desenvolvimento
      const mockItemId = `item-${Date.now()}`;
      const mockPrice = body.priceId.includes('price-1') ? 297 :
                      body.priceId.includes('price-2') ? 397 :
                      body.priceId.includes('price-3') ? 997 :
                      body.priceId.includes('price-4') ? 1297 :
                      body.priceId.includes('price-5') ? 49.90 :
                      body.priceId.includes('price-6') ? 59.90 :
                      body.priceId.includes('price-7') ? 99.90 :
                      body.priceId.includes('price-8') ? 129.90 : 100;
                      
      const quantity = body.quantity || 1;
      const totalPrice = mockPrice * quantity;
      
      // Dados simulados para desenvolvimento
      const mockOffer = {
        id: offerId,
        items: [{
          id: mockItemId,
          productId: body.productId,
          price: mockPrice,
          quantity: quantity,
          totalPrice: totalPrice
        }],
        leadId: offerId.includes('one-time') ? 'lead-123' : 'lead-456',
        subtotal: totalPrice,
        total: totalPrice,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return NextResponse.json(mockOffer);
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
} 