/**
 * Módulo para gerenciar o armazenamento persistente de ofertas
 * 
 * Este módulo fornece funcionalidades para armazenar e recuperar dados de ofertas,
 * com suporte para ambiente de cliente (localStorage/sessionStorage) e servidor (memória).
 */

// Mapa de ofertas para armazenamento em memória (usado no lado do servidor)
const offerMemoryCache = new Map<string, any>();

/**
 * Verifica se o código está sendo executado no navegador
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Obtém o armazenamento adequado para o ambiente atual
 */
function getStorage() {
  if (isBrowser()) {
    try {
      // Preferir sessionStorage (dura apenas durante a sessão)
      if (window.sessionStorage) {
        return window.sessionStorage;
      }
      // Cair para localStorage se sessionStorage não estiver disponível
      if (window.localStorage) {
        return window.localStorage;
      }
    } catch (e) {
      console.log('Erro ao acessar storage do navegador:', e);
    }
  }
  return null;
}

/**
 * Salva os dados de uma oferta no armazenamento
 */
export function saveOffer(offerId: string, offerData: any): void {
  const cacheKey = `offer_${offerId}`;
  
  // Salvar no storage do navegador se disponível
  const storage = getStorage();
  if (storage) {
    try {
      storage.setItem(cacheKey, JSON.stringify(offerData));
      return;
    } catch (e) {
      console.log('Erro ao salvar no storage:', e);
    }
  }
  
  // Caso contrário, salvar em memória
  offerMemoryCache.set(cacheKey, offerData);
}

/**
 * Recupera os dados de uma oferta do armazenamento
 */
export function getOffer(offerId: string): any | null {
  const cacheKey = `offer_${offerId}`;
  
  // Tentar recuperar do storage do navegador
  const storage = getStorage();
  if (storage) {
    try {
      const data = storage.getItem(cacheKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.log('Erro ao recuperar do storage:', e);
    }
  }
  
  // Caso contrário, tentar recuperar da memória
  if (offerMemoryCache.has(cacheKey)) {
    return offerMemoryCache.get(cacheKey);
  }
  
  return null;
}

/**
 * Remove os dados de uma oferta do armazenamento
 */
export function removeOffer(offerId: string): void {
  const cacheKey = `offer_${offerId}`;
  
  // Remover do storage do navegador
  const storage = getStorage();
  if (storage) {
    try {
      storage.removeItem(cacheKey);
    } catch (e) {
      console.log('Erro ao remover do storage:', e);
    }
  }
  
  // Remover da memória também
  offerMemoryCache.delete(cacheKey);
}

/**
 * Lista todas as ofertas disponíveis no armazenamento
 */
export function listStoredOffers(): string[] {
  const offerIds: string[] = [];
  
  // Coletar ofertas do storage do navegador
  const storage = getStorage();
  if (storage) {
    try {
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith('offer_')) {
          offerIds.push(key.replace('offer_', ''));
        }
      }
    } catch (e) {
      console.log('Erro ao listar ofertas do storage:', e);
    }
  }
  
  // Adicionar ofertas da memória também
  for (const key of offerMemoryCache.keys()) {
    if (key.startsWith('offer_')) {
      const offerId = key.replace('offer_', '');
      if (!offerIds.includes(offerId)) {
        offerIds.push(offerId);
      }
    }
  }
  
  return offerIds;
}

/**
 * Limpa todas as ofertas do armazenamento
 */
export function clearOffers(): void {
  // Limpar storage do navegador
  const storage = getStorage();
  if (storage) {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith('offer_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => storage.removeItem(key));
    } catch (e) {
      console.log('Erro ao limpar ofertas do storage:', e);
    }
  }
  
  // Limpar memória
  for (const key of offerMemoryCache.keys()) {
    if (key.startsWith('offer_')) {
      offerMemoryCache.delete(key);
    }
  }
} 