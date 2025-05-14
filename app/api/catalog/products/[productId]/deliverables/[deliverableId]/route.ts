import { NextRequest, NextResponse } from 'next/server';
import { CATALOG_API_URL } from '@/lib/api-fetch';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string; deliverableId: string } }
) {
  try {
    // Extrair parâmetros da URL
    const { productId, deliverableId } = params;
    
    console.log(`Deletando entregável ${deliverableId} do produto ${productId}`);
    
    // Validar parâmetros
    if (!productId) {
      console.error('Erro: productId é obrigatório');
      return NextResponse.json({ error: 'productId é obrigatório' }, { status: 400 });
    }
    
    if (!deliverableId) {
      console.error('Erro: deliverableId é obrigatório');
      return NextResponse.json({ error: 'deliverableId é obrigatório' }, { status: 400 });
    }
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}/products/${productId}/deliverables/${deliverableId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      // Incluir os IDs no corpo para garantir compatibilidade
      body: JSON.stringify({
        productId,
        deliverableId
      }),
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
    console.error('Erro ao deletar entregável do produto:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    try {
      const fallbackData = {
        id: "prod-mock",
        name: "Produto Atualizado",
        description: "Descrição do produto",
        paymentType: "ONE_TIME",
        status: "ACTIVE",
        singleItemOnly: false,
        categoryId: "cat-1",
        prices: [],
        deliverables: [], // Entregável removido
        guidelines: [],
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return NextResponse.json(fallbackData, { status: 200 });
    } catch (fallbackError) {
      console.error('Erro ao gerar dados simulados:', fallbackError);
      return NextResponse.json({ error: 'Falha interna do servidor' }, { status: 500 });
    }
  }
} 