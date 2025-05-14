import { NextResponse } from 'next/server';
import { CATALOG_API_URL } from '@/lib/api-fetch';

export async function GET() {
  try {
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}/guidelines`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
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
    
    // Obter os dados e retornar com o mesmo status
    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: apiResponse.status || 200,
    });
  } catch (error) {
    console.error('Erro ao buscar diretrizes:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const fallbackData = [
      {
        id: "guideline-1",
        name: "Diretriz 1",
        description: "Descrição da diretriz 1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "guideline-2",
        name: "Diretriz 2",
        description: "Descrição da diretriz 2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "guideline-3",
        name: "Diretriz 3",
        description: "Descrição da diretriz 3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    return NextResponse.json(fallbackData, { status: 200 });
  }
} 