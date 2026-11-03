
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { Product } from '../types'
import { getProductImage } from '../data/productImages'

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

interface ProductPhotoProps {
  name: string
  size?: 'small' | 'large'
}

const emptyForm: ProductFormData = {
  name: '',
  category: '',
  barcode: '',
  price: '',
  stock: '',
}

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })

function ProductPhoto({
  name,
  size = 'small',
}: ProductPhotoProps) {
  const imageUrl = getProductImage(name)
  const [failedUrl, setFailedUrl] = useState<string | null>(null)

  const showImage = imageUrl !== null && failedUrl !== imageUrl

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-subtle ${
        size === 'large'
          ? 'h-32 w-full sm:h-40'
          : 'h-14 w-14'
      }`}
    >
      {showImage ? (
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          onError={() => setFailedUrl(imageUrl)}
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <i
          className={`fas fa-box-open text-ink-muted/50 ${
            size === 'large'
              ? 'text-4xl'
              : 'text-xl'
          }`}
        />
      )}
    </div>
  )
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

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    if (!term) {
      return products
    }

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.barcode?.includes(term) ||
        product.id.includes(term),
    )
  }, [products, searchTerm])

  const totalProducts = products.length

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0,
  )

  const lowStock = products.filter(
    (product) => product.stock > 0 && product.stock <= 10,
  ).length

  const outOfStock = products.filter(
    (product) => product.stock === 0,
  ).length

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return {
        label: 'Sem estoque',
        className: 'bg-red-50 text-danger',
      }
    }

    if (stock <= 10) {
      return {
        label: 'Estoque baixo',
        className: 'bg-yellow-50 text-warning',
      }
    }

    return {
      label: 'Disponível',
      className: 'bg-green-50 text-success',
    }
  }

  const openAddForm = () => {
    setEditingProduct(null)
    setFormData({ ...emptyForm })
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
    setFormData({ ...emptyForm })
    setFormError('')
  }

  const updateFormField = (
    field: keyof ProductFormData,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))

    if (formError) {
      setFormError('')
    }
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

    if (
      formData.price.trim() === '' ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      setFormError('Informe um preço válido.')
      return
    }

    if (
      formData.stock.trim() === '' ||
      !Number.isFinite(stock) ||
      stock < 0 ||
      !Number.isInteger(stock)
    ) {
      setFormError('Informe uma quantidade de estoque válida.')
      return
    }

    if (barcode) {
      const barcodeExists = products.some(
        (product) =>
          product.barcode === barcode &&
          product.id !== editingProduct?.id,
      )

      if (barcodeExists) {
        setFormError(
          'Já existe um produto com este código de barras.',
        )
        return
      }
    }

    const productData = {
      name,
      category,
      barcode: barcode || undefined,
      price,
      stock,
    }

    if (editingProduct) {
      onUpdateProduct({
        ...productData,
        id: editingProduct.id,
      })
    } else {
      onAddProduct(productData)
    }

    closeForm()
  }

  const confirmDelete = () => {
    if (!productToDelete) {
      return
    }

    onDeleteProduct(productToDelete.id)
    setProductToDelete(null)
  }

  return (
    <div className="min-w-0 space-y-4 px-3 py-4 sm:space-y-6 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink sm:text-2xl">
            Produtos
          </h2>

          <p className="mt-1 text-sm text-ink-muted">
            Gerencie os produtos e acompanhe o estoque disponível.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-5 py-3 font-medium text-white shadow-sm transition-colors hover:bg-primary-hover sm:w-auto"
        >
          <i className="fas fa-plus mr-2" />
          Novo produto
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <div className="min-w-0 rounded-2xl border border-gray-200 bg-surface p-3 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-ink-muted sm:text-sm">
                Produtos cadastrados
              </p>

              <p className="mt-2 text-xl font-bold text-ink sm:text-2xl">
                {totalProducts}
              </p>
            </div>

            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary sm:flex">
              <i className="fas fa-box" />
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-gray-200 bg-surface p-3 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-ink-muted sm:text-sm">
                Unidades em estoque
              </p>

              <p className="mt-2 text-xl font-bold text-ink sm:text-2xl">
                {totalStock}
              </p>
            </div>

            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-success sm:flex">
              <i className="fas fa-boxes-stacked" />
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-gray-200 bg-surface p-3 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-ink-muted sm:text-sm">
                Estoque baixo
              </p>

              <p className="mt-2 text-xl font-bold text-warning sm:text-2xl">
                {lowStock}
              </p>
            </div>

            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-warning sm:flex">
              <i className="fas fa-triangle-exclamation" />
            </div>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-gray-200 bg-surface p-3 shadow-sm sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-ink-muted sm:text-sm">
                Sem estoque
              </p>

              <p className="mt-2 text-xl font-bold text-danger sm:text-2xl">
                {outOfStock}
              </p>
            </div>

            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-danger sm:flex">
              <i className="fas fa-circle-xmark" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-surface p-3 shadow-sm sm:p-4">
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar produto, categoria, código ou ID..."
            aria-label="Buscar produtos"
            className="min-h-12 w-full rounded-xl border border-gray-200 bg-surface py-3 pl-11 pr-4 text-base text-ink outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product.stock)

          return (
            <article
              key={product.id}
              className="min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-surface p-4 shadow-sm"
            >
              <ProductPhoto
                name={product.name}
                size="large"
              />

              <div className="mt-3 min-w-0">
                <h3 className="break-words text-base font-semibold text-ink">
                  {product.name}
                </h3>

                <p className="mt-1 break-all text-xs text-ink-muted">
                  ID: {product.id}
                </p>

                <p className="mt-2 text-sm text-ink-muted">
                  {product.category}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(product.price)}
                </p>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${stockStatus.className}`}
                >
                  {stockStatus.label}
                </span>
              </div>

              <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="text-ink-muted">
                    Estoque
                  </span>

                  <span className="font-semibold text-ink">
                    {product.stock} un.
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2 text-sm">
                  <span className="shrink-0 text-ink-muted">
                    Código
                  </span>

                  <span className="min-w-0 break-all text-right text-ink">
                    {product.barcode ?? 'Não informado'}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => openEditForm(product)}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary-soft px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-orange-100"
                >
                  <i className="fas fa-pen" />
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => setProductToDelete(product)}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-danger transition-colors hover:bg-red-100"
                >
                  <i className="fas fa-trash" />
                  Excluir
                </button>
              </div>
            </article>
          )
        })}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-surface shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-surface-subtle">
              <tr className="border-b border-gray-200 text-left text-sm text-ink-muted">
                <th className="px-4 py-4 font-medium">
                  Produto
                </th>
                <th className="px-4 py-4 font-medium">
                  Categoria
                </th>
                <th className="px-4 py-4 font-medium">
                  Código de barras
                </th>
                <th className="px-4 py-4 font-medium">
                  Preço
                </th>
                <th className="px-4 py-4 font-medium">
                  Estoque
                </th>
                <th className="px-4 py-4 font-medium">
                  Situação
                </th>
                <th className="px-4 py-4 text-center font-medium">
                  Ações
                </th>
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
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <ProductPhoto name={product.name} />

                        <div className="min-w-0">
                          <p className="font-medium text-ink">
                            {product.name}
                          </p>

                          <p className="break-all text-xs text-ink-muted">
                            ID: {product.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-ink-muted">
                      {product.category}
                    </td>

                    <td className="px-4 py-4 text-sm text-ink-muted">
                      {product.barcode ?? 'Não informado'}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-ink">
                      {formatCurrency(product.price)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <span className="font-semibold text-ink">
                        {product.stock}
                      </span>{' '}
                      <span className="text-xs text-ink-muted">
                        un.
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${stockStatus.className}`}
                      >
                        {stockStatus.label}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          title="Editar produto"
                          aria-label={`Editar ${product.name}`}
                          onClick={() => openEditForm(product)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary transition-colors hover:bg-orange-100"
                        >
                          <i className="fas fa-pen" />
                        </button>

                        <button
                          type="button"
                          title="Excluir produto"
                          aria-label={`Excluir ${product.name}`}
                          onClick={() => setProductToDelete(product)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-danger transition-colors hover:bg-red-100"
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
      </div>

      {filteredProducts.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-surface p-10 text-center text-ink-muted">
          <i className="fas fa-box-open mb-3 text-4xl" />

          <p className="font-medium text-ink">
            Nenhum produto encontrado
          </p>

          <p className="mt-1 text-sm">
            Tente realizar outra busca.
          </p>
        </div>
      )}

      {showForm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-form-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <div className="flex max-h-[96dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-surface shadow-2xl sm:rounded-2xl">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 p-4 sm:p-6">
              <div className="min-w-0">
                <h3
                  id="product-form-title"
                  className="text-xl font-bold text-ink"
                >
                  {editingProduct
                    ? 'Editar produto'
                    : 'Novo produto'}
                </h3>

                <p className="mt-1 text-sm text-ink-muted">
                  {editingProduct
                    ? 'Altere os dados do produto.'
                    : 'Preencha os dados do produto.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Fechar formulário"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-subtle hover:text-ink"
              >
                <i className="fas fa-xmark" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="min-h-0 space-y-4 overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6"
            >
              <div>
                <label
                  htmlFor="productName"
                  className="mb-1 block text-sm font-medium text-ink"
                >
                  Nome do produto
                </label>

                <input
                  id="productName"
                  type="text"
                  required
                  autoFocus
                  value={formData.name}
                  onChange={(event) =>
                    updateFormField('name', event.target.value)
                  }
                  placeholder="Ex.: Café 500 g"
                  className="min-h-12 w-full rounded-xl border border-gray-200 bg-surface px-4 py-3 text-base text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                  onChange={(event) =>
                    updateFormField('category', event.target.value)
                  }
                  placeholder="Ex.: Alimentos"
                  className="min-h-12 w-full rounded-xl border border-gray-200 bg-surface px-4 py-3 text-base text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                  inputMode="numeric"
                  value={formData.barcode}
                  onChange={(event) =>
                    updateFormField('barcode', event.target.value)
                  }
                  placeholder="Opcional"
                  className="min-h-12 w-full rounded-xl border border-gray-200 bg-surface px-4 py-3 text-base text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="min-w-0">
                  <label
                    htmlFor="productPrice"
                    className="mb-1 block text-sm font-medium text-ink"
                  >
                    Preço (R$)
                  </label>

                  <input
                    id="productPrice"
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.price}
                    onChange={(event) =>
                      updateFormField('price', event.target.value)
                    }
                    placeholder="0,00"
                    className="min-h-12 w-full min-w-0 rounded-xl border border-gray-200 bg-surface px-3 py-3 text-base text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:px-4"
                  />
                </div>

                <div className="min-w-0">
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
                    onChange={(event) =>
                      updateFormField('stock', event.target.value)
                    }
                    placeholder="0"
                    className="min-h-12 w-full min-w-0 rounded-xl border border-gray-200 bg-surface px-3 py-3 text-base text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:px-4"
                  />
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-xl bg-red-50 px-4 py-3 text-sm text-danger"
                >
                  <i className="fas fa-circle-exclamation mr-2" />
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="min-h-12 rounded-xl bg-surface-subtle px-3 py-3 font-medium text-ink transition-colors hover:bg-gray-200"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="min-h-12 rounded-xl bg-primary px-3 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover sm:text-base"
                >
                  <i className="fas fa-floppy-disk mr-2" />
                  {editingProduct
                    ? 'Salvar alterações'
                    : 'Salvar produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {productToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-product-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        >
          <div className="max-h-[95dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl sm:p-6">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-danger">
              <i className="fas fa-trash" />
            </div>

            <h3
              id="delete-product-title"
              className="text-xl font-bold text-ink"
            >
              Excluir produto
            </h3>

            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Tem certeza de que deseja excluir{' '}
              <strong className="break-words text-ink">
                {productToDelete.name}
              </strong>
              ?
            </p>

            <p className="mt-2 text-sm text-danger">
              Esta ação não poderá ser desfeita.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="min-h-12 rounded-xl bg-surface-subtle px-3 py-3 font-medium text-ink transition-colors hover:bg-gray-200"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="min-h-12 rounded-xl bg-danger px-3 py-3 font-bold text-white transition-colors hover:bg-red-700"
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
