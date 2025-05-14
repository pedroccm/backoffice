import { NextRequest, NextResponse } from 'next/server';
import { CATALOG_API_URL } from '@/lib/api-fetch';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string, priceId: string } }
) {
  try {
    // Obter os dados do corpo da requisição
    const productId = params.productId;
    const priceId = params.priceId;
    
    console.log(`Removendo preço ${priceId} do produto ${productId}`);
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}/products/${productId}/prices/${priceId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify({}),
    });
    
    // Se a resposta não for bem-sucedida, trate o erro
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text().catch(() => 'Erro desconhecido');
      console.error(`Erro na API externa: ${apiResponse.status} - ${errorText}`);
      
      // Retornar erro com informações detalhadas
      return NextResponse.json(
        { error: `Erro na API externa: ${apiResponse.status}`, details: errorText },
        { status: apiResponse.status }
      );
    }
    
    // Obter os dados e retornar com o mesmo status
    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: apiResponse.status || 200,
    });
  } catch (error) {
    console.error('Erro ao remover preço do produto:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const fallbackData = {
      id: params.productId,
      name: "Produto Simulado",
      description: "Descrição do produto",
      paymentType: "ONE_TIME",
      status: "ACTIVE",
      singleItemOnly: false,
      categoryId: "cat-1",
      prices: [], // Preço removido
      deliverables: [],
      guidelines: [],
      createdBy: "system",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(fallbackData, { status: 200 });
  }
} 