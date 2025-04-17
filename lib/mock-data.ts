import type { Product, Category, Currency, Deliverable, Guideline, ModifierType } from "./api-client"

// Categorias de exemplo
export const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Eletrônicos",
    description: "Produtos eletrônicos como smartphones, tablets e laptops",
  },
  {
    id: "cat-2",
    name: "Vestuário",
    description: "Roupas, calçados e acessórios",
  },
  {
    id: "cat-3",
    name: "Casa e Decoração",
    description: "Itens para casa, móveis e decoração",
  },
  {
    id: "cat-4",
    name: "Esportes",
    description: "Equipamentos esportivos e roupas para prática de esportes",
  },
  {
    id: "cat-5",
    name: "Livros",
    description: "Livros físicos, e-books e audiobooks",
  },
]

// Moedas de exemplo
export const mockCurrencies: Currency[] = [
  {
    id: "curr-1",
    code: "BRL",
    name: "Real Brasileiro",
    symbol: "R$",
  },
  {
    id: "curr-2",
    code: "USD",
    name: "Dólar Americano",
    symbol: "$",
  },
  {
    id: "curr-3",
    code: "EUR",
    name: "Euro",
    symbol: "€",
  },
]

// Add predefined modifier types to mock data
export const mockModifierTypes: ModifierType[] = [
  {
    key: "simple",
    displayName: "Simple",
    description: "Versão básica do produto",
    createdBy: "system"
  },
  {
    key: "max",
    displayName: "Max",
    description: "Versão avançada do produto com recursos adicionais",
    createdBy: "system"
  },
  {
    key: "ultra",
    displayName: "Ultra",
    description: "Versão premium do produto com todos os recursos",
    createdBy: "system"
  },
  {
    key: "enterprise",
    displayName: "Enterprise",
    description: "Versão empresarial com suporte dedicado",
    createdBy: "system",
    valueRestrictions: {
      maxValues: 1,
      restrictedCurrencies: ["currency-2"],
      restrictedProducts: ["Essential Training"],
    },
  },
]

// Entregáveis de exemplo
export const mockDeliverables: Deliverable[] = [
  {
    id: "del-1",
    name: "Manual do Usuário",
    description: "Manual completo com instruções de uso",
    productId: "prod-1",
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: "del-2",
    name: "Garantia Estendida",
    description: "Documento de garantia estendida por 2 anos",
    productId: "prod-1",
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: "del-3",
    name: "Certificado de Autenticidade",
    description: "Certificado que comprova a autenticidade do produto",
    productId: "prod-3",
    createdAt: new Date(2023, 2, 10).toISOString(),
    updatedAt: new Date(2023, 2, 10).toISOString(),
  },
  {
    id: "del-4",
    name: "Guia de Instalação",
    description: "Guia passo a passo para instalação do produto",
    productId: "prod-4",
    createdAt: new Date(2023, 3, 5).toISOString(),
    updatedAt: new Date(2023, 3, 5).toISOString(),
  },
]

// Diretrizes de exemplo
export const mockGuidelines: Guideline[] = [
  {
    id: "guide-1",
    name: "Instruções de Limpeza",
    description: "Como limpar e manter o produto em boas condições",
    productId: "prod-2",
    createdAt: new Date(2023, 1, 20).toISOString(),
    updatedAt: new Date(2023, 1, 20).toISOString(),
  },
  {
    id: "guide-2",
    name: "Recomendações de Uso",
    description: "Melhores práticas para utilização do produto",
    productId: "prod-2",
    createdAt: new Date(2023, 1, 20).toISOString(),
    updatedAt: new Date(2023, 1, 20).toISOString(),
  },
  {
    id: "guide-3",
    name: "Instruções de Armazenamento",
    description: "Como armazenar o produto corretamente",
    productId: "prod-5",
    createdAt: new Date(2023, 4, 12).toISOString(),
    updatedAt: new Date(2023, 4, 12).toISOString(),
  },
  {
    id: "guide-4",
    name: "Política de Devolução",
    description: "Informações sobre como proceder em caso de devolução do produto",
    productId: "",
    createdAt: new Date(2023, 5, 15).toISOString(),
    updatedAt: new Date(2023, 5, 15).toISOString(),
  },
  {
    id: "guide-5",
    name: "Guia de Tamanhos",
    description: "Tabela de medidas e tamanhos para produtos de vestuário",
    productId: "",
    createdAt: new Date(2023, 6, 10).toISOString(),
    updatedAt: new Date(2023, 6, 10).toISOString(),
  },
]

