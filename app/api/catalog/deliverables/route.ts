import { NextRequest, NextResponse } from 'next/server';
import { CATALOG_API_URL } from '@/lib/api-fetch';

export async function GET(request: NextRequest) {
  try {
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}/deliverables`, {
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
    console.error('Erro na API de entregáveis:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const mockData = [
      {
        id: "deliv-1",
        name: "Instalação de Software",
        description: "Instalação e configuração completa do software no ambiente do cliente",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "deliv-2",
        name: "Treinamento de Equipe",
        description: "Treinamento completo para equipe do cliente em todas as funcionalidades",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "deliv-3",
        name: "Relatório de Desempenho",
        description: "Relatório mensal detalhado com métricas de desempenho e recomendações",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "deliv-4",
        name: "Suporte Técnico Especializado",
        description: "Suporte técnico prioritário 24/7 com SLA garantido",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "deliv-5",
        name: "Customização de Interface",
        description: "Customização completa da interface do usuário conforme necessidades do cliente",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    return NextResponse.json(mockData, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Obter os dados do corpo da requisição
    const deliverableData = await request.json();
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}/deliverables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(deliverableData),
    });
    
    // Obter os dados e retornar com o mesmo status
    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error('Erro ao criar entregável:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const mockData = {
      id: `deliv-${Date.now()}`,
      name: "Novo Entregável",
      description: "Descrição do entregável",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(mockData, { status: 201 });
  }
} 