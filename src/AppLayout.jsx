import { Link, Outlet, useLocation } from 'react-router-dom'

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
]

export default function AppLayout() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen">
      <aside className="w-56 bg-gray-900 text-white flex flex-col p-4">
        <div className="text-2xl font-bold mb-8">Inventory</div>
        <nav className="flex flex-col gap-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-3 py-2 rounded hover:bg-gray-700 transition-colors ${pathname === item.path ? 'bg-gray-700' : ''}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
} 