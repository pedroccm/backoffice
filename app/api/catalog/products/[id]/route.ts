import { NextRequest, NextResponse } from 'next/server';
import { CATALOG_API_URL } from '@/lib/api-fetch';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log(`[API] PUT /api/catalog/products/${id} - Atualizando produto`);
  
  try {
    const data = await request.json();
    console.log('[API] Dados recebidos para atualização:', data);
    
    // Garantir que o ID na URL seja o mesmo usado no corpo da requisição
    const productData = {
      ...data,
      id
    };
    
    // Fazer a requisição para a API externa
    console.log(`[API] Enviando requisição para ${CATALOG_API_URL}/products/${id}`);
    
    const apiResponse = await fetch(`${CATALOG_API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(productData),
      signal: AbortSignal.timeout(10000), // 10 segundos de timeout
    }).catch(err => {
      console.error(`[API] Erro na requisição para ${CATALOG_API_URL}/products/${id}:`, err);
      return null;
    });
    
    // Se a resposta não existir ou não for bem-sucedida, tentar uma abordagem alternativa
    if (!apiResponse || !apiResponse.ok) {
      const errorStatus = apiResponse?.status || 'N/A';
      const errorText = apiResponse ? await apiResponse.text().catch(() => 'Erro desconhecido') : 'Sem resposta';
      console.error(`[API] Erro na API externa ao atualizar produto ${id}: ${errorStatus} - ${errorText}`);
      
      // Tentativa alternativa - tentar com URL sem o ID (padrão da documentação)
      console.log(`[API] Tentando abordagem alternativa para atualizar produto ${id}`);
      
      try {
        const alternativeResponse = await fetch(`${CATALOG_API_URL}/products`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(request.headers.get('Authorization') 
              ? { 'Authorization': request.headers.get('Authorization') || '' } 
              : {}),
          },
          body: JSON.stringify(productData),
          signal: AbortSignal.timeout(10000), // 10 segundos de timeout
        });
        
        if (alternativeResponse.ok) {
          const responseData = await alternativeResponse.json();
          console.log(`[API] Produto ${id} atualizado com sucesso na API externa (método alternativo)`);
          return NextResponse.json(responseData, { status: 200 });
        } else {
          console.error(`[API] Falha também na tentativa alternativa: ${alternativeResponse.status}`);
          
          // Não permitir continuar se API externa estiver indisponível
          return NextResponse.json(
            { 
              error: "A API externa está indisponível. Não é possível atualizar o produto no momento.",
              details: `Falha em ambos os métodos de atualização. Erro: ${alternativeResponse.status}`
            },
            { status: 503 } // Service Unavailable
          );
        }
      } catch (altError) {
        console.error(`[API] Erro na tentativa alternativa:`, altError);
      }
      
      // Se ambas as tentativas falharem, retornar erro detalhado
      return NextResponse.json(
        { 
          error: "A API externa está indisponível. Não é possível atualizar o produto no momento.", 
          details: `Erro na API: ${errorStatus} - ${errorText}` 
        }, 
        { status: 503 } // Service Unavailable
      );
    }
    
    // Obter os dados e retornar com o mesmo status
    try {
      const responseData = await apiResponse.json();
      console.log(`[API] Produto ${id} atualizado com sucesso na API externa`);
      return NextResponse.json(responseData, { status: 200 });
    } catch (parseError) {
      console.error(`[API] Erro ao processar JSON da resposta:`, parseError);
      return NextResponse.json(
        { 
          error: "Erro ao processar resposta da API externa",
          details: parseError instanceof Error ? parseError.message : String(parseError)
        }, 
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error(`[API] Erro ao atualizar produto com ID ${id}:`, error);
    
    // Não permitir continuar em caso de erro
    return NextResponse.json(
      { 
        error: "A API externa não está respondendo corretamente. Não é possível atualizar o produto no momento.",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 503 } // Service Unavailable
    );
  }
} 