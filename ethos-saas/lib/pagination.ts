/**
 * Utilidades para paginación
 */

export interface PaginationParams {
    page: number
    limit: number
}

export interface PaginationResult<T> {
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
}

/**
 * Calcula los parámetros de paginación para una query
 */
export function getPaginationParams(page: number, limit: number = 10): PaginationParams {
    const normalizedPage = Math.max(1, page)
    const normalizedLimit = Math.max(1, Math.min(100, limit)) // Máximo 100 items por página

    return {
        page: normalizedPage,
        limit: normalizedLimit
    }
}

/**
 * Calcula el offset para una query SQL
 */
export function getOffset(page: number, limit: number): number {
    return (Math.max(1, page) - 1) * limit
}

/**
 * Calcula el número total de páginas
 */
export function getTotalPages(totalItems: number, itemsPerPage: number): number {
    if (totalItems === 0) return 1
    return Math.ceil(totalItems / itemsPerPage)
}

/**
 * Crea un resultado de paginación
 */
export function createPaginationResult<T>(
    data: T[],
    total: number,
    page: number,
    limit: number
): PaginationResult<T> {
    const totalPages = getTotalPages(total, limit)

    return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    }
}

/**
 * Valida parámetros de paginación
 */
export function validatePaginationParams(page: number, limit: number): {
    valid: boolean
    error?: string
} {
    if (page < 1) {
        return { valid: false, error: 'La página debe ser mayor a 0' }
    }

    if (limit < 1) {
        return { valid: false, error: 'El límite debe ser mayor a 0' }
    }

    if (limit > 100) {
        return { valid: false, error: 'El límite máximo es 100' }
    }

    return { valid: true }
}
