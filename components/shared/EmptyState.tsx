import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface EmptyStateProps {
    title?: string
    message?: string
    icon?: React.ReactNode
    action?: React.ReactNode
}

export default function EmptyState({
    title = 'No hay datos',
    message = 'No se encontraron registros para mostrar.',
    icon,
    action
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            {icon || (
                <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mb-4" />
            )}
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 text-center max-w-sm mb-4">{message}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    )
}
