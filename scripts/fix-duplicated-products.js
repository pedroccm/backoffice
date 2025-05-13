/**
 * Script para remover produtos duplicados de ofertas
 * 
 * Este script identifica e remove produtos duplicados em uma oferta.
 * Uso: node scripts/fix-duplicated-products.js <offerId>
 * 
 * Para corrigir produtos específicos: node scripts/fix-duplicated-products.js <offerId> --product=<productId>
 */

const BASE_URL = process.env.API_URL || "http://localhost:3000";

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
const offerId = args[0];

// Verificar opções adicionais (como produto específico)
let specificProductId = null;
for (const arg of args) {
  if (arg.startsWith('--product=')) {
    specificProductId = arg.split('=')[1];
  }
}

if (!offerId) {
  console.error("É necessário fornecer um ID de oferta.");
  console.error("Uso: node scripts/fix-duplicated-products.js <offerId>");
  console.error("     node scripts/fix-duplicated-products.js <offerId> --product=<productId>");
  process.exit(1);
}

/**
 * Função para realizar requisições HTTP
 */
async function fetchAPI(url, options = {}) {
  const fullUrl = `${BASE_URL}${url}`;
  
  try {
    console.log(`Fazendo requisição para ${fullUrl}...`);
    
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
  } catch (error) {
    console.error(`Erro na requisição para ${fullUrl}:`, error.message);
    throw error;
  }
}

/**
 * Função para verificar produtos duplicados em uma oferta
 */
async function checkDuplicates(offerId, productId = null) {
  console.log(`\nVerificando produtos${productId ? " ("+productId+")" : ""} na oferta ${offerId}...`);
  
  try {
    const requestBody = { offerId };
    if (productId) {
      requestBody.productId = productId;
    }
    
    const result = await fetchAPI("/api/sales/offers/verify-item", {
      method: "POST",
      body: JSON.stringify(requestBody)
    });
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    if (productId) {
      if (result.exists) {
        const status = result.isDuplicated 
          ? `DUPLICADO (${result.duplicateCount} vezes)` 
          : "OK";
          
        console.log(`Produto ${productId}: ${status}`);
        return {
          hasDuplicates: result.isDuplicated,
          duplicatedProducts: result.isDuplicated ? [productId] : [],
          items: result.items || []
        };
      } else {
        console.log(`Produto ${productId} não encontrado na oferta ${offerId}.`);
        return {
          hasDuplicates: false,
          duplicatedProducts: [],
          items: []
        };
      }
    } else {
      if (result.hasDuplicates) {
        console.log(`Encontrados ${result.duplicatedProducts.length} produtos duplicados:`);
        console.log(result.duplicatedProducts);
        
        // Se temos detalhes de duplicação, mostrar mais informações
        if (result.duplicateDetails && result.duplicateDetails.length > 0) {
          console.log("\nDetalhes das duplicações:");
          result.duplicateDetails.forEach(detail => {
            console.log(`- Produto ${detail.productId}: ${detail.count} ocorrências`);
          });
        }
        
        return {
          hasDuplicates: true,
          duplicatedProducts: result.duplicatedProducts,
          items: result.items || []
        };
      } else {
        console.log("Nenhum produto duplicado encontrado.");
        return {
          hasDuplicates: false,
          duplicatedProducts: [],
          items: result.items || []
        };
      }
    }
  } catch (error) {
    console.error("Erro ao verificar duplicatas:", error.message);
    throw error;
  }
}

/**
 * Função para obter detalhes da oferta
 */
async function getOfferDetails(offerId) {
  console.log(`\nBuscando detalhes da oferta ${offerId}...`);
  
  try {
    const result = await fetchAPI(`/api/sales/offers/${offerId}`);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    console.log(`Oferta encontrada: ${result.id}`);
    console.log(`Status: ${result.status}`);
    console.log(`Total de itens: ${(result.offerItems || []).length}`);
    
    return result;
  } catch (error) {
    console.error("Erro ao buscar detalhes da oferta:", error.message);
    throw error;
  }
}

/**
 * Função para remover um item de uma oferta
 */
async function removeItem(offerId, itemId) {
  console.log(`\nRemovendo item ${itemId} da oferta ${offerId}...`);
  
  try {
    const result = await fetchAPI(`/api/sales/offers/${offerId}/items/${itemId}`, {
      method: "DELETE"
    });
    
    console.log("Item removido com sucesso.");
    return result;
  } catch (error) {
    console.error(`Erro ao remover item ${itemId}:`, error.message);
    throw error;
  }
}

/**
 * Função principal para corrigir duplicatas
 */
async function fixDuplicates() {
  try {
    // 0. Obter detalhes da oferta
    await getOfferDetails(offerId);
    
    // 1. Verificar duplicatas
    const checkResult = specificProductId 
      ? await checkDuplicates(offerId, specificProductId)
      : await checkDuplicates(offerId);
    
    if (!checkResult.hasDuplicates) {
      console.log("\nNada a corrigir.");
      return;
    }
    
    // 2. Para cada produto duplicado, manter apenas um
    const productsToFix = specificProductId 
      ? [specificProductId] 
      : checkResult.duplicatedProducts;
      
    for (const productId of productsToFix) {
      console.log(`\nCorrigindo duplicatas para o produto ${productId}...`);
      
      // Encontrar todos os itens com este productId
      const itemsWithProduct = checkResult.items.filter(item => item.productId === productId);
      console.log(`Encontrados ${itemsWithProduct.length} itens com este produto.`);
      
      if (itemsWithProduct.length <= 1) {
        console.log(`Produto ${productId} não está duplicado ou não foi encontrado.`);
        continue;
      }
      
      // Exibir detalhes dos itens encontrados
      itemsWithProduct.forEach((item, index) => {
        console.log(`  ${index + 1}. Item ID: ${item.id}, Quantidade: ${item.quantity}, Preço: ${item.price}`);
      });
      
      // Manter o primeiro e remover os demais
      const [keepItem, ...removeItems] = itemsWithProduct;
      console.log(`\nMantendo item ${keepItem.id} e removendo ${removeItems.length} itens duplicados.`);
      
      // Remover itens duplicados
      for (const item of removeItems) {
        await removeItem(offerId, item.id);
      }
    }
    
    // 3. Verificar novamente para confirmar que as duplicatas foram removidas
    const finalCheck = specificProductId 
      ? await checkDuplicates(offerId, specificProductId)
      : await checkDuplicates(offerId);
    
    if (finalCheck.hasDuplicates) {
      console.error("\nAVISO: Ainda existem duplicatas após a correção!");
      console.error("Pode ser necessário executar o script novamente.");
      
      if (finalCheck.duplicatedProducts.length > 0) {
        console.error("Produtos ainda duplicados:", finalCheck.duplicatedProducts);
      }
    } else {
      console.log("\nTodas as duplicatas foram removidas com sucesso!");
    }
    
  } catch (error) {
    console.error("\nErro durante a execução:", error.message);
  }
}

// Executar o script
console.log(`Iniciando correção de produtos duplicados para a oferta ${offerId}...`);
if (specificProductId) {
  console.log(`Corrigindo apenas o produto: ${specificProductId}`);
}
fixDuplicates(); 