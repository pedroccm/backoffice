import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';

// Função auxiliar para lidar com erros da API
function handleApiError(error: any, method: string = 'GET') {
  console.error(`Erro na API de vendas (${method}):`, error);
  
  // Em ambiente de desenvolvimento, retornar uma resposta mais amigável
  const message = error instanceof Error ? error.message : String(error);
  
  return NextResponse.json(
    { 
      success: false, 
      message: `Erro ao acessar a API de vendas: ${message}`,
      error: String(error),
      mockData: true
    },
    { 
      status: 500,
      headers: {
        'X-Mock-Data': 'true',
        'Content-Type': 'application/json'
      }
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    // Extrair o caminho da requisição
    const { searchParams, pathname } = new URL(request.url);
    const path = pathname.replace('/api/sales', '');
    
    // Construir a URL completa para a API de vendas
    let url = `${SALES_API_URL}${path}`;
    
    // Adicionar os parâmetros de consulta, se houver
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }
    
    console.log(`[API Proxy] GET ${url}`);
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      // Adicionar timeout para evitar requisições travadas
      signal: AbortSignal.timeout(10000)
    });
    
    // Log com o status da resposta
    console.log(`[API Proxy] Resposta de ${url}: ${apiResponse.status}`);
    
    // Verificar se a resposta é de sucesso
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`[API Proxy] Erro da API (${apiResponse.status}):`, 
          errorText.trim() ? errorText : '(resposta vazia)');
      
      throw new Error(`Erro ${apiResponse.status}: ${apiResponse.statusText}`);
    }
    
    // Verificar se há conteúdo na resposta
    const responseText = await apiResponse.text();
    if (!responseText.trim()) {
      console.warn(`[API Proxy] API retornou uma resposta vazia para ${url}`);
      
      // Retornar um objeto ou array vazio, dependendo do endpoint
      if (path.endsWith('/offers') || path.endsWith('/coupons') || 
          path.endsWith('/offer-durations') || path.endsWith('/installments') || 
          path.endsWith('/payment-methods')) {
        return NextResponse.json([], { status: 200 });
      }
      
      return NextResponse.json({}, { status: 200 });
    }
    
    // Parsear a resposta como JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[API Proxy] Erro ao parsear resposta JSON:', parseError);
      throw new Error('Erro ao processar resposta da API');
    }
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Extrair o caminho da requisição
    const { pathname } = new URL(request.url);
    const path = pathname.replace('/api/sales', '');
    
    // Obter o corpo da requisição
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[API Proxy] Erro ao parsear corpo da requisição:', parseError);
      return NextResponse.json(
        { success: false, message: 'Corpo da requisição inválido' },
        { status: 400 }
      );
    }
    
    console.log(`[API Proxy] POST ${SALES_API_URL}${path}`, body);
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(body),
      // Adicionar timeout para evitar requisições travadas
      signal: AbortSignal.timeout(15000)
    });
    
    // Log com o status da resposta
    console.log(`[API Proxy] Resposta de POST ${path}: ${apiResponse.status}`);
    
    // Verificar se a resposta é de sucesso
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`[API Proxy] Erro no POST (${apiResponse.status}):`, 
          errorText.trim() ? errorText : '(resposta vazia)');
      
      // Retornar o erro da API diretamente
      if (errorText.trim()) {
        try {
          const errorData = JSON.parse(errorText);
          return NextResponse.json(errorData, { status: apiResponse.status });
        } catch (e) {
          // Se não for JSON, retornar como texto
          return NextResponse.json(
            { success: false, message: errorText },
            { status: apiResponse.status }
          );
        }
      }
      
      throw new Error(`Erro ${apiResponse.status}: ${apiResponse.statusText}`);
    }
    
    // Verificar se há conteúdo na resposta
    const responseText = await apiResponse.text();
    if (!responseText.trim()) {
      // Para endpoints que não retornam conteúdo
      return new NextResponse(null, { status: 204 });
    }
    
    // Parsear a resposta como JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[API Proxy] Erro ao parsear resposta JSON do POST:', parseError);
      return NextResponse.json(
        { success: false, message: 'Erro ao processar resposta da API' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    return handleApiError(error, 'POST');
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Extrair o caminho da requisição
    const { pathname } = new URL(request.url);
    const path = pathname.replace('/api/sales', '');
    
    // Obter o corpo da requisição
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[API Proxy] Erro ao parsear corpo da requisição PUT:', parseError);
      return NextResponse.json(
        { success: false, message: 'Corpo da requisição inválido' },
        { status: 400 }
      );
    }
    
    console.log(`[API Proxy] PUT ${SALES_API_URL}${path}`, body);
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(body),
      // Adicionar timeout para evitar requisições travadas
      signal: AbortSignal.timeout(15000)
    });
    
    // Log com o status da resposta
    console.log(`[API Proxy] Resposta de PUT ${path}: ${apiResponse.status}`);
    
    // Verificar se a resposta é de sucesso
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`[API Proxy] Erro no PUT (${apiResponse.status}):`, 
          errorText.trim() ? errorText : '(resposta vazia)');
      
      // Retornar o erro da API diretamente
      if (errorText.trim()) {
        try {
          const errorData = JSON.parse(errorText);
          return NextResponse.json(errorData, { status: apiResponse.status });
        } catch (e) {
          // Se não for JSON, retornar como texto
          return NextResponse.json(
            { success: false, message: errorText },
            { status: apiResponse.status }
          );
        }
      }
      
      throw new Error(`Erro ${apiResponse.status}: ${apiResponse.statusText}`);
    }
    
    // Verificar se há conteúdo na resposta
    const responseText = await apiResponse.text();
    if (!responseText.trim()) {
      // Para endpoints que não retornam conteúdo
      return new NextResponse(null, { status: 204 });
    }
    
    // Parsear a resposta como JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[API Proxy] Erro ao parsear resposta JSON do PUT:', parseError);
      return NextResponse.json(
        { success: false, message: 'Erro ao processar resposta da API' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    return handleApiError(error, 'PUT');
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Extrair o caminho da requisição
    const { pathname } = new URL(request.url);
    const path = pathname.replace('/api/sales', '');
    
    console.log(`[API Proxy] DELETE ${SALES_API_URL}${path}`);
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}${path}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      // Adicionar timeout para evitar requisições travadas
      signal: AbortSignal.timeout(10000)
    });
    
    // Log com o status da resposta
    console.log(`[API Proxy] Resposta de DELETE ${path}: ${apiResponse.status}`);
    
    // Verificar se a resposta é de sucesso
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`[API Proxy] Erro no DELETE (${apiResponse.status}):`, 
          errorText.trim() ? errorText : '(resposta vazia)');
      
      throw new Error(`Erro ${apiResponse.status}: ${apiResponse.statusText}`);
    }
    
    // Verificar se a resposta contém dados JSON
    try {
      // Tentar primeiro verificar se há conteúdo
      const responseText = await apiResponse.text();
      if (!responseText.trim()) {
        // Se não tem conteúdo, retornar status 204 (No Content)
        return new NextResponse(null, { status: 204 });
      }
      
      // Se tem conteúdo, tentar parsear como JSON
      const data = JSON.parse(responseText);
      return NextResponse.json(data, {
        status: apiResponse.status,
      });
    } catch (error) {
      // Casos de sucesso onde não precisamos parsear o corpo
      if (apiResponse.status >= 200 && apiResponse.status < 300) {
        return new NextResponse(null, {
          status: apiResponse.status,
        });
      }
      
      console.error('[API Proxy] Erro ao processar resposta do DELETE:', error);
      throw error;
    }
  } catch (error) {
    return handleApiError(error, 'DELETE');
  }
} 