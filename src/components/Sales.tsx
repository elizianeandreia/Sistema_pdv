
import { useMemo, useState } from 'react'
import type { Sale } from '../types'
import { getProductImage } from '../data/productImages'

interface SalesProps {
  sales: Sale[]
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

const formatDate = (date: string) =>
  new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const getPaymentMethod = (method: string) => {
  switch (method) {
    case 'dinheiro':
      return 'Dinheiro'
    case 'cartao_credito':
      return 'Cartão de crédito'
    case 'cartao_debito':
      return 'Cartão de débito'
    case 'pix':
      return 'PIX'
    default:
      return method
  }
}

const getItemsCount = (sale: Sale) =>
  sale.items.reduce(
    (total, item) => total + item.quantity,
    0,
  )

function ProductPhoto({ name }: { name: string }) {
  const imageUrl = getProductImage(name)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  const showImage = imageUrl !== null && failedUrl !== imageUrl

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-subtle">
      {showImage ? (
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          onError={() => setFailedUrl(imageUrl)}
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <i className="fas fa-box-open text-xl text-ink-muted/50" />
      )}
    </div>
  )
}

export default function Sales({ sales }: SalesProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const filteredSales = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    if (!term) {
      return sales
    }

    return sales.filter((sale) => {
      const payment = getPaymentMethod(
        sale.paymentMethod,
      ).toLowerCase()

      const products = sale.items
        .map((item) => item.product.name)
        .join(' ')
        .toLowerCase()

      const date = formatDate(sale.date).toLowerCase()

      return (
        sale.id.toLowerCase().includes(term) ||
        payment.includes(term) ||
        products.includes(term) ||
        date.includes(term)
      )
    })
  }, [sales, searchTerm])

  const totalRevenue = useMemo(
    () =>
      sales.reduce(
        (total, sale) => total + sale.total,
        0,
      ),
    [sales],
  )

  const totalItems = useMemo(
    () =>
      sales.reduce(
        (total, sale) => total + getItemsCount(sale),
        0,
      ),
    [sales],
  )

  const averageTicket =
    sales.length > 0
      ? totalRevenue / sales.length
      : 0

  const indicators = [
    {
      label: 'Vendas realizadas',
      value: sales.length.toString(),
      icon: 'fas fa-receipt',
      color: 'text-ink',
      background: 'bg-primary-soft',
      iconColor: 'text-primary',
    },
    {
      label: 'Faturamento',
      value: formatCurrency(totalRevenue),
      icon: 'fas fa-sack-dollar',
      color: 'text-success',
      background: 'bg-green-50',
      iconColor: 'text-success',
    },
    {
      label: 'Itens vendidos',
      value: totalItems.toString(),
      icon: 'fas fa-box',
      color: 'text-ink',
      background: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Ticket médio',
      value: formatCurrency(averageTicket),
      icon: 'fas fa-chart-line',
      color: 'text-ink',
      background: 'bg-orange-50',
      iconColor: 'text-primary',
    },
  ]

  const openSaleDetails = (sale: Sale) => {
    setSelectedSale(sale)
  }

  const closeSaleDetails = () => {
    setSelectedSale(null)
  }

  return (
    <div className="min-w-0 space-y-4 px-3 py-4 sm:space-y-6 sm:p-6">
      <div>
        <h2 className="text-xl font-bold text-ink sm:text-2xl">
          Histórico de vendas
        </h2>

        <p className="mt-1 text-sm text-ink-muted">
          Consulte todas as vendas realizadas no sistema.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {indicators.map((indicator) => (
          <div
            key={indicator.label}
            className="min-w-0 rounded-2xl border border-gray-200 bg-surface p-3 shadow-sm sm:p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink-muted sm:text-sm">
                  {indicator.label}
                </p>

                <p
                  className={`mt-2 break-words text-lg font-bold sm:text-2xl ${indicator.color}`}
                >
                  {indicator.value}
                </p>
              </div>

              <div
                className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:flex ${indicator.background} ${indicator.iconColor}`}
              >
                <i className={indicator.icon} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-surface p-3 shadow-sm sm:p-4">
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Buscar venda, produto ou pagamento..."
            aria-label="Buscar vendas"
            className="min-h-12 w-full rounded-xl border border-gray-200 bg-surface py-3 pl-11 pr-4 text-base text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {filteredSales.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
          {filteredSales.map((sale) => {
            const itemsCount = getItemsCount(sale)

            return (
              <article
                key={sale.id}
                className="min-w-0 rounded-2xl border border-gray-200 bg-surface p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">
                      Venda #{sale.id.slice(-6)}
                    </p>

                    <p className="mt-1 text-xs text-ink-muted">
                      <i className="far fa-calendar mr-1" />
                      {formatDate(sale.date)}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <i className="fas fa-receipt" />
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                    {getPaymentMethod(sale.paymentMethod)}
                  </span>

                  <span className="text-sm text-ink-muted">
                    {itemsCount}{' '}
                    {itemsCount === 1 ? 'item' : 'itens'}
                  </span>
                </div>

                <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-ink-muted">
                      Desconto
                    </span>

                    <span className="text-sm font-medium text-ink">
                      {formatCurrency(sale.discount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-ink">
                      Total
                    </span>

                    <span className="text-xl font-bold text-success">
                      {formatCurrency(sale.total)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openSaleDetails(sale)}
                  className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-soft px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-orange-100"
                >
                  <i className="fas fa-eye" />
                  Ver detalhes
                </button>
              </article>
            )
          })}
        </div>
      )}

      {filteredSales.length > 0 && (
        <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-surface shadow-sm lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead className="bg-surface-subtle">
                <tr className="border-b border-gray-200 text-left text-sm text-ink-muted">
                  <th className="px-5 py-4 font-medium">
                    Venda
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Data
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Itens
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Pagamento
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Desconto
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Total
                  </th>

                  <th className="px-5 py-4 text-center font-medium">
                    Detalhes
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredSales.map((sale) => {
                  const itemsCount = getItemsCount(sale)

                  return (
                    <tr
                      key={sale.id}
                      className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-surface-subtle"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-ink">
                          Venda #{sale.id.slice(-6)}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-ink-muted">
                        {formatDate(sale.date)}
                      </td>

                      <td className="px-5 py-4 text-sm text-ink-muted">
                        {itemsCount}{' '}
                        {itemsCount === 1 ? 'item' : 'itens'}
                      </td>

                      <td className="px-5 py-4">
                        <span className="whitespace-nowrap rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                          {getPaymentMethod(sale.paymentMethod)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-ink-muted">
                        {formatCurrency(sale.discount)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 font-bold text-success">
                        {formatCurrency(sale.total)}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => openSaleDetails(sale)}
                          title="Ver detalhes"
                          aria-label={`Ver detalhes da venda ${sale.id.slice(-6)}`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors hover:bg-orange-100"
                        >
                          <i className="fas fa-eye" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredSales.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-surface p-10 text-center text-ink-muted">
          <i className="fas fa-receipt mb-3 text-4xl" />

          <p className="font-medium text-ink">
            Nenhuma venda encontrada
          </p>

          <p className="mt-1 text-sm">
            {sales.length === 0
              ? 'As vendas realizadas no PDV aparecerão aqui.'
              : 'Tente realizar outra busca.'}
          </p>
        </div>
      )}

      {selectedSale && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sale-details-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <div className="flex max-h-[96dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-surface shadow-2xl sm:rounded-2xl">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 p-4 sm:p-6">
              <div className="min-w-0">
                <h3
                  id="sale-details-title"
                  className="text-xl font-bold text-ink"
                >
                  Detalhes da venda
                </h3>

                <p className="mt-1 text-sm text-ink-muted">
                  Venda #{selectedSale.id.slice(-6)}
                </p>
              </div>

              <button
                type="button"
                onClick={closeSaleDetails}
                aria-label="Fechar detalhes da venda"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-subtle hover:text-ink"
              >
                <i className="fas fa-xmark" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
              <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
                <div className="min-w-0 rounded-xl bg-surface-subtle p-3">
                  <p className="text-xs text-ink-muted">
                    Data
                  </p>

                  <p className="mt-1 text-sm font-medium text-ink">
                    {formatDate(selectedSale.date)}
                  </p>
                </div>

                <div className="min-w-0 rounded-xl bg-surface-subtle p-3">
                  <p className="text-xs text-ink-muted">
                    Pagamento
                  </p>

                  <p className="mt-1 text-sm font-medium text-ink">
                    {getPaymentMethod(selectedSale.paymentMethod)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-base font-semibold text-ink">
                  Produtos vendidos
                </h4>

                <div className="space-y-3">
                  {selectedSale.items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-200 p-3"
                    >
                      <ProductPhoto name={item.product.name} />

                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-semibold text-ink">
                          {item.product.name}
                        </p>

                        <p className="mt-1 text-xs text-ink-muted">
                          {item.quantity} x{' '}
                          {formatCurrency(item.product.price)}
                        </p>

                        <p className="mt-2 text-sm font-bold text-success">
                          {formatCurrency(
                            item.product.price * item.quantity,
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-ink-muted">
                    Itens vendidos
                  </span>

                  <span className="font-medium text-ink">
                    {getItemsCount(selectedSale)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-ink-muted">
                    Desconto
                  </span>

                  <span className="font-medium text-ink">
                    {formatCurrency(selectedSale.discount)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3 text-lg font-bold">
                  <span className="text-ink">
                    Total
                  </span>

                  <span className="text-success">
                    {formatCurrency(selectedSale.total)}
                  </span>
                </div>

                {selectedSale.paymentMethod === 'dinheiro' && (
                  <>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-ink-muted">
                        Valor recebido
                      </span>

                      <span className="font-medium text-ink">
                        {formatCurrency(selectedSale.amountPaid)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-ink-muted">
                        Troco
                      </span>

                      <span className="font-semibold text-success">
                        {formatCurrency(selectedSale.change)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={closeSaleDetails}
                className="min-h-12 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
