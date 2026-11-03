
import { useMemo, useState } from 'react'
import type { Sale } from '../types'
import { getProductImage } from '../data/productImages'

interface ReportsProps {
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

const formatPercentage = (value: number) =>
  `${value.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`

const getPaymentLabel = (method: string) => {
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
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-subtle sm:h-14 sm:w-14">
      {showImage ? (
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          onError={() => setFailedUrl(imageUrl)}
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <i className="fas fa-box-open text-lg text-ink-muted/50" />
      )}
    </div>
  )
}

export default function Reports({ sales }: ReportsProps) {
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

  const totalDiscounts = useMemo(
    () =>
      sales.reduce(
        (total, sale) => total + sale.discount,
        0,
      ),
    [sales],
  )

  const averageTicket =
    sales.length > 0
      ? totalRevenue / sales.length
      : 0

  const averageItems =
    sales.length > 0
      ? totalItems / sales.length
      : 0

  const averageItemValue =
    totalItems > 0
      ? totalRevenue / totalItems
      : 0

  const paymentData = useMemo(() => {
    const methods = [
      {
        key: 'dinheiro',
        label: 'Dinheiro',
        icon: 'fas fa-money-bill-wave',
      },
      {
        key: 'cartao_credito',
        label: 'Cartão de crédito',
        icon: 'fas fa-credit-card',
      },
      {
        key: 'cartao_debito',
        label: 'Cartão de débito',
        icon: 'fas fa-credit-card',
      },
      {
        key: 'pix',
        label: 'PIX',
        icon: 'fas fa-qrcode',
      },
    ]

    return methods.map((method) => {
      const methodSales = sales.filter(
        (sale) => sale.paymentMethod === method.key,
      )

      const total = methodSales.reduce(
        (sum, sale) => sum + sale.total,
        0,
      )

      const percentage =
        sales.length > 0
          ? (methodSales.length / sales.length) * 100
          : 0

      return {
        ...method,
        count: methodSales.length,
        total,
        percentage,
      }
    })
  }, [sales])

  const topProducts = useMemo(() => {
    const products = new Map<
      string,
      {
        id: string
        name: string
        quantity: number
        revenue: number
      }
    >()

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const existing = products.get(item.product.id)

        const revenue =
          item.product.price * item.quantity

        if (existing) {
          existing.quantity += item.quantity
          existing.revenue += revenue
        } else {
          products.set(item.product.id, {
            id: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            revenue,
          })
        }
      })
    })

    return Array.from(products.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
  }, [sales])

  const recentSales = useMemo(
    () =>
      [...sales]
        .sort(
          (a, b) =>
            new Date(b.date).getTime() -
            new Date(a.date).getTime(),
        )
        .slice(0, 5),
    [sales],
  )

  const maxProductQuantity =
    topProducts.length > 0
      ? Math.max(
          ...topProducts.map(
            (product) => product.quantity,
          ),
        )
      : 0

  const indicators = [
    {
      label: 'Faturamento total',
      value: formatCurrency(totalRevenue),
      icon: 'fas fa-sack-dollar',
      color: 'text-success',
      background: 'bg-green-50',
      iconColor: 'text-success',
    },
    {
      label: 'Vendas realizadas',
      value: sales.length.toString(),
      icon: 'fas fa-receipt',
      color: 'text-ink',
      background: 'bg-primary-soft',
      iconColor: 'text-primary',
    },
    {
      label: 'Ticket médio',
      value: formatCurrency(averageTicket),
      icon: 'fas fa-chart-line',
      color: 'text-ink',
      background: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Itens vendidos',
      value: totalItems.toString(),
      icon: 'fas fa-box',
      color: 'text-ink',
      background: 'bg-orange-50',
      iconColor: 'text-primary',
    },
  ]

  const additionalIndicators = [
    {
      label: 'Descontos concedidos',
      value: formatCurrency(totalDiscounts),
      icon: 'fas fa-percent',
      color: 'text-warning',
      background: 'bg-yellow-50',
      iconColor: 'text-warning',
    },
    {
      label: 'Média de itens por venda',
      value: averageItems.toLocaleString('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
      icon: 'fas fa-cart-shopping',
      color: 'text-ink',
      background: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Valor médio por item',
      value: formatCurrency(averageItemValue),
      icon: 'fas fa-tag',
      color: 'text-ink',
      background: 'bg-primary-soft',
      iconColor: 'text-primary',
    },
  ]

  return (
    <div className="min-w-0 space-y-4 px-3 py-4 sm:space-y-6 sm:p-6">
      <div>
        <h2 className="text-xl font-bold text-ink sm:text-2xl">
          Relatórios
        </h2>

        <p className="mt-1 text-sm text-ink-muted">
          Acompanhe os principais indicadores de vendas do PDV.
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

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
        <section className="min-w-0 rounded-2xl border border-gray-200 bg-surface p-4 shadow-sm sm:p-6">
          <div className="mb-5 sm:mb-6">
            <h3 className="text-lg font-bold text-ink">
              Formas de pagamento
            </h3>

            <p className="mt-1 text-sm text-ink-muted">
              Distribuição das vendas por forma de pagamento.
            </p>
          </div>

          <div className="space-y-5">
            {paymentData.map((payment) => (
              <div key={payment.key}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <i className={payment.icon} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">
                        {payment.label}
                      </p>

                      <p className="text-xs text-ink-muted">
                        {payment.count}{' '}
                        {payment.count === 1 ? 'venda' : 'vendas'}
                      </p>
                    </div>
                  </div>

                  <div className="ml-auto min-w-0 text-right">
                    <p className="break-words text-sm font-semibold text-ink">
                      {formatCurrency(payment.total)}
                    </p>

                    <p className="text-xs text-ink-muted">
                      {formatPercentage(payment.percentage)}
                    </p>
                  </div>
                </div>

                <div
                  role="progressbar"
                  aria-label={`Participação de ${payment.label}`}
                  aria-valuenow={payment.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-2 overflow-hidden rounded-full bg-gray-100"
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${payment.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-gray-200 bg-surface p-4 shadow-sm sm:p-6">
          <div className="mb-5 sm:mb-6">
            <h3 className="text-lg font-bold text-ink">
              Produtos mais vendidos
            </h3>

            <p className="mt-1 text-sm text-ink-muted">
              Ranking por quantidade de unidades vendidas.
            </p>
          </div>

          {topProducts.length > 0 ? (
            <div className="space-y-5">
              {topProducts.map((product, index) => {
                const percentage =
                  maxProductQuantity > 0
                    ? (product.quantity / maxProductQuantity) * 100
                    : 0

                return (
                  <div key={product.id}>
                    <div className="mb-3 flex min-w-0 items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-subtle text-xs font-bold text-ink-muted sm:h-8 sm:w-8">
                        {index + 1}
                      </div>

                      <ProductPhoto name={product.name} />

                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-semibold text-ink">
                          {product.name}
                        </p>

                        <p className="mt-1 text-xs text-ink-muted">
                          {product.quantity}{' '}
                          {product.quantity === 1
                            ? 'unidade vendida'
                            : 'unidades vendidas'}
                        </p>
                      </div>
                    </div>

                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs text-ink-muted">
                        Quantidade vendida
                      </span>

                      <span className="break-words text-right text-sm font-semibold text-success">
                        {formatCurrency(product.revenue)}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-success transition-all"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-10 text-center text-ink-muted">
              <i className="fas fa-chart-column mb-3 text-4xl" />

              <p className="font-medium text-ink">
                Nenhuma venda registrada
              </p>

              <p className="mt-1 text-sm">
                Os produtos mais vendidos aparecerão aqui.
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {additionalIndicators.map((indicator) => (
          <div
            key={indicator.label}
            className="min-w-0 rounded-2xl border border-gray-200 bg-surface p-4 shadow-sm sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink-muted">
                  {indicator.label}
                </p>

                <p
                  className={`mt-2 break-words text-xl font-bold sm:text-2xl ${indicator.color}`}
                >
                  {indicator.value}
                </p>
              </div>

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${indicator.background} ${indicator.iconColor}`}
              >
                <i className={indicator.icon} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-surface shadow-sm">
        <div className="border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5">
          <h3 className="text-lg font-bold text-ink">
            Vendas recentes
          </h3>

          <p className="mt-1 text-sm text-ink-muted">
            Últimas movimentações registradas no sistema.
          </p>
        </div>

        {recentSales.length > 0 ? (
          <>
            <div className="space-y-3 p-3 sm:p-4 lg:hidden">
              {recentSales.map((sale) => {
                const items = getItemsCount(sale)

                return (
                  <article
                    key={sale.id}
                    className="min-w-0 rounded-xl border border-gray-200 bg-surface p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-ink">
                          Venda #{sale.id.slice(-6)}
                        </p>

                        <p className="mt-1 text-xs text-ink-muted">
                          {formatDate(sale.date)}
                        </p>
                      </div>

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                        <i className="fas fa-receipt" />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                        {getPaymentLabel(sale.paymentMethod)}
                      </span>

                      <span className="text-xs text-ink-muted">
                        {items} {items === 1 ? 'item' : 'itens'}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                      <span className="text-sm text-ink-muted">
                        Total
                      </span>

                      <span className="break-words text-right text-lg font-bold text-success">
                        {formatCurrency(sale.total)}
                      </span>
                    </div>
                  </article>
                )
              })}
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[700px]">
                <thead className="bg-surface-subtle">
                  <tr className="border-b border-gray-200 text-left text-sm text-ink-muted">
                    <th className="px-6 py-4 font-medium">
                      Venda
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Data
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Pagamento
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Itens
                    </th>

                    <th className="px-6 py-4 text-right font-medium">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentSales.map((sale) => {
                    const items = getItemsCount(sale)

                    return (
                      <tr
                        key={sale.id}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-surface-subtle"
                      >
                        <td className="px-6 py-4 font-medium text-ink">
                          #{sale.id.slice(-6)}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-sm text-ink-muted">
                          {formatDate(sale.date)}
                        </td>

                        <td className="px-6 py-4 text-sm text-ink-muted">
                          {getPaymentLabel(sale.paymentMethod)}
                        </td>

                        <td className="px-6 py-4 text-sm text-ink-muted">
                          {items} {items === 1 ? 'item' : 'itens'}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-right font-bold text-success">
                          {formatCurrency(sale.total)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-ink-muted sm:p-12">
            <i className="fas fa-chart-line mb-3 text-4xl" />

            <p className="font-medium text-ink">
              Ainda não há dados para o relatório
            </p>

            <p className="mt-1 text-sm">
              Realize uma venda no PDV para gerar os indicadores.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
