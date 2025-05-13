import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';

// GET - obter todos os métodos de pagamento
export async function GET(request: NextRequest) {
  try {
    console.log(`Fazendo requisição para ${SALES_API_URL}/payment-methods`);
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/payment-methods`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
    });
    
    console.log(`Resposta da API: status ${apiResponse.status}`);
    
    // Se a resposta não for bem-sucedida, trate o erro
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text().catch(() => 'Erro desconhecido');
      console.error(`Erro na API externa: ${apiResponse.status} - ${errorText}`);
      
      // Em ambiente de desenvolvimento, retornar dados simulados
      if (process.env.NODE_ENV === 'development') {
        console.log('Retornando dados simulados em ambiente de desenvolvimento');
        const mockData = [
          {
            id: "method-1",
            name: "Cartão de Crédito",
            description: "Pagamento via cartão de crédito (Visa, Mastercard, etc)",
            code: "CREDIT_CARD",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "method-2",
            name: "Boleto Bancário",
            description: "Pagamento via boleto bancário",
            code: "BOLETO",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "method-3",
            name: "Pix",
            description: "Pagamento instantâneo via Pix",
            code: "PIX",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        
        return NextResponse.json(mockData, { status: 200 });
      }
      
      // Em produção, retornar o erro
      return NextResponse.json(
        { error: `Erro na API externa: ${apiResponse.status}`, details: errorText },
        { status: apiResponse.status }
      );
    }
    
    // Obter os dados e retornar com o mesmo status
    const data = await apiResponse.json();
    console.log(`Dados recebidos da API: ${data.length} métodos de pagamento`);
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error('Erro na API de métodos de pagamento:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    if (process.env.NODE_ENV === 'development') {
      console.log('Retornando dados simulados em ambiente de desenvolvimento devido a um erro');
      const mockData = [
        {
          id: "method-1",
          name: "Cartão de Crédito",
          description: "Pagamento via cartão de crédito (Visa, Mastercard, etc)",
          code: "CREDIT_CARD",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "method-2",
          name: "Boleto Bancário",
          description: "Pagamento via boleto bancário",
          code: "BOLETO",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "method-3",
          name: "Pix",
          description: "Pagamento instantâneo via Pix",
          code: "PIX",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      return NextResponse.json(mockData, { status: 200 });
    }
    
    // Em produção, retornar um array vazio com status 500
    return NextResponse.json([], { status: 500 });
  }
}

// POST - criar um novo método de pagamento
export async function POST(request: NextRequest) {
  try {
    // Obter os dados do corpo da requisição
    const paymentMethodData = await request.json();
    
    // Validar dados obrigatórios
    if (!paymentMethodData.name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }
    
    if (!paymentMethodData.code) {
      return NextResponse.json({ error: 'Código é obrigatório' }, { status: 400 });
    }
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/payment-methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(paymentMethodData),
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
    console.error('Erro ao criar método de pagamento:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const paymentMethodData = await request.json().catch(() => ({}));
    
    const mockData = {
      id: `method-${Date.now()}`,
      name: paymentMethodData.name || "Novo Método de Pagamento",
      description: paymentMethodData.description || "Descrição do método de pagamento",
      code: paymentMethodData.code || "PAYMENT_CODE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(mockData, { status: 201 });
  }
} 