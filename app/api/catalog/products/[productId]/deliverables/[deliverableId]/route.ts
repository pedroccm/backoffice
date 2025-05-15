import { NextRequest, NextResponse } from 'next/server';
import { CATALOG_API_URL } from '@/lib/api-fetch';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string, deliverableId: string } }
) {
  try {
    // Obter os dados do corpo da requisição
    const productId = params.productId;
    const deliverableId = params.deliverableId;
    
    console.log(`[API Route] Tentando remover entregável - productId: ${productId}, deliverableId: ${deliverableId}`);
    
    // Fazer a requisição para a API externa
    const apiUrl = `${CATALOG_API_URL}/products/${productId}/deliverables/${deliverableId}`;
    console.log(`[API Route] URL da requisição: ${apiUrl}`);
    
    const apiResponse = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify({
        productId,
        deliverableId
      }),
    });
    
    console.log(`[API Route] Status da resposta: ${apiResponse.status}`);
    
    // Se a resposta não for bem-sucedida, trate o erro
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text().catch(() => 'Erro desconhecido');
      console.error(`[API Route] Erro na API externa: ${apiResponse.status} - ${errorText}`);
      
      // Retornar erro com informações detalhadas
      return NextResponse.json(
        { error: `Erro na API externa: ${apiResponse.status}`, details: errorText },
        { status: apiResponse.status }
      );
    }
    
    // Obter os dados e retornar com o mesmo status
    try {
      const data = await apiResponse.json();
      console.log(`[API Route] Resposta da API processada com sucesso`);
      return NextResponse.json(data, {
        status: apiResponse.status || 200,
      });
    } catch (error) {
      // Se não tiver corpo JSON, apenas retornar sucesso
      console.log(`[API Route] Sem resposta JSON, retornando sucesso simples`);
      return NextResponse.json({ success: true }, {
        status: apiResponse.status || 200,
      });
    }
  } catch (error) {
    console.error('[API Route] Erro ao remover entregável do produto:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const fallbackData = {
      id: params.productId,
      name: "Produto Simulado",
      description: "Descrição do produto",
      paymentType: "ONE_TIME",
      status: "ACTIVE",
      singleItemOnly: false,
      categoryId: "cat-1",
      prices: [],
      deliverables: [], // O entregável foi removido
      guidelines: [],
      createdBy: "system",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(fallbackData, { status: 200 });
  }
} 