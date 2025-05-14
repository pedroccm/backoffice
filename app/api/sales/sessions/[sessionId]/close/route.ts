import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';

// PUT - Finalizar sessão
export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    
    console.log(`Finalizando sessão: ${sessionId}`);
    
    // Correção: simplificar o endpoint para EXATAMENTE o que está na documentação
    const apiUrl = `${SALES_API_URL}/sessions/${sessionId}/close`;
    console.log(`Chamando API externa: ${apiUrl}`);
    
    // Fazer a requisição para a API externa - adicionando um corpo JSON vazio para resolver erro INVALID_JSON
    const apiResponse = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify({}) // Adicionando um objeto JSON vazio para satisfazer a API
    });
    
    console.log(`Resposta da API: status ${apiResponse.status}`);
    
    // Se a resposta não for bem-sucedida, tratar o erro
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text().catch(() => '');
      console.error(`Erro na API externa: ${errorText}`);
      
      // Em desenvolvimento, retornar uma resposta simulada
      if (process.env.NODE_ENV === 'development') {
        console.log('Ambiente de desenvolvimento: retornando sessão simulada fechada');
        
        const mockResponse = {
          id: sessionId,
          leadId: "lead-123",
          oneTimeOfferId: "one-time-123",
          recurrentOfferId: "recurrent-123",
          status: "CLOSED",
          isActive: false,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Salvar a sessão na base de dados local
        try {
          await fetch('/api/save-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(mockResponse)
          });
          console.log(`Sessão ${sessionId} salva localmente após fechamento`);
        } catch (saveError) {
          console.error(`Erro ao salvar sessão localmente:`, saveError);
        }
        
        return NextResponse.json(mockResponse);
      }
      
      return NextResponse.json(
        { error: `Falha ao finalizar sessão: ${apiResponse.status}` }, 
        { status: apiResponse.status }
      );
    }
    
    // Retornar a resposta da API
    const data = await apiResponse.json();
    
    // Salvar a sessão na base de dados local
    try {
      await fetch('/api/save-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      console.log(`Sessão ${sessionId} salva localmente após fechamento bem-sucedido`);
    } catch (saveError) {
      console.error(`Erro ao salvar sessão localmente:`, saveError);
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 