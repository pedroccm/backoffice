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

// Tipos de modificadores de exemplo
export const mockModifierTypes: ModifierType[] = [
  {
    key: "standard",
    displayName: "Padrão",
    description: "Versão padrão do produto sem modificações",
    createdBy: "system"
  },
  {
    key: "premium",
    displayName: "Premium",
    description: "Versão premium com recursos adicionais",
    createdBy: "system"
  },
  {
    key: "enterprise",
    displayName: "Empresarial",
    description: "Versão empresarial com suporte dedicado",
    createdBy: "system"
  },
  {
    key: "educational",
    displayName: "Educacional",
    description: "Versão com desconto para instituições de ensino",
    createdBy: "system"
  },
  {
    key: "non_profit",
    displayName: "Sem Fins Lucrativos",
    description: "Versão especial para ONGs e instituições sem fins lucrativos",
    createdBy: "system"
  }
]

// Entregáveis de exemplo
export const mockDeliverables: Deliverable[] = [
  {
    id: "del-1",
    name: "Manual do Usuário",
    description: "Manual completo com instruções de uso do sistema",
    productId: "prod-1",
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: "del-2",
    name: "Treinamento Inicial",
    description: "Sessão de treinamento online para uso do sistema",
    productId: "prod-1",
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 15).toISOString(),
  },
  {
    id: "del-3",
    name: "Material do Curso",
    description: "Material didático completo do curso",
    productId: "prod-2",
    createdAt: new Date(2023, 2, 10).toISOString(),
    updatedAt: new Date(2023, 2, 10).toISOString(),
  },
  {
    id: "del-4",
    name: "Certificado",
    description: "Certificado digital de conclusão",
    productId: "prod-2",
    createdAt: new Date(2023, 3, 5).toISOString(),
    updatedAt: new Date(2023, 3, 5).toISOString(),
  },
  {
    id: "del-5",
    name: "Relatório de Consultoria",
    description: "Relatório detalhado com análises e recomendações",
    productId: "prod-3",
    createdAt: new Date(2023, 3, 5).toISOString(),
    updatedAt: new Date(2023, 3, 5).toISOString(),
  }
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

// Produtos de exemplo atualizados
export const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "Software de Gestão Empresarial",
    description: "Sistema completo para gestão empresarial com módulos de finanças, RH e vendas",
    productType: "RECURRENT",
    status: "ACTIVE",
    singleItemOnly: true,
    categoryId: "cat-1",
    prices: [
      {
        id: "price-1",
        amount: 199.90,
        currencyId: "curr-1",
        modifierTypeId: "standard"
      },
      {
        id: "price-2",
        amount: 399.90,
        currencyId: "curr-1",
        modifierTypeId: "premium"
      },
      {
        id: "price-3",
        amount: 999.90,
        currencyId: "curr-1",
        modifierTypeId: "enterprise"
      },
      {
        id: "price-4",
        amount: 49.90,
        currencyId: "curr-1",
        modifierTypeId: "educational"
      }
    ],
    deliverables: [
      {
        id: "del-1",
        name: "Manual do Usuário",
        description: "Manual completo com instruções de uso do sistema",
        productId: "prod-1"
      },
      {
        id: "del-2",
        name: "Treinamento Inicial",
        description: "Sessão de treinamento online para uso do sistema",
        productId: "prod-1"
      }
    ],
    guidelines: [
      {
        id: "guide-1",
        name: "Requisitos do Sistema",
        description: "Requisitos mínimos de hardware e software",
        productId: "prod-1"
      }
    ],
    createdBy: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-2",
    name: "Curso de Marketing Digital",
    description: "Curso completo de marketing digital com certificação",
    productType: "ONE_TIME",
    status: "ACTIVE",
    singleItemOnly: false,
    categoryId: "cat-5",
    prices: [
      {
        id: "price-5",
        amount: 997.00,
        currencyId: "curr-1",
        modifierTypeId: "standard"
      },
      {
        id: "price-6",
        amount: 199.00,
        currencyId: "curr-1",
        modifierTypeId: "educational"
      },
      {
        id: "price-7",
        amount: 199.00,
        currencyId: "curr-2",
        modifierTypeId: "standard"
      }
    ],
    deliverables: [
      {
        id: "del-3",
        name: "Material do Curso",
        description: "Material didático completo do curso",
        productId: "prod-2"
      },
      {
        id: "del-4",
        name: "Certificado",
        description: "Certificado digital de conclusão",
        productId: "prod-2"
      }
    ],
    guidelines: [],
    createdBy: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-3",
    name: "Consultoria Especializada",
    description: "Serviço de consultoria empresarial personalizada",
    productType: "ONE_TIME",
    status: "ACTIVE",
    singleItemOnly: true,
    categoryId: "cat-1",
    prices: [
      {
        id: "price-8",
        amount: 5000.00,
        currencyId: "curr-1",
        modifierTypeId: null
      },
      {
        id: "price-9",
        amount: 1000.00,
        currencyId: "curr-2",
        modifierTypeId: null
      },
      {
        id: "price-10",
        amount: 900.00,
        currencyId: "curr-3",
        modifierTypeId: null
      }
    ],
    deliverables: [
      {
        id: "del-5",
        name: "Relatório de Consultoria",
        description: "Relatório detalhado com análises e recomendações",
        productId: "prod-3"
      }
    ],
    guidelines: [
      {
        id: "guide-2",
        name: "Termos de Serviço",
        description: "Termos e condições da consultoria",
        productId: "prod-3"
      }
    ],
    createdBy: "system",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
    status: "EXPIRED",
    usageType: "ONE_TIME",
    createdAt: "2023-05-14T00:00:00Z",
    updatedAt: "2023-05-17T00:00:00Z",
  },
]

