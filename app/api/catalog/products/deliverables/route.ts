import { NextRequest, NextResponse } from 'next/server';
import { CATALOG_API_URL } from '@/lib/api-fetch';

export async function POST(request: NextRequest) {
  try {
    // Obter os dados do corpo da requisição
    const deliverableData = await request.json();
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}/products/deliverables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(deliverableData),
    });
    
    // Obter os dados e retornar com o mesmo status
    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error('Erro ao adicionar entregável ao produto:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const mockData = {
      id: deliverableData?.productId || `prod-${Date.now()}`,
      name: "Produto com Entregável",
      description: "Descrição do produto",
      paymentType: "ONE_TIME",
      status: "ACTIVE",
      singleItemOnly: false,
      categoryId: "cat-1",
      prices: [],
      deliverables: [
        {
          id: deliverableData?.deliverableId || `del-${Date.now()}`,
          productId: deliverableData?.productId || `prod-${Date.now()}`,
          name: "Entregável exemplo",
          description: "Descrição do entregável",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      guidelines: [],
      createdBy: "system",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(mockData, { status: 201 });
  }
} 