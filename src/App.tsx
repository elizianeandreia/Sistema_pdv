
import { useEffect, useState } from 'react'
import PDV from './components/PDV'
import Products from './components/Products'
import Reports from './components/Reports'
import Sales from './components/Sales'
import Sidebar from './components/Sidebar'
import { initialProducts } from './data/products'
import type { Page, Product, Sale } from './types'

const PRODUCTS_STORAGE_KEY = 'sistema-pdv-products'
const SALES_STORAGE_KEY = 'sistema-pdv-sales'

function loadProducts(): Product[] {
  try {
    const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY)

    if (!savedProducts) {
      return initialProducts
    }

    const parsedProducts = JSON.parse(savedProducts)

    if (!Array.isArray(parsedProducts)) {
      return initialProducts
    }

    return parsedProducts
  } catch {
    return initialProducts
  }
}

function loadSales(): Sale[] {
  try {
    const savedSales = localStorage.getItem(SALES_STORAGE_KEY)

    if (!savedSales) {
      return []
    }

    const parsedSales = JSON.parse(savedSales)

    if (!Array.isArray(parsedSales)) {
      return []
    }

    return parsedSales
  } catch {
    return []
  }
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('pdv')
  const [products, setProducts] = useState<Product[]>(loadProducts)
  const [sales, setSales] = useState<Sale[]>(loadSales)

  useEffect(() => {
    localStorage.setItem(
      PRODUCTS_STORAGE_KEY,
      JSON.stringify(products),
    )
  }, [products])

  useEffect(() => {
    localStorage.setItem(
      SALES_STORAGE_KEY,
      JSON.stringify(sales),
    )
  }, [sales])

  const handleSaleComplete = (sale: Sale) => {
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

  const handleAddProduct = (
    newProduct: Omit<Product, 'id'>,
  ) => {
    setProducts((currentProducts) => {
      const nextId =
        Math.max(
          0,
          ...currentProducts.map(
            (product) => Number(product.id) || 0,
          ),
        ) + 1

      const product: Product = {
        ...newProduct,
        id: nextId.toString(),
      }

      return [
        product,
        ...currentProducts,
      ]
    })
  }

  const handleUpdateProduct = (
    updatedProduct: Product,
  ) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === updatedProduct.id
          ? updatedProduct
          : product,
      ),
    )
  }

  const handleDeleteProduct = (productId: string) => {
    setProducts((currentProducts) =>
      currentProducts.filter(
        (product) => product.id !== productId,
      ),
    )
  }

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

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
            onSaleComplete={handleSaleComplete}
            onUpdateStock={handleUpdateStock}
          />
        )

      case 'products':
        return (
          <Products
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )

      case 'sales':
        return <Sales sales={sales} />

      case 'reports':
        return <Reports sales={sales} />

      default:
        return null
    }
  }

  return (
    <div className="flex min-h-dvh min-w-0 w-full overflow-x-clip bg-canvas">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-surface">
          <div className="flex min-h-[68px] items-center justify-between gap-3 py-3 pl-[4.25rem] pr-3 sm:px-5 sm:pl-20 lg:px-6">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-bold text-ink sm:text-xl">
                {pageTitles[currentPage]}
              </h2>

              <p className="mt-1 text-xs capitalize text-ink-muted sm:text-sm">
                {today}
              </p>
            </div>

            <div className="hidden shrink-0 items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="text-sm font-medium text-ink">
                  {sales.length}{' '}
                  {sales.length === 1 ? 'venda' : 'vendas'}
                </p>

                <p className="text-xs text-ink-muted">
                  registradas
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                <i className="fas fa-user" />
              </div>
            </div>
          </div>
        </header>

        <main
          id="main-content"
          className="min-h-0 min-w-0 flex-1 overflow-x-hidden"
        >
          {renderPage()}
        </main>
      </div>
    </div>
  )
}

export default App
