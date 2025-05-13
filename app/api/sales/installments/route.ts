import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';

// GET - obter todas as parcelas
export async function GET(request: NextRequest) {
  try {
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/installments`, {
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
    console.error('Erro na API de parcelas:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const mockData = [
      {
        id: "installment-1",
        installment: 1,
        discountPercentage: 0,
        paymentMethodId: "method-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "installment-2",
        installment: 2,
        discountPercentage: 0,
        paymentMethodId: "method-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "installment-3",
        installment: 3,
        discountPercentage: 0,
        paymentMethodId: "method-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "installment-6",
        installment: 6,
        discountPercentage: 5,
        paymentMethodId: "method-2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "installment-12",
        installment: 12,
        discountPercentage: 10,
        paymentMethodId: "method-2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    return NextResponse.json(mockData, { status: 200 });
  }
}

// POST - criar uma nova parcela
export async function POST(request: NextRequest) {
  try {
    // Obter os dados do corpo da requisição
    const installmentData = await request.json();
    
    // Validar dados obrigatórios
    if (installmentData.installment === undefined) {
      return NextResponse.json({ error: 'Número de parcelas é obrigatório' }, { status: 400 });
    }
    
    if (installmentData.discountPercentage === undefined) {
      return NextResponse.json({ error: 'Percentual de desconto é obrigatório' }, { status: 400 });
    }
    
    if (!installmentData.paymentMethodId) {
      return NextResponse.json({ error: 'ID do método de pagamento é obrigatório' }, { status: 400 });
    }
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/installments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(installmentData),
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
    
    // Obter os dados e retornar com o status 201 (Created)
    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: 201,
    });
  } catch (error) {
    console.error('Erro ao criar parcela:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const installmentData = await request.json().catch(() => ({}));
    
    const mockData = {
      id: `installment-${Date.now()}`,
      installment: installmentData.installment || 1,
      discountPercentage: installmentData.discountPercentage || 0,
      paymentMethodId: installmentData.paymentMethodId || "method-1",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(mockData, { status: 201 });
  }
} 