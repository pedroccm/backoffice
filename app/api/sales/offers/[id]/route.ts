import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';

// GET - obter uma oferta específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    console.log(`Fazendo requisição para ${SALES_API_URL}/offers/${id}`);
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/offers/${id}`, {
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
        const mockOffer = {
          id: id,
          items: [],
          leadId: id.includes('one-time') ? 'lead-123' : 'lead-456',
          subtotal: 0,
          total: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        return NextResponse.json(mockOffer);
      }
      
      return NextResponse.json(
        { error: `Falha ao obter oferta: ${apiResponse.status}` }, 
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
      const mockOffer = {
        id: params.id,
        items: [],
        leadId: params.id.includes('one-time') ? 'lead-123' : 'lead-456',
        subtotal: 0,
        total: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return NextResponse.json(mockOffer);
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
} 