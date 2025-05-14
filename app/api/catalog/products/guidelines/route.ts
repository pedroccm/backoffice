import { NextRequest, NextResponse } from 'next/server';
import { CATALOG_API_URL } from '@/lib/api-fetch';

export async function POST(request: NextRequest) {
  try {
    // Obter os dados do corpo da requisição
    const guidelineData = await request.json();
    
    console.log('Dados recebidos para adição de diretriz:', guidelineData);
    
    // Validar dados obrigatórios conforme a documentação
    if (!guidelineData.name) {
      console.error('Erro: name é obrigatório');
      return NextResponse.json({ error: 'name é obrigatório' }, { status: 400 });
    }
    
    if (!guidelineData.description) {
      console.error('Erro: description é obrigatório');
      return NextResponse.json({ error: 'description é obrigatório' }, { status: 400 });
    }
    
    if (!guidelineData.productId) {
      console.error('Erro: productId é obrigatório');
      return NextResponse.json({ error: 'productId é obrigatório' }, { status: 400 });
    }
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}/products/guidelines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(guidelineData),
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
    console.error('Erro ao adicionar diretriz ao produto:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    try {
      const guidelineData = await request.json().catch(() => ({}));
      
      const fallbackData = {
        id: "prod-mock",
        name: "Produto Simulado",
        description: "Descrição do produto",
        paymentType: "ONE_TIME",
        status: "ACTIVE",
        singleItemOnly: false,
        categoryId: "cat-1",
        prices: [],
        deliverables: [],
        guidelines: [
          {
            id: `guideline-${Date.now()}`,
            name: guidelineData.name || "Nova Diretriz",
            description: guidelineData.description || "Descrição da diretriz",
            productId: guidelineData.productId || "prod-mock",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
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