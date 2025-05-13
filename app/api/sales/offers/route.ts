import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';

// Dados mockados para fallback
const MOCK_OFFERS = [
  {
    id: "offer-1",
    leadId: "lead-123",
    leadName: "João Silva",
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
    projectStartDate: "2023-05-01",
    paymentStartDate: "2023-05-15",
    payDay: 10,
    status: "PENDING",
    type: "ONE_TIME",
    subtotalPrice: 5000,
    totalPrice: 5000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    offerItems: [
      {
        id: "item-1",
        offerId: "offer-1",
        productId: "product-1",
        priceId: "price-1",
        productType: "DIGITAL",
        price: 2500,
        quantity: 1,
        totalPrice: 2500
      },
      {
        id: "item-2",
        offerId: "offer-1",
        productId: "product-2",
        priceId: "price-2",
        productType: "SERVICE",
        price: 2500,
        quantity: 1,
        totalPrice: 2500
      }
    ]
  },
  {
    id: "offer-2",
    leadId: "lead-456",
    leadName: "Maria Oliveira",
    couponId: "coupon-1",
    couponDiscountPercentage: 10,
    couponDiscountTotal: 500,
    installmentId: "installment-1",
    installmentMonths: 3,
    installmentDiscountPercentage: 0,
    installmentDiscountTotal: 0,
    offerDurationId: "duration-1",
    offerDurationMonths: 12,
    offerDurationDiscountPercentage: 5,
    offerDurationDiscountTotal: 250,
    projectStartDate: "2023-06-01",
    paymentStartDate: "2023-06-15",
    payDay: 15,
    status: "CONVERTED",
    type: "RECURRENT",
    subtotalPrice: 5000,
    totalPrice: 4250,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    offerItems: [
      {
        id: "item-3",
        offerId: "offer-2",
        productId: "product-3",
        priceId: "price-3",
        productType: "DIGITAL",
        price: 1500,
        quantity: 2,
        totalPrice: 3000
      },
      {
        id: "item-4",
        offerId: "offer-2",
        productId: "product-4",
        priceId: "price-4",
        productType: "PHYSICAL",
        price: 2000,
        quantity: 1,
        totalPrice: 2000
      }
    ]
  }
];

// Função para lidar com erros da API
function handleApiError(error: any, method: string = 'GET') {
  console.error(`Erro na API de ofertas (${method}):`, error);
  
  return NextResponse.json(
    { 
      success: false, 
      message: `Erro ao acessar a API de ofertas: ${error instanceof Error ? error.message : String(error)}`,
      mockData: true
    },
    { 
      status: 500,
      headers: {
        'X-Mock-Data': 'true',
        'Content-Type': 'application/json'
      }
    }
  );
}

