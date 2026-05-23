import type { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import { Info, Map, Trophy, Users } from 'lucide-react'
import { artAssets } from '../assets/art'

const navItems = [
  { to: '/game', label: '游戏世界', icon: Map },
  { to: '/achievements', label: '游戏成就', icon: Trophy },
  { to: '/parent', label: '家长端', icon: Users },
  { to: '/about-autism', label: '了解来自星星的孩子', icon: Info },
]

type PageShellProps = PropsWithChildren<{
  activePath: '/game' | '/achievements' | '/parent' | '/about-autism'
}>

export function PageShell({ activePath, children }: PageShellProps) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="brand" to="/game" aria-label="星桥计划首页">
          <img className="brand-logo" src={artAssets.logo} alt="" />
        </Link>
        <nav className="top-nav" aria-label="主导航">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                className={item.to === activePath ? 'nav-link is-active' : 'nav-link'}
                to={item.to}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>
      <main className="app-main">{children}</main>
    </div>
  )
}
