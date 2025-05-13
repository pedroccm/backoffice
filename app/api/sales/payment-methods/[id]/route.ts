import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/payment-methods/${id}`, {
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
      return NextResponse.json({ error: 'Método de pagamento não encontrado' }, { status: 404 });
    }
    
    // Obter os dados e retornar com o mesmo status
    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error(`Erro ao buscar método de pagamento:`, error);
    
    return NextResponse.json(
      { error: 'Erro ao buscar método de pagamento' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const paymentMethodData = await request.json();
    
    // Validar dados obrigatórios
    if (!paymentMethodData.name && !paymentMethodData.code && !paymentMethodData.description) {
      return NextResponse.json(
        { error: 'Pelo menos um campo deve ser fornecido para atualização' },
        { status: 400 }
      );
    }
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/payment-methods/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(paymentMethodData),
    });
    
    // Se não encontrar, retorne 404
    if (apiResponse.status === 404) {
      return NextResponse.json({ error: 'Método de pagamento não encontrado' }, { status: 404 });
    }
    
    // Obter os dados e retornar com o mesmo status
    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error(`Erro ao atualizar método de pagamento:`, error);
    
    return NextResponse.json(
      { error: 'Erro ao atualizar método de pagamento' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/payment-methods/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
    });
    
    // Se não encontrar, retorne 404
    if (apiResponse.status === 404) {
      return NextResponse.json({ error: 'Método de pagamento não encontrado' }, { status: 404 });
    }
    
    // Se for bem-sucedido, retorne 204 No Content
    if (apiResponse.status === 204 || apiResponse.ok) {
      return new NextResponse(null, { status: 204 });
    }
    
    // Obter os dados de erro e retornar
    const errorData = await apiResponse.text().catch(() => 'Erro desconhecido');
    
    return NextResponse.json(
      { error: `Erro na API externa: ${apiResponse.status}`, details: errorData },
      { status: apiResponse.status }
    );
  } catch (error) {
    console.error(`Erro ao excluir método de pagamento:`, error);
    
    return NextResponse.json(
      { error: 'Erro ao excluir método de pagamento' },
      { status: 500 }
    );
  }
} 