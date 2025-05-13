import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/offer-durations/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
    });
    
    // Se não encontrar, retorne 404
    if (apiResponse.status === 404) {
      return NextResponse.json({ error: 'Duração de oferta não encontrada' }, { status: 404 });
    }
    
    // Obter os dados e retornar com o mesmo status
    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error(`Erro ao buscar duração de oferta:`, error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    if (process.env.NODE_ENV === 'development') {
      const id = params.id;
      return NextResponse.json({
        id,
        months: 12,
        discountPercentage: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { status: 200 });
    }
    
    return NextResponse.json(
      { error: 'Erro ao buscar duração de oferta' },
      { status: 500 }
    );
  }
} 