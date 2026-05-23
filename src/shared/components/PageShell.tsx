import { useEffect, useState, type CSSProperties, type PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import { Info, Map, PanelLeft, PanelLeftClose, Users } from 'lucide-react'
import { artAssets } from '../assets/art'

export type PageShellActivePath =
  | '/game'
  | '/achievements'
  | '/parent'
  | '/about-autism'
  | '/buddy-chat'

export type PageShellActiveRail = 'map' | 'achievements' | 'buddy'

const railItems = [
  {
    id: 'map',
    to: '/game',
    label: '地图',
    art: artAssets.railMapIcon,
  },
  {
    id: 'achievements',
    to: '/achievements',
    label: '徽章',
    art: artAssets.railBadgeIcon,
  },
  {
    id: 'buddy',
    to: '/buddy-chat',
    label: '伙伴',
    art: artAssets.railBuddyIcon,
  },
] as const

const utilityNavItems = [
  { section: 'game', to: '/game', label: '游戏世界', icon: Map },
  { section: 'parent', to: '/parent', label: '家长端', icon: Users },
  { section: 'about', to: '/about-autism', label: '了解来自星星的孩子', icon: Info },
] as const

const railByPath: Partial<Record<PageShellActivePath, PageShellActiveRail>> = {
  '/game': 'map',
  '/achievements': 'achievements',
  '/buddy-chat': 'buddy',
}

const sidebarStorageKey = 'starbridge-sidebar-collapsed'

function getActiveUtilitySection(activePath: PageShellActivePath) {
  if (activePath === '/parent') return 'parent'
  if (activePath === '/about-autism') return 'about'
  return 'game'
}

type PageShellProps = PropsWithChildren<{
  activePath: PageShellActivePath
  activeRail?: PageShellActiveRail
  className?: string
  contentClassName?: string
  style?: CSSProperties
}>

export function PageShell({
  activePath,
  activeRail,
  children,
  className,
  contentClassName,
  style,
}: PageShellProps) {
  const resolvedActiveRail = activeRail ?? railByPath[activePath]
  const activeUtilitySection = getActiveUtilitySection(activePath)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(sidebarStorageKey) === 'true'
    } catch {
      return false
    }
  })
  const shellClassName = [
    'app-shell',
    className,
    isSidebarCollapsed ? 'is-sidebar-collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    try {
      window.localStorage.setItem(sidebarStorageKey, String(isSidebarCollapsed))
    } catch {
      // Ignore storage failures; the sidebar still works for the current page.
    }
  }, [isSidebarCollapsed])

  return (
    <div className={shellClassName} style={style}>
      <aside className="app-sidebar" aria-label="星桥计划导航">
        <Link className="brand app-sidebar-brand" to="/game" aria-label="星桥计划首页">
          <img className="brand-logo" src={artAssets.logo} alt="" />
        </Link>
        <button
          className="sidebar-toggle"
          type="button"
          aria-expanded={!isSidebarCollapsed}
          aria-label={isSidebarCollapsed ? '展开边栏' : '收起边栏'}
          title={isSidebarCollapsed ? '展开边栏' : '收起边栏'}
          onClick={() => setIsSidebarCollapsed((current) => !current)}
        >
          {isSidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
        </button>

        <nav className="side-rail page-nav-cards app-side-rail" aria-label="儿童端功能入口">
          {railItems.map((item) => {
            const isActive = item.id === resolvedActiveRail

            return (
              <Link
                aria-current={isActive ? 'page' : undefined}
                className={isActive ? 'rail-item is-active' : 'rail-item'}
                key={item.id}
                to={item.to}
                title={item.label}
              >
                <img className="rail-art" src={item.art} alt="" />
                <span className="rail-label">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <nav className="sidebar-quick-nav" aria-label="全局入口">
          {utilityNavItems.map((item) => {
            const Icon = item.icon
            const isActive = item.section === activeUtilitySection

            return (
              <Link
                aria-current={isActive ? 'page' : undefined}
                key={item.to}
                className={isActive ? 'sidebar-quick-link is-active' : 'sidebar-quick-link'}
                to={item.to}
                title={item.label}
              >
                <Icon size={20} />
                <span className="visually-hidden">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className={contentClassName ? `app-main ${contentClassName}` : 'app-main'}>{children}</main>
    </div>
  )
}
