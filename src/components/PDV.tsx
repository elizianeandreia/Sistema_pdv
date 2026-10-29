import { useMemo, useState } from 'react'
import type {
  CartItem,
  PaymentMethod,
  Product,
  Sale,
} from '../types'

interface PDVProps {
  products: Product[]
  onSaleComplete: (sale: Sale) => void
  onUpdateStock: (productId: string, quantity: number) => void
}

export default function PDV({
  products,
  onSaleComplete,
  onUpdateStock,
}: PDVProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [discount, setDiscount] = useState(0)

  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('dinheiro')

  const [amountPaid, setAmountPaid] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [lastChange, setLastChange] = useState(0)

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

  const categories = useMemo(() => {
    return ['Todos', ...new Set(products.map((product) => product.category))]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.includes(searchTerm)

      const matchesCategory =
        selectedCategory === 'Todos' ||
        product.category === selectedCategory

      return matchesSearch && matchesCategory && product.stock > 0
    })
  }, [products, searchTerm, selectedCategory])

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) =>
        total + item.product.price * item.quantity,
      0,
    )
  }, [cart])

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount)
  }, [subtotal, discount])

  const totalItems = useMemo(() => {
    return cart.reduce(
      (total, item) => total + item.quantity,
      0,
    )
  }, [cart])

  const addToCart = (product: Product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.product.id === product.id,
      )

      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          return currentCart
        }

        return currentCart.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        )
      }

      return [
        ...currentCart,
        {
          product,
          quantity: 1,
        },
      ]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.product.id !== productId,
      ),
    )
  }

  const updateQuantity = (
    productId: string,
    quantity: number,
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.product.id !== productId) {
          return item
        }

        return {
          ...item,
          quantity: Math.min(
            quantity,
            item.product.stock,
          ),
        }
      }),
    )
  }

  const handlePayment = () => {
    const paid =
      paymentMethod === 'dinheiro'
        ? parseFloat(amountPaid)
        : total

    const amount = Number.isNaN(paid)
      ? total
      : paid

    const change = Math.max(0, amount - total)

    const sale: Sale = {
      id: Date.now().toString(),
      items: [...cart],
      total,
      discount,
      paymentMethod,
      amountPaid: amount,
      change,
      date: new Date().toISOString(),
    }

    cart.forEach((item) => {
      onUpdateStock(
        item.product.id,
        -item.quantity,
      )
    })

    onSaleComplete(sale)

    setLastChange(change)
    setShowSuccess(true)
    setShowPayment(false)

    setTimeout(() => {
      setShowSuccess(false)
      setCart([])
      setDiscount(0)
      setAmountPaid('')
      setPaymentMethod('dinheiro')
    }, 3000)
  }

  if (showSuccess) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-2xl border-2 border-green-500 bg-green-50 p-12 text-center shadow-xl">
          <div className="mb-4 text-6xl">
            <i className="fas fa-circle-check text-green-600" />
          </div>

          <h2 className="mb-2 text-3xl font-bold text-green-700">
            Venda realizada!
          </h2>

          <p className="text-xl text-green-600">
            Total: {formatCurrency(total)}
          </p>

          {lastChange > 0 && (
            <p className="mt-2 text-lg text-green-600">
              Troco: {formatCurrency(lastChange)}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4 lg:flex-row">
      {/* Produtos */}
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="mb-4 space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar produto ou código de barras..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 pl-12 text-lg focus:border-blue-500 focus:outline-none"
            />

            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setSelectedCategory(category)
                }
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid flex-1 content-start grid-cols-2 gap-3 overflow-y-auto md:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => addToCart(product)}
              className="rounded-xl border-2 border-gray-100 bg-white p-3 text-left transition-all hover:border-blue-400 hover:shadow-md active:scale-95"
            >
              <p className="truncate text-sm font-semibold text-gray-800">
                {product.name}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {product.category}
              </p>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-lg font-bold text-blue-600">
                  {formatCurrency(product.price)}
                </span>

                <span className="text-xs text-gray-400">
                  Estoque: {product.stock}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Carrinho */}
      <section className="flex w-full flex-col rounded-2xl border border-gray-200 bg-white shadow-lg lg:w-96">
        <div className="border-b border-gray-100 p-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <i className="fas fa-shopping-cart text-blue-600" />

            Carrinho

            {totalItems > 0 && (
              <span className="rounded-full bg-blue-600 px-2 py-1 text-xs text-white">
                {totalItems}{' '}
                {totalItems === 1
                  ? 'item'
                  : 'itens'}
              </span>
            )}
          </h2>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <i className="fas fa-cart-plus mb-3 text-4xl" />

              <p>Carrinho vazio</p>

              <p className="text-sm">
                Clique nos produtos para adicionar
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 rounded-lg bg-gray-50 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">
                    {item.product.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {formatCurrency(
                      item.product.price,
                    )}{' '}
                    un.
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.product.id,
                        item.quantity - 1,
                      )
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-sm font-bold hover:bg-gray-300"
                  >
                    -
                  </button>

                  <span className="w-8 text-center text-sm font-bold">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.product.id,
                        item.quantity + 1,
                      )
                    }
                    disabled={
                      item.quantity >=
                      item.product.stock
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">
                    {formatCurrency(
                      item.product.price *
                        item.quantity,
                    )}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      removeFromCart(
                        item.product.id,
                      )
                    }
                    className="text-xs text-red-400 hover:text-red-600"
                    aria-label={`Remover ${item.product.name}`}
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-3 border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">
              Subtotal:
            </span>

            <span className="font-semibold">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <label
              htmlFor="discount"
              className="text-gray-600"
            >
              Desconto:
            </label>

            <input
              id="discount"
              type="number"
              value={discount || ''}
              onChange={(event) =>
                setDiscount(
                  Math.max(
                    0,
                    parseFloat(
                      event.target.value,
                    ) || 0,
                  ),
                )
              }
              placeholder="0,00"
              className="w-24 rounded-lg border px-2 py-1 text-right text-sm"
              step="0.01"
              min="0"
            />
          </div>

          <div className="flex items-center justify-between text-xl font-bold">
            <span className="text-gray-800">
              Total:
            </span>

            <span className="text-green-600">
              {formatCurrency(total)}
            </span>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={() =>
                setShowPayment(true)
              }
              className="w-full rounded-xl bg-green-600 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-green-700 active:scale-95"
            >
              <i className="fas fa-cash-register mr-2" />
              Finalizar venda
            </button>
          )}
        </div>
      </section>

      {/* Pagamento */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-800">
              <i className="fas fa-credit-card text-blue-600" />
              Pagamento
            </h3>

            <div className="mb-4 rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Total a pagar
              </p>

              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(total)}
              </p>
            </div>

            <div className="mb-4">
              <p className="mb-2 block text-sm font-medium text-gray-700">
                Forma de pagamento
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    value: 'dinheiro',
                    label: 'Dinheiro',
                    icon: 'fas fa-money-bill-wave',
                  },
                  {
                    value: 'cartao_credito',
                    label: 'Crédito',
                    icon: 'fas fa-credit-card',
                  },
                  {
                    value: 'cartao_debito',
                    label: 'Débito',
                    icon: 'fas fa-credit-card',
                  },
                  {
                    value: 'pix',
                    label: 'PIX',
                    icon: 'fas fa-qrcode',
                  },
                ].map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() =>
                      setPaymentMethod(
                        method.value as PaymentMethod,
                      )
                    }
                    className={`rounded-xl border-2 p-3 text-sm font-medium transition-all ${
                      paymentMethod ===
                      method.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <i
                      className={`${method.icon} mb-1 block text-lg`}
                    />

                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'dinheiro' && (
              <div className="mb-4">
                <label
                  htmlFor="amountPaid"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Valor recebido
                </label>

                <input
                  id="amountPaid"
                  type="number"
                  value={amountPaid}
                  onChange={(event) =>
                    setAmountPaid(
                      event.target.value,
                    )
                  }
                  placeholder="0,00"
                  className="w-full rounded-xl border-2 px-4 py-3 text-right text-lg focus:border-blue-500 focus:outline-none"
                  step="0.01"
                  min="0"
                  autoFocus
                />

                {parseFloat(amountPaid) >=
                  total && (
                  <p className="mt-2 text-sm font-medium text-green-600">
                    Troco:{' '}
                    {formatCurrency(
                      parseFloat(amountPaid) -
                        total,
                    )}
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setShowPayment(false)
                }
                className="flex-1 rounded-xl bg-gray-100 py-3 font-medium text-gray-700 transition-all hover:bg-gray-200"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handlePayment}
                disabled={
                  paymentMethod ===
                    'dinheiro' &&
                  (!amountPaid ||
                    parseFloat(
                      amountPaid,
                    ) < total)
                }
                className="flex-1 rounded-xl bg-green-600 py-3 font-bold text-white transition-all hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}