import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';

// Função para lidar com erros de API de forma consistente
function handleApiError(error: any, method: string = 'GET') {
  console.error(`Erro na API de durações de oferta (${method}):`, error);
  
  // Mensagem amigável para o cliente
  const message = error instanceof Error ? error.message : String(error);
  
  return NextResponse.json(
    { 
      success: false, 
      message: `Erro ao acessar a API de durações de oferta: ${message}`,
      error: String(error),
      mockData: process.env.NODE_ENV === 'development'
    },
    { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

// Validação para durações de oferta
function validateOfferDuration(offerDuration: any): { valid: boolean; message?: string } {
  if (!offerDuration) return { valid: false, message: 'Dados da duração não fornecidos' };
  
  if (offerDuration.months === undefined || typeof offerDuration.months !== 'number' || 
      offerDuration.months <= 0 || !Number.isInteger(offerDuration.months)) {
    return { valid: false, message: 'Meses deve ser um número inteiro positivo' };
  }
  
  if (offerDuration.discountPercentage === undefined || typeof offerDuration.discountPercentage !== 'number' || 
      offerDuration.discountPercentage < 0 || offerDuration.discountPercentage > 100) {
    return { valid: false, message: 'Percentual de desconto deve ser um número entre 0 e 100' };
  }
  
  return { valid: true };
}

// GET - obter todas as durações de ofertas
export async function GET(request: NextRequest) {
  try {
    console.log(`Fazendo requisição para ${SALES_API_URL}/offer-durations`);
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/offer-durations`, {
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
            id: "duration-1",
            months: 3,
            discountPercentage: 5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "duration-2",
            months: 6,
            discountPercentage: 10,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: "duration-3",
            months: 12,
            discountPercentage: 15,
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
    console.log(`Dados recebidos da API: ${data.length} durações de oferta`);
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error('Erro na API de durações de ofertas:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    if (process.env.NODE_ENV === 'development') {
      console.log('Retornando dados simulados em ambiente de desenvolvimento devido a um erro');
      const mockData = [
        {
          id: "duration-1",
          months: 3,
          discountPercentage: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "duration-2",
          months: 6,
          discountPercentage: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: "duration-3",
          months: 12,
          discountPercentage: 15,
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

// POST - criar uma nova duração de oferta
export async function POST(request: NextRequest) {
  try {
    // Obter os dados do corpo da requisição
    const offerDurationData = await request.json();
    
    // Validar dados obrigatórios
    if (offerDurationData.months === undefined || offerDurationData.months <= 0) {
      return NextResponse.json({ error: 'Número de meses deve ser maior que zero' }, { status: 400 });
    }
    
    if (offerDurationData.discountPercentage === undefined || 
        offerDurationData.discountPercentage < 0 || 
        offerDurationData.discountPercentage > 100) {
      return NextResponse.json({ error: 'Percentual de desconto deve estar entre 0 e 100' }, { status: 400 });
    }
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/offer-durations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(offerDurationData),
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
    console.error('Erro ao criar duração de oferta:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const offerDurationData = await request.json().catch(() => ({}));
    
    const mockData = {
      id: `duration-${Date.now()}`,
      months: offerDurationData.months || 3,
      discountPercentage: offerDurationData.discountPercentage || 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(mockData, { status: 201 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Extrair o ID da duração da URL
    const { pathname } = new URL(request.url);
    const parts = pathname.split('/');
    const durationId = parts[parts.length - 1] !== 'offer-durations' ? parts[parts.length - 1] : null;
    
    if (!durationId) {
      return NextResponse.json(
        { success: false, message: 'ID da duração não especificado' },
        { status: 400 }
      );
    }
    
    console.log(`[API Durações] Iniciando PUT para atualizar duração ${durationId}`);
    
    // Obter o corpo da requisição
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, message: 'Corpo da requisição inválido' },
        { status: 400 }
      );
    }
    
    console.log(`[API Durações] Enviando PUT para ${SALES_API_URL}/offer-durations/${durationId}`, body);
    
    // Fazer a requisição para a API externa
    try {
      const apiResponse = await fetch(`${SALES_API_URL}/offer-durations/${durationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(request.headers.get('Authorization') 
            ? { 'Authorization': request.headers.get('Authorization') || '' } 
            : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000) // 15 segundos de timeout
      });
      
      // Verificar se a resposta é válida
      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error(`[API Durações] Erro na resposta da API (${apiResponse.status}):`, 
            errorText.trim() ? errorText : '(resposta vazia)');
        
        throw new Error(`API retornou status ${apiResponse.status}: ${apiResponse.statusText}`);
      }
      
      // Processar a resposta
      const responseText = await apiResponse.text();
      
      if (!responseText.trim()) {
        return new NextResponse(null, { status: 204 });
      }
      
      const data = JSON.parse(responseText);
      return NextResponse.json(data, { status: 200 });
    } catch (apiError) {
      console.error('[API Durações] Erro ao atualizar duração:', apiError);
      
      // Em ambiente de desenvolvimento, atualizar uma duração mockada
      if (process.env.NODE_ENV === 'development') {
        console.log('[API Durações] Atualizando duração mockada');
        
        // Criar uma versão mockada da duração atualizada
        const mockDuration = {
          id: durationId,
          ...body,
          updatedAt: new Date().toISOString()
        };
        
        return NextResponse.json(mockDuration, { 
          status: 200,
          headers: { 'X-Mock-Data': 'true' }
        });
      }
      
      throw apiError;
    }
  } catch (error) {
    return handleApiError(error, 'PUT');
  }
} 