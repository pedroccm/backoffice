/**
 * Script para testar a adição de produtos a uma oferta
 * 
 * Este script demonstra o processo de adição e verificação de produtos em uma oferta
 * Uso: node scripts/test-product-add.js
 */

const offerId = "ca64e451-c668-48e3-bdd0-715e8acf660b"; // ID da oferta a ser testada
const productId = "f3c880d3-cef7-41fb-b222-d7c1a3765e62"; // ID do produto a ser adicionado
const priceId = "price-1"; // ID do preço a ser usado
const quantity = 1; // Quantidade a ser adicionada

/**
 * Função para fazer uma requisição fetch
 */
async function fetchAPI(url, options = {}) {
  const baseUrl = "http://localhost:3000";
  const fullUrl = `${baseUrl}${url}`;
  
  const response = await fetch(fullUrl, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }
  
  return await response.json();
}

/**
 * Função para adicionar um produto a uma oferta
 */
async function addProductToOffer(offerId, productId, priceId, quantity) {
  console.log(`Adicionando produto ${productId} à oferta ${offerId}...`);
  
  try {
    const result = await fetchAPI("/api/sales/offers/items", {
      method: "POST",
      body: JSON.stringify({ offerId, productId, priceId, quantity })
    });
    
    console.log("Resposta da API:");
    console.log(JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error("Erro ao adicionar produto:", error.message);
    throw error;
  }
}

/**
 * Função para verificar se um produto foi adicionado à oferta
 */
async function verifyProductInOffer(offerId, productId) {
  console.log(`Verificando se produto ${productId} existe na oferta ${offerId}...`);
  
  try {
    const result = await fetchAPI("/api/sales/offers/verify-item", {
      method: "POST",
      body: JSON.stringify({ offerId, productId })
    });
    
    console.log("Resultado da verificação:");
    console.log(JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error("Erro ao verificar produto:", error.message);
    throw error;
  }
}

/**
 * Função principal para executar o teste
 */
async function runTest() {
  try {
    // 1. Verificar estado inicial da oferta
    console.log("=== VERIFICANDO ESTADO INICIAL DA OFERTA ===");
    const initialState = await verifyProductInOffer(offerId, productId);
    
    // 2. Adicionar produto à oferta
    console.log("\n=== ADICIONANDO PRODUTO À OFERTA ===");
    const addResult = await addProductToOffer(offerId, productId, priceId, quantity);
    
    // 3. Verificar estado após adição
    console.log("\n=== VERIFICANDO ESTADO APÓS ADIÇÃO ===");
    const finalState = await verifyProductInOffer(offerId, productId);
    
    // 4. Mostrar resumo
    console.log("\n=== RESUMO DO TESTE ===");
    console.log(`Produto estava na oferta antes? ${initialState.exists ? "SIM" : "NÃO"}`);
    console.log(`Produto está na oferta agora? ${finalState.exists ? "SIM" : "NÃO"}`);
    console.log(`Status: ${finalState.exists ? "SUCESSO" : "FALHA"}`);
    
    if (!finalState.exists) {
      console.log("\nPROBLEMA DETECTADO: O produto foi adicionado na resposta da API, mas não está presente na oferta quando verificada.");
      console.log("Isso pode indicar um problema de persistência no banco de dados ou na API.");
    }
    
  } catch (error) {
    console.error("\n=== ERRO DURANTE O TESTE ===");
    console.error(error.message);
  }
}

// Executar o teste
runTest(); 