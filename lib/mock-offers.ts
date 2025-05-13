import { Offer, OfferItem } from "./api-fetch";

// Exemplos de itens de oferta
const mockOfferItems: OfferItem[] = [
  {
    id: "item-1",
    offerId: "offer-1",
    productId: "prod-1",
    priceId: "price-1",
    productType: "ONE_TIME",
    price: 1000.00,
    quantity: 1,
    totalPrice: 1000.00
  },
  {
    id: "item-2",
    offerId: "offer-2",
    productId: "prod-2",
    priceId: "price-2",
    productType: "RECURRENT",
    price: 1250.00,
    quantity: 2,
    totalPrice: 2500.00
  },
  {
    id: "item-3",
    offerId: "offer-3",
    productId: "prod-3",
    priceId: "price-3",
    productType: "ONE_TIME",
    price: 750.00,
    quantity: 3,
    totalPrice: 2250.00
  }
];

// Exemplos de ofertas
export const mockOffers: (Offer & { leadName: string })[] = [
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa1",
    leadId: "lead-1",
    leadName: "João Silva",
    status: "OPEN",
    type: "ONE_TIME",
    subtotalPrice: 1000.00,
    totalPrice: 900.00,
    offerItems: [mockOfferItems[0]],
    createdAt: "2024-03-15T10:00:00Z",
    updatedAt: "2024-03-15T10:00:00Z"
  },
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa2",
    leadId: "lead-2",
    leadName: "Maria Santos",
    status: "CONVERTED",
    type: "RECURRENT",
    subtotalPrice: 2500.00,
    totalPrice: 2250.00,
    offerItems: [mockOfferItems[1]],
    createdAt: "2024-03-14T15:30:00Z",
    updatedAt: "2024-03-14T16:00:00Z"
  },
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa3",
    leadId: "lead-3",
    leadName: "Pedro Oliveira",
    couponId: "coupon-1",
    couponDiscountPercentage: 10,
    couponDiscountTotal: 225.00,
    status: "OPEN",
    type: "ONE_TIME",
    subtotalPrice: 2250.00,
    totalPrice: 2025.00,
    offerItems: [mockOfferItems[2]],
    createdAt: "2024-03-13T09:45:00Z",
    updatedAt: "2024-03-13T09:45:00Z"
  },
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa4",
    leadId: "lead-4",
    leadName: "Ana Costa",
    status: "OPEN",
    type: "RECURRENT",
    installmentId: "installment-1",
    installmentMonths: 12,
    installmentDiscountPercentage: 5,
    installmentDiscountTotal: 50.00,
    offerDurationId: "duration-1",
    offerDurationMonths: 24,
    offerDurationDiscountPercentage: 10,
    offerDurationDiscountTotal: 100.00,
    projectStartDate: "2024-04-01T00:00:00Z",
    paymentStartDate: "2024-04-15T00:00:00Z",
    payDay: 15,
    subtotalPrice: 1000.00,
    totalPrice: 850.00,
    offerItems: [
      {
        id: "item-4",
        offerId: "offer-4",
        productId: "prod-4",
        priceId: "price-4",
        productType: "RECURRENT",
        price: 500.00,
        quantity: 1,
        totalPrice: 500.00
      },
      {
        id: "item-5",
        offerId: "offer-4",
        productId: "prod-5",
        priceId: "price-5",
        productType: "RECURRENT",
        price: 500.00,
        quantity: 1,
        totalPrice: 500.00
      }
    ],
    createdAt: "2024-03-12T14:20:00Z",
    updatedAt: "2024-03-12T16:30:00Z"
  },
  {
    id: "3fa85f64-5717-4562-b3fc-2c963f66afa5",
    leadId: "lead-5",
    leadName: "Carlos Mendes",
    status: "CONVERTED",
    type: "ONE_TIME",
    subtotalPrice: 3500.00,
    totalPrice: 3500.00,
    offerItems: [
      {
        id: "item-6",
        offerId: "offer-5",
        productId: "prod-6",
        priceId: "price-6",
        productType: "ONE_TIME",
        price: 3500.00,
        quantity: 1,
        totalPrice: 3500.00
      }
    ],
    createdAt: "2024-03-10T11:15:00Z",
    updatedAt: "2024-03-11T09:00:00Z"
  }
]; 