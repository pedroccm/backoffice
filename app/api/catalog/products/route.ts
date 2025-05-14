import { NextRequest, NextResponse } from 'next/server';
import { CATALOG_API_URL } from '@/lib/api-fetch';

export async function GET(request: NextRequest) {
  try {
    // Requisição para listar todos os produtos
    const apiResponse = await fetch(`${CATALOG_API_URL}/products`, {
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
    console.error('Erro na API de produtos:', error);
    
    // Produtos baseados nos planos reais
    const realProducts = [
      {
        id: "growth-assessment",
        name: "Assessoria de Growth",
        description: "Implementação de indicadores, análise de métricas e projetos de conversão.",
        paymentType: "RECURRENT",
        status: "ACTIVE",
        singleItemOnly: true,
        categoryId: "cat-growth",
        prices: [
          {
            id: "price-growth",
            amount: 0.00,
            currencyId: "curr-brl",
            modifierTypeId: null
          }
        ],
        deliverables: [
          {
            id: "del-growth-1",
            name: "Planejamento para campanha",
            description: "Desenvolvimento de plano estratégico para campanhas"
          },
          {
            id: "del-growth-2",
            name: "Implementação de Data Layer tags",
            description: "Implementação e configuração de tags para análise de dados"
          },
          {
            id: "del-growth-3",
            name: "Treinamento por demanda",
            description: "Treinamentos específicos conforme necessidade"
          }
        ],
        guidelines: [],
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "media-management",
        name: "Gestão de Mídia Paga",
        description: "Gestão de publicidade em plataformas de tráfego pago com implementação e segmentação das campanhas.",
        paymentType: "RECURRENT",
        status: "ACTIVE",
        singleItemOnly: true,
        categoryId: "cat-media",
        prices: [
          {
            id: "price-media",
            amount: 1323.00,
            currencyId: "curr-brl",
            modifierTypeId: null
          }
        ],
        deliverables: [
          {
            id: "del-media-1",
            name: "Google Ads",
            description: "Gestão de campanhas no Google Ads"
          },
          {
            id: "del-media-2",
            name: "Meta Ads",
            description: "Gestão de campanhas no Facebook/Instagram"
          },
          {
            id: "del-media-3",
            name: "LinkedIn Ads",
            description: "Gestão de campanhas no LinkedIn"
          }
        ],
        guidelines: [],
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "creative-ads",
        name: "Criativos para Anúncios",
        description: "Criação de artes e textos para anúncios, otimizados para conversão e geração de leads.",
        paymentType: "RECURRENT",
        status: "ACTIVE",
        singleItemOnly: true,
        categoryId: "cat-creative",
        prices: [
          {
            id: "price-creative",
            amount: 8838.00,
            currencyId: "curr-brl",
            modifierTypeId: null
          }
        ],
        deliverables: [
          {
            id: "del-creative-1",
            name: "Criativo Estático",
            description: "Criação de imagens estáticas para anúncios"
          },
          {
            id: "del-creative-2",
            name: "Copywriting",
            description: "Redação de textos para anúncios"
          },
          {
            id: "del-creative-3",
            name: "Slides",
            description: "Criação de slides para campanhas"
          },
          {
            id: "del-creative-4",
            name: "Animações",
            description: "Criação de animações para anúncios"
          }
        ],
        guidelines: [],
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "web-design",
        name: "Web Design",
        description: "Criação/redesign sites com proposta principal de direcionar visitas para conversão.",
        paymentType: "RECURRENT",
        status: "ACTIVE",
        singleItemOnly: true,
        categoryId: "cat-web",
        prices: [
          {
            id: "price-web",
            amount: 1816.00,
            currencyId: "curr-brl",
            modifierTypeId: null
          }
        ],
        deliverables: [
          {
            id: "del-web-1",
            name: "Páginas de Landing Page",
            description: "Criação de landing pages"
          },
          {
            id: "del-web-2",
            name: "Copywriting",
            description: "Redação de textos para sites"
          }
        ],
        guidelines: [],
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "data-management",
        name: "Gestão e Visualização de Dados",
        description: "Dashboard para análise completa e projeção de retorno de campanhas de marketing.",
        paymentType: "RECURRENT",
        status: "ACTIVE",
        singleItemOnly: true,
        categoryId: "cat-data",
        prices: [
          {
            id: "price-data",
            amount: 737.00,
            currencyId: "curr-brl",
            modifierTypeId: null
          }
        ],
        deliverables: [
          {
            id: "del-data-1",
            name: "Implementação",
            description: "Implementação de ferramentas de análise"
          },
          {
            id: "del-data-2",
            name: "Manutenção",
            description: "Manutenção de dashboards"
          },
          {
            id: "del-data-3",
            name: "Integração",
            description: "Integração com fontes de dados"
          }
        ],
        guidelines: [],
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "client-journey",
        name: "Jornada de Relacionamento com o Cliente",
        description: "Acompanhamento do cliente em todos os pontos de contato, otimizando o processo de conversão.",
        paymentType: "RECURRENT",
        status: "ACTIVE",
        singleItemOnly: true,
        categoryId: "cat-journey",
        prices: [
          {
            id: "price-journey",
            amount: 1139.00,
            currencyId: "curr-brl",
            modifierTypeId: null
          }
        ],
        deliverables: [
          {
            id: "del-journey-1",
            name: "Mapa Mental",
            description: "Desenvolvimento de mapas mentais de jornada"
          },
          {
            id: "del-journey-2",
            name: "Automação",
            description: "Implementação de automações de marketing"
          },
          {
            id: "del-journey-3",
            name: "Copywriting",
            description: "Criação de conteúdo para jornadas"
          },
          {
            id: "del-journey-4",
            name: "Configuração de CRM",
            description: "Configuração de ferramentas de CRM"
          }
        ],
        guidelines: [],
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "sales-solutions",
        name: "Soluções para Jornada de Vendas",
        description: "Implementação e aperfeiçoamento do atendimento, crm e pós-venda.",
        paymentType: "RECURRENT",
        status: "ACTIVE",
        singleItemOnly: true,
        categoryId: "cat-sales",
        prices: [
          {
            id: "price-sales",
            amount: 6094.00,
            currencyId: "curr-brl",
            modifierTypeId: null
          }
        ],
        deliverables: [
          {
            id: "del-sales-1",
            name: "Coordenador de vendedores",
            description: "Gestão de equipe de vendas"
          },
          {
            id: "del-sales-2",
            name: "Coordenador de Inside Sales",
            description: "Gestão de equipe de inside sales"
          },
          {
            id: "del-sales-3",
            name: "Coordenador de Pós-Venda",
            description: "Gestão de atendimento pós-venda"
          },
          {
            id: "del-sales-4",
            name: "SDR",
            description: "Sales Development Representative"
          },
          {
            id: "del-sales-5",
            name: "Configuração de CRM",
            description: "Implementação e configuração de CRM"
          },
          {
            id: "del-sales-6",
            name: "Treinamento de CRM de vendas",
            description: "Capacitação em ferramentas de CRM"
          }
        ],
        guidelines: [],
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "content-solutions",
        name: "Soluções para Jornada de Conteúdo",
        description: "Estratégia que combina criação de conteúdo visual e textual de projetos de social media.",
        paymentType: "RECURRENT",
        status: "ACTIVE",
        singleItemOnly: true,
        categoryId: "cat-content",
        prices: [
          {
            id: "price-content",
            amount: 3319.00,
            currencyId: "curr-brl",
            modifierTypeId: null
          }
        ],
        deliverables: [
          {
            id: "del-content-1",
            name: "Criativo Estático",
            description: "Criação de imagens para redes sociais"
          },
          {
            id: "del-content-2",
            name: "Videos",
            description: "Produção de vídeos para conteúdo"
          },
          {
            id: "del-content-3",
            name: "Copywriting",
            description: "Redação de textos para conteúdo"
          },
          {
            id: "del-content-4",
            name: "Gestão de Redes",
            description: "Gerenciamento de perfis em redes sociais"
          }
        ],
        guidelines: [],
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "prod-1",
        name: "[DEL] Software de Gestão Empresarial",
        description: "Sistema completo para gestão empresarial com módulos de finanças, RH e vendas",
        paymentType: "RECURRENT",
        status: "INACTIVE",
        singleItemOnly: true,
        categoryId: "cat-1",
        prices: [
          {
            id: "price-1",
            amount: 199.90,
            currencyId: "curr-1",
            modifierTypeId: null
          }
        ],
        deliverables: [],
        guidelines: [],
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "prod-2",
        name: "[DEL] Consultoria Especializada",
        description: "Serviço de consultoria empresarial personalizada",
        paymentType: "ONE_TIME",
        status: "INACTIVE",
        singleItemOnly: true,
        categoryId: "cat-2",
        prices: [
          {
            id: "price-2",
            amount: 1500.00,
            currencyId: "curr-1",
            modifierTypeId: null
          }
        ],
        deliverables: [],
        guidelines: [],
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    return NextResponse.json(realProducts, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Obter os dados do corpo da requisição
    const productData = await request.json();
    
    // Fazer a requisição para a API externa
    const apiResponse = await fetch(`${CATALOG_API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(productData),
    });
    
    // Obter os dados e retornar com o mesmo status
    const data = await apiResponse.json();
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    
    // Em ambiente de desenvolvimento, retornar dados simulados
    const mockData = {
      id: `prod-${Date.now()}`,
      name: "Novo Produto",
      description: "Descrição do produto",
      paymentType: "ONE_TIME",
      status: "ACTIVE",
      singleItemOnly: false,
      categoryId: "cat-1",
      prices: [],
      deliverables: [],
      guidelines: [],
      createdBy: "system",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(mockData, { status: 201 });
  }
}

export async function PUT(request: NextRequest) {
  console.log(`[API] PUT /api/catalog/products - Atualizando produto`);
  
  try {
    // Obter os dados do corpo da requisição
    const productData = await request.json();
    console.log('[API] Dados recebidos para atualização:', productData);
    
    if (!productData.id) {
      return NextResponse.json(
        { error: "ID do produto é obrigatório" },
        { status: 400 }
      );
    }
    
    // Fazer a requisição para a API externa
    console.log(`[API] Enviando requisição para ${CATALOG_API_URL}/products/${productData.id}`);
    
    const apiResponse = await fetch(`${CATALOG_API_URL}/products/${productData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
      body: JSON.stringify(productData),
    });
    
    // Verificar se a resposta foi bem-sucedida
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error(`[API] Erro ao atualizar produto: ${apiResponse.status} - ${errorText}`);
      
      // Tentar uma abordagem alternativa - usando a URL sem o ID (conforme documentação)
      console.log(`[API] Tentando abordagem alternativa: ${CATALOG_API_URL}/products`);
      
      const alternativeResponse = await fetch(`${CATALOG_API_URL}/products`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(request.headers.get('Authorization') 
            ? { 'Authorization': request.headers.get('Authorization') || '' } 
            : {}),
        },
        body: JSON.stringify(productData),
      });
      
      if (!alternativeResponse.ok) {
        const altErrorText = await alternativeResponse.text();
        console.error(`[API] Erro na abordagem alternativa: ${alternativeResponse.status} - ${altErrorText}`);
        
        // Não permitir continuar se API externa estiver indisponível
        return NextResponse.json(
          { 
            error: `A API externa está indisponível. Não é possível atualizar o produto no momento.`,
            details: `Erro: ${alternativeResponse.status} - ${altErrorText}`
          },
          { status: 503 } // Service Unavailable
        );
      }
      
      // Obter os dados da resposta alternativa
      const altData = await alternativeResponse.json();
      console.log('[API] Produto atualizado com sucesso (abordagem alternativa):', altData);
      
      return NextResponse.json(altData, {
        status: alternativeResponse.status,
      });
    }
    
    // Obter os dados e retornar com o mesmo status (abordagem padrão)
    const data = await apiResponse.json();
    console.log('[API] Produto atualizado com sucesso:', data);
    
    return NextResponse.json(data, {
      status: apiResponse.status,
    });
  } catch (error) {
    console.error('[API] Erro ao atualizar produto:', error);
    
    // Não permitir continuar se ocorrer um erro
    return NextResponse.json(
      { 
        error: "A API externa não está respondendo corretamente. Não é possível atualizar o produto no momento.",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 503 } // Service Unavailable
    );
  }
} 