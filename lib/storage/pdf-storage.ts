/**
 * PDF Storage Utilities
 * Handles uploading and retrieving PDF reports from Supabase Storage
 */

import { createClient } from '@/lib/supabase/server'

export interface SavePDFOptions {
    organizationId: string
    closingId: string
    period: string // YYYY-MM format
    reportType: 'journal' | 'ledger' | 'expense' | 'property-statement' | 'balance' | 'income-statement'
    pdfBlob: Blob
    userId: string
}

export interface SavedPDFResult {
    success: boolean
    filePath?: string
    fileName?: string
    fileSize?: number
    error?: string
}

/**
 * Saves a PDF report to Supabase Storage and records it in generated_reports table
 */
export async function savePDFReport(options: SavePDFOptions): Promise<SavedPDFResult> {
    const { organizationId, closingId, period, reportType, pdfBlob, userId } = options

    try {
        const supabase = await createClient()

        // Generate unique filename
        const timestamp = Date.now()
        const fileName = `${reportType}_${period}_${timestamp}.pdf`
        const filePath = `closings/${organizationId}/${period}/${fileName}`

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, pdfBlob, {
                contentType: 'application/pdf',
                cacheControl: '3600',
                upsert: false // Don't overwrite existing files
            })

        if (uploadError) {
            console.error('Error uploading PDF to storage:', uploadError)
            return { success: false, error: uploadError.message }
        }

        // Record in generated_reports table
        const { error: dbError } = await supabase
            .from('generated_reports')
            .insert({
                closing_id: closingId,
                organization_id: organizationId,
                report_type: reportType,
                file_path: uploadData.path,
                file_name: fileName,
                file_size: pdfBlob.size,
                generated_by: userId,
                metadata: {
                    period,
                    generatedAt: new Date().toISOString(),
                    fileType: 'pdf'
                }
            })

        if (dbError) {
            console.error('Error recording PDF in database:', dbError)
            // Try to clean up the uploaded file
            await supabase.storage.from('documents').remove([filePath])
            return { success: false, error: dbError.message }
        }

        return {
            success: true,
            filePath: uploadData.path,
            fileName,
            fileSize: pdfBlob.size
        }
    } catch (error: any) {
        console.error('Unexpected error saving PDF:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Retrieves the public URL for a stored PDF report
 */
export async function getPDFUrl(filePath: string): Promise<string | null> {
    try {
        const supabase = await createClient()

        const { data } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath)

        return data.publicUrl
    } catch (error) {
        console.error('Error getting PDF URL:', error)
        return null
    }
}

/**
 * Retrieves all reports for a specific closing
 */
export async function getClosingReports(closingId: string) {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('generated_reports')
            .select('*')
            .eq('closing_id', closingId)
            .order('report_type')

        if (error) {
            console.error('Error fetching closing reports:', error)
            return []
        }

        // Add public URLs to each report
        const reportsWithUrls = await Promise.all(
            (data || []).map(async (report) => ({
                ...report,
                publicUrl: await getPDFUrl(report.file_path)
            }))
        )

        return reportsWithUrls
    } catch (error) {
        console.error('Error in getClosingReports:', error)
        return []
    }
}

/**
 * Deletes a PDF report from storage and database
 * (Only for admins, in case of regeneration)
 */
export async function deletePDFReport(reportId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = await createClient()

        // Get the file path first
        const { data: report, error: fetchError } = await supabase
            .from('generated_reports')
            .select('file_path')
            .eq('id', reportId)
            .single()

        if (fetchError || !report) {
            return { success: false, error: 'Report not found' }
        }

        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from('documents')
            .remove([report.file_path])

        if (storageError) {
            console.error('Error deleting from storage:', storageError)
        }

        // Delete from database (cascade will handle this even if storage fails)
        const { error: dbError } = await supabase
            .from('generated_reports')
            .delete()
            .eq('id', reportId)

        if (dbError) {
            return { success: false, error: dbError.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error deleting PDF report:', error)
        return { success: false, error: error.message }
    }
}
