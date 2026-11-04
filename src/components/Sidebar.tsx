
import { useEffect, useState } from 'react'
import type { Page } from '../types'

interface SidebarProps {
  currentPage: Page
  onPageChange: (page: Page) => void
}

interface SidebarContentProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  onClose?: () => void
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

function SidebarContent({
  currentPage,
  onNavigate,
  onClose,
}: SidebarContentProps) {
  const currentYear = new Date().getFullYear()

  return (
    <div className="flex h-full w-full flex-col bg-surface">
      <div className="border-b border-gray-200 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-xl text-white">
              <i className="fas fa-store" />
            </div>

            <div className="min-w-0">
              <h1 className="text-base font-bold text-ink">
                Sistema PDV
              </h1>

              <p className="text-xs text-ink-muted">
                LTHS Tecnologia
              </p>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar menu"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-surface-subtle hover:text-ink"
            >
              <i className="fas fa-xmark text-lg" />
            </button>
          )}
        </div>
      </div>

      <nav
        aria-label="Navegação do sistema"
        className="flex-1 space-y-2 overflow-y-auto p-4"
      >
        {menuItems.map((item) => {
          const isActive = currentPage === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                isActive
                  ? 'bg-primary-soft font-semibold text-primary'
                  : 'text-ink-muted hover:bg-surface-subtle hover:text-ink'
              }`}
            >
              <i
                className={`${item.icon} w-5 shrink-0 text-center`}
              />

              <span className="text-sm sm:text-base">
                {item.label}
              </span>

              {isActive && (
                <i className="fas fa-chevron-right ml-auto text-xs" />
              )}
            </button>
          )
        })}
      </nav>

      <footer className="shrink-0 border-t border-gray-200 p-4">
        <div className="rounded-xl bg-surface-subtle p-3 text-center">
          <div className="mb-2 flex items-center justify-center gap-2 text-primary">
            <i className="fas fa-shield-halved text-sm" />

            <span className="text-xs font-semibold">
              Sistema de demonstração
            </span>
          </div>

          <p className="text-xs font-semibold leading-5 text-ink">
            © {currentYear} LTHS Tecnologia
          </p>

          <p className="mt-1 text-[11px] leading-4 text-ink-muted">
            Todos os direitos reservados.
          </p>

          <div className="my-3 border-t border-gray-200" />

          <p className="text-[11px] leading-5 text-ink-muted">
            Sistema desenvolvido para fins de portfólio.
            Operações e pagamentos simulados.
          </p>

          <p className="mt-2 text-[10px] leading-4 text-ink-muted">
            Marcas e imagens de produtos pertencem aos seus
            respectivos titulares.
          </p>

          <a
            href="https://www.lthstecnologia.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center justify-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary-hover"
          >
            <i className="fas fa-globe" />
            LTHS Tecnologia
            <i className="fas fa-arrow-up-right-from-square text-[9px]" />
          </a>
        </div>
      </footer>
    </div>
  )
}

export default function Sidebar({
  currentPage,
  onPageChange,
}: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileOpen])

  const handleNavigate = (page: Page) => {
    onPageChange(page)
    setMobileOpen(false)
  }

  return (
    <>
      <aside
        aria-label="Menu principal"
        className="hidden w-64 shrink-0 border-r border-gray-200 bg-surface lg:sticky lg:top-0 lg:flex lg:h-dvh"
      >
        <SidebarContent
          currentPage={currentPage}
          onNavigate={onPageChange}
        />
      </aside>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
        aria-expanded={mobileOpen}
        aria-controls="mobile-pdv-menu"
        className="fixed left-3 top-3 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-surface text-primary shadow-sm transition-colors hover:bg-primary-soft lg:hidden"
      >
        <i className="fas fa-bars text-lg" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/50"
          />

          <aside
            id="mobile-pdv-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            className="absolute inset-y-0 left-0 flex h-dvh w-[min(20rem,88vw)] flex-col border-r border-gray-200 bg-surface shadow-2xl"
          >
            <SidebarContent
              currentPage={currentPage}
              onNavigate={handleNavigate}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  )
}
