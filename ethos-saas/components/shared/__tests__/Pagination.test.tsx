import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Pagination from '../Pagination'

describe('Pagination Component', () => {
    const mockOnPageChange = jest.fn()

    const defaultProps = {
        currentPage: 1,
        totalPages: 5,
        onPageChange: mockOnPageChange,
        totalItems: 50,
        itemsPerPage: 10
    }

    beforeEach(() => {
        mockOnPageChange.mockClear()
    })

    it('renders pagination info correctly', () => {
        render(<Pagination {...defaultProps} />)

        // Verifica que se muestre el texto de resumen
        expect(screen.getByText(/Mostrando/i)).toBeInTheDocument()
        // Verificamos que contenga los números esperados dentro del contenedor de información
        const container = screen.getByText(/Mostrando/i).closest('div')
        expect(container).toHaveTextContent('1')
        expect(container).toHaveTextContent('10')
        expect(container).toHaveTextContent('50')
    })

    it('disables previous button on first page', () => {
        render(<Pagination {...defaultProps} />)

        const prevButton = screen.getByRole('button', { name: /Página anterior/i })
        expect(prevButton).toBeDisabled()
    })

    it('calls onPageChange when clicking next button', () => {
        render(<Pagination {...defaultProps} />)

        const nextButton = screen.getByRole('button', { name: /Página siguiente/i })
        fireEvent.click(nextButton)

        expect(mockOnPageChange).toHaveBeenCalledWith(2)
    })

    it('disables next button on last page', () => {
        render(<Pagination {...defaultProps} currentPage={5} />)

        const nextButton = screen.getByRole('button', { name: /Página siguiente/i })
        expect(nextButton).toBeDisabled()
    })
})
