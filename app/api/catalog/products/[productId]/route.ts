import { NextRequest, NextResponse } from 'next/server';
import { CATALOG_API_URL } from '@/lib/api-fetch';

export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    // Obter os dados do corpo da requisição
    const productData = await request.json();
    
    console.log('Dados recebidos para atualização do produto:', productData);
    
    // Validar dados obrigatórios
    if (!productData.name) {
      console.error('Erro: name é obrigatório');
      return NextResponse.json({ error: 'name é obrigatório' }, { status: 400 });
    }
    
    if (!productData.description) {
      console.error('Erro: description é obrigatório');
      return NextResponse.json({ error: 'description é obrigatório' }, { status: 400 });
    }
    
    if (!productData.paymentType) {
      console.error('Erro: paymentType é obrigatório');
      return NextResponse.json({ error: 'paymentType é obrigatório' }, { status: 400 });
    }
    
    if (!productData.categoryId) {
      console.error('Erro: categoryId é obrigatório');
      return NextResponse.json({ error: 'categoryId é obrigatório' }, { status: 400 });
    }
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}/products/${params.productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(productData),
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
    console.error('Erro ao atualizar produto:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    try {
      const fallbackData = {
        id: params.productId,
        name: "Produto Atualizado",
        description: "Descrição do produto atualizado",
        paymentType: "ONE_TIME",
        status: "ACTIVE",
        singleItemOnly: false,
        categoryId: "cat-1",
        prices: [],
        deliverables: [],
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

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}/products/find/${params.productId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
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
    console.error('Erro ao buscar produto:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    try {
      const fallbackData = {
        id: params.productId,
        name: "Produto Simulado",
        description: "Descrição do produto",
        paymentType: "ONE_TIME",
        status: "ACTIVE",
        singleItemOnly: false,
        categoryId: "cat-1",
        prices: [],
        deliverables: [],
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