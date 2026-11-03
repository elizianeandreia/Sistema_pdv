import type { Page } from '../types'

interface SidebarProps {
  currentPage: Page
  onPageChange: (page: Page) => void
}

const menuItems: {
  id: Page
  label: string
  icon: string
}[] = [
  { id: 'pdv', label: 'Ponto de Venda', icon: 'fas fa-cash-register' },
  { id: 'products', label: 'Produtos', icon: 'fas fa-box' },
  { id: 'sales', label: 'Vendas', icon: 'fas fa-receipt' },
  { id: 'reports', label: 'Relatórios', icon: 'fas fa-chart-column' },
]

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-surface">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-xl text-white">
            <i className="fas fa-store" />
          </div>
          <div>
            <h1 className="font-bold text-ink">Sistema PDV</h1>
            <p className="text-xs text-ink-muted">LTHS Tecnologia</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {menuItems.map((item) => {
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPageChange(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                isActive
                  ? 'bg-primary-soft font-semibold text-primary'
                  : 'text-ink-muted hover:bg-surface-subtle hover:text-ink'
              }`}
            >
              <i className={`${item.icon} w-5 text-center`} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="rounded-xl bg-surface-subtle p-3">
          <p className="text-sm font-medium text-ink">Sistema de demonstração</p>
          <p className="mt-1 text-xs text-ink-muted">Projeto desenvolvido para portfólio</p>
        </div>
      </div>
    </aside>
  )
}