import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Product } from '../types'

interface ProductsProps {
  products: Product[]
  onAddProduct: (product: Omit<Product, 'id'>) => void
  onUpdateProduct: (product: Product) => void
  onDeleteProduct: (productId: string) => void
}

interface ProductFormData {
  name: string
  category: string
  barcode: string
  price: string
  stock: string
}

const emptyForm: ProductFormData = {
  name: '',
  category: '',
  barcode: '',
  price: '',
  stock: '',
}

export default function Products({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}: ProductsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>(emptyForm)
  const [formError, setFormError] = useState('')

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return products
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.barcode?.includes(term) ||
        product.id.includes(term),
    )
  }, [products, searchTerm])

  const totalProducts = products.length
  const totalStock = products.reduce((total, product) => total + product.stock, 0)
  const lowStock = products.filter((product) => product.stock > 0 && product.stock <= 10).length
  const outOfStock = products.filter((product) => product.stock === 0).length

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Sem estoque', className: 'bg-red-50 text-danger' }
    if (stock <= 10) return { label: 'Estoque baixo', className: 'bg-yellow-50 text-warning' }
    return { label: 'Disponível', className: 'bg-green-50 text-success' }
  }

  const openAddForm = () => {
    setEditingProduct(null)
    setFormData(emptyForm)
    setFormError('')
    setShowForm(true)
  }

  const openEditForm = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      barcode: product.barcode ?? '',
      price: product.price.toString(),
      stock: product.stock.toString(),
    })
    setFormError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingProduct(null)
    setFormData(emptyForm)
    setFormError('')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = formData.name.trim()
    const category = formData.category.trim()
    const barcode = formData.barcode.trim()
    const price = Number(formData.price)
    const stock = Number(formData.stock)

    if (!name) {
      setFormError('Informe o nome do produto.')
      return
    }
    if (!category) {
      setFormError('Informe a categoria.')
      return
    }
    if (Number.isNaN(price) || price <= 0) {
      setFormError('Informe um preço válido.')
      return
    }
    if (Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      setFormError('Informe uma quantidade de estoque válida.')
      return
    }

    if (barcode) {
      const barcodeExists = products.some(
        (product) => product.barcode === barcode && product.id !== editingProduct?.id,
      )
      if (barcodeExists) {
        setFormError('Já existe um produto com este código de barras.')
        return
      }
    }

    const productData = { name, category, barcode: barcode || undefined, price, stock }

    if (editingProduct) {
      onUpdateProduct({ ...productData, id: editingProduct.id })
    } else {
      onAddProduct(productData)
    }

    closeForm()
  }

  const confirmDelete = () => {
    if (!productToDelete) return
    onDeleteProduct(productToDelete.id)
    setProductToDelete(null)
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-ink">Produtos</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Gerencie os produtos e acompanhe o estoque disponível.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="rounded-xl bg-primary px-5 py-3 font-medium text-white shadow-sm transition-colors hover:bg-primary-hover"
        >
          <i className="fas fa-plus mr-2" />
          Novo produto
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-muted">Produtos cadastrados</p>
              <p className="mt-1 text-2xl font-bold text-ink">{totalProducts}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <i className="fas fa-box" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-muted">Unidades em estoque</p>
              <p className="mt-1 text-2xl font-bold text-ink">{totalStock}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-success">
              <i className="fas fa-boxes-stacked" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-muted">Estoque baixo</p>
              <p className="mt-1 text-2xl font-bold text-warning">{lowStock}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50 text-warning">
              <i className="fas fa-triangle-exclamation" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-surface p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-muted">Sem estoque</p>
              <p className="mt-1 text-2xl font-bold text-danger">{outOfStock}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-danger">
              <i className="fas fa-circle-xmark" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-surface p-4 shadow-sm">
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por produto, categoria, código de barras ou ID..."
            className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="bg-surface-subtle">
              <tr className="border-b border-gray-200 text-left text-sm text-ink-muted">
                <th className="px-5 py-4 font-medium">Produto</th>
                <th className="px-5 py-4 font-medium">Categoria</th>
                <th className="px-5 py-4 font-medium">Código de barras</th>
                <th className="px-5 py-4 font-medium">Preço</th>
                <th className="px-5 py-4 font-medium">Estoque</th>
                <th className="px-5 py-4 font-medium">Situação</th>
                <th className="px-5 py-4 text-center font-medium">Ações</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock)
                return (
                  <tr
                    key={product.id}
                    className="border-b border-gray-100 transition-colors last:border-b-0 hover:bg-surface-subtle"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{product.name}</p>
                      <p className="text-xs text-ink-muted">ID: {product.id}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-ink-muted">{product.category}</td>
                    <td className="px-5 py-4 text-sm text-ink-muted">
                      {product.barcode ?? 'Não informado'}
                    </td>
                    <td className="px-5 py-4 font-semibold text-ink">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-ink">{product.stock}</span>{' '}
                      <span className="text-xs text-ink-muted">un.</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${stockStatus.className}`}
                      >
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          title="Editar produto"
                          onClick={() => openEditForm(product)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors hover:bg-orange-100"
                        >
                          <i className="fas fa-pen" />
                        </button>
                        <button
                          type="button"
                          title="Excluir produto"
                          onClick={() => setProductToDelete(product)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-danger transition-colors hover:bg-red-100"
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-ink-muted">
            <i className="fas fa-box-open mb-3 text-4xl" />
            <p className="font-medium text-ink">Nenhum produto encontrado</p>
            <p className="mt-1 text-sm">Tente realizar outra busca.</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-surface p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-ink">
                  {editingProduct ? 'Editar produto' : 'Novo produto'}
                </h3>
                <p className="text-sm text-ink-muted">
                  {editingProduct
                    ? 'Altere os dados do produto.'
                    : 'Preencha os dados do produto.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-subtle hover:text-ink"
                aria-label="Fechar"
              >
                <i className="fas fa-xmark" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="productName" className="mb-1 block text-sm font-medium text-ink">
                  Nome do produto
                </label>
                <input
                  id="productName"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Ex.: Café 500 g"
                  autoFocus
                />
              </div>

              <div>
                <label
                  htmlFor="productCategory"
                  className="mb-1 block text-sm font-medium text-ink"
                >
                  Categoria
                </label>
                <input
                  id="productCategory"
                  type="text"
                  required
                  value={formData.category}
                  onChange={(event) => setFormData({ ...formData, category: event.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Ex.: Alimentos"
                />
              </div>

              <div>
                <label
                  htmlFor="productBarcode"
                  className="mb-1 block text-sm font-medium text-ink"
                >
                  Código de barras
                </label>
                <input
                  id="productBarcode"
                  type="text"
                  value={formData.barcode}
                  onChange={(event) => setFormData({ ...formData, barcode: event.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Opcional"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="productPrice"
                    className="mb-1 block text-sm font-medium text-ink"
                  >
                    Preço
                  </label>
                  <input
                    id="productPrice"
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.price}
                    onChange={(event) => setFormData({ ...formData, price: event.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <label
                    htmlFor="productStock"
                    className="mb-1 block text-sm font-medium text-ink"
                  >
                    Estoque
                  </label>
                  <input
                    id="productStock"
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={formData.stock}
                    onChange={(event) => setFormData({ ...formData, stock: event.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="0"
                  />
                </div>
              </div>

              {formError && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger">
                  <i className="fas fa-circle-exclamation mr-2" />
                  {formError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 rounded-xl bg-surface-subtle py-3 font-medium text-ink transition-colors hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-primary py-3 font-bold text-white transition-colors hover:bg-primary-hover"
                >
                  <i className="fas fa-floppy-disk mr-2" />
                  {editingProduct ? 'Salvar alterações' : 'Salvar produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-danger">
              <i className="fas fa-trash" />
            </div>

            <h3 className="text-xl font-bold text-ink">Excluir produto</h3>

            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Tem certeza de que deseja excluir{' '}
              <strong className="text-ink">{productToDelete.name}</strong>?
            </p>

            <p className="mt-2 text-sm text-danger">Esta ação não poderá ser desfeita.</p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="flex-1 rounded-xl bg-surface-subtle py-3 font-medium text-ink transition-colors hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-danger py-3 font-bold text-white transition-colors hover:bg-red-700"
              >
                <i className="fas fa-trash mr-2" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}