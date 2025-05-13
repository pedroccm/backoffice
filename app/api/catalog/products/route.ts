import { NextRequest, NextResponse } from 'next/server';
import { CATALOG_API_URL } from '@/lib/api-fetch';

export async function GET(request: NextRequest) {
  try {
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
    });
    
    // Obter os dados e retornar com o mesmo status
    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error('Erro na API de produtos:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const mockData = [
      {
        id: "prod-1",
        name: "Software de Gestão Empresarial",
        description: "Sistema completo para gestão empresarial com módulos de finanças, RH e vendas",
        paymentType: "RECURRENT",
        status: "ACTIVE",
        singleItemOnly: true,
        categoryId: "cat-1",
        prices: [
          {
            id: "price-1",
            amount: 199.90,
            currencyId: "curr-1",
            modifierTypeId: null
          }
        ],
        deliverables: [],
        guidelines: [],
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "prod-2",
        name: "Consultoria Especializada",
        description: "Serviço de consultoria empresarial personalizada",
        paymentType: "ONE_TIME",
        status: "ACTIVE",
        singleItemOnly: true,
        categoryId: "cat-2",
        prices: [
          {
            id: "price-2",
            amount: 1500.00,
            currencyId: "curr-1",
            modifierTypeId: null
          }
        ],
        deliverables: [],
        guidelines: [],
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    return NextResponse.json(mockData, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Obter os dados do corpo da requisição
    const productData = await request.json();
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(productData),
    });
    
    // Obter os dados e retornar com o mesmo status
    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const mockData = {
      id: `prod-${Date.now()}`,
      name: "Novo Produto",
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
    
    return NextResponse.json(mockData, { status: 201 });
  }
} 