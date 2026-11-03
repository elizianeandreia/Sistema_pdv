
import { useEffect, useMemo, useRef, useState } from 'react'
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

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

const parseMoney = (value: string): number | null => {
  const normalized = value.trim()

  if (!/^\d+([.,]\d{1,2})?$/.test(normalized)) {
    return null
  }

  const [integer, decimal = ''] = normalized
    .replace('.', ',')
    .split(',')

  const cents =
    Number(integer) * 100 +
    Number(decimal.padEnd(2, '0'))

  return Number.isSafeInteger(cents) ? cents : null
}

const paymentOptions: {
  value: PaymentMethod
  label: string
  icon: string
}[] = [
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
]

export default function PDV({
  products,
  onSaleComplete,
  onUpdateStock,
}: PDVProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [discountInput, setDiscountInput] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('dinheiro')
  const [amountPaid, setAmountPaid] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [receipt, setReceipt] = useState({
    total: 0,
    change: 0,
  })

  const processingRef = useRef(false)

  const categories = useMemo(
    () => [
      'Todos',
      ...new Set(products.map((product) => product.category)),
    ],
    [products],
  )

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search) ||
        product.barcode?.includes(search)

      const matchesCategory =
        selectedCategory === 'Todos' ||
        product.category === selectedCategory

      return (
        matchesSearch &&
        matchesCategory &&
        product.stock > 0
      )
    })
  }, [products, searchTerm, selectedCategory])

  const subtotalCents = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum +
          Math.round(item.product.price * 100) *
            item.quantity,
        0,
      ),
    [cart],
  )

  const discountCents =
    discountInput.trim() === ''
      ? 0
      : parseMoney(discountInput)

  const validDiscount =
    discountCents !== null &&
    discountCents >= 0 &&
    discountCents <= subtotalCents

  const totalCents = Math.max(
    0,
    subtotalCents - (validDiscount ? discountCents : 0),
  )

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0,
  )

  const receivedCents = parseMoney(amountPaid)

  const changeCents =
    paymentMethod === 'dinheiro' &&
    receivedCents !== null
      ? Math.max(0, receivedCents - totalCents)
      : 0

  const enoughCash =
    paymentMethod !== 'dinheiro' ||
    (receivedCents !== null && receivedCents >= totalCents)

  const validStock = cart.every((item) => {
    const product = products.find(
      (current) => current.id === item.product.id,
    )

    return product !== undefined &&
      product.stock >= item.quantity
  })

  const canComplete =
    cart.length > 0 &&
    validDiscount &&
    enoughCash &&
    validStock

  useEffect(() => {
    if (!showSuccess) {
      return
    }

    const timeout = window.setTimeout(() => {
      setShowSuccess(false)
      processingRef.current = false
    }, 2500)

    return () => window.clearTimeout(timeout)
  }, [showSuccess])

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      return
    }

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.product.id === product.id,
      )

      if (existing) {
        if (existing.quantity >= product.stock) {
          return currentCart
        }

        return currentCart.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                product,
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

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.product.id !== productId) {
          return item
        }

        const availableProduct = products.find(
          (product) => product.id === productId,
        )

        return {
          ...item,
          quantity: Math.min(
            quantity,
            availableProduct?.stock ?? 0,
          ),
        }
      }).filter((item) => item.quantity > 0),
    )
  }

  const handlePayment = () => {
    if (!canComplete || processingRef.current) {
      return
    }

    processingRef.current = true

    const paidCents =
      paymentMethod === 'dinheiro'
        ? receivedCents ?? 0
        : totalCents

    const sale: Sale = {
      id: Date.now().toString(),
      items: cart.map((item) => ({
        product: { ...item.product },
        quantity: item.quantity,
      })),
      total: totalCents / 100,
      discount: (discountCents ?? 0) / 100,
      paymentMethod,
      amountPaid: paidCents / 100,
      change: changeCents / 100,
      date: new Date().toISOString(),
    }

    cart.forEach((item) => {
      onUpdateStock(item.product.id, -item.quantity)
    })

    onSaleComplete(sale)

    setReceipt({
      total: sale.total,
      change: sale.change,
    })

    setCart([])
    setDiscountInput('')
    setAmountPaid('')
    setPaymentMethod('dinheiro')
    setShowPayment(false)
    setShowSuccess(true)
  }

  if (showSuccess) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border-2 border-green-500 bg-green-50 p-10 text-center shadow-xl">
          <i className="fas fa-circle-check mb-5 text-6xl text-green-600" />

          <h2 className="mb-3 text-3xl font-bold text-green-700">
            Venda realizada!
          </h2>

          <p className="text-xl font-semibold text-green-700">
            Total: {formatCurrency(receipt.total)}
          </p>

          {receipt.change > 0 && (
            <p className="mt-3 text-lg text-green-600">
              Troco: {formatCurrency(receipt.change)}
            </p>
          )}

          <p className="mt-5 text-sm text-gray-500">
            Venda registrada com sucesso.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-col gap-4 p-4 lg:flex-row">
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="mb-4 space-y-3">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar produto ou código de barras..."
              className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-4 text-base outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid content-start grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const cartItem = cart.find(
                (item) => item.product.id === product.id,
              )

              const unavailable =
                (cartItem?.quantity ?? 0) >= product.stock

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addToCart(product)}
                  disabled={unavailable}
                  className="rounded-xl border-2 border-gray-100 bg-white p-4 text-left transition-all hover:border-blue-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <p className="text-sm font-semibold text-gray-800">
                    {product.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {product.category}
                  </p>

                  <p className="mt-3 text-lg font-bold text-blue-600">
                    {formatCurrency(product.price)}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Estoque: {product.stock} un.
                  </p>

                  {unavailable && (
                    <p className="mt-2 text-xs font-medium text-orange-600">
                      Limite de estoque atingido
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl bg-white p-10 text-center text-gray-400">
            <i className="fas fa-box-open mb-3 text-4xl" />

            <p className="font-medium">
              Nenhum produto disponível
            </p>

            <p className="mt-1 text-sm">
              Tente outra busca ou categoria.
            </p>
          </div>
        )}
      </section>

      <section className="flex w-full flex-col self-start rounded-2xl border border-gray-200 bg-white shadow-sm lg:sticky lg:top-4 lg:w-96">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <i className="fas fa-shopping-cart text-blue-600" />
            Carrinho
          </h2>

          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            {totalItems} {totalItems === 1 ? 'item' : 'itens'}
          </span>
        </div>

        <div className="max-h-[400px] min-h-40 space-y-3 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="py-10 text-center text-gray-400">
              <i className="fas fa-cart-plus mb-3 text-4xl" />

              <p className="font-medium">
                Carrinho vazio
              </p>

              <p className="mt-1 text-sm">
                Selecione um produto para começar.
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const availableStock =
                products.find(
                  (product) => product.id === item.product.id,
                )?.stock ?? 0

              return (
                <div
                  key={item.product.id}
                  className="rounded-xl bg-gray-50 p-3"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800">
                        {item.product.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatCurrency(item.product.price)} por unidade
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      aria-label={`Remover ${item.product.name}`}
                      className="text-red-400 hover:text-red-600"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.quantity - 1,
                          )
                        }
                        aria-label={`Diminuir quantidade de ${item.product.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300"
                      >
                        <i className="fas fa-minus text-xs" />
                      </button>

                      <span className="w-7 text-center font-semibold">
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
                        disabled={item.quantity >= availableStock}
                        aria-label={`Aumentar quantidade de ${item.product.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <i className="fas fa-plus text-xs" />
                      </button>
                    </div>

                    <p className="text-sm font-bold text-green-600">
                      {formatCurrency(
                        item.product.price * item.quantity,
                      )}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <div className="space-y-4 border-t border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>

            <span className="font-semibold text-gray-800">
              {formatCurrency(subtotalCents / 100)}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between gap-4">
              <label
                htmlFor="discount"
                className="text-sm text-gray-600"
              >
                Desconto (R$)
              </label>

              <input
                id="discount"
                type="text"
                inputMode="decimal"
                value={discountInput}
                onChange={(event) =>
                  setDiscountInput(event.target.value)
                }
                placeholder="0,00"
                aria-invalid={!validDiscount}
                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-right text-sm outline-none focus:border-blue-500"
              />
            </div>

            {!validDiscount && (
              <p className="mt-2 text-xs text-red-600">
                Informe um desconto válido, até o valor do subtotal.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xl font-bold">
            <span className="text-gray-800">Total</span>

            <span className="text-green-600">
              {formatCurrency(totalCents / 100)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setAmountPaid('')
              setShowPayment(true)
            }}
            disabled={cart.length === 0 || !validDiscount || !validStock}
            className="w-full rounded-xl bg-green-600 py-4 font-bold text-white shadow-sm hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <i className="fas fa-cash-register mr-2" />
            Finalizar venda
          </button>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setCart([])
                setDiscountInput('')
              }}
              className="w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Limpar carrinho
            </button>
          )}
        </div>
      </section>

      {showPayment && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3
              id="payment-title"
              className="mb-6 text-2xl font-bold text-gray-800"
            >
              <i className="fas fa-credit-card mr-2 text-blue-600" />
              Pagamento
            </h3>

            <div className="mb-5 rounded-xl bg-gray-50 p-4">
              <p className="text-sm text-gray-500">
                Total a pagar
              </p>

              <p className="mt-1 text-3xl font-bold text-green-600">
                {formatCurrency(totalCents / 100)}
              </p>
            </div>

            <p className="mb-3 text-sm font-medium text-gray-700">
              Forma de pagamento
            </p>

            <div className="mb-5 grid grid-cols-2 gap-3">
              {paymentOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPaymentMethod(option.value)}
                  className={`rounded-xl border-2 p-3 text-sm font-medium transition-colors ${
                    paymentMethod === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <i
                    className={`${option.icon} mb-2 block text-xl`}
                  />

                  {option.label}
                </button>
              ))}
            </div>

            {paymentMethod === 'dinheiro' && (
              <div className="mb-5">
                <label
                  htmlFor="amountPaid"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Valor recebido (R$)
                </label>

                <input
                  id="amountPaid"
                  type="text"
                  inputMode="decimal"
                  value={amountPaid}
                  onChange={(event) => setAmountPaid(event.target.value)}
                  placeholder="0,00"
                  autoFocus
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-right text-lg outline-none focus:border-blue-500"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Use vírgula para os centavos.
                </p>

                {receivedCents !== null &&
                  receivedCents >= totalCents && (
                    <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-700">
                      Troco: {formatCurrency(changeCents / 100)}
                    </p>
                  )}

                {amountPaid.trim() !== '' &&
                  (receivedCents === null ||
                    receivedCents < totalCents) && (
                    <p className="mt-2 text-sm text-red-600">
                      Informe um valor válido e suficiente para o pagamento.
                    </p>
                  )}
              </div>
            )}

            {!validStock && (
              <p className="mb-4 text-sm text-red-600">
                O estoque disponível foi alterado. Revise o carrinho.
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowPayment(false)}
                className="flex-1 rounded-xl bg-gray-100 py-3 font-medium text-gray-700 hover:bg-gray-200"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handlePayment}
                disabled={!canComplete}
                className="flex-1 rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                <i className="fas fa-check mr-2" />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
