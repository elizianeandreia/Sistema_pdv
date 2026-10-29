import { useState } from 'react'
import PDV from './components/PDV'
import Sidebar from './components/Sidebar'
import { initialProducts } from './data/products'
import type {
  Page,
  Product,
  Sale,
} from './types'

function App() {
  const [currentPage, setCurrentPage] =
    useState<Page>('pdv')

  const [products, setProducts] =
    useState<Product[]>(initialProducts)

  const [sales, setSales] =
    useState<Sale[]>([])

  const handleSaleComplete = (
    sale: Sale,
  ) => {
    setSales((currentSales) => [
      sale,
      ...currentSales,
    ])
  }

  const handleUpdateStock = (
    productId: string,
    quantity: number,
  ) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === productId
          ? {
              ...product,
              stock: Math.max(
                0,
                product.stock + quantity,
              ),
            }
          : product,
      ),
    )
  }

  const today =
    new Date().toLocaleDateString(
      'pt-BR',
      {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      },
    )

  const pageTitles: Record<Page, string> = {
    pdv: 'Ponto de Venda',
    products: 'Produtos',
    sales: 'Vendas',
    reports: 'Relatórios',
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'pdv':
        return (
          <PDV
            products={products}
            onSaleComplete={
              handleSaleComplete
            }
            onUpdateStock={
              handleUpdateStock
            }
          />
        )

      case 'products':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Produtos
            </h2>

            <p className="mt-2 text-gray-500">
              O gerenciamento de produtos
              será criado na próxima etapa.
            </p>
          </div>
        )

      case 'sales':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Vendas
            </h2>

            <p className="mt-2 text-gray-500">
              Aqui ficará o histórico de
              vendas realizadas.
            </p>
          </div>
        )

      case 'reports':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800">
              Relatórios
            </h2>

            <p className="mt-2 text-gray-500">
              Aqui serão exibidos os
              indicadores do PDV.
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {pageTitles[currentPage]}
              </h2>

              <p className="text-sm capitalize text-gray-500">
                {today}
              </p>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {sales.length}{' '}
                  {sales.length === 1
                    ? 'venda'
                    : 'vendas'}
                </p>

                <p className="text-xs text-gray-500">
                  registradas
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <i className="fas fa-user" />
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

export default App