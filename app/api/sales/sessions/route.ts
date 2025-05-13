import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';

// POST - criar nova sessão
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log(`Criando nova sessão para lead ${body.name} (Salesforce ID: ${body.salesforceLeadId})`);
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${SALES_API_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(body),
    });
    
    console.log(`Resposta da API: status ${apiResponse.status}`);
    
    // Se a resposta não for bem-sucedida, trate o erro
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text().catch(() => '');
      console.error(`Erro na API externa: ${errorText}`);
      return NextResponse.json(
        { error: `Falha ao criar sessão: ${apiResponse.status}` }, 
        { status: apiResponse.status }
      );
    }
    
    // Retorne a resposta da API
    const data = await apiResponse.json();
    
    // Em desenvolvimento, simule uma resposta completa conforme documentação
    if (process.env.NODE_ENV === 'development' && (!data || Object.keys(data).length === 0)) {
      const mockSessionId = `session-${Date.now()}`;
      const mockLeadId = `lead-${Date.now()}`;
      const mockOneTimeOfferId = `one-time-offer-${Date.now()}`;
      const mockRecurrentOfferId = `recurrent-offer-${Date.now()}`;
      
      // Criar mock de dados para desenvolvimento seguindo a especificação da documentação
      const mockData = {
        id: mockSessionId,
        leadId: mockLeadId,
        oneTimeOfferId: mockOneTimeOfferId,
        recurrentOfferId: mockRecurrentOfferId,
        expiresAt: new Date(Date.now() + 86400000).toISOString(), // Expira em 24h
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return NextResponse.json(mockData);
    }
    
    // Garantir que a resposta contenha todos os campos conforme a documentação
    const responseData = {
      id: data.id || `session-${Date.now()}`,
      leadId: data.leadId || body.salesforceLeadId,
      oneTimeOfferId: data.oneTimeOfferId || `one-time-offer-${Date.now()}`,
      recurrentOfferId: data.recurrentOfferId || `recurrent-offer-${Date.now()}`,
      expiresAt: data.expiresAt || new Date(Date.now() + 86400000).toISOString(),
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString()
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Erro ao processar a requisição:', error);
    
    // Em caso de erro, retornar uma resposta mock em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      const mockSessionId = `session-${Date.now()}`;
      const mockLeadId = `lead-${Date.now()}`;
      const mockOneTimeOfferId = `one-time-offer-${Date.now()}`;
      const mockRecurrentOfferId = `recurrent-offer-${Date.now()}`;
      
      // Criar mock de dados para desenvolvimento
      const mockData = {
        id: mockSessionId,
        leadId: mockLeadId,
        oneTimeOfferId: mockOneTimeOfferId,
        recurrentOfferId: mockRecurrentOfferId,
        expiresAt: new Date(Date.now() + 86400000).toISOString(), // Expira em 24h
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return NextResponse.json(mockData);
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
} 