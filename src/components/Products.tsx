import { useMemo, useState } from 'react'
import type { Product } from '../types'

interface ProductsProps {
  products: Product[]
}

export default function Products({
  products,
}: ProductsProps) {
  const [searchTerm, setSearchTerm] =
    useState('')

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })

  const filteredProducts = useMemo(() => {
    const term = searchTerm
      .trim()
      .toLowerCase()

    if (!term) {
      return products
    }

    return products.filter((product) => {
      return (
        product.name
          .toLowerCase()
          .includes(term) ||
        product.category
          .toLowerCase()
          .includes(term) ||
        product.barcode?.includes(term)
      )
    })
  }, [products, searchTerm])

  const totalProducts = products.length

  const totalStock = products.reduce(
    (total, product) =>
      total + product.stock,
    0,
  )

  const lowStock = products.filter(
    (product) =>
      product.stock > 0 &&
      product.stock <= 10,
  ).length

  const outOfStock = products.filter(
    (product) => product.stock === 0,
  ).length

  const getStockStatus = (
    stock: number,
  ) => {
    if (stock === 0) {
      return {
        label: 'Sem estoque',
        className:
          'bg-red-100 text-red-700',
      }
    }

    if (stock <= 10) {
      return {
        label: 'Estoque baixo',
        className:
          'bg-yellow-100 text-yellow-700',
      }
    }

    return {
      label: 'Disponível',
      className:
        'bg-green-100 text-green-700',
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Produtos
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Gerencie os produtos e acompanhe
            o estoque disponível.
          </p>
        </div>

        <button
          type="button"
          className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow-sm transition-all hover:bg-blue-700"
        >
          <i className="fas fa-plus mr-2" />
          Novo produto
        </button>
      </div>

      {/* Indicadores */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Produtos cadastrados
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-800">
                {totalProducts}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <i className="fas fa-box" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Unidades em estoque
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-800">
                {totalStock}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <i className="fas fa-boxes-stacked" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Estoque baixo
              </p>

              <p className="mt-1 text-2xl font-bold text-yellow-600">
                {lowStock}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
              <i className="fas fa-triangle-exclamation" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Sem estoque
              </p>

              <p className="mt-1 text-2xl font-bold text-red-600">
                {outOfStock}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <i className="fas fa-circle-xmark" />
            </div>
          </div>
        </div>
      </div>

      {/* Busca */}
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
            placeholder="Buscar por produto, categoria ou código de barras..."
            className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 outline-none transition-all focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200 text-left text-sm text-gray-500">
                <th className="px-5 py-4 font-medium">
                  Produto
                </th>

                <th className="px-5 py-4 font-medium">
                  Categoria
                </th>

                <th className="px-5 py-4 font-medium">
                  Código de barras
                </th>

                <th className="px-5 py-4 font-medium">
                  Preço
                </th>

                <th className="px-5 py-4 font-medium">
                  Estoque
                </th>

                <th className="px-5 py-4 font-medium">
                  Situação
                </th>

                <th className="px-5 py-4 text-center font-medium">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map(
                (product) => {
                  const stockStatus =
                    getStockStatus(
                      product.stock,
                    )

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-800">
                          {product.name}
                        </p>

                        <p className="text-xs text-gray-400">
                          ID: {product.id}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {product.category}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {product.barcode ??
                          'Não informado'}
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-800">
                        {formatCurrency(
                          product.price,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-800">
                          {product.stock}
                        </span>{' '}
                        <span className="text-xs text-gray-400">
                          un.
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${stockStatus.className}`}
                        >
                          {
                            stockStatus.label
                          }
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            title="Editar produto"
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
                          >
                            <i className="fas fa-pen" />
                          </button>

                          <button
                            type="button"
                            title="Excluir produto"
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                          >
                            <i className="fas fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                },
              )}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <i className="fas fa-box-open mb-3 text-4xl" />

            <p className="font-medium">
              Nenhum produto encontrado
            </p>

            <p className="mt-1 text-sm">
              Tente realizar outra busca.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}