// Ofertas de exemplo
export const mockOffers = [
  {
    id: "offer-1",
    leadName: "Empresa ABC Ltda",
    leadEmail: "contato@abcltda.com",
    status: "CONVERTED",
    type: "RECURRENT",
    subtotal: 999.90,
    total: 999.90,
    items: [
      {
        productId: "prod-1",
        priceId: "price-3", // enterprise
        quantity: 1
      }
    ],
    createdBy: "system",
    createdAt: new Date(2023, 11, 15).toISOString(),
    updatedAt: new Date(2023, 11, 15).toISOString(),
    convertedAt: new Date(2023, 11, 16).toISOString()
  },
  {
    id: "offer-2",
    leadName: "Universidade XYZ",
    leadEmail: "compras@xyz.edu",
    status: "CONVERTED",
    type: "ONE_TIME",
    subtotal: 398.00,
    total: 398.00,
    items: [
      {
        productId: "prod-2",
        priceId: "price-6", // educational
        quantity: 2
      }
    ],
    createdBy: "system",
    createdAt: new Date(2023, 11, 10).toISOString(),
    updatedAt: new Date(2023, 11, 12).toISOString(),
    convertedAt: new Date(2023, 11, 12).toISOString()
  },
  {
    id: "offer-3",
    leadName: "Consultoria DEF",
    leadEmail: "financeiro@def.com",
    status: "PENDING",
    type: "ONE_TIME",
    subtotal: 5000.00,
    total: 5000.00,
    items: [
      {
        productId: "prod-3",
        priceId: "price-8", // BRL sem modificador
        quantity: 1
      }
    ],
    createdBy: "system",
    createdAt: new Date(2023, 11, 18).toISOString(),
    updatedAt: new Date(2023, 11, 18).toISOString(),
    convertedAt: null
  },
  {
    id: "offer-4",
    leadName: "Tech Solutions Inc",
    leadEmail: "purchase@techsolutions.com",
    status: "PENDING",
    type: "RECURRENT",
    subtotal: 599.70,
    total: 599.70,
    items: [
      {
        productId: "prod-1",
        priceId: "price-2", // premium
        quantity: 1
      },
      {
        productId: "prod-2",
        priceId: "price-7", // standard USD
        quantity: 1
      }
    ],
    createdBy: "system",
    createdAt: new Date(2023, 11, 20).toISOString(),
    updatedAt: new Date(2023, 11, 20).toISOString(),
    convertedAt: null
  },
  {
    id: "offer-5",
    leadName: "ONG Educação Para Todos",
    leadEmail: "projetos@educacaoparatodos.org",
    status: "CONVERTED",
    type: "ONE_TIME",
    subtotal: 149.70,
    total: 149.70,
    items: [
      {
        productId: "prod-1",
        priceId: "price-4", // educational
        quantity: 3
      }
    ],
    createdBy: "system",
    createdAt: new Date(2023, 11, 5).toISOString(),
    updatedAt: new Date(2023, 11, 7).toISOString(),
    convertedAt: new Date(2023, 11, 7).toISOString()
  }
]
