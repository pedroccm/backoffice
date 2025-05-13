import { NextRequest, NextResponse } from 'next/server';
import { SALES_API_URL } from '@/lib/api-fetch';
import { getOffer, saveOffer } from '@/lib/offer-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId, productId } = body;
    
    if (!offerId) {
      return NextResponse.json({ error: 'ID da oferta é obrigatório' }, { status: 400 });
    }
    
    console.log(`Verificando se produto ${productId || 'qualquer'} existe na oferta ${offerId}`);
    
    // Primeiro, tentar obter dados diretamente da API conforme doc.txt
    const apiResponse = await fetch(`${SALES_API_URL}/offers/${offerId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') 
          ? { 'Authorization': request.headers.get('Authorization') || '' } 
          : {}),
      }
    });
    
    // Se a API responder com sucesso
    if (apiResponse.ok) {
      const offerData = await apiResponse.json();
      console.log(`Dados da oferta ${offerId} obtidos com sucesso da API externa`);
      
      // Salvar em cache para uso futuro
      saveOffer(offerId, offerData);
      
      // Verificar se a oferta tem itens
      const offerItems = offerData.offerItems || [];
      
      if (offerItems.length === 0) {
        console.log(`A oferta ${offerId} não possui itens`);
        return NextResponse.json({ 
          exists: false, 
          message: 'A oferta não possui nenhum item',
          offerDetails: {
            id: offerData.id,
            status: offerData.status,
            type: offerData.type,
            subtotalPrice: offerData.subtotalPrice || 0,
            totalPrice: offerData.totalPrice || 0,
            itemCount: 0
          }
        });
      }
      
      // Se foi especificado um productId, verificar se existe na oferta
      if (productId) {
        // Verificar se há duplicatas desse produto
        const matchingItems = offerItems.filter((item) => item.productId === productId);
        const productExists = matchingItems.length > 0;
        const isDuplicated = matchingItems.length > 1;
        
        console.log(`Verificação de produto ${productId}: existe=${productExists}, duplicado=${isDuplicated}, quantidade=${matchingItems.length}`);
        
        return NextResponse.json({
          exists: productExists,
          isDuplicated: isDuplicated,
          duplicateCount: matchingItems.length,
          message: productExists 
            ? isDuplicated
              ? `Produto ${productId} encontrado ${matchingItems.length} vezes na oferta ${offerId} (duplicado)` 
              : `Produto ${productId} encontrado na oferta ${offerId}`
            : `Produto ${productId} não encontrado na oferta ${offerId}`,
          offerDetails: {
            id: offerData.id,
            status: offerData.status,
            type: offerData.type,
            subtotalPrice: offerData.subtotalPrice || 0,
            totalPrice: offerData.totalPrice || 0,
            itemCount: offerItems.length
          },
          items: matchingItems
        });
      }
      
      // Se não foi especificado productId, retornar todos os itens
      // Verificar se há itens duplicados
      const productCounts = new Map();
      const duplicatedProducts = new Set();
      
      // Contar ocorrências de cada productId
      offerItems.forEach((item) => {
        if (item.productId) {
          const count = (productCounts.get(item.productId) || 0) + 1;
          productCounts.set(item.productId, count);
          
          if (count > 1) {
            duplicatedProducts.add(item.productId);
          }
        }
      });
      
      return NextResponse.json({
        exists: true,
        hasDuplicates: duplicatedProducts.size > 0,
        duplicatedProducts: Array.from(duplicatedProducts),
        message: duplicatedProducts.size > 0
          ? `Oferta ${offerId} possui ${offerItems.length} item(s), com ${duplicatedProducts.size} produto(s) duplicado(s)`
          : `Oferta ${offerId} possui ${offerItems.length} item(s)`,
        offerDetails: {
          id: offerData.id,
          status: offerData.status,
          type: offerData.type,
          subtotalPrice: offerData.subtotalPrice || 0,
          totalPrice: offerData.totalPrice || 0,
          itemCount: offerItems.length
        },
        items: offerItems
      });
    } else {
      console.error(`API externa retornou erro: ${apiResponse.status}`);
    }
    
    // Se a API falhou, verificar o cache local
    const cachedOffer = getOffer(offerId);
    if (cachedOffer) {
      console.log(`Usando dados em cache para oferta ${offerId}`);
      
      const offerItems = cachedOffer.offerItems || [];
      
      if (offerItems.length === 0) {
        return NextResponse.json({ 
          exists: false, 
          message: 'A oferta não possui nenhum item (de acordo com o cache)',
          offerDetails: {
            id: cachedOffer.id,
            status: cachedOffer.status,
            type: cachedOffer.type,
            subtotalPrice: cachedOffer.subtotalPrice || 0,
            totalPrice: cachedOffer.totalPrice || 0,
            itemCount: 0
          }
        });
      }
      
      // Se foi especificado um productId, verificar se existe na oferta
      if (productId) {
        // Verificar inclusive se há duplicatas desse produto
        const matchingItems = offerItems.filter((item) => item.productId === productId);
        const productExists = matchingItems.length > 0;
        const isDuplicated = matchingItems.length > 1;
        
        console.log(`Cache: produto ${productId} existe=${productExists}, duplicado=${isDuplicated}, quantidade=${matchingItems.length}`);
        
        return NextResponse.json({
          exists: productExists,
          isDuplicated: isDuplicated,
          duplicateCount: matchingItems.length,
          message: productExists 
            ? isDuplicated
              ? `Produto ${productId} encontrado ${matchingItems.length} vezes na oferta ${offerId} (duplicado, cache)` 
              : `Produto ${productId} encontrado na oferta ${offerId} (cache)`
            : `Produto ${productId} não encontrado na oferta ${offerId} (cache)`,
          offerDetails: {
            id: cachedOffer.id,
            status: cachedOffer.status,
            type: cachedOffer.type,
            subtotalPrice: cachedOffer.subtotalPrice || 0,
            totalPrice: cachedOffer.totalPrice || 0,
            itemCount: offerItems.length
          },
          items: isDuplicated ? matchingItems : (productExists ? [matchingItems[0]] : [])
        });
      }
      
      // Se não foi especificado productId, retornar todos os itens
      // Verificar se há itens duplicados
      const productCounts = new Map();
      const duplicatedProducts = new Set();
      
      // Contar ocorrências de cada productId
      offerItems.forEach((item) => {
        if (item.productId) {
          const count = (productCounts.get(item.productId) || 0) + 1;
          productCounts.set(item.productId, count);
          
          if (count > 1) {
            duplicatedProducts.add(item.productId);
          }
        }
      });
      
      return NextResponse.json({
        exists: true,
        hasDuplicates: duplicatedProducts.size > 0,
        duplicatedProducts: Array.from(duplicatedProducts),
        message: duplicatedProducts.size > 0
          ? `Oferta ${offerId} possui ${offerItems.length} item(s), com ${duplicatedProducts.size} produto(s) duplicado(s) (cache)`
          : `Oferta ${offerId} possui ${offerItems.length} item(s) (cache)`,
        offerDetails: {
          id: cachedOffer.id,
          status: cachedOffer.status,
          type: cachedOffer.type,
          subtotalPrice: cachedOffer.subtotalPrice || 0,
          totalPrice: cachedOffer.totalPrice || 0,
          itemCount: offerItems.length
        },
        items: offerItems
      });
    }
    
    // Em ambiente de desenvolvimento, criar uma resposta simulada quando não há dados
    if (process.env.NODE_ENV === 'development') {
      console.log(`Em desenvolvimento: criando resposta simulada para oferta ${offerId}`);
      
      // Esta oferta simulada inicia sem itens
      const simulatedOffer = {
        id: offerId,
        status: "PENDING",
        type: "ONE_TIME",
        subtotalPrice: 0,
        totalPrice: 0,
        offerItems: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Salvar em cache para uso futuro
      saveOffer(offerId, simulatedOffer);
      
      // Se for verificação de produto específico
      if (productId) {
        return NextResponse.json({
          exists: false,
          isDuplicated: false,
          duplicateCount: 0,
          message: `Produto ${productId} não encontrado na oferta ${offerId} (simulação)`,
          offerDetails: {
            id: offerId,
            status: "PENDING",
            type: "ONE_TIME",
            subtotalPrice: 0,
            totalPrice: 0,
            itemCount: 0
          },
          items: []
        });
      }
      
      // Resposta para verificação geral
      return NextResponse.json({
        exists: false,
        hasDuplicates: false,
        duplicatedProducts: [],
        message: `Oferta ${offerId} não possui itens (simulação)`,
        offerDetails: {
          id: offerId,
          status: "PENDING",
          type: "ONE_TIME",
          subtotalPrice: 0,
          totalPrice: 0,
          itemCount: 0
        },
        items: []
      });
    }
    
    // Em produção, quando não há dados, retornar erro
    return NextResponse.json(
      { error: `Oferta não encontrada: ${offerId}` },
      { status: 404 }
    );
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 