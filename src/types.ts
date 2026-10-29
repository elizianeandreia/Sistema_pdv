export interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
  barcode?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Sale {
  id: string
  items: CartItem[]
  total: number
  discount: number
  paymentMethod: string
  amountPaid: number
  change: number
  date: string
}

export type PaymentMethod =
  | 'dinheiro'
  | 'cartao_credito'
  | 'cartao_debito'
  | 'pix'

export type Page =
  | 'pdv'
  | 'products'
  | 'sales'
  | 'reports'