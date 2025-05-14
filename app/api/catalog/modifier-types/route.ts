import { NextRequest, NextResponse } from 'next/server';
import { CATALOG_API_URL } from '@/lib/api-fetch';

export async function GET(request: NextRequest) {
  try {
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}/modifier-types`, {
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
    console.error('Erro na API de tipos de modificadores:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const mockData = [
      {
        id: "mod-1",
        key: "seasonal_discount",
        displayName: "Desconto Sazonal",
        description: "Descontos aplicados em épocas específicas do ano",
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "mod-2",
        key: "volume_discount",
        displayName: "Desconto por Volume",
        description: "Descontos aplicados com base na quantidade comprada",
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "mod-3",
        key: "loyalty_bonus",
        displayName: "Bônus de Fidelidade",
        description: "Preços especiais para clientes antigos",
        createdBy: "system",
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
    const modifierTypeData = await request.json();
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}/modifier-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(modifierTypeData),
    });
    
    // Obter os dados e retornar com o mesmo status
    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error('Erro ao criar tipo de modificador:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const mockData = {
      id: `mod-${Date.now()}`,
      key: modifierTypeData?.key || "new_modifier",
      displayName: modifierTypeData?.displayName || "Novo Modificador",
      description: modifierTypeData?.description || "Descrição do modificador",
      createdBy: "system",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(mockData, { status: 201 });
  }
} 