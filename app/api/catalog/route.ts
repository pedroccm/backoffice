import { NextRequest, NextResponse } from 'next/server';
import { CATALOG_API_URL } from '@/lib/api-fetch';

export async function GET(request: NextRequest) {
  try {
    // Extrair o caminho da requisição
    const { searchParams, pathname } = new URL(request.url);
    const path = pathname.replace('/api/catalog', '');
    
    // Construir a URL completa para a API do catálogo
    let url = `${CATALOG_API_URL}${path}`;
    
    // Adicionar os parâmetros de consulta, se houver
    if (searchParams.toString()) {
      url += `?${searchParams.toString()}`;
    }
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
    });
    
    // Obter os dados e retornar com o mesmo status
    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error('Erro na API de catálogo:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao acessar a API de catálogo', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Extrair o caminho da requisição
    const { pathname } = new URL(request.url);
    const path = pathname.replace('/api/catalog', '');
    
    // Obter o corpo da requisição
    const body = await request.json();
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(body),
    });
    
    // Obter os dados e retornar com o mesmo status
    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error('Erro na API de catálogo (POST):', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao acessar a API de catálogo', error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Extrair o caminho da requisição
    const { pathname } = new URL(request.url);
    const path = pathname.replace('/api/catalog', '');
    
    // Obter o corpo da requisição
    const body = await request.json();
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(body),
    });
    
    // Obter os dados e retornar com o mesmo status
    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error('Erro na API de catálogo (PUT):', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao acessar a API de catálogo', error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Extrair o caminho da requisição
    const { pathname } = new URL(request.url);
    const path = pathname.replace('/api/catalog', '');
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}${path}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
    });
    
    // Verificar se a resposta contém dados JSON
    try {
      const data = await apiResponse.json();
      return NextResponse.json(data, {
        status: apiResponse.status,
      });
    } catch {
      // Se não for JSON, retornar apenas o status
      return new NextResponse(null, {
        status: apiResponse.status,
      });
    }
  } catch (error) {
    console.error('Erro na API de catálogo (DELETE):', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao acessar a API de catálogo', error: String(error) },
      { status: 500 }
    );
  }
} 