// GET - Listar todas as ofertas ou buscar uma oferta específica
export async function GET(request: NextRequest) {
  try {
    console.log("Iniciando requisição GET para API de ofertas");
    
    // Extrair o ID da oferta da URL se presente
    const { pathname } = new URL(request.url);
    const parts = pathname.split('/');
    const offerId = parts[parts.length - 1] !== 'offers' ? parts[parts.length - 1] : null;
    
    if (offerId) {
      console.log(`Buscando oferta específica: ${offerId}`);
      
      // Tentar buscar da API real
      try {
        const apiResponse = await fetch(`${SALES_API_URL}/offers/${offerId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(request.headers.get('Authorization') 
              ? { 'Authorization': request.headers.get('Authorization') || '' } 
              : {}),
          },
          signal: AbortSignal.timeout(10000)
        });
        
        // Verificar se a resposta é de sucesso
        if (!apiResponse.ok) {
          throw new Error(`API retornou status ${apiResponse.status}`);
        }
        
        const data = await apiResponse.json();
        return NextResponse.json(data);
      } catch (apiError) {
        console.error(`Erro ao buscar oferta ${offerId} da API:`, apiError);
        
        // Fallback: retornar dados mockados
        const mockOffer = MOCK_OFFERS.find(o => o.id === offerId);
        if (!mockOffer) {
          return NextResponse.json(
            { success: false, message: `Oferta ${offerId} não encontrada` },
            { status: 404 }
          );
        }
        
        console.log(`Retornando dados mockados para oferta ${offerId}`);
        return NextResponse.json(mockOffer, {
          status: 200,
          headers: {
            'X-Mock-Data': 'true'
          }
        });
      }
    } else {
      console.log("Buscando todas as ofertas");
      
      // Normalmente teríamos um endpoint para listar todas as ofertas,
      // mas como não existe na API real, vamos retornar dados mockados diretamente
      
      // Caso haja implementação futura da API real:
      /*
      try {
        const apiResponse = await fetch(`${SALES_API_URL}/offers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(request.headers.get('Authorization') 
              ? { 'Authorization': request.headers.get('Authorization') || '' } 
              : {}),
          },
          signal: AbortSignal.timeout(10000)
        });
        
        if (!apiResponse.ok) {
          throw new Error(`API retornou status ${apiResponse.status}`);
        }
        
        const data = await apiResponse.json();
        return NextResponse.json(data);
      } catch (apiError) {
        console.error("Erro ao buscar ofertas da API:", apiError);
      }
      */
      
      console.log("Retornando dados mockados para todas as ofertas");
      return NextResponse.json(MOCK_OFFERS, {
        status: 200,
        headers: {
          'X-Mock-Data': 'true'
        }
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Criar uma nova oferta
export async function POST(request: NextRequest) {
  try {
    console.log("Iniciando requisição POST para criação de oferta");
    
    // Extrair o caminho da requisição
    const { pathname } = new URL(request.url);
    
    // Verificar se é um POST para adicionar item à oferta
    const isItemsEndpoint = pathname.includes('/items');
    
    // Obter o corpo da requisição
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Erro ao parsear corpo da requisição:', parseError);
      return NextResponse.json(
        { success: false, message: 'Corpo da requisição inválido' },
        { status: 400 }
      );
    }
    
    console.log(`POST ${isItemsEndpoint ? 'adicionar item à oferta' : 'criar oferta'}:`, body);
    
    // Tentar enviar para a API real
    try {
      const endpoint = isItemsEndpoint 
        ? `${SALES_API_URL}/offers/items`
        : `${SALES_API_URL}/offers`;
      
      const apiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(request.headers.get('Authorization') 
            ? { 'Authorization': request.headers.get('Authorization') || '' } 
            : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000)
      });
      
      // Verificar se a resposta é de sucesso
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error(`Erro na resposta da API (${apiResponse.status}):`, 
            errorText.trim() ? errorText : '(resposta vazia)');
        
        throw new Error(`API retornou status ${apiResponse.status}`);
      }
      
      // Processar a resposta
      const responseText = await apiResponse.text();
      if (!responseText.trim()) {
        return new NextResponse(null, { status: 204 });
      }
      
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch (apiError) {
      console.error("Erro ao enviar para API real:", apiError);
      
      // Fallback: criar dados mockados
      if (isItemsEndpoint) {
        // Adicionar item à oferta
        const { offerId, productId, priceId, quantity } = body;
        
        // Verificar se a oferta existe
        const offerIndex = MOCK_OFFERS.findIndex(o => o.id === offerId);
        if (offerIndex === -1) {
          return NextResponse.json(
            { success: false, message: `Oferta ${offerId} não encontrada` },
            { status: 404, headers: { 'X-Mock-Data': 'true' } }
          );
        }
        
        // Criar novo item
        const newItem = {
          id: `item-${Date.now()}`,
          offerId,
          productId,
          priceId,
          productType: "DIGITAL", // Valor default
          price: 1000, // Valor default
          quantity,
          totalPrice: 1000 * quantity
        };
        
        // Adicionar à oferta
        MOCK_OFFERS[offerIndex].offerItems.push(newItem);
        
        // Recalcular valores
        const newTotal = MOCK_OFFERS[offerIndex].offerItems.reduce(
          (sum, item) => sum + item.totalPrice, 
          0
        );
        
        MOCK_OFFERS[offerIndex].subtotalPrice = newTotal;
        MOCK_OFFERS[offerIndex].totalPrice = newTotal;
        MOCK_OFFERS[offerIndex].updatedAt = new Date().toISOString();
        
        return NextResponse.json(MOCK_OFFERS[offerIndex], {
          status: 201,
          headers: { 'X-Mock-Data': 'true' }
        });
      } else {
        // Criar nova oferta
        const { leadId, type } = body;
        
        const newOffer = {
          id: `offer-${Date.now()}`,
          leadId,
          leadName: "Cliente Mockado",
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
          type: type || "ONE_TIME",
          subtotalPrice: 0,
          totalPrice: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          offerItems: []
        };
        
        MOCK_OFFERS.push(newOffer);
        
        return NextResponse.json(newOffer, {
          status: 201,
          headers: { 'X-Mock-Data': 'true' }
        });
      }
    }
  } catch (error) {
    return handleApiError(error, 'POST');
  }
}

