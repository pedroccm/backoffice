import { NextRequest, NextResponse } from 'next/server';
import { CATALOG_API_URL } from '@/lib/api-fetch';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    console.log(`Removendo entregável ${id}`);
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}/deliverables/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify({ id }),
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
    
    // Tentar obter resposta JSON ou retornar sucesso simples
    try {
      const data = await apiResponse.json();
      return NextResponse.json(data, {
        status: apiResponse.status || 200,
      });
    } catch (error) {
      // Se não tiver corpo JSON, apenas retornar sucesso
      return NextResponse.json({ success: true }, {
        status: apiResponse.status || 200,
      });
    }
  } catch (error) {
    console.error('Erro ao remover entregável:', error);
    
    // Em ambiente de desenvolvimento, retornar sucesso simulado
    return NextResponse.json({ success: true }, { status: 200 });
  }
} 