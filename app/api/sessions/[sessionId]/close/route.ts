import { NextRequest, NextResponse } from 'next/server';
import { apiRequest, SALES_API_URL } from '@/lib/api-fetch';

export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;
  
  try {
    console.log(`Fechando sessão ${sessionId} via API`);
    
    // Enviar requisição para a API externa para fechar a sessão
    const response = await fetch(`${SALES_API_URL}/sessions/${sessionId}/close`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
    });
    
    if (!response.ok) {
      // Se o ambiente for de desenvolvimento, retornar uma resposta simulada
      if (process.env.NODE_ENV === 'development') {
        console.log(`Em desenvolvimento, retornando resposta simulada para sessão ${sessionId}`);
        return NextResponse.json({
          id: sessionId,
          status: "CLOSED",
          updatedAt: new Date().toISOString()
        });
      }
      
      // Em produção, retornar o erro da API
      const errorText = await response.text().catch(() => 'Erro desconhecido');
      console.error(`Erro ao fechar sessão ${sessionId}:`, errorText);
      return NextResponse.json(
        { error: `Falha ao fechar sessão: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }
    
    // Retornar a resposta da API
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Erro ao fechar sessão ${sessionId}:`, error);
    
    // Em desenvolvimento, retornar resposta simulada
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        id: sessionId,
        status: "CLOSED",
        updatedAt: new Date().toISOString()
      });
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: String(error) },
      { status: 500 }
    );
  }
} 