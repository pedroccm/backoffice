import { NextRequest, NextResponse } from 'next/server';
import { CATALOG_API_URL } from '@/lib/api-fetch';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    // Tentar buscar o produto da API do catálogo
    const apiResponse = await fetch(`${CATALOG_API_URL}/products/find/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      },
    });
    
    // Se a resposta não existir ou não for bem-sucedida, retornar dados do produto solicitado
    if (!apiResponse || !apiResponse.ok) {
      const errorStatus = apiResponse?.status || 'N/A';
      const errorText = apiResponse ? await apiResponse.text().catch(() => 'Erro desconhecido') : 'Sem resposta';
      console.error(`[API] Erro na API externa ao buscar produto ${id}: ${errorStatus} - ${errorText}`);
      
      // Buscar da lista de produtos reais
      const response = await fetch(`${request.nextUrl.origin}/api/catalog/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const allProducts = await response.json();
        const product = allProducts.find((p: any) => p.id === id);
        
        if (product) {
          console.log(`[API] Produto ${id} encontrado na lista local`);
          return NextResponse.json(product, { status: 200 });
        }
      }
      
      // Fallback caso o produto não seja encontrado
      const fallbackData = {
        id: id,
        name: `Produto Não Encontrado (${id})`,
        description: "Este produto não foi encontrado no catálogo.",
        paymentType: "ONE_TIME",
        status: "INACTIVE",
        singleItemOnly: false,
        categoryId: "cat-misc",
        prices: [
          {
            id: `price-fallback-${Date.now()}`,
            amount: 0,
            currencyId: "curr-brl",
            modifierTypeId: null
          }
        ],
        deliverables: [],
        guidelines: [],
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log(`[API] Retornando dados de fallback para produto ${id}`);
      return NextResponse.json(fallbackData, { status: 200 });
    }
    
    // Processar e retornar os dados do produto
    try {
      const data = await apiResponse.json();
      
      // Verificar se os dados são válidos
      if (!data || !data.id) {
        console.error(`[API] API externa retornou dados inválidos para o produto ${id}:`, data);
        
        // Buscar da lista de produtos reais
        const response = await fetch(`${request.nextUrl.origin}/api/catalog/products`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const allProducts = await response.json();
          const product = allProducts.find((p: any) => p.id === id);
          
          if (product) {
            console.log(`[API] Produto ${id} encontrado na lista local`);
            return NextResponse.json(product, { status: 200 });
          }
        }
        
        // Fallback caso o produto não seja encontrado
        const fallbackData = {
          id: id,
          name: `Produto Não Encontrado (${id})`,
          description: "Este produto não foi encontrado no catálogo.",
          paymentType: "ONE_TIME",
          status: "INACTIVE",
          singleItemOnly: false,
          categoryId: "cat-misc",
          prices: [
            {
              id: `price-fallback-${Date.now()}`,
              amount: 0,
              currencyId: "curr-brl",
              modifierTypeId: null
            }
          ],
          deliverables: [],
          guidelines: [],
          createdBy: "system",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        console.log(`[API] Retornando dados de fallback para produto ${id}`);
        return NextResponse.json(fallbackData, { status: 200 });
      }
      
      // Garantir que o objeto tenha todos os campos necessários
      const normalizedData = {
        ...data,
        id: data.id || id,
        productType: data.productType || data.paymentType || "ONE_TIME",
        paymentType: data.paymentType || data.productType || "ONE_TIME",
        prices: Array.isArray(data.prices) && data.prices.length > 0 
          ? data.prices 
          : [{
              id: `price-default-${Date.now()}`,
              amount: 0,
              currencyId: "curr-brl",
              modifierTypeId: null
            }],
        deliverables: Array.isArray(data.deliverables) ? data.deliverables : [],
        guidelines: Array.isArray(data.guidelines) ? data.guidelines : []
      };
      
      return NextResponse.json(normalizedData, { status: 200 });
    } catch (error) {
      console.error(`[API] Erro ao processar dados da API externa para produto ${id}:`, error);
      
      // Fallback para erro de processamento
      const fallbackData = {
        id: id,
        name: `Erro ao Processar Produto (${id})`,
        description: "Ocorreu um erro ao processar os dados deste produto.",
        paymentType: "ONE_TIME",
        status: "INACTIVE",
        singleItemOnly: false,
        categoryId: "cat-misc",
        prices: [
          {
            id: `price-error-${Date.now()}`,
            amount: 0,
            currencyId: "curr-brl",
            modifierTypeId: null
          }
        ],
        deliverables: [],
        guidelines: [],
        createdBy: "system",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return NextResponse.json(fallbackData, { status: 200 });
    }
  } catch (error) {
    console.error(`[API] Erro ao buscar produto ${id}:`, error);
    
    // Fallback para erro geral
    const fallbackData = {
      id: id,
      name: `Erro ao Buscar Produto (${id})`,
      description: "Ocorreu um erro ao buscar os dados deste produto.",
      paymentType: "ONE_TIME",
      status: "INACTIVE",
      singleItemOnly: false,
      categoryId: "cat-misc",
      prices: [
        {
          id: `price-error-${Date.now()}`,
          amount: 0,
          currencyId: "curr-brl",
          modifierTypeId: null
        }
      ],
      deliverables: [],
      guidelines: [],
      createdBy: "system",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return NextResponse.json(fallbackData, { status: 200 });
  }
} 