import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
 
export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
 
  if (!user) redirect('/login')
 
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-xs">E</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
                Ethos Portal
              </span>
            </div>
            <div>
              <button className="text-sm font-medium text-gray-500 hover:text-gray-900">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>
 
      <main>{children}</main>
 
      <footer className="py-8 text-center text-gray-400 text-xs">
        &copy; {new Date().getFullYear()} Ethos SaaS para OSFL. Todos los derechos reservados.
      </footer>
    </div>
  )
}