// Produtos de exemplo - Updated with modifiers
export const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "Smartphone XYZ Pro",
    description: "Smartphone de última geração com câmera de alta resolução e processador potente",
    productType: "ONE_TIME",
    status: "ACTIVE",
    singleItemOnly: false,
    categoryId: "cat-1",
    prices: [
      {
        amount: 2499.99,
        currencyId: "curr-1",
        modifierTypeId: "max",
      },
    ],
    deliverables: [
      {
        id: "del-1",
        name: "Manual do Usuário",
        description: "Manual completo com instruções de uso",
        productId: "prod-1",
        createdAt: new Date(2023, 0, 15).toISOString(),
        updatedAt: new Date(2023, 0, 15).toISOString(),
      },
      {
        id: "del-2",
        name: "Garantia Estendida",
        description: "Documento de garantia estendida por 2 anos",
        productId: "prod-1",
        createdAt: new Date(2023, 0, 15).toISOString(),
        updatedAt: new Date(2023, 0, 15).toISOString(),
      },
    ],
    guidelines: [],
    createdBy: "system",
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: "prod-2",
    name: "Camiseta Premium",
    description: "Camiseta de algodão de alta qualidade com design exclusivo",
    productType: "ONE_TIME",
    status: "ACTIVE",
    singleItemOnly: false,
    categoryId: "cat-2",
    prices: [
      {
        amount: 89.9,
        currencyId: "curr-1",
        modifierTypeId: "simple",
      },
    ],
    deliverables: [],
    guidelines: [
      {
        id: "guide-1",
        name: "Instruções de Limpeza",
        description: "Como limpar e manter o produto em boas condições",
        productId: "prod-2",
        createdAt: new Date(2023, 1, 20).toISOString(),
        updatedAt: new Date(2023, 1, 20).toISOString(),
      },
      {
        id: "guide-2",
        name: "Recomendações de Uso",
        description: "Melhores práticas para utilização do produto",
        productId: "prod-2",
        createdAt: new Date(2023, 1, 20).toISOString(),
        updatedAt: new Date(2023, 1, 20).toISOString(),
      },
    ],
    createdBy: "system",
    createdAt: new Date(2023, 1, 20).toISOString(),
    updatedAt: new Date(2023, 1, 20).toISOString(),
  },
  {
    id: "prod-3",
    name: "Relógio de Parede Vintage",
    description: "Relógio de parede com design vintage, perfeito para decoração",
    productType: "ONE_TIME",
    status: "ACTIVE",
    singleItemOnly: true,
    categoryId: "cat-3",
    prices: [
      {
        amount: 149.9,
        currencyId: "curr-1",
        modifierTypeId: "ultra",
      },
    ],
    deliverables: [
      {
        id: "del-3",
        name: "Certificado de Autenticidade",
        description: "Certificado que comprova a autenticidade do produto",
        productId: "prod-3",
        createdAt: new Date(2023, 2, 10).toISOString(),
        updatedAt: new Date(2023, 2, 10).toISOString(),
      },
    ],
    guidelines: [],
    createdBy: "system",
    createdAt: new Date(2023, 2, 10).toISOString(),
    updatedAt: new Date(2023, 2, 10).toISOString(),
  },
  {
    id: "prod-4",
    name: "Kit de Yoga Completo",
    description: "Kit completo para prática de yoga, incluindo tapete, blocos e faixa",
    productType: "ONE_TIME",
    status: "ACTIVE",
    singleItemOnly: false,
    categoryId: "cat-4",
    prices: [
      {
        amount: 199.9,
        currencyId: "curr-1",
        modifierTypeId: "discount",
      },
    ],
    deliverables: [
      {
        id: "del-4",
        name: "Guia de Instalação",
        description: "Guia passo a passo para instalação do produto",
        productId: "prod-4",
        createdAt: new Date(2023, 3, 5).toISOString(),
        updatedAt: new Date(2023, 3, 5).toISOString(),
      },
    ],
    guidelines: [],
    createdBy: "system",
    createdAt: new Date(2023, 3, 5).toISOString(),
    updatedAt: new Date(2023, 3, 5).toISOString(),
  },
  {
    id: "prod-5",
    name: "Assinatura Revista Digital",
    description: "Assinatura mensal de revista digital com conteúdo exclusivo",
    productType: "RECURRENT",
    status: "ACTIVE",
    singleItemOnly: true,
    categoryId: "cat-5",
    prices: [
      {
        amount: 29.9,
        currencyId: "curr-1",
        modifierTypeId: "premium_addon",
      },
    ],
    deliverables: [],
    guidelines: [
      {
        id: "guide-3",
        name: "Instruções de Armazenamento",
        description: "Como armazenar o produto corretamente",
        productId: "prod-5",
        createdAt: new Date(2023, 4, 12).toISOString(),
        updatedAt: new Date(2023, 4, 12).toISOString(),
      },
    ],
    createdBy: "system",
    createdAt: new Date(2023, 4, 12).toISOString(),
    updatedAt: new Date(2023, 4, 12).toISOString(),
  },
  {
    id: "prod-6",
    name: "Notebook Ultra Slim",
    description: "Notebook leve e potente com processador de última geração",
    productType: "ONE_TIME",
    status: "ACTIVE",
    singleItemOnly: false,
    categoryId: "cat-1",
    prices: [
      {
        amount: 4999.9,
        currencyId: "curr-1",
        modifierTypeId: null,
      },
    ],
    deliverables: [],
    guidelines: [],
    createdBy: "system",
    createdAt: new Date(2023, 5, 8).toISOString(),
    updatedAt: new Date(2023, 5, 8).toISOString(),
  },
  {
    id: "prod-7",
    name: "Tênis Esportivo Pro",
    description: "Tênis para corrida com tecnologia de amortecimento avançada",
    productType: "ONE_TIME",
    status: "ACTIVE",
    singleItemOnly: false,
    categoryId: "cat-4",
    prices: [
      {
        amount: 349.9,
        currencyId: "curr-1",
        modifierTypeId: "max",
      },
    ],
    deliverables: [],
    guidelines: [],
    createdBy: "system",
    createdAt: new Date(2023, 6, 15).toISOString(),
    updatedAt: new Date(2023, 6, 15).toISOString(),
  },
  {
    id: "prod-8",
    name: "Curso de Programação Online",
    description: "Curso completo de programação com certificado",
    productType: "RECURRENT",
    status: "ACTIVE",
    singleItemOnly: true,
    categoryId: "cat-5",
    prices: [
      {
        amount: 59.9,
        currencyId: "curr-1",
        modifierTypeId: "ultra",
      },
    ],
    deliverables: [],
    guidelines: [],
    createdBy: "system",
    createdAt: new Date(2023, 7, 20).toISOString(),
    updatedAt: new Date(2023, 7, 20).toISOString(),
  },
]

// Cupons de exemplo
export const mockCoupons = [
  {
    id: "coupon-1",
    code: "WELCOME10",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minPurchaseAmount: null,
    usedCount: 45,
    status: "ACTIVE",
    usageType: "ONE_TIME",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "coupon-2",
    code: "SUMMER25",
    discountType: "PERCENTAGE",
    discountValue: 25,
    minPurchaseAmount: 100,
    usedCount: 12,
    status: "ACTIVE",
    usageType: "RECURRING",
    createdAt: "2023-06-01T00:00:00Z",
    updatedAt: "2023-06-01T00:00:00Z",
  },
  {
    id: "coupon-3",
    code: "FLASH50",
    discountType: "PERCENTAGE",
    discountValue: 50,
    minPurchaseAmount: 200,
    usedCount: 20,
    status: "EXPIRED",
    usageType: "ONE_TIME",
    createdAt: "2023-05-14T00:00:00Z",
    updatedAt: "2023-05-17T00:00:00Z",
  },
]
