import { useMemo, useState } from 'react'
import type { Sale } from '../types'

interface SalesProps {
  sales: Sale[]
}

export default function Sales({
  sales,
}: SalesProps) {
  const [searchTerm, setSearchTerm] =
    useState('')

  const [selectedSale, setSelectedSale] =
    useState<Sale | null>(null)

  const formatCurrency = (
    value: number,
  ) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

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

  const getPaymentMethod = (
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

  const filteredSales =
    useMemo(() => {
      const term = searchTerm
        .trim()
        .toLowerCase()

      if (!term) {
        return sales
      }

      return sales.filter((sale) => {
        const payment =
          getPaymentMethod(
            sale.paymentMethod,
          ).toLowerCase()

        const products =
          sale.items
            .map(
              (item) =>
                item.product.name,
            )
            .join(' ')
            .toLowerCase()

        return (
          sale.id
            .toLowerCase()
            .includes(term) ||
          payment.includes(term) ||
          products.includes(term)
        )
      })
    }, [sales, searchTerm])

  const totalRevenue =
    sales.reduce(
      (total, sale) =>
        total + sale.total,
      0,
    )

  const totalItems =
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
    )

  const averageTicket =
    sales.length > 0
      ? totalRevenue / sales.length
      : 0

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Histórico de vendas
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Consulte todas as vendas realizadas no sistema.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                Faturamento
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
                Itens vendidos
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-800">
                {totalItems}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <i className="fas fa-box" />
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

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <i className="fas fa-chart-line" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

          <input
            type="text"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value,
              )
            }
            placeholder="Buscar por produto, pagamento ou número da venda..."
            className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none transition-all focus:border-blue-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
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
              {filteredSales.map(
                (sale) => {
                  const itemsCount =
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
                      className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">
                          Venda #
                          {sale.id.slice(
                            -6,
                          )}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(
                          sale.date,
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {itemsCount}{' '}
                        {itemsCount === 1
                          ? 'item'
                          : 'itens'}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {getPaymentMethod(
                            sale.paymentMethod,
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatCurrency(
                          sale.discount,
                        )}
                      </td>

                      <td className="px-5 py-4 font-bold text-green-600">
                        {formatCurrency(
                          sale.total,
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedSale(
                              sale,
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
                          title="Ver detalhes"
                        >
                          <i className="fas fa-eye" />
                        </button>
                      </td>
                    </tr>
                  )
                },
              )}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <i className="fas fa-receipt mb-3 text-4xl" />

            <p className="font-medium">
              Nenhuma venda encontrada
            </p>

            <p className="mt-1 text-sm">
              As vendas realizadas no PDV aparecerão aqui.
            </p>
          </div>
        )}
      </div>

      {selectedSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Detalhes da venda
                </h3>

                <p className="text-sm text-gray-500">
                  Venda #
                  {selectedSale.id.slice(
                    -6,
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedSale(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Fechar"
              >
                <i className="fas fa-xmark" />
              </button>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  Data
                </p>

                <p className="mt-1 text-sm font-medium text-gray-800">
                  {formatDate(
                    selectedSale.date,
                  )}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-xs text-gray-500">
                  Pagamento
                </p>

                <p className="mt-1 text-sm font-medium text-gray-800">
                  {getPaymentMethod(
                    selectedSale.paymentMethod,
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {selectedSale.items.map(
                (item) => (
                  <div
                    key={
                      item.product.id
                    }
                    className="flex items-center justify-between rounded-xl border border-gray-100 p-3"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {
                          item.product
                            .name
                        }
                      </p>

                      <p className="text-xs text-gray-500">
                        {item.quantity}{' '}
                        x{' '}
                        {formatCurrency(
                          item.product
                            .price,
                        )}
                      </p>
                    </div>

                    <p className="font-semibold text-gray-800">
                      {formatCurrency(
                        item.product
                          .price *
                          item.quantity,
                      )}
                    </p>
                  </div>
                ),
              )}
            </div>

            <div className="mt-6 space-y-2 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Desconto
                </span>

                <span className="text-gray-700">
                  {formatCurrency(
                    selectedSale.discount,
                  )}
                </span>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>
                  Total
                </span>

                <span className="text-green-600">
                  {formatCurrency(
                    selectedSale.total,
                  )}
                </span>
              </div>

              {selectedSale.paymentMethod ===
                'dinheiro' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Valor recebido
                    </span>

                    <span className="text-gray-700">
                      {formatCurrency(
                        selectedSale.amountPaid,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Troco
                    </span>

                    <span className="font-medium text-gray-700">
                      {formatCurrency(
                        selectedSale.change,
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedSale(null)
              }
              className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-medium text-white hover:bg-blue-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}