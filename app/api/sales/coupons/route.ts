import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';

// Função para lidar com erros de API de forma consistente
function handleApiError(error: any, method: string = 'GET') {
  console.error(`Erro na API de cupons (${method}):`, error);
  
  // Mensagem amigável para o cliente
  const message = error instanceof Error ? error.message : String(error);
  
  return NextResponse.json(
    { 
      success: false, 
      message: `Erro ao acessar a API de cupons: ${message}`,
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

// Validação para cupons
function validateCoupon(coupon: any): { valid: boolean; message?: string } {
  if (!coupon) return { valid: false, message: 'Dados do cupom não fornecidos' };
  
  if (!coupon.code || typeof coupon.code !== 'string' || coupon.code.trim() === '') {
    return { valid: false, message: 'Código do cupom é obrigatório' };
  }
  
  if (coupon.discountPercentage === undefined || typeof coupon.discountPercentage !== 'number' || 
      coupon.discountPercentage <= 0 || coupon.discountPercentage > 100) {
    return { valid: false, message: 'Percentual de desconto deve ser um número entre 0 e 100' };
  }
  
  if (!coupon.type || !['ONE_TIME', 'RECURRENT'].includes(coupon.type)) {
    return { valid: false, message: 'Tipo do cupom deve ser ONE_TIME ou RECURRENT' };
  }
  
  return { valid: true };
}

export async function GET(request: NextRequest) {
  try {
    console.log(`[API Cupons] GET ${SALES_API_URL}/coupons`);
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/coupons`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      signal: AbortSignal.timeout(10000) // 10 segundos de timeout
    });
    
    // Verificar se a resposta é válida
    if (!apiResponse.ok) {
      throw new Error(`API retornou status ${apiResponse.status}: ${apiResponse.statusText}`);
    }
    
    // Obter os dados e retornar com o mesmo status
    const responseText = await apiResponse.text();
    
    // Se a resposta estiver vazia, retornar um array vazio
    if (!responseText.trim()) {
      return NextResponse.json([], { status: 200 });
    }
    
    const data = JSON.parse(responseText);
    return NextResponse.json(data, { status: apiResponse.status });
  } catch (error) {
    console.error('Erro na API de cupons:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    if (process.env.NODE_ENV === 'development') {
      console.log('Retornando dados mockados para cupons');
      const mockData = [
        {
          id: "coupon-1",
          code: "WELCOME10",
          discountPercentage: 10,
          type: "ONE_TIME",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z"
        },
        {
          id: "coupon-2",
          code: "PREMIUM20",
          discountPercentage: 20,
          type: "RECURRENT",
          createdAt: "2024-02-01T00:00:00Z",
          updatedAt: "2024-02-01T00:00:00Z"
        }
      ];
      
      return NextResponse.json(mockData, { 
        status: 200,
        headers: { 'X-Mock-Data': 'true' }
      });
    }
    
    return handleApiError(error, 'GET');
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log(`[API Cupons] Iniciando POST para criar cupom`);
    
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
    
    // Validar os dados do cupom
    const validation = validateCoupon(body);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 400 }
      );
    }
    
    console.log(`[API Cupons] Enviando POST para ${SALES_API_URL}/coupons`, body);
    
    // Fazer a requisição para a API externa
    try {
      const apiResponse = await fetch(`${SALES_API_URL}/coupons`, {
        method: 'POST',
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
        console.error(`[API Cupons] Erro na resposta da API (${apiResponse.status}):`, 
            errorText.trim() ? errorText : '(resposta vazia)');
        
        throw new Error(`API retornou status ${apiResponse.status}: ${apiResponse.statusText}`);
      }
      
      // Processar a resposta
      const responseText = await apiResponse.text();
      
      if (!responseText.trim()) {
        return new NextResponse(null, { status: 204 });
      }
      
      const data = JSON.parse(responseText);
      return NextResponse.json(data, { status: 201 });
    } catch (apiError) {
      console.error('[API Cupons] Erro ao criar cupom:', apiError);
      
      // Em ambiente de desenvolvimento, criar um cupom mockado
      if (process.env.NODE_ENV === 'development') {
        console.log('[API Cupons] Criando cupom mockado');
        
        const { code, discountPercentage, type } = body;
        
        const mockCoupon = {
          id: `coupon-${Date.now()}`,
          code,
          discountPercentage,
          type,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return NextResponse.json(mockCoupon, { 
          status: 201,
          headers: { 'X-Mock-Data': 'true' }
        });
      }
      
      throw apiError;
    }
  } catch (error) {
    return handleApiError(error, 'POST');
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Extrair o caminho da requisição para verificar se está atualizando um cupom específico
    const { pathname } = new URL(request.url);
    const parts = pathname.split('/');
    const couponId = parts[parts.length - 1] !== 'coupons' ? parts[parts.length - 1] : null;
    
    if (!couponId) {
      return NextResponse.json(
        { success: false, message: 'ID do cupom não especificado' },
        { status: 400 }
      );
    }
    
    console.log(`[API Cupons] Iniciando PUT para atualizar cupom ${couponId}`);
    
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
    
    console.log(`[API Cupons] Enviando PUT para ${SALES_API_URL}/coupons/${couponId}`, body);
    
    // Fazer a requisição para a API externa
    try {
      const apiResponse = await fetch(`${SALES_API_URL}/coupons/${couponId}`, {
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
        console.error(`[API Cupons] Erro na resposta da API (${apiResponse.status}):`, 
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
      console.error('[API Cupons] Erro ao atualizar cupom:', apiError);
      
      // Em ambiente de desenvolvimento, atualizar um cupom mockado
      if (process.env.NODE_ENV === 'development') {
        console.log('[API Cupons] Atualizando cupom mockado');
        
        // Criar uma versão mockada do cupom atualizado
        const mockCoupon = {
          id: couponId,
          ...body,
          updatedAt: new Date().toISOString()
        };
        
        return NextResponse.json(mockCoupon, { 
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