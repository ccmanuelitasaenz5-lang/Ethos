import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrganizationForm from '@/components/settings/OrganizationForm'
import AccountPlanManager from '@/components/settings/AccountPlanManager'
import PropertyManager from '@/components/settings/PropertyManager'
import { getProperties } from '@/app/actions/organization'

export const metadata: Metadata = {
  title: 'Configuración | Ethos',
  description: 'Configuración de la organización y sistema contable',
}

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Obtener los datos del perfil del usuario para saber su organización
  const { data: userData } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle()

  if (!userData?.organization_id) {
    return (
      <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl">
        <p className="text-red-700">No se encontró una organización vinculada a tu usuario.</p>
      </div>
    )
  }

  // Obtener los datos completos de la organización
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', userData.organization_id)
    .single()

  const properties = await getProperties()

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12 text-gray-900">
      {/* Encabezado de la página */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="mt-2 text-gray-600">
          Administra los datos legales de tu organización y la estructura del plan de cuentas contable.
        </p>
      </div>

      <div className="grid gap-10">
        {/* Sección 1: Datos de la Organización */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Datos Generales</h2>
            <p className="text-sm text-gray-500">Información legal, RIF y datos de contacto de la organización.</p>
          </div>
          {organization ? (
            <OrganizationForm organization={organization} />
          ) : (
            <p className="text-gray-500">Cargando organización...</p>
          )}
        </section>

        {/* Sección: Propiedades */}
        <section className="border-t border-gray-200 pt-8">
          <PropertyManager properties={properties} />
        </section>

        {/* Sección 2: Módulo Contable (Plan de Cuentas) */}
        <section className="border-t border-gray-200 pt-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Estructura Contable</h2>
            <p className="text-sm text-gray-500">Configura el catálogo de cuentas necesario para los registros financieros bajo VEN-NIF.</p>
          </div>
          {/* Componente para gestionar el plan de cuentas */}
          <AccountPlanManager organizationId={userData.organization_id} />
        </section>
      </div>
    </div>
  )
}