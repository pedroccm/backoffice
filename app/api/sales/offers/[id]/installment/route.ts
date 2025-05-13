import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';

// POST - aplicar parcelamento a uma oferta
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offerId = params.id;
    const body = await request.json();
    
    console.log(`Aplicando parcelamento ${body.installmentId} à oferta ${offerId}`);
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/offers/${offerId}/installment`, {
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
        // Vamos simular a aplicação de um parcelamento para desenvolvimento
        const mockOffer = {
          id: offerId,
          items: [],
          leadId: offerId.includes('one-time') ? 'lead-123' : 'lead-456',
          subtotal: 0,
          total: 0,
          installmentId: body.installmentId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        return NextResponse.json(mockOffer);
      }
      
      return NextResponse.json(
        { error: `Falha ao aplicar parcelamento à oferta: ${apiResponse.status}` }, 
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
      const body = await request.json().catch(() => ({ installmentId: 'installment-1' }));
        
      // Vamos simular a aplicação de um parcelamento para desenvolvimento
      const mockOffer = {
        id: offerId,
        items: [],
        leadId: offerId.includes('one-time') ? 'lead-123' : 'lead-456',
        subtotal: 0,
        total: 0,
        installmentId: body.installmentId,
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