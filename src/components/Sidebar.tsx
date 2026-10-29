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
  {
    id: 'pdv',
    label: 'Ponto de Venda',
    icon: 'fas fa-cash-register',
  },
  {
    id: 'products',
    label: 'Produtos',
    icon: 'fas fa-box',
  },
  {
    id: 'sales',
    label: 'Vendas',
    icon: 'fas fa-receipt',
  },
  {
    id: 'reports',
    label: 'Relatórios',
    icon: 'fas fa-chart-column',
  },
]

export default function Sidebar({
  currentPage,
  onPageChange,
}: SidebarProps) {
  return (
    <aside className="flex w-64 flex-col bg-slate-900 text-white">
      <div className="border-b border-slate-800 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl">
            <i className="fas fa-store" />
          </div>

          <div>
            <h1 className="font-bold">
              Sistema PDV
            </h1>

            <p className="text-xs text-slate-400">
              LTHS Tecnologia
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const isActive =
            currentPage === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                onPageChange(item.id)
              }
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i
                className={`${item.icon} w-5 text-center`}
              />

              <span className="font-medium">
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="rounded-xl bg-slate-800 p-3">
          <p className="text-sm font-medium">
            Sistema de demonstração
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Projeto desenvolvido para portfólio
          </p>
        </div>
      </div>
    </aside>
  )
}