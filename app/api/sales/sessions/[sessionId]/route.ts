import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';

// GET - Obter detalhes da sessão
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    
    console.log(`Obtendo detalhes da sessão: ${sessionId}`);
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      }
    });
    
    console.log(`Resposta da API: status ${apiResponse.status}`);
    
    // Se a resposta não for bem-sucedida, tratar o erro
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text().catch(() => '');
      console.error(`Erro na API externa: ${errorText}`);
      
      // Em desenvolvimento, retornar uma resposta simulada
      if (process.env.NODE_ENV === 'development') {
        console.log('Ambiente de desenvolvimento: retornando sessão simulada');
        
        const mockResponse = {
          id: sessionId,
          leadId: "lead-123",
          oneTimeOfferId: "one-time-123",
          recurrentOfferId: "recurrent-123",
          status: "ACTIVE",
          isActive: true,
          expiresAt: new Date(Date.now() + 3600000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return NextResponse.json(mockResponse);
      }
      
      return NextResponse.json(
        { error: `Falha ao obter detalhes da sessão: ${apiResponse.status}` }, 
        { status: apiResponse.status }
      );
    }
    
    // Retornar a resposta da API
    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 