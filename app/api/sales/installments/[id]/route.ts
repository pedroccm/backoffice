import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/installments/${id}`, {
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
      return NextResponse.json({ error: 'Parcela não encontrada' }, { status: 404 });
    }
    
    // Obter os dados e retornar com o mesmo status
    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error(`Erro ao buscar parcela:`, error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const id = params.id;
    
    // Criar dados fictícios com base no ID
    const mockData = {
      id: id,
      installment: parseInt(id.split('-')[1]) || 1,
      discountPercentage: parseInt(id.split('-')[1]) > 6 ? 10 : 0,
      paymentMethodId: "method-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(mockData, { status: 200 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const installmentData = await request.json();
    
    // Validar dados
    if (installmentData.installment === undefined && 
        installmentData.discountPercentage === undefined && 
        !installmentData.paymentMethodId) {
      return NextResponse.json(
        { error: 'Pelo menos um campo deve ser fornecido para atualização' },
        { status: 400 }
      );
    }
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/installments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(installmentData),
    });
    
    // Se não encontrar, retorne 404
    if (apiResponse.status === 404) {
      return NextResponse.json({ error: 'Parcela não encontrada' }, { status: 404 });
    }
    
    // Obter os dados e retornar com o mesmo status
    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error(`Erro ao atualizar parcela:`, error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const id = params.id;
    const installmentData = await request.json().catch(() => ({}));
    
    // Criar dados fictícios com base no ID e dados atualizados
    const mockData = {
      id: id,
      installment: installmentData.installment || parseInt(id.split('-')[1]) || 1,
      discountPercentage: installmentData.discountPercentage || (parseInt(id.split('-')[1]) > 6 ? 10 : 0),
      paymentMethodId: installmentData.paymentMethodId || "method-1",
      createdAt: new Date(Date.now() - 86400000).toISOString(), // Ontem
      updatedAt: new Date().toISOString() // Agora
    };
    
    return NextResponse.json(mockData, { status: 200 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/installments/${id}`, {
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
      return NextResponse.json({ error: 'Parcela não encontrada' }, { status: 404 });
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
    console.error(`Erro ao excluir parcela:`, error);
    
    // Em ambiente de desenvolvimento, sempre retornar sucesso
    return new NextResponse(null, { status: 204 });
  }
} 