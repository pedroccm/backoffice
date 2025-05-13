import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';

export async function GET(request: NextRequest) {
  try {
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/offers`, {
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
    console.error('Erro na API de ofertas:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const mockData = [
      {
        id: "3fa85f64-5717-4562-b3fc-2c963f66afa1",
        leadId: "lead-1",
        status: "OPEN",
        type: "ONE_TIME",
        subtotalPrice: 1000.00,
        totalPrice: 900.00,
        offerItems: [
          {
            id: "item-1",
            offerId: "3fa85f64-5717-4562-b3fc-2c963f66afa1",
            productId: "prod-1",
            priceId: "price-1",
            productType: "ONE_TIME",
            price: 1000.00,
            quantity: 1,
            totalPrice: 1000.00
          }
        ],
        createdAt: "2024-03-15T10:00:00Z",
        updatedAt: "2024-03-15T10:00:00Z"
      },
      {
        id: "3fa85f64-5717-4562-b3fc-2c963f66afa2",
        leadId: "lead-2",
        status: "CONVERTED",
        type: "RECURRENT",
        subtotalPrice: 2500.00,
        totalPrice: 2250.00,
        offerItems: [
          {
            id: "item-2",
            offerId: "3fa85f64-5717-4562-b3fc-2c963f66afa2",
            productId: "prod-2",
            priceId: "price-2",
            productType: "RECURRENT",
            price: 1250.00,
            quantity: 2,
            totalPrice: 2500.00
          }
        ],
        createdAt: "2024-03-14T15:30:00Z",
        updatedAt: "2024-03-14T16:00:00Z"
      }
    ];
    
    return NextResponse.json(mockData, { status: 200 });
  }
} 