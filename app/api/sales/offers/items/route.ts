import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';
import { saveOffer, getOffer } from '@/lib/offer-storage';

// POST - adicionar item a uma oferta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId, productId, priceId, quantity } = body;
    
    console.log(`Adicionando produto ${productId} à oferta ${offerId}`);
    console.log(`Dados da requisição:`, JSON.stringify(body, null, 2));
    
    // Validar parâmetros obrigatórios
    if (!offerId || !productId || !priceId) {
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios ausentes: offerId, productId e priceId são necessários' },
        { status: 400 }
      );
    }
    
    // Tentar acessar diretamente a API externa conforme documentado
    const apiResponse = await fetch(`${SALES_API_URL}/offers/items`, {
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
    
    console.log(`Resposta da API externa: status ${apiResponse.status}`);
    
    // Se a chamada à API externa for bem-sucedida, retornar a resposta
    if (apiResponse.ok) {
      const responseData = await apiResponse.json();
      console.log('Resposta da API externa após adição:', JSON.stringify(responseData, null, 2));
      
      // Salvar em cache para uso futuro
      saveOffer(offerId, responseData);
      
      return NextResponse.json(responseData);
    }
    
    const errorText = await apiResponse.text().catch(() => '');
    console.error(`Erro na API externa: ${apiResponse.status} - ${errorText}`);

    // Em ambiente de desenvolvimento, criar uma simulação
    if (process.env.NODE_ENV === 'development') {
      console.log('Ambiente de desenvolvimento: criando simulação de adição do item');
      
      // Buscar oferta ou criar uma nova
      let offerData = getOffer(offerId);
      if (!offerData) {
        // Se não tiver cache, tentar consultar da API primeiro
        try {
          const fetchResponse = await fetch(`${SALES_API_URL}/offers/${offerId}`, {
            headers: {
              'Content-Type': 'application/json',
              ...(request.headers.get('Authorization') 
                ? { 'Authorization': request.headers.get('Authorization') || '' } 
                : {}),
            }
          });
          
          if (fetchResponse.ok) {
            offerData = await fetchResponse.json();
          }
        } catch (fetchError) {
          console.error('Erro ao buscar oferta existente:', fetchError);
        }
        
        // Se ainda não tiver dados, criar uma oferta simulada
        if (!offerData) {
          offerData = {
            id: offerId,
            leadId: "lead-123", 
            status: "PENDING",
            type: "ONE_TIME",
            subtotalPrice: 0,
            totalPrice: 0,
            offerItems: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
      }
      
      // Garantir que offerItems existe
      if (!offerData.offerItems) {
        offerData.offerItems = [];
      }
      
      // Verificar se o produto já existe
      const existingItemIndex = offerData.offerItems.findIndex((item) => 
        item.productId === productId
      );
      
      if (existingItemIndex >= 0) {
        console.log(`Produto ${productId} já existe na oferta. Atualizando quantidade.`);
        
        // Atualizar quantidade se já existir
        offerData.offerItems[existingItemIndex].quantity += (Number(quantity) || 1);
        offerData.offerItems[existingItemIndex].totalPrice = 
          offerData.offerItems[existingItemIndex].price * offerData.offerItems[existingItemIndex].quantity;
      } else {
        // Preço simulado
        const mockPrice = Number(priceId.includes('price-1') ? 297 :
                      priceId.includes('price-2') ? 397 :
                      priceId.includes('price-3') ? 997 :
                      priceId.includes('price-4') ? 1297 :
                      priceId.includes('price-5') ? 49.90 :
                      priceId.includes('price-6') ? 59.90 :
                      priceId.includes('price-7') ? 99.90 :
                      priceId.includes('price-8') ? 129.90 : 100);
        
        const itemQuantity = Number(quantity) || 1;
        const totalPrice = mockPrice * itemQuantity;
        
        // Criar novo item
        const newItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
          offerId: offerId,
          productId: productId,
          priceId: priceId,
          productType: "ONE_TIME",
          price: mockPrice,
          quantity: itemQuantity,
          totalPrice: totalPrice
        };
        
        // Adicionar à oferta
        offerData.offerItems.push(newItem);
      }
      
      // Recalcular totais
      offerData.subtotalPrice = offerData.offerItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      offerData.totalPrice = offerData.subtotalPrice;
      offerData.updatedAt = new Date().toISOString();
      
      // Salvar em cache
      saveOffer(offerId, offerData);
      
      console.log('Retornando resposta simulada:', JSON.stringify(offerData, null, 2));
      return NextResponse.json(offerData);
    }
    
    // Em produção, retornar o erro da API
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