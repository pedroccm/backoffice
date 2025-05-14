import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';
import { saveOffer } from '@/lib/offer-storage';

// POST - adicionar item a uma oferta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId, productId, priceId, quantity } = body;
    
    console.log(`>>> ENDPOINT: /api/sales/offers/items (POST)`);
    console.log(`>>> PARÂMETROS:`);
    console.log(`>>> offerId: ${offerId}`);
    console.log(`>>> productId: ${productId}`);
    console.log(`>>> priceId: ${priceId}`);
    console.log(`>>> quantity: ${quantity}`);
    
    // Validar parâmetros obrigatórios
    if (!offerId || !productId || !priceId) {
      console.log(`>>> ERRO: Parâmetros obrigatórios ausentes`);
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios ausentes: offerId, productId e priceId são necessários' },
        { status: 400 }
      );
    }
    
    // Acessar diretamente a API externa conforme documentado
    const apiUrl = `${SALES_API_URL}/offers/items`;
    console.log(`>>> CHAMANDO API EXTERNA: ${apiUrl}`);
    
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify({
        offerId,
        productId,
        priceId,
        quantity: Number(quantity) || 1
      }),
    });
    
    console.log(`>>> RESPOSTA API: status ${apiResponse.status}`);
    
    // Se a chamada à API externa for bem-sucedida, retornar a resposta
    if (apiResponse.ok) {
      const responseData = await apiResponse.json();
      console.log('>>> RESPOSTA COMPLETA DA API:');
      console.log(JSON.stringify(responseData, null, 2));
      
      // Salvar em cache para uso futuro
      saveOffer(offerId, responseData);
      console.log('>>> OFERTA SALVA EM CACHE');
      
      return NextResponse.json(responseData);
    }
    
    // Se houver erro, retornar o erro da API externa
    const errorText = await apiResponse.text().catch(() => '');
    console.error(`Erro na API externa: ${apiResponse.status} - ${errorText}`);
    
    // Retornar o erro da API
    return NextResponse.json(
      { error: `Falha ao adicionar item à oferta: ${apiResponse.status}`, details: errorText }, 
      { status: apiResponse.status || 500 }
    );
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 