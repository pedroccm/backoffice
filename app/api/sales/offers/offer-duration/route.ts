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
    
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) }, 
      { status: 500 }
    );
  }
} 