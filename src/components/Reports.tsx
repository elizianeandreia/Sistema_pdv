import { useMemo } from 'react'
import type { Sale } from '../types'

interface ReportsProps {
  sales: Sale[]
}

export default function Reports({
  sales,
}: ReportsProps) {
  const formatCurrency = (
    value: number,
  ) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

  const totalRevenue = useMemo(
    () =>
      sales.reduce(
        (total, sale) =>
          total + sale.total,
        0,
      ),
    [sales],
  )

  const totalItems = useMemo(
    () =>
      sales.reduce(
        (total, sale) =>
          total +
          sale.items.reduce(
            (itemsTotal, item) =>
              itemsTotal +
              item.quantity,
            0,
          ),
        0,
      ),
    [sales],
  )

  const averageTicket =
    sales.length > 0
      ? totalRevenue / sales.length
      : 0

  const totalDiscounts = useMemo(
    () =>
      sales.reduce(
        (total, sale) =>
          total + sale.discount,
        0,
      ),
    [sales],
  )

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
      const methodSales =
        sales.filter(
          (sale) =>
            sale.paymentMethod ===
            method.key,
        )

      const total =
        methodSales.reduce(
          (sum, sale) =>
            sum + sale.total,
          0,
        )

      const percentage =
        sales.length > 0
          ? (methodSales.length /
              sales.length) *
            100
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
        name: string
        quantity: number
        revenue: number
      }
    >()

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const existing =
          products.get(
            item.product.id,
          )

        const revenue =
          item.product.price *
          item.quantity

        if (existing) {
          existing.quantity +=
            item.quantity
          existing.revenue += revenue
        } else {
          products.set(
            item.product.id,
            {
              name: item.product.name,
              quantity:
                item.quantity,
              revenue,
            },
          )
        }
      })
    })

    return Array.from(
      products.values(),
    )
      .sort(
        (a, b) =>
          b.quantity -
          a.quantity,
      )
      .slice(0, 5)
  }, [sales])

  const recentSales = useMemo(
    () => sales.slice(0, 5),
    [sales],
  )

  const maxProductQuantity =
    topProducts.length > 0
      ? Math.max(
          ...topProducts.map(
            (product) =>
              product.quantity,
          ),
        )
      : 0

  const formatDate = (
    date: string,
  ) =>
    new Date(date).toLocaleString(
      'pt-BR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    )

  const getPaymentLabel = (
    method: string,
  ) => {
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

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Relatórios
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Acompanhe os principais indicadores de vendas do PDV.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Faturamento total
              </p>

              <p className="mt-1 text-2xl font-bold text-green-600">
                {formatCurrency(
                  totalRevenue,
                )}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <i className="fas fa-sack-dollar" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Vendas realizadas
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-800">
                {sales.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <i className="fas fa-receipt" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Ticket médio
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-800">
                {formatCurrency(
                  averageTicket,
                )}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <i className="fas fa-chart-line" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Itens vendidos
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-800">
                {totalItems}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <i className="fas fa-box" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              Formas de pagamento
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Distribuição das vendas por forma de pagamento.
            </p>
          </div>

          <div className="space-y-5">
            {paymentData.map(
              (payment) => (
                <div key={payment.key}>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <i
                          className={
                            payment.icon
                          }
                        />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {
                            payment.label
                          }
                        </p>

                        <p className="text-xs text-gray-500">
                          {
                            payment.count
                          }{' '}
                          {payment.count ===
                          1
                            ? 'venda'
                            : 'vendas'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">
                        {formatCurrency(
                          payment.total,
                        )}
                      </p>

                      <p className="text-xs text-gray-500">
                        {payment.percentage.toFixed(
                          1,
                        )}
                        %
                      </p>
                    </div>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${payment.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800">
              Produtos mais vendidos
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Ranking por quantidade de unidades vendidas.
            </p>
          </div>

          {topProducts.length > 0 ? (
            <div className="space-y-5">
              {topProducts.map(
                (
                  product,
                  index,
                ) => {
                  const percentage =
                    maxProductQuantity >
                    0
                      ? (product.quantity /
                          maxProductQuantity) *
                        100
                      : 0

                  return (
                    <div
                      key={
                        product.name
                      }
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                            {index + 1}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800">
                              {
                                product.name
                              }
                            </p>

                            <p className="text-xs text-gray-500">
                              {
                                product.quantity
                              }{' '}
                              {product.quantity ===
                              1
                                ? 'unidade'
                                : 'unidades'}
                            </p>
                          </div>
                        </div>

                        <p className="shrink-0 text-sm font-semibold text-green-600">
                          {formatCurrency(
                            product.revenue,
                          )}
                        </p>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-green-600 transition-all"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                },
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-400">
              <i className="fas fa-chart-column mb-3 text-4xl" />

              <p className="font-medium">
                Nenhuma venda registrada
              </p>

              <p className="mt-1 text-sm">
                Os produtos mais vendidos aparecerão aqui.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Descontos concedidos
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-600">
                {formatCurrency(
                  totalDiscounts,
                )}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <i className="fas fa-percent" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Média de itens por venda
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-800">
                {sales.length > 0
                  ? (
                      totalItems /
                      sales.length
                    ).toFixed(1)
                  : '0,0'}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <i className="fas fa-cart-shopping" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Valor médio por item
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-800">
                {formatCurrency(
                  totalItems > 0
                    ? totalRevenue /
                        totalItems
                    : 0,
                )}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <i className="fas fa-tag" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-5">
          <h3 className="text-lg font-bold text-gray-800">
            Vendas recentes
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Últimas movimentações registradas no sistema.
          </p>
        </div>

        {recentSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
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
                {recentSales.map(
                  (sale) => {
                    const items =
                      sale.items.reduce(
                        (
                          total,
                          item,
                        ) =>
                          total +
                          item.quantity,
                        0,
                      )

                    return (
                      <tr
                        key={sale.id}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        <td className="px-6 py-4 font-medium text-gray-800">
                          #
                          {sale.id.slice(
                            -6,
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(
                            sale.date,
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {getPaymentLabel(
                            sale.paymentMethod,
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {items}{' '}
                          {items === 1
                            ? 'item'
                            : 'itens'}
                        </td>

                        <td className="px-6 py-4 text-right font-bold text-green-600">
                          {formatCurrency(
                            sale.total,
                          )}
                        </td>
                      </tr>
                    )
                  },
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <i className="fas fa-chart-line mb-3 text-4xl" />

            <p className="font-medium">
              Ainda não há dados para o relatório
            </p>

            <p className="mt-1 text-sm">
              Realize uma venda no PDV para gerar os indicadores.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}