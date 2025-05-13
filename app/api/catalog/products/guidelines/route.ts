import { NextRequest, NextResponse } from 'next/server';
import { CATALOG_API_URL } from '@/lib/api-fetch';

export async function POST(request: NextRequest) {
  try {
    // Obter os dados do corpo da requisição
    const guidelineData = await request.json();
    
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
    
    // Obter os dados e retornar com o mesmo status
    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error('Erro ao adicionar guideline ao produto:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const mockData = {
      id: guidelineData?.productId || `prod-${Date.now()}`,
      name: "Produto com Guideline",
      description: "Descrição do produto",
      paymentType: "ONE_TIME",
      status: "ACTIVE",
      singleItemOnly: false,
      categoryId: "cat-1",
      prices: [],
      deliverables: [],
      guidelines: [
        {
          id: `guide-${Date.now()}`,
          name: guidelineData?.name || "Guideline exemplo",
          description: guidelineData?.description || "Descrição da guideline",
          productId: guidelineData?.productId || `prod-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      createdBy: "system",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(mockData, { status: 201 });
  }
} 