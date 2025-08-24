import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, QrCode, Users, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'

const Layout = ({ children }) => {
  const { user, profile, signOut, isAdmin } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
  }

  const navigationItems = isAdmin() ? [
    { href: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { href: '/tickets', icon: QrCode, label: 'Entradas' },
    { href: '/scanner', icon: QrCode, label: 'Escáner' },
    { href: '/users', icon: Users, label: 'Usuarios' }
  ] : [
    { href: '/profile', icon: User, label: 'Mi Perfil' },
    { href: '/my-tickets', icon: QrCode, label: 'Mis Entradas' }
  ]

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href={isAdmin() ? '/dashboard' : '/profile'}>
                <h1 className="text-xl font-bold text-gray-900 cursor-pointer">
                  QR Tickets
                </h1>
              </Link>
              <span className="text-sm bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                {profile?.role === 'admin' ? 'Administrador' : 'Cliente'}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {profile?.full_name || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut size={20} />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = router.pathname === item.href
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout