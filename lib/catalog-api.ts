import { apiRequest, CATALOG_API_URL } from "./api-fetch";

// Interfaces para o catálogo
export interface Product {
  id: string;
  name: string;
  description: string;
  paymentType: string;
  status: string;
  singleItemOnly: boolean;
  categoryId: string;
  prices: ProductPrice[];
  deliverables: ProductDeliverable[];
  guidelines: ProductGuideline[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPrice {
  id?: string;
  productId?: string;
  amount: number;
  currencyId: string;
  modifierTypeId?: string | null;
}

export interface ProductDeliverable {
  id: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductGuideline {
  id: string;
  name: string;
  description: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Currency {
  id: string;
  name: string;
  symbol: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deliverable {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModifierType {
  id: string;
  key: string;
  displayName: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Produtos
export async function getProducts(): Promise<Product[]> {
  return apiRequest<Product[]>('/api/catalog/products');
}

export async function getProductById(id: string): Promise<Product> {
  console.log(`[CATALOG-API] Buscando produto com ID: ${id}`);
  return apiRequest<Product>(`/api/catalog/products/find/${id}`);
}

export async function createProduct(data: {
  name: string;
  description: string;
  paymentType: "ONE_TIME" | "RECURRENT";
  singleItemOnly: boolean;
  categoryId: string;
  createdBy: string;
}): Promise<Product> {
  return apiRequest<Product>(`${CATALOG_API_URL}/products`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(data: {
  id: string;
  name: string;
  description: string;
  paymentType: "ONE_TIME" | "RECURRENT";
  status: "ACTIVE" | "INACTIVE";
  singleItemOnly: boolean;
  categoryId: string;
}): Promise<Product> {
  return apiRequest<Product>(`/api/catalog/products/${data.id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Preços de produtos
export async function addProductPrice(data: {
  productId: string;
  currencyId: string;
  amount: number;
  modifierTypeId?: string;
}): Promise<Product> {
  return apiRequest<Product>(`${CATALOG_API_URL}/products/prices`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProductPrice(data: {
  productId: string;
  priceId: string;
  amount: number;
}): Promise<Product> {
  return apiRequest<Product>(`${CATALOG_API_URL}/products/prices`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProductPrice(productId: string, priceId: string): Promise<Product> {
  return apiRequest<Product>(`${CATALOG_API_URL}/products/${productId}/prices/${priceId}`, {
    method: "DELETE",
    body: JSON.stringify({}),
  });
}

// Deliverables
export async function addProductDeliverable(data: {
  productId: string;
  deliverableId: string;
}): Promise<Product> {
  return apiRequest<Product>(`${CATALOG_API_URL}/products/deliverables`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteProductDeliverable(productId: string, deliverableId: string): Promise<Product> {
  return apiRequest<Product>(`${CATALOG_API_URL}/products/${productId}/deliverables/${deliverableId}`, {
    method: "DELETE",
    body: JSON.stringify({
      productId: productId,
      deliverableId: deliverableId
    })
  });
}

// Guidelines
export async function addProductGuideline(data: {
  description: string;
  name: string;
  productId: string;
}): Promise<Product> {
  return apiRequest<Product>(`${CATALOG_API_URL}/products/guidelines`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteProductGuideline(productId: string, guidelineId: string): Promise<Product> {
  return apiRequest<Product>(`${CATALOG_API_URL}/products/${productId}/guidelines/${guidelineId}`, {
    method: "DELETE",
    body: JSON.stringify({}),
  });
}

// Categorias
export async function getCategories(): Promise<Category[]> {
  return apiRequest<Category[]>('/api/catalog/categories');
}

export async function getCategoryById(id: string): Promise<Category> {
  return apiRequest<Category>(`${CATALOG_API_URL}/categories/${id}`);
}

export async function createCategory(data: {
  name: string;
  description: string;
  createdBy: string;
}): Promise<Category> {
  return apiRequest<Category>(`${CATALOG_API_URL}/categories`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Moedas
export async function getCurrencies(): Promise<Currency[]> {
  return apiRequest<Currency[]>('/api/catalog/currencies');
}

export async function createCurrency(data: {
  name: string;
  symbol: string;
  code: string;
}): Promise<Currency> {
  return apiRequest<Currency>(`${CATALOG_API_URL}/currencies`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Deliverables
export async function getDeliverables(): Promise<Deliverable[]> {
  return apiRequest<Deliverable[]>('/api/catalog/deliverables');
}

export async function createDeliverable(data: {
  name: string;
  description: string;
}): Promise<Deliverable> {
  return apiRequest<Deliverable>(`${CATALOG_API_URL}/deliverables`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteDeliverable(id: string): Promise<void> {
  return apiRequest<void>(`${CATALOG_API_URL}/deliverables/${id}`, {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}

// Tipos de modificadores
export async function getModifierTypes(): Promise<ModifierType[]> {
  return apiRequest<ModifierType[]>('/api/catalog/modifier-types');
}

export async function createModifierType(data: {
  key: string;
  displayName: string;
  description: string;
  createdBy: string;
}): Promise<ModifierType> {
  return apiRequest<ModifierType>(`${CATALOG_API_URL}/modifier-types`, {
    method: "POST",
    body: JSON.stringify(data),
  });
} 