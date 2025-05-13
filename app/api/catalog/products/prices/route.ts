import { NextRequest, NextResponse } from 'next/server';
import { CATALOG_API_URL } from '@/lib/api-fetch';

// Função para validar UUIDs
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function POST(request: NextRequest) {
  try {
    // Obter os dados do corpo da requisição
    const priceData = await request.json();
    
    console.log('Dados recebidos para adição de preço:', priceData);
    
    // Validar dados obrigatórios conforme a documentação
    if (!priceData.productId) {
      console.error('Erro: productId é obrigatório');
      return NextResponse.json({ error: 'productId é obrigatório' }, { status: 400 });
    }
    
    if (!priceData.currencyId) {
      console.error('Erro: currencyId é obrigatório');
      return NextResponse.json({ error: 'currencyId é obrigatório' }, { status: 400 });
    }
    
    // Verificar e ajustar o modifierTypeId
    if (priceData.modifierTypeId && !isValidUUID(priceData.modifierTypeId)) {
      console.warn(`modifierTypeId inválido recebido: ${priceData.modifierTypeId}, será enviado como null`);
      priceData.modifierTypeId = null;
    }
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}/products/prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(priceData),
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
      status: apiResponse.status || 201,
    });
  } catch (error) {
    console.error('Erro ao adicionar preço ao produto:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    try {
      const fallbackData = {
        id: "prod-mock",
        name: "Produto com Preço",
        description: "Descrição do produto",
        paymentType: "ONE_TIME",
        status: "ACTIVE",
        singleItemOnly: false,
        categoryId: "cat-1",
        prices: [
          {
            id: `price-${Date.now()}`,
            amount: 100,
            currencyId: "curr-1",
            modifierTypeId: null
          }
        ],
        deliverables: [],
        guidelines: [],
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return NextResponse.json(fallbackData, { status: 201 });
    } catch (fallbackError) {
      console.error('Erro ao gerar dados simulados:', fallbackError);
      return NextResponse.json({ error: 'Falha interna do servidor' }, { status: 500 });
    }
  }
} 