// PUT - Atualizar uma oferta existente
export async function PUT(request: NextRequest) {
  try {
    console.log("Iniciando requisição PUT para atualização de oferta");
    
    // Obter o corpo da requisição
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Erro ao parsear corpo da requisição PUT:', parseError);
      return NextResponse.json(
        { success: false, message: 'Corpo da requisição inválido' },
        { status: 400 }
      );
    }
    
    console.log("PUT atualizar oferta:", body);
    
    const { offerId, projectStartDate, paymentStartDate, payDay } = body;
    
    if (!offerId) {
      return NextResponse.json(
        { success: false, message: 'ID da oferta é obrigatório' },
        { status: 400 }
      );
    }
    
    // Tentar atualizar na API real
    try {
      const apiResponse = await fetch(`${SALES_API_URL}/offers`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(request.headers.get('Authorization') 
            ? { 'Authorization': request.headers.get('Authorization') || '' } 
            : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000)
      });
      
      // Verificar se a resposta é de sucesso
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error(`Erro na resposta da API PUT (${apiResponse.status}):`, 
            errorText.trim() ? errorText : '(resposta vazia)');
        
        throw new Error(`API retornou status ${apiResponse.status}`);
      }
      
      // Processar a resposta
      const responseText = await apiResponse.text();
      if (!responseText.trim()) {
        return new NextResponse(null, { status: 204 });
      }
      
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch (apiError) {
      console.error("Erro ao atualizar oferta na API real:", apiError);
      
      // Fallback: atualizar dados mockados
      const offerIndex = MOCK_OFFERS.findIndex(o => o.id === offerId);
      if (offerIndex === -1) {
        return NextResponse.json(
          { success: false, message: `Oferta ${offerId} não encontrada` },
          { status: 404, headers: { 'X-Mock-Data': 'true' } }
        );
      }
      
      // Atualizar campos
      if (projectStartDate) {
        MOCK_OFFERS[offerIndex].projectStartDate = projectStartDate;
      }
      
      if (paymentStartDate) {
        MOCK_OFFERS[offerIndex].paymentStartDate = paymentStartDate;
      }
      
      if (payDay !== undefined) {
        MOCK_OFFERS[offerIndex].payDay = payDay;
      }
      
      // Atualizar data de modificação
      MOCK_OFFERS[offerIndex].updatedAt = new Date().toISOString();
      
      return NextResponse.json(MOCK_OFFERS[offerIndex], {
        status: 200,
        headers: { 'X-Mock-Data': 'true' }
      });
    }
  } catch (error) {
    return handleApiError(error, 'PUT');
  }
}

// DELETE - Remover um item de uma oferta
export async function DELETE(request: NextRequest) {
  try {
    console.log("Iniciando requisição DELETE para oferta");
    
    // Extrair o ID da oferta e do item da URL
    const { pathname } = new URL(request.url);
    const parts = pathname.split('/');
    
    // Formato esperado: /api/sales/offers/{offerId}/items/{itemId}
    if (parts.length < 7 || !pathname.includes('/items/')) {
      return NextResponse.json(
        { success: false, message: 'Formato de URL inválido' },
        { status: 400 }
      );
    }
    
    const offerId = parts[4];
    const itemId = parts[6];
    
    console.log(`Removendo item ${itemId} da oferta ${offerId}`);
    
    // Tentar remover da API real
    try {
      const apiResponse = await fetch(`${SALES_API_URL}/offers/${offerId}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(request.headers.get('Authorization') 
            ? { 'Authorization': request.headers.get('Authorization') || '' } 
            : {}),
        },
        signal: AbortSignal.timeout(10000)
      });
      
      // Verificar se a resposta é de sucesso
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error(`Erro na resposta da API DELETE (${apiResponse.status}):`, 
            errorText.trim() ? errorText : '(resposta vazia)');
        
        throw new Error(`API retornou status ${apiResponse.status}`);
      }
      
      // Processar a resposta
      const responseText = await apiResponse.text();
      if (!responseText.trim()) {
        return new NextResponse(null, { status: 204 });
      }
      
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch (apiError) {
      console.error("Erro ao remover item da oferta na API real:", apiError);
      
      // Fallback: remover dos dados mockados
      const offerIndex = MOCK_OFFERS.findIndex(o => o.id === offerId);
      if (offerIndex === -1) {
        return NextResponse.json(
          { success: false, message: `Oferta ${offerId} não encontrada` },
          { status: 404, headers: { 'X-Mock-Data': 'true' } }
        );
      }
      
      // Procurar o item
      const itemIndex = MOCK_OFFERS[offerIndex].offerItems.findIndex(i => i.id === itemId);
      if (itemIndex === -1) {
        return NextResponse.json(
          { success: false, message: `Item ${itemId} não encontrado na oferta ${offerId}` },
          { status: 404, headers: { 'X-Mock-Data': 'true' } }
        );
      }
      
      // Remover o item
      MOCK_OFFERS[offerIndex].offerItems.splice(itemIndex, 1);
      
      // Recalcular totais
      const newTotal = MOCK_OFFERS[offerIndex].offerItems.reduce(
        (sum, item) => sum + item.totalPrice, 
        0
      );
      
      MOCK_OFFERS[offerIndex].subtotalPrice = newTotal;
      MOCK_OFFERS[offerIndex].totalPrice = newTotal;
      MOCK_OFFERS[offerIndex].updatedAt = new Date().toISOString();
      
      return NextResponse.json(MOCK_OFFERS[offerIndex], {
        status: 200,
        headers: { 'X-Mock-Data': 'true' }
      });
    }
  } catch (error) {
    return handleApiError(error, 'DELETE');
  }
} 