import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';

// GET - obter todos os produtos
export async function GET(request: NextRequest) {
  try {
    console.log(`Fazendo requisição para ${SALES_API_URL}/products`);
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/products`, {
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
      const errorText = await apiResponse.text().catch(() => '');
      console.error(`Erro na API externa: ${errorText}`);
      
      // Em desenvolvimento, simule uma resposta
      if (process.env.NODE_ENV === 'development') {
        // Dados simulados para desenvolvimento
        const mockProducts = [
          {
            id: 'prod-1',
            name: 'Consulta Única',
            description: 'Consulta única - pagamento único',
            paymentType: 'ONE_TIME',
            prices: [
              { currencyId: 'price-1', amount: 297 },
              { currencyId: 'price-2', amount: 397 },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'prod-2',
            name: 'Pacote Premium',
            description: 'Pacote Premium - pagamento único',
            paymentType: 'ONE_TIME',
            prices: [
              { currencyId: 'price-3', amount: 997 },
              { currencyId: 'price-4', amount: 1297 },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'prod-3',
            name: 'Assinatura Básica',
            description: 'Assinatura mensal básica',
            paymentType: 'RECURRENT',
            prices: [
              { currencyId: 'price-5', amount: 49.90 },
              { currencyId: 'price-6', amount: 59.90 },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'prod-4',
            name: 'Assinatura Premium',
            description: 'Assinatura mensal premium',
            paymentType: 'RECURRENT',
            prices: [
              { currencyId: 'price-7', amount: 99.90 },
              { currencyId: 'price-8', amount: 129.90 },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        
        return NextResponse.json(mockProducts);
      }
      
      return NextResponse.json(
        { error: `Falha ao obter produtos: ${apiResponse.status}` }, 
        { status: apiResponse.status }
      );
    }
    
    // Retorne a resposta da API
    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao processar a requisição:', error);
    
    // Em desenvolvimento, retorne dados simulados
    if (process.env.NODE_ENV === 'development') {
      // Dados simulados para desenvolvimento
      const mockProducts = [
        {
          id: 'prod-1',
          name: 'Consulta Única',
          description: 'Consulta única - pagamento único',
          paymentType: 'ONE_TIME',
          prices: [
            { currencyId: 'price-1', amount: 297 },
            { currencyId: 'price-2', amount: 397 },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'prod-2',
          name: 'Pacote Premium',
          description: 'Pacote Premium - pagamento único',
          paymentType: 'ONE_TIME',
          prices: [
            { currencyId: 'price-3', amount: 997 },
            { currencyId: 'price-4', amount: 1297 },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'prod-3',
          name: 'Assinatura Básica',
          description: 'Assinatura mensal básica',
          paymentType: 'RECURRENT',
          prices: [
            { currencyId: 'price-5', amount: 49.90 },
            { currencyId: 'price-6', amount: 59.90 },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'prod-4',
          name: 'Assinatura Premium',
          description: 'Assinatura mensal premium',
          paymentType: 'RECURRENT',
          prices: [
            { currencyId: 'price-7', amount: 99.90 },
            { currencyId: 'price-8', amount: 129.90 },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      
      return NextResponse.json(mockProducts);
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
} 