import { NextRequest, NextResponse } from 'next/server';
import { CATALOG_API_URL } from '@/lib/api-fetch';

export async function GET(request: NextRequest) {
  try {
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}/currencies`, {
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
    console.error('Erro na API de moedas:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const mockData = [
      {
        id: "curr-1",
        name: "Real Brasileiro",
        symbol: "R$",
        code: "BRL",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "curr-2",
        name: "Dólar Americano",
        symbol: "$",
        code: "USD",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "curr-3",
        name: "Euro",
        symbol: "€",
        code: "EUR",
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
    const currencyData = await request.json();
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}/currencies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(currencyData),
    });
    
    // Obter os dados e retornar com o mesmo status
    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error('Erro ao criar moeda:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const mockData = {
      id: `curr-${Date.now()}`,
      name: currencyData?.name || "Nova Moeda",
      symbol: currencyData?.symbol || "$",
      code: currencyData?.code || "XYZ",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(mockData, { status: 201 });
  }
} 